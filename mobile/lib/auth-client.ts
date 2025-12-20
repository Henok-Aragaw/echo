import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
    baseURL: "https://echo-ten-eta.vercel.app",
    plugins: [
        expoClient({
            scheme: "echo-app", 
            storage: SecureStore,
        }),
    ],
});