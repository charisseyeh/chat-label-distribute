"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentManager = void 0;
const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const defaultTemplates_1 = require("../../shared/data/defaultTemplates");
class AssessmentManager {
    constructor() {
        this.writeOperations = new Map();
        // Set up storage directory in user's documents folder
        const userDocumentsPath = path.join(os.homedir(), 'Documents', 'ChatLabelingApp');
        this.assessmentTemplatesDir = path.join(userDocumentsPath, 'question-templates');
        // Ensure the directory exists
        fs.ensureDirSync(this.assessmentTemplatesDir);
    }
    async storeAssessmentTemplate(template) {
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
            const templatePath = path.join(this.assessmentTemplatesDir, `${template.id}.json`);
            const jsonContent = JSON.stringify(template, null, 2);
            // Write to a temporary file first, then rename (atomic operation)
            const tempPath = `${templatePath}.tmp`;
            await fs.writeFile(tempPath, jsonContent);
            await fs.move(tempPath, templatePath, { overwrite: true });
            return true;
        }
        catch (error) {
            console.error('Failed to store assessment template:', error);
            return false;
        }
    }
    async getAssessmentTemplate(templateId) {
        try {
            const templatePath = path.join(this.assessmentTemplatesDir, `${templateId}.json`);
            if (!await fs.pathExists(templatePath)) {
                return null;
            }
            const content = await fs.readFile(templatePath, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            console.error('Failed to get assessment template:', error);
            return null;
        }
    }
    async getAllAssessmentTemplates() {
        try {
            const files = await fs.readdir(this.assessmentTemplatesDir);
            const templates = [];
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const templatePath = path.join(this.assessmentTemplatesDir, file);
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
    async updateAssessmentTemplate(templateId, updates) {
        try {
            console.log('🔄 AssessmentManager: updateAssessmentTemplate called', { templateId, updates });
            const existingTemplate = await this.getAssessmentTemplate(templateId);
            if (!existingTemplate) {
                console.error('❌ AssessmentManager: Template not found:', templateId);
                return false;
            }
            console.log('📄 AssessmentManager: Found existing template:', existingTemplate);
            const updatedTemplate = {
                ...existingTemplate,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            console.log('💾 AssessmentManager: Storing updated template:', updatedTemplate);
            const result = await this.storeAssessmentTemplate(updatedTemplate);
            console.log('💾 AssessmentManager: Store result:', result);
            return result;
        }
        catch (error) {
            console.error('❌ AssessmentManager: Failed to update assessment template:', error);
            return false;
        }
    }
    async deleteAssessmentTemplate(templateId) {
        try {
            const templatePath = path.join(this.assessmentTemplatesDir, `${templateId}.json`);
            if (!await fs.pathExists(templatePath)) {
                return false;
            }
            await fs.remove(templatePath);
            return true;
        }
        catch (error) {
            console.error('Failed to delete assessment template:', error);
            return false;
        }
    }
    async getAssessmentTemplateStats() {
        try {
            const templates = await this.getAllAssessmentTemplates();
            const totalTemplates = templates.length;
            const totalQuestions = templates.reduce((sum, template) => sum + (template.questions?.length || 0), 0);
            return { totalTemplates, totalQuestions };
        }
        catch (error) {
            console.error('Failed to get assessment template stats:', error);
            return { totalTemplates: 0, totalQuestions: 0 };
        }
    }
    getAssessmentTemplatesDirectory() {
        return this.assessmentTemplatesDir;
    }
    /**
     * Initialize default templates if none exist (first run)
     * Returns true if templates were initialized, false if they already existed
     */
    async initializeDefaultTemplates() {
        try {
            console.log('🔍 AssessmentManager: Checking for existing templates...');
            // Check if any templates already exist
            const existingTemplates = await this.getAllAssessmentTemplates();
            if (existingTemplates.length > 0) {
                console.log(`✅ AssessmentManager: Found ${existingTemplates.length} existing templates, skipping default initialization`);
                return false;
            }
            console.log('📝 AssessmentManager: No existing templates found, initializing default templates...');
            // Get default templates
            const defaultTemplates = (0, defaultTemplates_1.getDefaultTemplates)();
            let initializedCount = 0;
            // Store each default template
            for (const template of defaultTemplates) {
                const success = await this.storeAssessmentTemplate(template);
                if (success) {
                    initializedCount++;
                    console.log(`✅ AssessmentManager: Initialized default template: ${template.name}`);
                }
                else {
                    console.error(`❌ AssessmentManager: Failed to initialize template: ${template.name}`);
                }
            }
            console.log(`🎉 AssessmentManager: Successfully initialized ${initializedCount}/${defaultTemplates.length} default templates`);
            return initializedCount > 0;
        }
        catch (error) {
            console.error('❌ AssessmentManager: Failed to initialize default templates:', error);
            return false;
        }
    }
    /**
     * Check if this is the first run (no templates exist)
     */
    async isFirstRun() {
        try {
            const templates = await this.getAllAssessmentTemplates();
            return templates.length === 0;
        }
        catch (error) {
            console.error('❌ AssessmentManager: Failed to check first run status:', error);
            return true; // Assume first run if we can't check
        }
    }
}
exports.AssessmentManager = AssessmentManager;
