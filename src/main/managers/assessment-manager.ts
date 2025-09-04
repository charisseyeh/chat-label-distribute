import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

interface AssessmentTemplate {
  id: string;
  name: string;
  questions: any[];
  createdAt: string;
  updatedAt: string;
}

export class AssessmentManager {
  private assessmentTemplatesDir: string;
  private writeOperations: Map<string, Promise<boolean>> = new Map();

  constructor() {
    // Set up storage directory in user's documents folder
    const userDocumentsPath = path.join(os.homedir(), 'Documents', 'ChatLabelingApp');
    this.assessmentTemplatesDir = path.join(userDocumentsPath, 'question-templates');
    
    // Ensure the directory exists
    fs.ensureDirSync(this.assessmentTemplatesDir);
  }

  async storeAssessmentTemplate(template: AssessmentTemplate): Promise<boolean> {
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

  private async performWrite(template: AssessmentTemplate): Promise<boolean> {
    try {
      const templatePath = path.join(this.assessmentTemplatesDir, `${template.id}.json`);
      const jsonContent = JSON.stringify(template, null, 2);
      
      // Write to a temporary file first, then rename (atomic operation)
      const tempPath = `${templatePath}.tmp`;
      await fs.writeFile(tempPath, jsonContent);
      await fs.move(tempPath, templatePath, { overwrite: true });
      
      return true;
    } catch (error) {
      console.error('Failed to store assessment template:', error);
      return false;
    }
  }

  async getAssessmentTemplate(templateId: string): Promise<AssessmentTemplate | null> {
    try {
      const templatePath = path.join(this.assessmentTemplatesDir, `${templateId}.json`);
      
      if (!await fs.pathExists(templatePath)) {
        return null;
      }

      const content = await fs.readFile(templatePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to get assessment template:', error);
      return null;
    }
  }

  async getAllAssessmentTemplates(): Promise<AssessmentTemplate[]> {
    try {
      const files = await fs.readdir(this.assessmentTemplatesDir);
      const templates: AssessmentTemplate[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const templatePath = path.join(this.assessmentTemplatesDir, file);
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

  async updateAssessmentTemplate(templateId: string, updates: Partial<AssessmentTemplate>): Promise<boolean> {
    try {
      const existingTemplate = await this.getAssessmentTemplate(templateId);
      if (!existingTemplate) {
        console.error('Template not found:', templateId);
        return false;
      }

      const updatedTemplate = {
        ...existingTemplate,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const result = await this.storeAssessmentTemplate(updatedTemplate);
      return result;
    } catch (error) {
      console.error('Failed to update assessment template:', error);
      return false;
    }
  }

  async deleteAssessmentTemplate(templateId: string): Promise<boolean> {
    try {
      const templatePath = path.join(this.assessmentTemplatesDir, `${templateId}.json`);
      
      if (!await fs.pathExists(templatePath)) {
        return false;
      }

      await fs.remove(templatePath);
      return true;
    } catch (error) {
      console.error('Failed to delete assessment template:', error);
      return false;
    }
  }

  async getAssessmentTemplateStats(): Promise<{ totalTemplates: number; totalQuestions: number }> {
    try {
      const templates = await this.getAllAssessmentTemplates();
      const totalTemplates = templates.length;
      const totalQuestions = templates.reduce((sum, template) => 
        sum + (template.questions?.length || 0), 0
      );
      
      return { totalTemplates, totalQuestions };
    } catch (error) {
      console.error('Failed to get assessment template stats:', error);
      return { totalTemplates: 0, totalQuestions: 0 };
    }
  }

  getAssessmentTemplatesDirectory(): string {
    return this.assessmentTemplatesDir;
  }

  /**
   * Initialize default templates if none exist (first run)
   * Returns true if templates were initialized, false if they already existed
   */
  async initializeDefaultTemplates(): Promise<boolean> {
    try {
      // Check if any templates already exist
      const existingTemplates = await this.getAllAssessmentTemplates();
      
      if (existingTemplates.length > 0) {
        return false;
      }

      // Get default templates
      const defaultTemplatesPath = path.join(__dirname, '../../shared/data/defaultTemplates');
      const { getDefaultTemplates } = await import(defaultTemplatesPath);
      const defaultTemplates = getDefaultTemplates();
      
      let initializedCount = 0;

      // Store each default template
      for (const template of defaultTemplates) {
        const success = await this.storeAssessmentTemplate(template);
        if (success) {
          initializedCount++;
        } else {
          console.error(`Failed to store template: ${template.name}`);
        }
      }

      return initializedCount > 0;
    } catch (error) {
      console.error('Failed to initialize default templates:', error);
      return false;
    }
  }

  /**
   * Check if this is the first run (no templates exist)
   */
  async isFirstRun(): Promise<boolean> {
    try {
      const templates = await this.getAllAssessmentTemplates();
      return templates.length === 0;
    } catch (error) {
      console.error('Failed to check first run status:', error);
      return true; // Assume first run if we can't check
    }
  }
}
