import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { CreateFragmentDto } from './dto/create-fragment.dto';

const prisma = new PrismaClient();

@Injectable()
export class FragmentsService {
  constructor(private aiService: AiService) {}

  async create(userId: string, dto: CreateFragmentDto) {
    // 1. Save to DB
    const fragment = await prisma.fragment.create({
      data: {
        userId,
        type: dto.type, // Enum matches Prisma Enum
        content: dto.content,
        mediaUrl: dto.mediaUrl,
      },
    });

    try {
        const aiType = dto.type.toLowerCase() as 'text' | 'image' | 'link' | 'location';
        
        const aiContent = await this.aiService.generateFragmentInsight(
            dto.content, 
            aiType,
            { caption: dto.content } 
        );

        if (aiContent) {
            await prisma.insight.create({
                data: { fragmentId: fragment.id, content: aiContent },
            });
        }
    } catch (error) {
        console.error("AI Generation failed:", error);
    }

    return this.getOne(fragment.id);
  }

  async getOne(id: string) {
    return prisma.fragment.findUnique({
      where: { id },
      include: { insight: true },
    });
  }
}