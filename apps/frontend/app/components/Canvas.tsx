"use client";
import { useRef, useEffect, useState } from "react";
import {
  clearCanvas,
  getExistingShapes,
  initDraw,
  Shape,
  ShapeTypes,
} from "@/app/method/draw";

export const Canvas = () => {
  const NEXT_PUBLIC_WS_URL = process.env.NEXT_PUBLIC_WS_URL || "";
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedShapeRef = useRef<ShapeTypes>("rect");

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
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx || !socket) return;

      const setUpCanvas = async () => {
        try {
          const existingShapes: Shape[] = await getExistingShapes(1);
          clearCanvas(existingShapes, ctx, canvas);
          if (selectedShapeRef.current) {
            initDraw(
              canvas,
              ctx,
              existingShapes,
              socket,
              selectedShapeRef,
            );
          }
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
            selectedShapeRef.current = "rect";
          }}
        >
          Rectangle
        </button>
        <button
          onClick={() => {
            selectedShapeRef.current = "circle";
          }}
        >
          Circle
        </button>
      </div>
      <canvas ref={canvasRef} height={500} width={1000}></canvas>
    </div>
  );
};
