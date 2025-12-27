import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AiService } from '../ai/ai.service';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

const prisma = new PrismaClient();

@Injectable()
export class DailyMemoryService {
  private readonly logger = new Logger(DailyMemoryService.name);

  constructor(private aiService: AiService) {}

  // Get All
  async getEchoes(userId: string, cursor?: string, limit: number = 10) {
    const items = await prisma.dailyMemory.findMany({
      where: { userId },
      take: limit + 1, 
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { date: 'desc' },
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = items[items.length - 1].id;
    }

    return { items, nextCursor };
  }

  // Get Single by Date
  async getMemory(userId: string, dateString: string) {
    const date = new Date(dateString);
    const dayStart = startOfDay(date);

    return prisma.dailyMemory.findUnique({
      where: {
        userId_date: {
          userId,
          date: dayStart
        }
      }
    });
  }

  // Generate Today
  async generateToday(userId: string) {
    const today = new Date();
    await this.createMemoryForUser(userId, today);
    return this.getMemory(userId, today.toISOString());
  }

  // Cron Job 
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async generateDailyMemories() {
    this.logger.log('Starting Daily Memory Generation...');
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const activeUsers = await prisma.user.findMany({
      where: {
        fragments: { some: { createdAt: { gte: todayStart, lte: todayEnd } } }
      },
      select: { id: true }
    });

    for (const user of activeUsers) {
      await this.createMemoryForUser(user.id, new Date());
    }
  }

  async createMemoryForUser(userId: string, date: Date) {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const fragments = await prisma.fragment.findMany({
      where: { userId, createdAt: { gte: dayStart, lte: dayEnd } },
      include: { insight: true }
    });

    if (fragments.length === 0) return;

    const summary = await this.aiService.generateDailyMemory(fragments);

    await prisma.dailyMemory.upsert({
      where: { userId_date: { userId, date: dayStart } },
      update: { summary },
      create: { userId, date: dayStart, summary }
    });
  }
}