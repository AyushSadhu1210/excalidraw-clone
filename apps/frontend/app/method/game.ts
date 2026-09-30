import { getExistingShapes, Shape, ShapeTypes } from "./draw";

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: number;
    socket: WebSocket
    private clicked = false
    private startX = 0
    private startY = 0
    private selectedTool: ShapeTypes = "rect"

    constructor(canvas: HTMLCanvasElement, roomId: number, socket: WebSocket) {
        this.canvas = canvas,
            this.ctx = canvas.getContext("2d")!
        this.existingShapes = []
        this.roomId = roomId
        this.socket = socket
        this.joinRoom()
        this.init()
        this.initHandler()
        this.mouseHandlers()
        this.clicked
        this.startX
    }

    setShape(shape: ShapeTypes) {
        this.selectedTool = shape
    }

    joinRoom() {
        this.socket.send(
            JSON.stringify({
                type: "join_room",
                roomId: this.roomId,
            }),
        );

    }
    async init() {
        this.existingShapes = await getExistingShapes(this.roomId)
        this.clearCanvas()
    }

    initHandler() {
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "chat") {
                const shape = JSON.parse(data.message) as Shape;
                this.existingShapes.push(shape);
                this.clearCanvas();
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.map((shape) => {
            this.ctx.strokeStyle = "rgba(255, 255, 255)";

            if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
                this.ctx.stroke();
            } else if (shape.type === "line") {
                this.ctx.beginPath()
                this.ctx.moveTo(shape.startX, shape.startY)
                this.ctx.lineTo(shape.endX, shape.endY)
                this.ctx.stroke()
            }
        });
    }

    onMouseDown = (e: MouseEvent) => {
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
    };

    onMouseUp = async (e: MouseEvent) => {
        this.clicked = false;
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;
        let newShape: Shape | null = null

        if (this.selectedTool === "rect") {
            newShape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width,
                height,
            };
        } else if (this.selectedTool === "circle") {
            const radius = Math.max(width, height);
            newShape = {
                type: "circle",
                centerX: this.startX,
                centerY: this.startY,
                radius,
            }
        } else if (this.selectedTool === "line") {
            newShape = {
                type: "line",
                startX: this.startX,
                startY: this.startY,
                endX: e.clientX,
                endY: e.clientY
            }
        }
        // Don't push locally — wait for the WS broadcast so every client
        // (including the drawer) adds the shape exactly once via onmessage
        this.socket.send(
            JSON.stringify({
                type: "chat",
                roomId: this.roomId,
                message: JSON.stringify(newShape),
            }),
        );
    };

    onMouseMove = async (e: MouseEvent) => {
        if (this.clicked) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;

            this.clearCanvas();
            this.ctx.strokeStyle = "rgba(255, 255, 255)";
            if (this.selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            } else if (this.selectedTool === "circle") {
                const radius = Math.max(width, height);
                this.ctx.beginPath();
                this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
            } else if (this.selectedTool === "line") {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY)
                this.ctx.lineTo(e.clientX, e.clientY)
                this.ctx.stroke()
            }
        }
    };

    mouseHandlers() {

        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.onMouseDown);
        this.canvas.removeEventListener("mouseup", this.onMouseUp);
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
    }
}