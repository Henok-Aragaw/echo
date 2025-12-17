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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  },

  plugins: [
    bearer()
  ],

  advanced: {
    database: {
      generateId: false,
    },
    useSecureCookies: false,
    cookie: {
      secure: false,
      sameSite: "lax",
    }
  },
  
  trustedOrigins: [
    "http://localhost:3000",
    "myapp://",
    // "http://127.0.0.1:5500",
    "http://localhost:5500"
  ],
});