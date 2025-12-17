import { 
  Controller, Post, Get, Body, UseGuards, UseInterceptors, UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FragmentsService } from './fragments.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CreateFragmentDto } from './dto/create-fragment.dto';
import { v2 as cloudinary } from 'cloudinary';

@Controller('fragments')
@UseGuards(AuthGuard)
export class FragmentsController {
  constructor(private readonly fragmentsService: FragmentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image')) // Expect key 'image' for uploads
  async create(
    @CurrentUser() user: any, 
    @Body() dto: CreateFragmentDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    // Handle Image Upload if present
    if (file) {
      // Basic buffer upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream({}, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }).end(file.buffer);
      });
      
      dto.mediaUrl = result.secure_url;
      dto.type = 'IMAGE' as any; // Force type if file exists
    }

    return this.fragmentsService.create(user.id, dto);
  }

  @Get('timeline')
  async getTimeline(@CurrentUser() user: any) {
    return this.fragmentsService.getTimeline(user.id);
  }
}