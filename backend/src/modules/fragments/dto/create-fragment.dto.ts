import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export enum FragmentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  LINK = 'LINK',
  LOCATION = 'LOCATION',
}

export class CreateFragmentDto {
  @IsEnum(FragmentType)
  type: FragmentType;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}