import { PrismaClient } from "@prisma/client/extension";

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? [] : ["query"],
});
