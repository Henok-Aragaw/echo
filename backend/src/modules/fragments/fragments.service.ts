import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { CreateFragmentDto } from './dto/create-fragment.dto';

const prisma = new PrismaClient();

@Injectable()
export class FragmentsService {
  constructor(private aiService: AiService) {}

  async create(userId: string, dto: CreateFragmentDto) {
    // Create the fragment in DB
    const fragment = await prisma.fragment.create({
      data: {
        userId,
        type: dto.type,
        content: dto.content,
        mediaUrl: dto.mediaUrl,
      },
    });

    const aiType = dto.type.toLowerCase() as 'text' | 'image' | 'link' | 'location';

    // Generate AI Insight
    const aiContent = await this.aiService.generateFragmentInsight(
      dto.content, 
      aiType,
      { caption: dto.content } 
    );

    // Save Insight
    await prisma.insight.create({
      data: {
        fragmentId: fragment.id,
        content: aiContent,
      },
    });

    // Return combined data
    return this.getOne(fragment.id);
  }

  async getOne(id: string) {
    return prisma.fragment.findUnique({
      where: { id },
      include: { insight: true },
    });
  }

  async getTimeline(userId: string) {
    return prisma.fragment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { insight: true },
    });
  }
}