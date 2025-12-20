import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum FragmentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  LINK = 'LINK',
  LOCATION = 'LOCATION',
}

export class CreateFragmentDto {
  @IsEnum(FragmentType)
  // Transform handles if frontend sends 'image' instead of 'IMAGE'
  @Transform(({ value }) => value?.toString().toUpperCase()) 
  type: FragmentType;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}