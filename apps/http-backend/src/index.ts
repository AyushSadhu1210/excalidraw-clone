import { env } from "@repo/env";
import express from "express";
import cors from "cors";
import useRouter from "./routes/routes.js";

const app = express();
const PORT = env.PORT;

// Global Middlewares
app.use(
  cors({
    origin: "http://localhost:3000", // or '*' for development
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

// Mount Routes
app.use("/api/v1", useRouter);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
