import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

async function bootstrap() {
  await prisma.$connect();

  const server = app.listen(env.PORT, () => {
    console.log(`AI Receptionist API running on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch(async (error) => {
  console.error("Failed to start server:", error);
  await prisma.$disconnect();
  process.exit(1);
});
