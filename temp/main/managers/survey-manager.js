"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyManager = void 0;
const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const default_templates_1 = require("../templates/default-templates");
class SurveyManager {
    constructor() {
        this.writeOperations = new Map();
        // Set up storage directory in user's documents folder
        const userDocumentsPath = path.join(os.homedir(), 'Documents', 'ChatLabelingApp');
        this.surveyTemplatesDir = path.join(userDocumentsPath, 'question-templates');
        // Ensure the directory exists
        fs.ensureDirSync(this.surveyTemplatesDir);
    }
    async storeSurveyTemplate(template) {
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
        }
        finally {
            // Clean up the write operation
            this.writeOperations.delete(templateId);
        }
    }
    async performWrite(template) {
        try {
            const templatePath = path.join(this.surveyTemplatesDir, `${template.id}.json`);
            const jsonContent = JSON.stringify(template, null, 2);
            // Write to a temporary file first, then rename (atomic operation)
            const tempPath = `${templatePath}.tmp`;
            await fs.writeFile(tempPath, jsonContent);
            await fs.move(tempPath, templatePath, { overwrite: true });
            return true;
        }
        catch (error) {
            console.error('Failed to store survey template:', error);
            return false;
        }
    }
    async getSurveyTemplate(templateId) {
        try {
            const templatePath = path.join(this.surveyTemplatesDir, `${templateId}.json`);
            if (!await fs.pathExists(templatePath)) {
                return null;
            }
            const content = await fs.readFile(templatePath, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            console.error('Failed to get survey template:', error);
            return null;
        }
    }
    async getAllSurveyTemplates() {
        try {
            const files = await fs.readdir(this.surveyTemplatesDir);
            const templates = [];
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const templatePath = path.join(this.surveyTemplatesDir, file);
                    try {
                        const content = await fs.readFile(templatePath, 'utf-8');
                        const template = JSON.parse(content);
                        templates.push(template);
                    }
                    catch (error) {
                        console.error(`Failed to read template file ${file}:`, error);
                        // Optionally, you could move corrupted files to a backup location
                        // or attempt to fix them automatically
                    }
                }
            }
            // Sort by creation date (newest first)
            return templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        catch (error) {
            console.error('Failed to get all Assessment templates:', error);
            return [];
        }
    }
    async updateSurveyTemplate(templateId, updates) {
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
        }
        catch (error) {
            console.error('❌ SurveyManager: Failed to update survey template:', error);
            return false;
        }
    }
    async deleteSurveyTemplate(templateId) {
        try {
            const templatePath = path.join(this.surveyTemplatesDir, `${templateId}.json`);
            if (!await fs.pathExists(templatePath)) {
                return false;
            }
            await fs.remove(templatePath);
            return true;
        }
        catch (error) {
            console.error('Failed to delete survey template:', error);
            return false;
        }
    }
    async getSurveyTemplateStats() {
        try {
            const templates = await this.getAllSurveyTemplates();
            const totalTemplates = templates.length;
            const totalQuestions = templates.reduce((sum, template) => sum + (template.questions?.length || 0), 0);
            return { totalTemplates, totalQuestions };
        }
        catch (error) {
            console.error('Failed to get survey template stats:', error);
            return { totalTemplates: 0, totalQuestions: 0 };
        }
    }
    getSurveyTemplatesDirectory() {
        return this.surveyTemplatesDir;
    }
    /**
     * Initialize default templates if they don't exist
     * This method should be called during app startup
     */
    async initializeDefaultTemplates() {
        try {
            console.log('🔄 SurveyManager: initializeDefaultTemplates method called');
            console.log('🔄 SurveyManager: Initializing default templates...');
            // Check if any templates already exist
            const existingTemplates = await this.getAllSurveyTemplates();
            const existingTemplateIds = new Set(existingTemplates.map(t => t.id));
            // Filter out templates that already exist
            const templatesToCreate = default_templates_1.DEFAULT_TEMPLATES.filter(template => !existingTemplateIds.has(template.id));
            if (templatesToCreate.length === 0) {
                console.log('✅ SurveyManager: All default templates already exist');
                return true;
            }
            console.log(`📝 SurveyManager: Creating ${templatesToCreate.length} default templates...`);
            // Create each missing template
            let successCount = 0;
            for (const template of templatesToCreate) {
                try {
                    const success = await this.storeSurveyTemplate(template);
                    if (success) {
                        successCount++;
                        console.log(`✅ SurveyManager: Created template "${template.name}"`);
                    }
                    else {
                        console.error(`❌ SurveyManager: Failed to create template "${template.name}"`);
                    }
                }
                catch (error) {
                    console.error(`❌ SurveyManager: Error creating template "${template.name}":`, error);
                }
            }
            const allSuccessful = successCount === templatesToCreate.length;
            if (allSuccessful) {
                console.log(`✅ SurveyManager: Successfully initialized ${successCount} default templates`);
            }
            else {
                console.warn(`⚠️ SurveyManager: Initialized ${successCount}/${templatesToCreate.length} default templates`);
            }
            return allSuccessful;
        }
        catch (error) {
            console.error('❌ SurveyManager: Failed to initialize default templates:', error);
            return false;
        }
    }
}
exports.SurveyManager = SurveyManager;
