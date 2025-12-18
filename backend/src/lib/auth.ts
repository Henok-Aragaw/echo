import { PrismaClient } from "@prisma/client";
// Only import types statically
import type { BetterAuthOptions } from "better-auth"; 

const prisma = new PrismaClient();

let authInstance: any = null;

// Helper to prevent TypeScript from converting import() to require()
const _importDynamic = new Function('modulePath', 'return import(modulePath)');

export const getAuth = async () => {
  if (authInstance) {
    return authInstance;
  }

  // Use the helper to dynamically import ESM modules
  const { betterAuth } = await _importDynamic("better-auth");
  const { prismaAdapter } = await _importDynamic("better-auth/adapters/prisma");
  const { bearer } = await _importDynamic("better-auth/plugins");

  authInstance = betterAuth({
    database: prismaAdapter(prisma, {
      provider: "mongodb",
    }),

    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,

    user: {
      deleteUser: {
        enabled: true,
      },
    },

    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },

    plugins: [bearer()],

    advanced: {
      database: {
        generateId: false,
      },
      useSecureCookies: false,
      cookie: {
        secure: false,
        sameSite: "lax",
      },
    },

    trustedOrigins: [
      "http://localhost:3000",
      "myapp://",
      "http://localhost:5500",
      process.env.FRONTEND_URL || "" 
    ],
  });

  return authInstance;
};