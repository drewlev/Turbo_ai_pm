import db from "@/app/db";
import { users } from "@/app/db/schema";


// used for assignee dropdown
export async function getUsers() {
  const users = await db.query.users.findMany();
  
  return users;
}

