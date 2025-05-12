import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/app/db/schema";

const db = drizzle(process.env.DATABASE_URL!, { schema });

export default db;
