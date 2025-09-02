import { ipcMain } from 'electron';
import { SurveyManager } from '../managers/survey-manager';

export class SurveyHandlers {
  private surveyManager: SurveyManager;

  constructor(surveyManager: SurveyManager) {
    console.log('📊 SurveyHandlers: Constructor called');
    this.surveyManager = surveyManager;
    console.log('📊 SurveyHandlers: Setting up handlers...');
    this.setupHandlers();
    console.log('✅ SurveyHandlers: Handlers set up successfully');
  }

  private setupHandlers() {
    // Survey Template Operations
    ipcMain.handle('survey:create-template', async (event, template: any) => {
      try {
        const success = await this.surveyManager.storeSurveyTemplate(template);
        if (success) {
          return { success: true, data: template };
        } else {
          return { success: false, error: 'Failed to store template' };
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    ipcMain.handle('survey:get-template', async (event, templateId: string) => {
      try {
        const template = await this.surveyManager.getSurveyTemplate(templateId);
        if (template) {
          return { success: true, data: template };
        } else {
          return { success: false, error: 'Template not found' };
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    ipcMain.handle('survey:get-all-templates', async () => {
      try {
        const templates = await this.surveyManager.getAllSurveyTemplates();
        return { success: true, data: templates };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    ipcMain.handle('survey:update-template', async (event, templateId: string, updates: any) => {
      try {
        console.log('🔄 SurveyHandlers: survey:update-template called', { templateId, updates });
        const success = await this.surveyManager.updateSurveyTemplate(templateId, updates);
        console.log('📁 SurveyManager: updateSurveyTemplate result:', success);
        
        if (success) {
          console.log('✅ SurveyHandlers: Template updated successfully');
          return { success: true, data: { updated: true } };
        } else {
          console.error('❌ SurveyHandlers: Failed to update template');
          return { success: false, error: 'Failed to update template' };
        }
      } catch (error) {
        console.error('❌ SurveyHandlers: Error updating template:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    ipcMain.handle('survey:delete-template', async (event, templateId: string) => {
      try {
        const success = await this.surveyManager.deleteSurveyTemplate(templateId);
        if (success) {
          return { success: true, data: { deleted: true } };
        } else {
          return { success: false, error: 'Failed to delete template' };
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    ipcMain.handle('survey:get-template-stats', async () => {
      try {
        const stats = await this.surveyManager.getSurveyTemplateStats();
        return { success: true, data: stats };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });
  }
}
