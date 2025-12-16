import { All, Controller, Req, Res } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth';

@Controller('auth')
export class AuthController {
    @All('*path')
    async handleAuth(@Req() req, @Res() res) {
        return toNodeHandler(auth)(req, res)
    }
}
