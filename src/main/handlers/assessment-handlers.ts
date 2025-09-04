import { ipcMain } from 'electron';
import { AssessmentManager } from '../managers/assessment-manager';

export class AssessmentHandlers {
  private assessmentManager: AssessmentManager;

  constructor(assessmentManager: AssessmentManager) {
    console.log('📊 AssessmentHandlers: Constructor called');
    this.assessmentManager = assessmentManager;
    console.log('📊 AssessmentHandlers: Setting up handlers...');
    this.setupHandlers();
    console.log('✅ AssessmentHandlers: Handlers set up successfully');
  }

  private setupHandlers() {
    // Assessment Template Operations
    ipcMain.handle('assessment:create-template', async (event, template: any) => {
      try {
        const success = await this.assessmentManager.storeAssessmentTemplate(template);
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

    ipcMain.handle('assessment:get-template', async (event, templateId: string) => {
      try {
        const template = await this.assessmentManager.getAssessmentTemplate(templateId);
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

    ipcMain.handle('assessment:get-all-templates', async () => {
      try {
        const templates = await this.assessmentManager.getAllAssessmentTemplates();
        return { success: true, data: templates };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    ipcMain.handle('assessment:update-template', async (event, templateId: string, updates: any) => {
      try {
        console.log('🔄 AssessmentHandlers: assessment:update-template called', { templateId, updates });
        const success = await this.assessmentManager.updateAssessmentTemplate(templateId, updates);
        console.log('📁 AssessmentManager: updateAssessmentTemplate result:', success);
        
        if (success) {
          console.log('✅ AssessmentHandlers: Template updated successfully');
          return { success: true, data: { updated: true } };
        } else {
          console.error('❌ AssessmentHandlers: Failed to update template');
          return { success: false, error: 'Failed to update template' };
        }
      } catch (error) {
        console.error('❌ AssessmentHandlers: Error updating template:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    ipcMain.handle('assessment:delete-template', async (event, templateId: string) => {
      try {
        const success = await this.assessmentManager.deleteAssessmentTemplate(templateId);
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

    ipcMain.handle('assessment:get-template-stats', async () => {
      try {
        const stats = await this.assessmentManager.getAssessmentTemplateStats();
        return { success: true, data: stats };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    // Initialize default templates (for first run)
    ipcMain.handle('assessment:initialize-default-templates', async () => {
      try {
        console.log('🔄 AssessmentHandlers: assessment:initialize-default-templates called');
        const initialized = await this.assessmentManager.initializeDefaultTemplates();
        console.log('📁 AssessmentManager: initializeDefaultTemplates result:', initialized);
        
        if (initialized) {
          console.log('✅ AssessmentHandlers: Default templates initialized successfully');
          return { success: true, data: { initialized: true } };
        } else {
          console.log('ℹ️ AssessmentHandlers: Default templates already exist, no initialization needed');
          return { success: true, data: { initialized: false, reason: 'Templates already exist' } };
        }
      } catch (error) {
        console.error('❌ AssessmentHandlers: Error initializing default templates:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    // Check if this is first run
    ipcMain.handle('assessment:is-first-run', async () => {
      try {
        const isFirstRun = await this.assessmentManager.isFirstRun();
        return { success: true, data: { isFirstRun } };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });
  }
}
