"use client";
import { useRef, useEffect, useState } from "react";
import {
  clearCanvas,
  getExistingShapes,
  Shape,
  ShapeTypes,
} from "@/app/method/draw";
import { Game } from "../method/game";

export const Canvas = () => {
  const NEXT_PUBLIC_WS_URL = process.env.NEXT_PUBLIC_WS_URL || "";
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [game, setGame] = useState<Game>()
  const [selectedTool, setSelectedTool] = useState<ShapeTypes>("rect")
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = new WebSocket(`${NEXT_PUBLIC_WS_URL}?token=${token}`);
    socket.onopen = () => {
      setSocket(socket);
    };

    return () => {
      setTimeout(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      }, 0);
    };
  }, [NEXT_PUBLIC_WS_URL]);

  useEffect(() => {
    game?.setShape(selectedTool)
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx || !socket) return;

      const setUpCanvas = async () => {
        try {
          const existingShapes: Shape[] = await getExistingShapes(1);
          clearCanvas(existingShapes, ctx, canvas);
          const game = new Game(canvas, "2", socket)
          setGame(game)
        } catch (error) {
          console.error("Failed to load existing shapes:", error);
        }
      };
      setUpCanvas();
    }
  }, [socket]);
  return (
    <div>
      <div>
        <button
          onClick={() => {
            setSelectedTool("rect")
          }}
        >
          Rectangle
        </button>
        <button
          onClick={() => {
            setSelectedTool("circle")
          }}
        >
          Circle
        </button>
        <button
          onClick={() => {
            setSelectedTool("line")
          }}
        >
          Line
        </button>
      </div>
      <canvas ref={canvasRef} height={500} width={1000}></canvas>
    </div>
  );
};
