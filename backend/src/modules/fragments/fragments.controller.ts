import {
  Controller, Post, Get, Body, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FragmentsService } from './fragments.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CreateFragmentDto, FragmentType } from './dto/create-fragment.dto';
import { v2 as cloudinary } from 'cloudinary';

@Controller('fragments')
@UseGuards(AuthGuard)
export class FragmentsController {
  constructor(private readonly fragmentsService: FragmentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateFragmentDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      if (dto.type !== FragmentType.IMAGE) {
        dto.type = FragmentType.IMAGE;
      }

      try {
        const result = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload_stream({}, (err, res) => {
            if (err) return reject(err);
            resolve(res);
          }).end(file.buffer);
        });
        
        dto.mediaUrl = result.secure_url;
      } catch (e) {
        throw new BadRequestException("Failed to upload image to Cloudinary");
      }
    }

    return this.fragmentsService.create(user.id, dto);
  }

  @Get('timeline')
  async getTimeline(
    @CurrentUser() user: any,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
    @Query('date') date?: string
  ) {
    return this.fragmentsService.getTimeline(user.id, skip, take, date);
  }
}