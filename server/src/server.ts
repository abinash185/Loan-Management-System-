import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

async function bootstrap() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});