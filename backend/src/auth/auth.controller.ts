import { All, Controller, Req, Res } from '@nestjs/common';
import { getAuth } from '../lib/auth';

@Controller('auth')
export class AuthController {
    @All('*path')
    async handleAuth(@Req() req, @Res() res) {
        const { toNodeHandler } = await import('better-auth/node');
        
        // Initialize auth asynchronously
        const auth = await getAuth();
        
        return toNodeHandler(auth)(req, res);
    }
}