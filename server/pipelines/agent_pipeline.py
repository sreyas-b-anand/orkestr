import logging
import json
from uuid import UUID

from agents import FactAgent, WriterAgent, EditorAgent
from services import GroqClient
from services import ws_manager
from langgraph.graph import StateGraph, END
from schemas.graph import GraphState
from config import SupabaseConfig

logger = logging.getLogger(__name__)

ALL_PIECES = ["blog_post", "social_thread", "email_teaser"]
MAX_ITERATIONS = 2


class AgentPipeline:
    def __init__(self):

        groq_client = GroqClient(model="llama-3.1-8b-instant")

        self.fact_agent = FactAgent(groq_client)
        self.writer_agent = WriterAgent(groq_client)
        self.editor_agent = EditorAgent(groq_client)

        self.supabase = SupabaseConfig()

        self._build_graph()

    async def fact_node(self, state: GraphState):

        user_id = state["user_id"]

        await ws_manager.send(user_id, {
            "event": "fact_stage",
            "status": "start",
            "message": "Extracting key facts..."
        })

        facts = await self.fact_agent.run(state["source_text"])

        await ws_manager.send(user_id, {
            "event": "fact_stage",
            "status": "done",
            "message": "Facts extracted",
            "data": facts
        })

        return {
            "fact_sheet": facts,
            "iterations": 0
        }

    async def writer_node(self, state: GraphState):

        user_id = state["user_id"]

        await ws_manager.send(user_id, {
            "event": "writer_stage",
            "status": "start",
            "message": "Generating content..."
        })

        draft = await self.writer_agent.generate(state["fact_sheet"])

        if not draft or "error" in draft:
            await ws_manager.send(user_id, {
                "event": "writer_stage",
                "status": "error",
                "message": "Draft generation failed"
            })

            return {
                "drafts": {
                    "blog_post": "",
                    "social_thread": [],
                    "email_teaser": ""
                }
            }

        await ws_manager.send(user_id, {
            "event": "writer_stage",
            "status": "done",
            "message": "Draft generated",
            "data": draft
        })

        return {"drafts": draft}

    async def editor_node(self, state: GraphState):

        user_id = state["user_id"]

        await ws_manager.send(user_id, {
            "event": "editor_stage",
            "status": "start",
            "message": "Reviewing content..."
        })

        review = await self.editor_agent.review(
            state["fact_sheet"],
            state["drafts"]
        )

        if not review or "error" in review:
            await ws_manager.send(user_id, {
                "event": "editor_stage",
                "status": "error",
                "message": "Editor failed"
            })

            return {
                "review": review,
                "status": "rejected",
                "feedback": "Editor failed",
                "iterations": state.get("iterations", 0) + 1
            }

        approved = all(
            review.get(p, {}).get("approved", False)
            for p in ALL_PIECES
        )

        await ws_manager.send(user_id, {
            "event": "editor_stage",
            "status": "done",
            "approved": approved,
            "data": review
        })

        return {
            "review": review,
            "status": "approved" if approved else "rejected",
            "iterations": state.get("iterations", 0) + 1
        }

    async def revise_node(self, state: GraphState):

        user_id = state["user_id"]

        await ws_manager.send(user_id, {
            "event": "revise_stage",
            "status": "start",
            "message": "Applying corrections..."
        })

        drafts = dict(state.get("drafts", {}))
        review = state.get("review", {})

        for piece in ALL_PIECES:

            if review.get(piece, {}).get("approved", True):
                continue

            if piece not in drafts:
                continue

            correction_note = review[piece].get(
                "correction_note",
                "Fix all issues."
            )

            result = await self.writer_agent.revise(
                piece=piece,
                old_draft=drafts[piece],
                correction_note=correction_note,
                fact_sheet=state.get("fact_sheet", {})
            )

            if result and piece in result:
                drafts[piece] = result[piece]

        await ws_manager.send(user_id, {
            "event": "revise_stage",
            "status": "done",
            "data": drafts
        })

        return {"drafts": drafts}

    def router(self, state: GraphState) -> str:

        if state.get("status") == "approved":
            return "end"

        if state.get("iterations", 0) >= MAX_ITERATIONS:
            return "end"

        return "revise"

    def _build_graph(self):

        self.graph = StateGraph(GraphState)

        self.graph.add_node("fact", self.fact_node)
        self.graph.add_node("writer", self.writer_node)
        self.graph.add_node("editor", self.editor_node)
        self.graph.add_node("revise", self.revise_node)

        self.graph.set_entry_point("fact")

        self.graph.add_edge("fact", "writer")
        self.graph.add_edge("writer", "editor")

        self.graph.add_conditional_edges(
            "editor",
            self.router,
            {"revise": "revise", "end": END}
        )

        self.graph.add_edge("revise", "editor")

        self.app = self.graph.compile()

    async def run(self, source_text: str, user_id: UUID):

        result = await self.app.ainvoke({
            "source_text": source_text,
            "user_id": str(user_id),
            "fact_sheet": {},
            "drafts": {},
            "review": {},
            "iterations": 0,
            "status": ""
        })

        output_data = {
            "fact_sheet": result.get("fact_sheet", {}),
            "drafts": result.get("drafts", {}),
            "review": result.get("review", {}),
            "status": result.get("status", ""),
            "iterations": result.get("iterations", 0),
        }

        try:
            self.supabase.client.table("campaigns").insert({
                "user_id": str(user_id),
                "input_text": source_text,
                "output": json.loads(json.dumps(output_data, default=str)),
                "status": result.get("status", ""),
                "iterations": result.get("iterations", 0)
            }).execute()
        except Exception as e:
            logger.error("Supabase error: %s", e)

        return result