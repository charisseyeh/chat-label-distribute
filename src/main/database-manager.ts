import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

export class DatabaseManager {
  private prisma: PrismaClient;
  private dbPath: string;

  constructor() {
    // Set up database path in user's documents folder
    const userDocumentsPath = path.join(os.homedir(), 'Documents', 'ChatLabelingApp');
    this.dbPath = path.join(userDocumentsPath, 'data', 'app.db');
    
    // Ensure the directory exists
    fs.ensureDirSync(path.dirname(this.dbPath));
    
    // Set environment variable for Prisma
    process.env.DATABASE_URL = `file:${this.dbPath}`;
    
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${this.dbPath}`,
        },
      },
    });
  }

  async initialize(): Promise<void> {
    try {
      // Test database connection
      await this.prisma.$connect();
      
      // Initialize default survey dimensions if they don't exist
      await this.initializeDefaultDimensions();
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async initializeDefaultDimensions(): Promise<void> {
    try {
      const existingDimensions = await this.prisma.surveyDimension.count();
      
      if (existingDimensions === 0) {
        const defaultDimensions = [
          {
            name: 'Mood State',
            description: 'Overall emotional state and mood',
            options: JSON.stringify([
              'Very negative', 'Negative', 'Slightly negative', 
              'Neutral', 'Slightly positive', 'Positive', 'Very positive'
            ]),
            scale: 7,
            orderIndex: 1,
            isActive: true
          },
          {
            name: 'Emotional Regulation',
            description: 'Ability to manage and control emotions',
            options: JSON.stringify([
              'Poor control', 'Below average', 'Somewhat poor', 
              'Average', 'Somewhat good', 'Good control', 'Excellent control'
            ]),
            scale: 7,
            orderIndex: 2,
            isActive: true
          },
          {
            name: 'Stress Level',
            description: 'Current level of stress and anxiety',
            options: JSON.stringify([
              'Extremely stressed', 'Very stressed', 'Stressed', 
              'Moderate', 'Slightly stressed', 'Low stress', 'No stress'
            ]),
            scale: 7,
            orderIndex: 3,
            isActive: true
          },
          {
            name: 'Energy Level',
            description: 'Current energy and motivation level',
            options: JSON.stringify([
              'Very low energy', 'Low energy', 'Somewhat low', 
              'Moderate', 'Somewhat high', 'High energy', 'Very high energy'
            ]),
            scale: 7,
            orderIndex: 4,
            isActive: true
          },
          {
            name: 'Overall Wellbeing',
            description: 'General sense of wellbeing and satisfaction',
            options: JSON.stringify([
              'Very poor', 'Poor', 'Below average', 
              'Average', 'Above average', 'Good', 'Excellent'
            ]),
            scale: 7,
            orderIndex: 5,
            isActive: true
          }
        ];

        for (const dimension of defaultDimensions) {
          await this.prisma.surveyDimension.create({
            data: dimension
          });
        }
        
        console.log('Default survey dimensions initialized');
      }
    } catch (error) {
      console.error('Failed to initialize default dimensions:', error);
      // Don't throw error as this is not critical for app startup
    }
  }

  // Conversation methods
  async getConversations(): Promise<any[]> {
    try {
      return await this.prisma.conversation.findMany({
        include: {
          messages: {
            orderBy: { sequenceOrder: 'asc' }
          },
          surveyResponses: true,
          aiLabels: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Failed to get conversations:', error);
      throw error;
    }
  }

  async getConversation(id: string): Promise<any> {
    try {
      return await this.prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { sequenceOrder: 'asc' }
          },
          surveyResponses: true,
          aiLabels: true
        }
      });
    } catch (error) {
      console.error('Failed to get conversation:', error);
      throw error;
    }
  }

  async createConversation(data: any): Promise<any> {
    try {
      return await this.prisma.conversation.create({
        data: {
          title: data.title,
          modelVersion: data.modelVersion,
          conversationLength: data.conversationLength,
          metadata: JSON.stringify(data.metadata),
          filePath: data.filePath
        }
      });
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  async createMessages(conversationId: string, messages: any[]): Promise<void> {
    try {
      const messageData = messages.map((msg, index) => ({
        conversationId,
        role: msg.role,
        content: msg.content,
        sequenceOrder: index
      }));

      await this.prisma.message.createMany({
        data: messageData
      });
    } catch (error) {
      console.error('Failed to create messages:', error);
      throw error;
    }
  }

  // Survey methods
  async getSurveyDimensions(): Promise<any[]> {
    try {
      return await this.prisma.surveyDimension.findMany({
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' }
      });
    } catch (error) {
      console.error('Failed to get survey dimensions:', error);
      throw error;
    }
  }

  async saveSurveyResponse(response: any): Promise<any> {
    try {
      const { conversationId, position, ratings, notes } = response;
      
      return await this.prisma.surveyResponse.upsert({
        where: {
          conversationId_position: {
            conversationId,
            position
          }
        },
        update: {
          ratings: JSON.stringify(ratings),
          notes,
          updatedAt: new Date()
        },
        create: {
          conversationId,
          position,
          ratings: JSON.stringify(ratings),
          notes
        }
      });
    } catch (error) {
      console.error('Failed to save survey response:', error);
      throw error;
    }
  }

  async getSurveyResponses(conversationId: string): Promise<any[]> {
    try {
      return await this.prisma.surveyResponse.findMany({
        where: { conversationId }
      });
    } catch (error) {
      console.error('Failed to get survey responses:', error);
      throw error;
    }
  }

  // AI Labels methods
  async saveAILabel(label: any): Promise<any> {
    try {
      const { conversationId, position, modelUsed, ratings, confidenceScores, promptUsed } = label;
      
      return await this.prisma.aILabel.upsert({
        where: {
          conversationId_position_modelUsed: {
            conversationId,
            position,
            modelUsed
          }
        },
        update: {
          ratings: JSON.stringify(ratings),
          confidenceScores: confidenceScores ? JSON.stringify(confidenceScores) : null,
          promptUsed
        },
        create: {
          conversationId,
          position,
          modelUsed,
          ratings: JSON.stringify(ratings),
          confidenceScores: confidenceScores ? JSON.stringify(confidenceScores) : null,
          promptUsed
        }
      });
    } catch (error) {
      console.error('Failed to save AI label:', error);
      throw error;
    }
  }

  async getAILabels(conversationId: string): Promise<any[]> {
    try {
      return await this.prisma.aILabel.findMany({
        where: { conversationId }
      });
    } catch (error) {
      console.error('Failed to get AI labels:', error);
      throw error;
    }
  }

  // Export methods
  async saveExportHistory(exportData: any): Promise<any> {
    try {
      return await this.prisma.exportHistory.create({
        data: {
          exportType: exportData.exportType,
          filters: exportData.filters ? JSON.stringify(exportData.filters) : null,
          filePath: exportData.filePath,
          recordCount: exportData.recordCount
        }
      });
    } catch (error) {
      console.error('Failed to save export history:', error);
      throw error;
    }
  }

  async getExportHistory(): Promise<any[]> {
    try {
      return await this.prisma.exportHistory.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Failed to get export history:', error);
      throw error;
    }
  }

  // Utility methods
  async close(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.prisma.$executeRaw`DELETE FROM ai_labels`;
      await this.prisma.$executeRaw`DELETE FROM survey_responses`;
      await this.prisma.$executeRaw`DELETE FROM messages`;
      await this.prisma.$executeRaw`DELETE FROM conversations`;
      await this.prisma.$executeRaw`DELETE FROM export_history`;
      console.log('Database reset successfully');
    } catch (error) {
      console.error('Failed to reset database:', error);
      throw error;
    }
  }
}
