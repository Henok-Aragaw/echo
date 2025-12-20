import { PrismaClient } from "@prisma/client";
import { normalizeName, VALID_DOMAIN } from "./utils";

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
  
  const { APIError, createAuthMiddleware } = await _importDynamic("better-auth/api");
  
  const { expo } = await _importDynamic("@better-auth/expo");

  authInstance = betterAuth({
    database: prismaAdapter(prisma, {
      provider: "mongodb",
    }),

    secret: process.env.BETTER_AUTH_SECRET,
    basePath: "/api/auth", 
    baseURL: process.env.BETTER_AUTH_URL || "https://echo-ten-eta.vercel.app", 

    user: {
      deleteUser: { enabled: true },
      changeEmail: { enabled: true }
    },

    emailAndPassword: {
      enabled: true,
      autoSignIn: true
    },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },

    hooks: {
      before: createAuthMiddleware(async(ctx: any) => {
        if(ctx.path === '/sign-up/email') {
          const email = String(ctx.body.email);
          const domain = email.split("@")[1];

          if(!VALID_DOMAIN().includes(domain)){
              throw new APIError("BAD_REQUEST", {
                  message:'Invalid domain, Please use a valid email.'
              });
          }

          const name = normalizeName(ctx.body.name);

          return {
            context: {
              ...ctx,
              body: {
                ...ctx.body,
                name
              }
            }
          }
        }
      })
    },

    plugins: [
        bearer(),
        expo() 
    ],

    advanced: {
      database: { generateId: false },
      useSecureCookies: false, 
      cookie: {
        secure: false, 
        sameSite: "lax",
      },
    },

    trustedOrigins: [
      "http://localhost:3000", 
      "myapp://",       
      "echo-app://",       
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
