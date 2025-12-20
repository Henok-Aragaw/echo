import axios from "axios";
import { storage } from "./storage";


const API_URL = 'https://echo-ten-eta.vercel.app/api';


export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
})

// Request Interceptor Attach Bearer Token
api.interceptors.request.use(async (config) => {
    const token = await storage.getToken();

    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    
    }

    return config
})

// Response Interceptor Handle 401 (Unauthorized)
api.interceptors.response.use((response) => response, 
 async (error) => {
    if(error.response?.status === 401) {
        await storage.removeToken();
    }
    return Promise.reject(error)
 }
)

