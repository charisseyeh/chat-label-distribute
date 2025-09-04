import { AssessmentTemplate } from '../../types/assessment';

export const DEFAULT_TEMPLATES: AssessmentTemplate[] = [
  // Set A — Moment Check (3-point)
  {
    id: 'moment_check_3pt',
    name: 'Moment Check',
    questions: [
      {
        id: '1',
        text: 'How calm do you feel right now?',
        scale: 3,
        labels: {
          1: 'Not calm',
          2: 'Somewhat calm',
          3: 'Very calm'
        },
        order: 1
      },
      {
        id: '2',
        text: 'How relaxed is your body right now?',
        scale: 3,
        labels: {
          1: 'Not relaxed',
          2: 'Somewhat relaxed',
          3: 'Very relaxed'
        },
        order: 2
      },
      {
        id: '3',
        text: 'How in control of your emotions do you feel?',
        scale: 3,
        labels: {
          1: 'Not in control',
          2: 'Some control',
          3: 'Fully in control'
        },
        order: 3
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Set B — State Scan (5-point)
  {
    id: 'state_scan_5pt',
    name: 'State Scan',
    questions: [
      {
        id: '1',
        text: 'How present and focused are you right now?',
        scale: 5,
        labels: {
          1: 'Not at all focused',
          2: 'Slightly focused',
          3: 'Moderately focused',
          4: 'Quite focused',
          5: 'Extremely focused'
        },
        order: 1
      },
      {
        id: '2',
        text: 'How open do you feel toward connecting with others?',
        scale: 5,
        labels: {
          1: 'Very closed',
          2: 'Somewhat closed',
          3: 'Neutral',
          4: 'Somewhat open',
          5: 'Very open'
        },
        order: 2
      },
      {
        id: '3',
        text: 'If you tried, how easy would it be to return to calm?',
        scale: 5,
        labels: {
          1: 'Very hard',
          2: 'Hard',
          3: 'Neutral effort',
          4: 'Easy',
          5: 'Very easy'
        },
        order: 3
      },
      {
        id: '4',
        text: 'How fast are your thoughts moving?',
        scale: 5,
        labels: {
          1: 'Very slow',
          2: 'Slow',
          3: 'Steady',
          4: 'Fast',
          5: 'Very fast'
        },
        order: 4
      },
      {
        id: '5',
        text: 'How clear are your emotions right now?',
        scale: 5,
        labels: {
          1: 'Very unclear',
          2: 'Unclear',
          3: 'Mixed',
          4: 'Clear',
          5: 'Very clear'
        },
        order: 5
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Set C — Inner Map (7-point)
  {
    id: 'inner_map_7pt',
    name: 'Inner Map',
    questions: [
      {
        id: '1',
        text: 'How grounded do you feel in your body?',
        scale: 7,
        labels: {
          1: 'Not at all grounded',
          2: 'Slightly ungrounded',
          3: 'Somewhat ungrounded',
          4: 'Neutral',
          5: 'Somewhat grounded',
          6: 'Grounded',
          7: 'Very grounded'
        },
        order: 1
      },
      {
        id: '2',
        text: 'How scattered or focused is your attention?',
        scale: 7,
        labels: {
          1: 'Very scattered',
          2: 'Scattered',
          3: 'Somewhat scattered',
          4: 'Neutral',
          5: 'Somewhat focused',
          6: 'Focused',
          7: 'Very focused'
        },
        order: 2
      },
      {
        id: '3',
        text: 'How emotionally balanced do you feel?',
        scale: 7,
        labels: {
          1: 'Very unbalanced',
          2: 'Unbalanced',
          3: 'Somewhat unbalanced',
          4: 'Neutral',
          5: 'Somewhat balanced',
          6: 'Balanced',
          7: 'Very balanced'
        },
        order: 3
      },
      {
        id: '4',
        text: 'How much energy do you have right now?',
        scale: 7,
        labels: {
          1: 'Very low energy',
          2: 'Low energy',
          3: 'Somewhat low energy',
          4: 'Moderate energy',
          5: 'Somewhat high energy',
          6: 'High energy',
          7: 'Very high energy'
        },
        order: 4
      },
      {
        id: '5',
        text: 'How much control do you feel over your current state?',
        scale: 7,
        labels: {
          1: 'No control',
          2: 'Very little control',
          3: 'Some control',
          4: 'Neutral',
          5: 'Moderate control',
          6: 'Strong control',
          7: 'Full control'
        },
        order: 5
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const getDefaultTemplates = (): AssessmentTemplate[] => {
  return DEFAULT_TEMPLATES.map(template => ({
    ...template,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
};

export const getDefaultTemplate = (templateId: string): AssessmentTemplate | undefined => {
  return DEFAULT_TEMPLATES.find(template => template.id === templateId);
};

export const getDefaultTemplateNames = (): string[] => {
  return DEFAULT_TEMPLATES.map(template => template.name);
};
