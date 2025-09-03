import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

interface SurveyTemplate {
  id: string;
  name: string;
  questions: any[];
  createdAt: string;
  updatedAt: string;
}

export class SurveyManager {
  private surveyTemplatesDir: string;
  private writeOperations: Map<string, Promise<boolean>> = new Map();

  constructor() {
    // Set up storage directory in user's documents folder
    const userDocumentsPath = path.join(os.homedir(), 'Documents', 'ChatLabelingApp');
    this.surveyTemplatesDir = path.join(userDocumentsPath, 'question-templates');
    
    // Ensure the directory exists
    fs.ensureDirSync(this.surveyTemplatesDir);
  }

  async storeSurveyTemplate(template: SurveyTemplate): Promise<boolean> {
    const templateId = template.id;
    
    // If there's already a write operation in progress for this template, wait for it
    if (this.writeOperations.has(templateId)) {
      console.log(`⏳ Waiting for existing write operation for template ${templateId}`);
      await this.writeOperations.get(templateId);
    }
    
    // Create a new write operation
    const writePromise = this.performWrite(template);
    this.writeOperations.set(templateId, writePromise);
    
    try {
      const result = await writePromise;
      return result;
    } finally {
      // Clean up the write operation
      this.writeOperations.delete(templateId);
    }
  }

  private async performWrite(template: SurveyTemplate): Promise<boolean> {
    try {
      const templatePath = path.join(this.surveyTemplatesDir, `${template.id}.json`);
      const jsonContent = JSON.stringify(template, null, 2);
      
      // Write to a temporary file first, then rename (atomic operation)
      const tempPath = `${templatePath}.tmp`;
      await fs.writeFile(tempPath, jsonContent);
      await fs.move(tempPath, templatePath, { overwrite: true });
      
      return true;
    } catch (error) {
      console.error('Failed to store survey template:', error);
      return false;
    }
  }

  async getSurveyTemplate(templateId: string): Promise<SurveyTemplate | null> {
    try {
      const templatePath = path.join(this.surveyTemplatesDir, `${templateId}.json`);
      
      if (!await fs.pathExists(templatePath)) {
        return null;
      }

      const content = await fs.readFile(templatePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to get survey template:', error);
      return null;
    }
  }

  async getAllSurveyTemplates(): Promise<SurveyTemplate[]> {
    try {
      const files = await fs.readdir(this.surveyTemplatesDir);
      const templates: SurveyTemplate[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const templatePath = path.join(this.surveyTemplatesDir, file);
          try {
            const content = await fs.readFile(templatePath, 'utf-8');
            const template = JSON.parse(content);
            templates.push(template);
          } catch (error) {
            console.error(`Failed to read template file ${file}:`, error);
            // Optionally, you could move corrupted files to a backup location
            // or attempt to fix them automatically
          }
        }
      }

      // Sort by creation date (newest first)
      return templates.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get all Assessment templates:', error);
      return [];
    }
  }

  async updateSurveyTemplate(templateId: string, updates: Partial<SurveyTemplate>): Promise<boolean> {
    try {
      console.log('🔄 SurveyManager: updateSurveyTemplate called', { templateId, updates });
      
      const existingTemplate = await this.getSurveyTemplate(templateId);
      if (!existingTemplate) {
        console.error('❌ SurveyManager: Template not found:', templateId);
        return false;
      }

      console.log('📄 SurveyManager: Found existing template:', existingTemplate);

      const updatedTemplate = {
        ...existingTemplate,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      console.log('💾 SurveyManager: Storing updated template:', updatedTemplate);
      const result = await this.storeSurveyTemplate(updatedTemplate);
      console.log('💾 SurveyManager: Store result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ SurveyManager: Failed to update survey template:', error);
      return false;
    }
  }

  async deleteSurveyTemplate(templateId: string): Promise<boolean> {
    try {
      const templatePath = path.join(this.surveyTemplatesDir, `${templateId}.json`);
      
      if (!await fs.pathExists(templatePath)) {
        return false;
      }

      await fs.remove(templatePath);
      return true;
    } catch (error) {
      console.error('Failed to delete survey template:', error);
      return false;
    }
  }

  async getSurveyTemplateStats(): Promise<{ totalTemplates: number; totalQuestions: number }> {
    try {
      const templates = await this.getAllSurveyTemplates();
      const totalTemplates = templates.length;
      const totalQuestions = templates.reduce((sum, template) => 
        sum + (template.questions?.length || 0), 0
      );
      
      return { totalTemplates, totalQuestions };
    } catch (error) {
      console.error('Failed to get survey template stats:', error);
      return { totalTemplates: 0, totalQuestions: 0 };
    }
  }

  getSurveyTemplatesDirectory(): string {
    return this.surveyTemplatesDir;
  }
}
