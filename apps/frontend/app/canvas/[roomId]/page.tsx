"use client";

import { useRef, useEffect } from "react";

type Shape = {
  type: "Rect";
  x: number;
  y: number;
  height: number;
  width: number;
};

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isClicked = useRef<boolean>(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const rectangles = useRef<Shape[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderScene = () => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "white";
      rectangles.current.map((r) =>
        ctx.strokeRect(r.x, r.y, r.width, r.height),
      );
    };

    renderScene();

    // Paint initial black canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const getCanvasCoordinates = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      isClicked.current = true;
      startPos.current = getCanvasCoordinates(e);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isClicked.current || !startPos.current) return;

      const currentPos = getCanvasCoordinates(e);
      const { x, y } = startPos.current;
      const width = currentPos.x - x;
      const height = currentPos.y - y;

      if (Math.abs(width) > 2 || Math.abs(height) > 2) {
        // Normalize negative width/height so x, y is always top-left (optional, but cleaner data)
        const finalX = width < 0 ? currentPos.x : x;
        const finalY = height < 0 ? currentPos.y : y;
        const finalW = Math.abs(width);
        const finalH = Math.abs(height);

        rectangles.current.push({
          type: "Rect",
          x: finalX,
          y: finalY,
          width: finalW,
          height: finalH,
        });
      }

      // Reset interaction state and render final canvas
      isClicked.current = false;
      startPos.current = null;
      renderScene();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isClicked.current || !startPos.current) return;

      const currentPos = getCanvasCoordinates(e);
      const { x, y } = startPos.current;

      const width = currentPos.x - x;
      const height = currentPos.y - y;

      renderScene();

      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={1000}
        height={2000}
        style={{ display: "block", maxWidth: "100%" }}
      />
    </div>
  );
}
