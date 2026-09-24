import axios from "axios";

export type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    };

export const clearCanvas = (
  existingShapes: Shape[],
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  existingShapes.map((shape) => {
    if (shape.type === "rect") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }
  });
};

export const initDraw = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  existingShapes: Shape[],
  socket: WebSocket,
) => {
  let clicked = false;
  let startX: number;
  let startY: number;

  const shapes: Shape[] = existingShapes;

  // Initial black background fill
  clearCanvas(shapes, ctx, canvas);

  const onMouseDown = (e: MouseEvent) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  };

  const onMouseUp = async (e: MouseEvent) => {
    clicked = false;
    const width = e.clientX - startX;
    const height = e.clientY - startY;

    const newShape: Shape = {
      type: "rect",
      x: startX,
      y: startY,
      width,
      height,
    };
    shapes.push(newShape);
    socket.send(
      JSON.stringify({
        type: "chat",
        roomId: 1,
        message: JSON.stringify(newShape),
      }),
    );
  };

  const onMouseMove = async (e: MouseEvent) => {
    if (clicked) {
      const width = e.clientX - startX;
      const height = e.clientY - startY;

      clearCanvas(shapes, ctx, canvas);
      ctx.strokeStyle = "rgba(255, 255, 255)";
      ctx.strokeRect(startX, startY, width, height);
    }
  };

  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mousemove", onMouseMove);

  // Return teardown to remove event listeners on unmount
  return () => {
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("mousemove", onMouseMove);
  };
};

export const getExistingShapes = async (roomId: number) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const response = await axios.get(`${BACKEND_URL}/get-room-chats/${roomId}`);
  const chats = response.data.chats;
  const shapes = chats.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData as Shape;
  });
  return shapes;
};
