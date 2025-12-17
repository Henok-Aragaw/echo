import { All, Controller, Req, Res } from '@nestjs/common';
import { auth } from '../lib/auth';

@Controller('auth')
export class AuthController {
    @All('*path')
    async handleAuth(@Req() req, @Res() res) {
        const { toNodeHandler } = await import('better-auth/node');
        
        return toNodeHandler(auth)(req, res);
    }
}