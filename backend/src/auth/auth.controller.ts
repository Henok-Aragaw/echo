import { All, Controller, Req, Res } from '@nestjs/common';
import { getAuth } from '../lib/auth';

@Controller('auth')
export class AuthController {
    @All('*path')
    async handleAuth(@Req() req, @Res() res) {
        const _importDynamic = new Function('modulePath', 'return import(modulePath)');
        
        const { toNodeHandler } = await _importDynamic('better-auth/node');
        
        const auth = await getAuth();
        
        return toNodeHandler(auth)(req, res);
    }
}