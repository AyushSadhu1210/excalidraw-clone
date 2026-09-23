"use client";

import { useRef, useEffect, useState } from "react";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      height: number;
      width: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    };

type Tool = "rect" | "circle";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isClicked = useRef<boolean>(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const shapes = useRef<Shape[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>("rect");
  const toolRef = useRef<Tool>("rect");

  useEffect(() => {
    toolRef.current = selectedTool;
  }, [selectedTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleDrawShape = (shape: Shape) => {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;

      if (shape.type === "rect") {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        ctx.beginPath();
        ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const renderScene = () => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "white";
      shapes.current.map((shape) => handleDrawShape(shape));
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
      if (toolRef.current === "rect") {
        const width = currentPos.x - x;
        const height = currentPos.y - y;

        if (Math.abs(width) > 2 || Math.abs(height) > 2) {
          shapes.current.push({
            type: "rect",
            x: width < 0 ? currentPos.x : x,
            y: height < 0 ? currentPos.y : y,
            width: Math.abs(width),
            height: Math.abs(height),
          });
        }
      } else if (toolRef.current === "circle") {
        const dx = currentPos.x - x;
        const dy = currentPos.y - y;
        const radius = Math.sqrt(dx * dx + dy * dy);

        if (Math.abs(radius) > 2) {
          shapes.current.push({
            type: "circle",
            centerX: x,
            centerY: y,
            radius: radius,
          });
        }
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

      renderScene();

      if (toolRef.current === "rect") {
        const width = currentPos.x - x;
        const height = currentPos.y - y;
        handleDrawShape({ type: "rect", x, y, width, height });
      } else if (toolRef.current === "circle") {
        const dx = currentPos.x - x;
        const dy = currentPos.y - y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        handleDrawShape({ type: "circle", centerX: x, centerY: y, radius });
      }
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
      <button onClick={() => setSelectedTool("rect")}>Rectangle</button>
      <button onClick={() => setSelectedTool("circle")}>Circle</button>
      <canvas
        ref={canvasRef}
        width={1000}
        height={2000}
        style={{ display: "block", maxWidth: "100%" }}
      />
    </div>
  );
}
