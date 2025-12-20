import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let authInstance: any = null;

const _importDynamic = new Function('modulePath', 'return import(modulePath)');

export const getAuth = async () => {
  if (authInstance) {
    return authInstance;
  }

  const { betterAuth } = await _importDynamic("better-auth");
  const { prismaAdapter } = await _importDynamic("better-auth/adapters/prisma");
  const { bearer } = await _importDynamic("better-auth/plugins");

  authInstance = betterAuth({
    database: prismaAdapter(prisma, {
      provider: "mongodb",
    }),

    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || "https://echo-ten-eta.vercel.app", 

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
      "exp://192.168.1.100:8081", 
      "http://192.168.1.100:8081", 
      /exp:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5})/, 
      /http:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5})/,
      process.env.FRONTEND_URL || "" 
    ],
  });

  return authInstance;
};

function _forceBundling() {
    if (false) {
        require("better-auth");
        require("better-auth/adapters/prisma");
        require("better-auth/plugins");
        require("better-auth/node"); 
    }
}