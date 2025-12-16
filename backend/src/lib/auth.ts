import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  user:{
    deleteUser: {
      enabled: true
    }
  },

  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    bearer()
  ],

  advanced: {
    database: {
      generateId: false,
    },
  },
  
  trustedOrigins: [
    "http://localhost:3000",
    "myapp://"
  ],
});