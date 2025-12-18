import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Variable to cache the instance so we don't recreate it on every request
let authInstance: any = null;

export const getAuth = async () => {
  if (authInstance) {
    return authInstance;
  }

  // Dynamically import ESM modules
  const { betterAuth } = await import("better-auth");
  const { prismaAdapter } = await import("better-auth/adapters/prisma");
  const { bearer } = await import("better-auth/plugins");

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
    ],
  });

  return authInstance;
};