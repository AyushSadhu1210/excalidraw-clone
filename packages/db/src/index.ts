import { env } from "@repo/env";
import { lookup } from "node:dns/promises";
import { Pool } from "pg";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = env.DATABASE_URL;
const dbUrl = new URL(connectionString);

// This machine's IPv6 route to Neon is broken; force IPv4 and keep SNI via servername.
const { address: ipv4Host } = await lookup(dbUrl.hostname, { family: 4 });

const pool = new Pool({
  host: ipv4Host,
  port: Number(dbUrl.port || 5432),
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace(/^\//, ""),
  ssl: {
    rejectUnauthorized: false,
    servername: dbUrl.hostname,
  },
});

const adapter = new PrismaPg(pool);

export const prismaClient = new PrismaClient({
  adapter,
});
