"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-provider";
import { WSMessage } from "@/types/socket";

const WS_BASE = process.env
  .NEXT_PUBLIC_BACKEND_URL!.replace("http://", "ws://")
  .replace("https://", "wss://");

export function useWebSocket() {
  const { session } = useAuth();

  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!session?.access_token) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(
      `${WS_BASE}/api/v1/ws?token=${session.access_token}`,
    );

    ws.onopen = () => setConnected(true);

    ws.onmessage = (evt) => {
      try {
        const msg: WSMessage = JSON.parse(evt.data);

        setMessages((prev) => {
          return [...prev, msg];
        });
      } catch {
        // ignore bad messages
      }
    };

    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    wsRef.current = ws;
  }, [session]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return {
    messages,
    connected,
    connect,
    disconnect,
    clearMessages,
  };
}
