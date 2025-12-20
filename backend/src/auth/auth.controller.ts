import { All, Controller, Req, Res } from '@nestjs/common';
import { getAuth } from '../lib/auth';

@Controller('auth')
export class AuthController {
    @All('*path')
    async handleAuth(@Req() req, @Res() res) {
 
        try {
            require.resolve("better-auth");
            require.resolve("better-auth/node");
            require.resolve("better-auth/adapters/prisma");
            require.resolve("better-auth/plugins");
            require.resolve("better-auth/api");
            require.resolve("@better-auth/expo"); 
        } catch (e) {
            
        }

        const _importDynamic = new Function('modulePath', 'return import(modulePath)');
        
        const { toNodeHandler } = await _importDynamic('better-auth/node');
        
        const auth = await getAuth();
        
        return toNodeHandler(auth)(req, res);
    }
}