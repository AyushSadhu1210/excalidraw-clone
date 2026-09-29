import axios from "axios";

export type ShapeTypes = "rect" | "circle" | "line";

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
  }
  | {
    type: "line";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
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
    ctx.strokeStyle = "rgba(255, 255, 255)";

    if (shape.type === "rect") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape.type === "line") {
      ctx.beginPath()
      ctx.moveTo(shape.startX, shape.startY)
      ctx.lineTo(shape.endX, shape.endY)
      ctx.stroke()
    }
  });
};

export const initDraw = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  existingShapes: Shape[],
  socket: WebSocket,
  selectedShapeRef: React.RefObject<ShapeTypes>,
) => {
  let clicked = false;
  let startX: number;
  let startY: number;
  let newShape: Shape;

  const shapes: Shape[] = existingShapes;
  const roomId = 1;

  // Initial black background fill
  clearCanvas(shapes, ctx, canvas);

  // Must join so the server will broadcast this user's room messages
  socket.send(
    JSON.stringify({
      type: "join_room",
      roomId,
    }),
  );

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "chat") {
      const shape = JSON.parse(data.message) as Shape;
      shapes.push(shape);
      clearCanvas(shapes, ctx, canvas);
    }
  };

  const onMouseDown = (e: MouseEvent) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  };

  const onMouseUp = async (e: MouseEvent) => {
    clicked = false;
    const width = e.clientX - startX;
    const height = e.clientY - startY;

    if (selectedShapeRef.current === "rect") {
      newShape = {
        type: "rect",
        x: startX,
        y: startY,
        width,
        height,
      };
    } else if (selectedShapeRef.current === "circle") {
      const radius = Math.max(width, height);
      newShape = {
        type: "circle",
        centerX: startX,
        centerY: startY,
        radius,
      }
    } else if (selectedShapeRef.current === "line") {
      newShape = {
        type: "line",
        startX,
        startY,
        endX: e.clientX,
        endY: e.clientY
      }
    }
    // Don't push locally — wait for the WS broadcast so every client
    // (including the drawer) adds the shape exactly once via onmessage
    socket.send(
      JSON.stringify({
        type: "chat",
        roomId,
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
      if (selectedShapeRef.current === "rect") {
        ctx.strokeRect(startX, startY, width, height);
      } else if (selectedShapeRef.current === "circle") {
        const radius = Math.max(width, height);
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (selectedShapeRef.current === "line") {
        ctx.beginPath();
        ctx.moveTo(startX, startY)
        ctx.lineTo(e.clientX, e.clientY)
        ctx.stroke()
      }
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
