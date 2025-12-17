import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AiService } from '../ai/ai.service';
import { startOfDay, endOfDay, subDays } from 'date-fns';

const prisma = new PrismaClient();

@Injectable()
export class DailyMemoryService {
  private readonly logger = new Logger(DailyMemoryService.name);

  constructor(private aiService: AiService) {}

  // Triggered every night at 11:55 PM
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async generateDailyMemories() {
    this.logger.log('Starting Daily Memory Generation...');
    
    // Find all users who posted today
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const activeUsers = await prisma.user.findMany({
      where: {
        fragments: {
          some: {
            createdAt: { gte: todayStart, lte: todayEnd }
          }
        }
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

    // Fetch fragments
    const fragments = await prisma.fragment.findMany({
      where: {
        userId,
        createdAt: { gte: dayStart, lte: dayEnd }
      },
      include: { insight: true }
    });

    if (fragments.length === 0) return;

    // Generate AI Summary
    const summary = await this.aiService.generateDailyMemory(fragments);

    // Upsert Memory
    await prisma.dailyMemory.upsert({
      where: {
        userId_date: {
          userId,
          date: dayStart
        }
      },
      update: { summary },
      create: {
        userId,
        date: dayStart,
        summary
      }
    });
  }

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
  
  // Get all past memories
  async getEchoes(userId: string) {
      return prisma.dailyMemory.findMany({
          where: { userId },
          orderBy: { date: 'desc' }
      });
  }
}