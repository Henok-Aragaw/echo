import { Controller, Get, Delete, UseGuards, Res, Req, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { auth } from '../lib/auth';
import { Response, Request } from 'express';

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
  async deleteAccount(@CurrentUser() user: any, @Req() req: Request, @Res() res: Response) {
    try {
        console.log("Attempting to delete user:", user.id);

        await auth.api.deleteUser({
            body: {}, 
            
            headers: req.headers as any 
        });

        return res.status(HttpStatus.OK).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error("Better Auth Delete Error:", error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
            error: 'Failed to delete account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
  }
}