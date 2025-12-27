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

  // Get All Infinite Scroll
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

  async getMemory(userId: string, dateString: string) {

    const startDate = new Date(`${dateString}T00:00:00.000Z`);
    const endDate = new Date(`${dateString}T23:59:59.999Z`);

    console.log("Searching for memory between:", startDate.toISOString(), "and", endDate.toISOString());

    return prisma.dailyMemory.findFirst({
      where: {
        userId: userId,
        date: {
          gte: startDate, 
          lte: endDate,   
        },
      },
    });
  }

  // Generate Today 
  async generateToday(userId: string) {
    const today = new Date();
    await this.createMemoryForUser(userId, today);
    return this.getMemory(userId, today.toISOString().split('T')[0]);
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

    const existing = await prisma.dailyMemory.findFirst({
        where: { 
            userId, 
            date: { gte: dayStart, lte: dayEnd } 
        }
    });

    if (existing) {
        // Update existing
        await prisma.dailyMemory.update({
            where: { id: existing.id },
            data: { summary }
        });
    } else {

        const normalizedDate = new Date(date.toISOString().split('T')[0] + 'T00:00:00.000Z');
        
        await prisma.dailyMemory.create({
            data: { 
                userId, 
                date: normalizedDate, 
                summary 
            }
        });
    }
  }
}