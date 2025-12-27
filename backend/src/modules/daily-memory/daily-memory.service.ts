import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AiService } from '../ai/ai.service';
import { startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

@Injectable()
export class DailyMemoryService {
  private readonly logger = new Logger(DailyMemoryService.name);

  constructor(private aiService: AiService) {}

  // Get All Infinite Scroll Logic
  async getEchoes(userId: string, cursor?: string, limit: number = 10) {
    const items = await prisma.dailyMemory.findMany({
      where: { userId },
      take: limit + 1, // Fetch 1 extra to check if there is a next page
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { date: 'desc' },
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = items[items.length - 1].id;
    }

    // Return object format { items, nextCursor }
    return { items, nextCursor };
  }

  // Get Single Memory Range Search Fix
  async getMemory(userId: string, dateString: string) {
    const targetDate = new Date(dateString);
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);


    return prisma.dailyMemory.findFirst({
      where: {
        userId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });
  }

  // Manual Generation
  async generateToday(userId: string) {
    const today = new Date();
    await this.createMemoryForUser(userId, today);
    return this.getMemory(userId, today.toISOString());
  }

  // Cron Job Automatic Nightly Generation
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


    const existing = await prisma.dailyMemory.findFirst({
        where: { userId, date: { gte: dayStart, lte: dayEnd } }
    });

    if (existing) {
        await prisma.dailyMemory.update({
            where: { id: existing.id },
            data: { summary }
        });
    } else {
        await prisma.dailyMemory.create({
            data: { userId, date: dayStart, summary }
        });
    }
  }
}