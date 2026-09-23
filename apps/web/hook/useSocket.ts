"use client";

import { useEffect, useRef, useState } from "react";

export const useSocket = () => {
  const socket = useRef<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);
  const NEXT_PUBLIC_WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const ws = new WebSocket(`${NEXT_PUBLIC_WS_URL}?token=${token}`);
    ws.onopen = () => {
      setLoading(false);
      socket.current = ws;
    };
  }, []);

  return {
    loading,
    socket: socket.current,
  };
};
