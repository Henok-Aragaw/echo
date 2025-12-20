import { 
  Controller, 
  Get, 
  Delete, 
  UseGuards, 
  Res, 
  Req, 
  HttpStatus 
} from '@nestjs/common';
import { Response, Request } from 'express'; 
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { getAuth } from '../lib/auth';

@Controller('user')
export class UserController {
  
  @Get('me')
  @UseGuards(AuthGuard)
  getProfile(@CurrentUser() user: any) {
    return {
      message: 'User profile retrieved',
      user: user,
    };
  }

  @Delete('me')
  @UseGuards(AuthGuard)
  async deleteAccount(
    @CurrentUser() user: any, 
    @Req() req: Request,
    @Res() res: Response 
  ) {
    try {
      
        const auth = await getAuth();

        await auth.api.deleteUser({
            body: {}, 
            headers: req.headers as unknown as HeadersInit
        });

        return res.status(HttpStatus.OK).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error("Delete Error:", error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
            error: 'Failed to delete account'
        });
    }
  }
}