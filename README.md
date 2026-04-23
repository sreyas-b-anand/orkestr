# Orkestr AI Campaign Generator

Orkestr is a powerful full-stack platform designed to automate and streamline marketing campaign generation. Leveraging advanced multi-agent AI pipelines, Orkestr orchestrates specialized agents—such as planners, copywriters, and reviewers—to transform simple prompts into comprehensive marketing campaigns. 

The application features a modern, responsive frontend built with Next.js and a robust Python FastAPI backend, offering real-time streaming of agent interactions via WebSockets and seamless integration with Supabase for authentication and storage.

## Features

- **Multi-Agent AI Pipeline**: Utilizes LangGraph and Groq to manage complex content generation workflows.
- **Real-time Feedback**: Watch the AI agents collaborate in real-time through a WebSocket-powered chat feed.
- **Modern Dashboard**: A premium, responsive UI built with Next.js 16, Tailwind CSS 4, shadcn/ui, and Framer Motion.
- **Campaign Management**: Easily view, manage, and export generated campaigns.
- **Supabase Integration**: Secure authentication and reliable cloud storage for campaign assets.

## Tech Stack

### Frontend (Client)
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Animations**: Framer Motion
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

### Backend (Server)
- **Framework**: FastAPI (Python)
- **AI & Logic**: LangGraph, Groq
- **Real-time**: WebSockets
- **Database**: Supabase

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Supabase account & project
- Groq API Key

### Backend Setup (Server)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your keys:
   ```env
   GROQ_API_KEY=your_groq_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

5. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup (Client)

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local` and update the values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## Architecture Overview
- **Agents**: Specialized AI modules defined in `server/agents/` handle specific content generation tasks (e.g., planning, drafting, reviewing).
- **Pipelines**: LangGraph workflows in `server/pipelines/` coordinate the sequence and data passing between multiple agents.
- **WebSockets**: Real-time communication is established via FastAPI WebSockets and managed on the frontend using custom hooks (`client/hooks/use-websocket.ts`).
- **State Management & Auth**: Supabase handles user sessions and data persistence.

## License
MIT
