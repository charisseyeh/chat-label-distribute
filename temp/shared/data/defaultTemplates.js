"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultTemplateNames = exports.getDefaultTemplate = exports.getDefaultTemplates = exports.DEFAULT_TEMPLATES = void 0;
exports.DEFAULT_TEMPLATES = [
    {
        id: 'default_emotional_wellbeing',
        name: 'Emotional Wellbeing Assessment',
        questions: [
            {
                id: '1',
                text: 'How would you rate the overall mood or emotional tone?',
                scale: 7,
                labels: {
                    1: 'Very negative',
                    2: 'Negative',
                    3: 'Somewhat negative',
                    4: 'Neutral',
                    5: 'Somewhat positive',
                    6: 'Positive',
                    7: 'Very positive'
                },
                order: 1
            },
            {
                id: '2',
                text: 'How well is the person managing and controlling their emotions?',
                scale: 7,
                labels: {
                    1: 'Poor control',
                    2: 'Below average',
                    3: 'Somewhat poor',
                    4: 'Average',
                    5: 'Somewhat good',
                    6: 'Good control',
                    7: 'Excellent control'
                },
                order: 2
            },
            {
                id: '3',
                text: 'How stressed or overwhelmed does the person appear to be?',
                scale: 7,
                labels: {
                    1: 'Extremely stressed',
                    2: 'Very stressed',
                    3: 'Stressed',
                    4: 'Moderate',
                    5: 'Somewhat relaxed',
                    6: 'Relaxed',
                    7: 'No stress'
                },
                order: 3
            },
            {
                id: '4',
                text: 'How energetic and engaged does the person seem?',
                scale: 7,
                labels: {
                    1: 'Very low energy',
                    2: 'Low energy',
                    3: 'Somewhat low',
                    4: 'Moderate',
                    5: 'Somewhat high',
                    6: 'High energy',
                    7: 'Very high energy'
                },
                order: 4
            },
            {
                id: '5',
                text: 'How would you rate the person\'s overall psychological wellbeing?',
                scale: 7,
                labels: {
                    1: 'Very poor',
                    2: 'Poor',
                    3: 'Below average',
                    4: 'Average',
                    5: 'Above average',
                    6: 'Good',
                    7: 'Excellent'
                },
                order: 5
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'default_communication_skills',
        name: 'Communication Skills Assessment',
        questions: [
            {
                id: '1',
                text: 'How clear and articulate is the person\'s communication?',
                scale: 7,
                labels: {
                    1: 'Very unclear',
                    2: 'Unclear',
                    3: 'Somewhat unclear',
                    4: 'Moderate',
                    5: 'Somewhat clear',
                    6: 'Clear',
                    7: 'Very clear'
                },
                order: 1
            },
            {
                id: '2',
                text: 'How well does the person listen and respond to others?',
                scale: 7,
                labels: {
                    1: 'Poor listening',
                    2: 'Below average',
                    3: 'Somewhat poor',
                    4: 'Average',
                    5: 'Somewhat good',
                    6: 'Good listening',
                    7: 'Excellent listening'
                },
                order: 2
            },
            {
                id: '3',
                text: 'How empathetic and understanding does the person appear?',
                scale: 7,
                labels: {
                    1: 'Not empathetic',
                    2: 'Low empathy',
                    3: 'Somewhat low',
                    4: 'Moderate',
                    5: 'Somewhat high',
                    6: 'High empathy',
                    7: 'Very empathetic'
                },
                order: 3
            },
            {
                id: '4',
                text: 'How confident does the person appear in their communication?',
                scale: 7,
                labels: {
                    1: 'Very unconfident',
                    2: 'Unconfident',
                    3: 'Somewhat unconfident',
                    4: 'Moderate',
                    5: 'Somewhat confident',
                    6: 'Confident',
                    7: 'Very confident'
                },
                order: 4
            },
            {
                id: '5',
                text: 'How effective is the person at conveying their thoughts and ideas?',
                scale: 7,
                labels: {
                    1: 'Very ineffective',
                    2: 'Ineffective',
                    3: 'Somewhat ineffective',
                    4: 'Moderate',
                    5: 'Somewhat effective',
                    6: 'Effective',
                    7: 'Very effective'
                },
                order: 5
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'default_problem_solving',
        name: 'Problem-Solving & Critical Thinking Assessment',
        questions: [
            {
                id: '1',
                text: 'How well does the person analyze and break down complex problems?',
                scale: 7,
                labels: {
                    1: 'Very poor analysis',
                    2: 'Poor analysis',
                    3: 'Below average',
                    4: 'Average',
                    5: 'Above average',
                    6: 'Good analysis',
                    7: 'Excellent analysis'
                },
                order: 1
            },
            {
                id: '2',
                text: 'How creative and innovative are the person\'s solutions?',
                scale: 7,
                labels: {
                    1: 'Not creative',
                    2: 'Low creativity',
                    3: 'Somewhat low',
                    4: 'Moderate',
                    5: 'Somewhat high',
                    6: 'High creativity',
                    7: 'Very creative'
                },
                order: 2
            },
            {
                id: '3',
                text: 'How logical and systematic is the person\'s approach to problems?',
                scale: 7,
                labels: {
                    1: 'Very illogical',
                    2: 'Illogical',
                    3: 'Somewhat illogical',
                    4: 'Moderate',
                    5: 'Somewhat logical',
                    6: 'Logical',
                    7: 'Very logical'
                },
                order: 3
            },
            {
                id: '4',
                text: 'How well does the person consider multiple perspectives and alternatives?',
                scale: 7,
                labels: {
                    1: 'Very narrow view',
                    2: 'Narrow view',
                    3: 'Somewhat narrow',
                    4: 'Moderate',
                    5: 'Somewhat broad',
                    6: 'Broad view',
                    7: 'Very broad view'
                },
                order: 4
            },
            {
                id: '5',
                text: 'How effective are the person\'s problem-solving strategies?',
                scale: 7,
                labels: {
                    1: 'Very ineffective',
                    2: 'Ineffective',
                    3: 'Somewhat ineffective',
                    4: 'Moderate',
                    5: 'Somewhat effective',
                    6: 'Effective',
                    7: 'Very effective'
                },
                order: 5
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'default_leadership_potential',
        name: 'Leadership Potential Assessment',
        questions: [
            {
                id: '1',
                text: 'How well does the person inspire and motivate others?',
                scale: 7,
                labels: {
                    1: 'Not inspiring',
                    2: 'Low inspiration',
                    3: 'Somewhat low',
                    4: 'Moderate',
                    5: 'Somewhat high',
                    6: 'High inspiration',
                    7: 'Very inspiring'
                },
                order: 1
            },
            {
                id: '2',
                text: 'How effectively does the person take initiative and responsibility?',
                scale: 7,
                labels: {
                    1: 'Very passive',
                    2: 'Passive',
                    3: 'Somewhat passive',
                    4: 'Moderate',
                    5: 'Somewhat active',
                    6: 'Active',
                    7: 'Very proactive'
                },
                order: 2
            },
            {
                id: '3',
                text: 'How well does the person handle conflict and difficult situations?',
                scale: 7,
                labels: {
                    1: 'Very poor handling',
                    2: 'Poor handling',
                    3: 'Below average',
                    4: 'Average',
                    5: 'Above average',
                    6: 'Good handling',
                    7: 'Excellent handling'
                },
                order: 3
            },
            {
                id: '4',
                text: 'How well does the person delegate and coordinate with others?',
                scale: 7,
                labels: {
                    1: 'Very poor delegation',
                    2: 'Poor delegation',
                    3: 'Below average',
                    4: 'Average',
                    5: 'Above average',
                    6: 'Good delegation',
                    7: 'Excellent delegation'
                },
                order: 4
            },
            {
                id: '5',
                text: 'How confident and decisive does the person appear in leadership situations?',
                scale: 7,
                labels: {
                    1: 'Very indecisive',
                    2: 'Indecisive',
                    3: 'Somewhat indecisive',
                    4: 'Moderate',
                    5: 'Somewhat decisive',
                    6: 'Decisive',
                    7: 'Very decisive'
                },
                order: 5
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];
/**
 * Get default templates with fresh timestamps
 * @returns Array of default assessment templates
 */
const getDefaultTemplates = () => {
    return exports.DEFAULT_TEMPLATES.map(template => ({
        ...template,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }));
};
exports.getDefaultTemplates = getDefaultTemplates;
/**
 * Get a specific default template by ID
 * @param templateId - The ID of the template to retrieve
 * @returns The template if found, undefined otherwise
 */
const getDefaultTemplate = (templateId) => {
    return exports.DEFAULT_TEMPLATES.find(template => template.id === templateId);
};
exports.getDefaultTemplate = getDefaultTemplate;
/**
 * Get template names for display purposes
 * @returns Array of template names
 */
const getDefaultTemplateNames = () => {
    return exports.DEFAULT_TEMPLATES.map(template => template.name);
};
exports.getDefaultTemplateNames = getDefaultTemplateNames;
