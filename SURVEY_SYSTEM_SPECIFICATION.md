# Survey System Specification

## Overview
The survey system provides psychological assessment capabilities for conversations through progressive disclosure of survey sections. Users can create custom questions with flexible rating scales and labels, with surveys appearing at natural conversation breakpoints.

## Core Architecture

### 1. Survey Question Builder (`/survey-questions`)
- **Purpose**: Global question management interface for creating and customizing survey questions
- **Access**: Separate navigation route accessible from main navigation
- **Scope**: Single global question set applied to all conversations

#### Functionality
- Create custom questions (1-10 questions per survey section)
- Set rating scales per question (1-5, 1-7, 1-10, etc.)
- Define custom labels for each rating value (e.g., "1=Very Poor, 5=Excellent")
- Save question sets for reuse across all conversations
- Edit existing questions and scales
- Delete questions
- Preview how questions will appear in surveys

#### Data Structure
```typescript
interface SurveyQuestion {
  id: string;
  text: string;
  scale: number; // 5, 7, 10, etc.
  labels: Record<number, string>; // {1: "Very Poor", 2: "Poor", ...}
  category?: string; // Optional grouping
  order: number; // Display order within survey section
}

interface SurveyTemplate {
  id: string;
  name: string;
  questions: SurveyQuestion[];
  createdAt: string;
  updatedAt: string;
}

// AI Integration Requirements
interface AIPromptConfig {
  templateId: string;
  questions: Array<{
    id: string;
    text: string;
    scale: number;
    labels: Record<number, string>;
    position: 'beginning' | 'turn6' | 'end';
  }>;
  conversationContext: string;
  ratingInstructions: string;
}
```

### 2. Conversation Viewer with Survey Sidebar

#### Layout Structure
- **Main Content**: 80% width - conversation messages
- **Left Sidebar**: 20% width - survey sections with embedded questions
- **Progressive Disclosure**: Survey sections appear as user progresses through conversation

#### Survey Sections
1. **Beginning Survey**
   - Appears immediately when conversation loads
   - Contains questions for pre-conversation state assessment
   - Position: Top of left sidebar

2. **Turn 6 Survey**
   - Appears automatically when user scrolls to 6th message exchange
   - Contains questions for mid-conversation state assessment
   - Position: Middle of left sidebar, below beginning survey

3. **End Survey**
   - Appears when user scrolls to bottom of conversation
   - Contains questions for post-conversation state assessment
   - Position: Bottom of left sidebar, below turn 6 survey

#### Visual Design
- **Rating Buttons**: 18px circular buttons with hover effects
- **Selection States**: Filled background when selected, with shadow and scale effects
- **Hover Interactions**: Buttons scale to 1.1x and change border color
- **Smooth Transitions**: 0.2s ease animations for all interactions
- **Survey Section Headers**: Clear titles with position indicators
- **Progress Indicators**: Visual cues showing completion status

### 3. Scroll Position Tracking

#### Detection Mechanisms
- **Turn 6 Detection**: 
  - Monitor scroll position relative to message count
  - Trigger when 6th message exchange becomes visible in viewport
  - Use Intersection Observer API for efficient detection

- **End Detection**:
  - Monitor scroll position relative to conversation bottom
  - Trigger when user reaches bottom of conversation
  - Use scroll event listeners with throttling

#### Implementation
```typescript
interface ScrollTracker {
  trackMessageVisibility: (messageIndex: number) => void;
  trackConversationEnd: () => void;
  onTurn6Reached: (callback: () => void) => void;
  onEndReached: (callback: () => void) => void;
}
```

### 4. Survey Interface Components

#### Question Display
- Question text with clear typography
- Rating scale buttons with custom labels
- Previous/Next navigation within each survey section
- Auto-save functionality for each answer
- Visual feedback for answered/unanswered questions

#### Rating Scale Interface
- Circular rating buttons (18px diameter)
- Custom labels displayed below each button
- Hover effects with scale and color changes
- Selection states with filled backgrounds and shadows
- Smooth transitions for all interactions

#### Navigation
- Previous/Next buttons for question navigation within sections
- No validation preventing progression (users can skip questions)
- Auto-save on each answer change
- Visual indicators for question progress within sections

### 5. Data Management

#### Storage
- **Local Storage**: Auto-save survey responses as users progress
- **Survey Store**: Zustand store for managing survey state
- **Response Persistence**: Save partial progress and resume later
- **Question Templates**: Store custom question sets for reuse

#### Data Structure
```typescript
interface SurveyResponse {
  id: string;
  conversationId: string;
  position: 'beginning' | 'turn6' | 'end';
  questionId: string;
  rating: number;
  timestamp: string;
}

interface ConversationSurveyData {
  conversationId: string;
  responses: SurveyResponse[];
  completedSections: string[];
  lastUpdated: string;
}
```

### 6. AI Integration & Prompt Generation

#### AI Prompt System
- **Dynamic Prompt Generation**: Create prompts based on user's custom survey settings
- **Modular System Prompts**: Adapt prompts to different rating scales and question types
- **Position-Aware Prompts**: Generate context-specific prompts for beginning, turn 6, and end surveys
- **Custom Label Integration**: Include user-defined rating labels in AI instructions

#### Prompt Configuration
- **Survey Template Access**: AI service must access current survey template configuration
- **Dynamic Question Mapping**: Map custom questions to AI prompt structure
- **Rating Scale Adaptation**: Adapt prompts to different scales (1-5, 1-7, 1-10, etc.)
- **Label Context**: Provide AI with custom rating labels for accurate assessment

#### AI Service Integration
- **OpenAI API Integration**: Use GPT models for automated survey completion
- **Prompt Construction**: Build prompts dynamically from survey template
- **Response Parsing**: Parse AI responses to match survey rating format
- **Quality Validation**: Validate AI responses against expected rating scales

#### Example AI Prompt Generation
```typescript
// Example of how custom survey settings become AI prompts
const surveyTemplate = {
  questions: [
    {
      id: "mood_1",
      text: "How would you rate the overall mood?",
      scale: 5,
      labels: {1: "Very Negative", 2: "Negative", 3: "Neutral", 4: "Positive", 5: "Very Positive"},
      position: "beginning"
    }
  ]
};

// Generated AI prompt would include:
const aiPrompt = `
You are analyzing a conversation for psychological assessment. 
Please rate the following question based on the conversation content:

Question: "How would you rate the overall mood?"
Rating Scale: 1-5
Labels: 1=Very Negative, 2=Negative, 3=Neutral, 4=Positive, 5=Very Positive

Context: This rating is for the BEGINNING of the conversation (pre-conversation state).

Please provide only the numeric rating (1, 2, 3, 4, or 5) based on your analysis.
`;
```

### 7. Export & Analysis

#### Export Functionality
- **Format**: Simple JSON download for completed survey data
- **Implementation**: Export button integrated into survey sidebar or AI comparisons page
- **Content**: All survey responses with metadata, organized by conversation and survey position
- **Timestamps**: Include response timing data
- **No separate UI**: Direct download without complex export interface

#### Cross-Conversation Analysis
- **Comparison**: Side-by-side analysis of same questions across conversations
- **Statistics**: Aggregated ratings and trends
- **Visualization**: Charts and graphs for rating patterns
- **AI Comparison**: Integration with AI assessment data

## File Architecture

### New Files to Create

#### Components
```
src/renderer/components/survey/
├── SurveyQuestionBuilder.tsx          # Main question builder interface
├── SurveySidebar.tsx                  # Left sidebar with survey sections
├── SurveySection.tsx                  # Individual survey section component
├── QuestionDisplay.tsx                # Question rendering with rating scales
├── RatingScale.tsx                    # Rating scale interface component
└── SurveyProgress.tsx                 # Progress indicators and navigation
```

#### Pages
```
src/renderer/pages/
├── SurveyQuestionsPage.tsx            # Survey question builder page
└── AIComparisonsPage.tsx              # AI comparison analysis page
```

#### Services
```
src/renderer/services/
├── survey/
│   ├── questionService.ts             # Question management logic
│   ├── scrollTrackingService.ts       # Scroll position detection
│   ├── surveyExportService.ts         # Export functionality
│   ├── surveyValidationService.ts     # Survey validation logic
│   └── aiPromptService.ts             # AI prompt generation and management
```

#### Stores
```
src/renderer/stores/
├── surveyQuestionStore.ts             # Question template management
└── surveyResponseStore.ts             # Survey response data
```

#### Types
```
src/renderer/types/
├── survey.ts                          # Survey-related type definitions
└── question.ts                        # Question and template types
```

#### Hooks
```
src/renderer/hooks/
├── useSurveyQuestions.ts              # Question management hooks
├── useSurveyResponses.ts              # Response management hooks
├── useScrollTracking.ts               # Scroll position tracking
├── useSurveyExport.ts                 # Export functionality hook
└── useAIPrompt.ts                     # AI prompt generation and management
```

### Modified Files

#### Existing Components
- `ConversationViewer.tsx` - Integrate survey sidebar
- `App.tsx` - Add survey questions route
- `Sidebar.tsx` - Add survey questions navigation link
- `Header.tsx` - Add survey-related actions

#### Existing Stores
- `surveyStore.ts` - Extend with new functionality
- `navigationStore.ts` - Add survey navigation state

#### Existing Services
- `index.ts` - Export new survey services

## Implementation Phases

### Phase 1: Core Infrastructure
1. Create survey question types and interfaces
2. Implement survey question store
3. Create basic survey sidebar component
4. Integrate with conversation viewer

### Phase 2: Question Builder
1. Build survey questions page
2. Implement question creation/editing interface
3. Add rating scale customization
4. Create question template management

### Phase 3: Survey Interface
1. Implement progressive survey sections
2. Add rating scale components
3. Create navigation between questions
4. Implement auto-save functionality

### Phase 4: Scroll Tracking
1. Implement turn 6 detection
2. Add end of conversation detection
3. Integrate with survey section display
4. Add visual cues for survey points

### Phase 5: Export & Analysis
1. Implement JSON export functionality
2. Create AI comparisons page
3. Add cross-conversation analysis
4. Final testing and optimization

## Technical Requirements

### Performance
- Efficient scroll position tracking with throttling
- Lazy loading of survey sections
- Optimized re-rendering for survey components
- Minimal memory footprint for large conversations

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for rating scales

### Responsiveness
- Mobile-friendly survey interface
- Adaptive sidebar sizing
- Touch-friendly rating interactions
- Responsive typography and spacing

## User Experience Flow

### 1. Initial Setup
- User navigates to Survey Questions page
- Creates custom questions with rating scales and labels
- Saves question template for global use

### 2. Conversation Analysis
- User opens conversation
- Beginning survey appears in left sidebar
- User rates questions using custom scales
- Responses auto-save as they progress

### 3. Progressive Disclosure
- User scrolls to turn 6 → turn 6 survey appears
- User scrolls to end → end survey appears
- All surveys remain visible and accessible

### 4. Completion & Export
- User completes all survey sections
- Data is stored locally with timestamps
- User can export JSON data for analysis
- User can compare ratings across conversations

## Success Metrics

### Functionality
- All survey sections appear at correct conversation positions
- Rating scales work correctly with custom labels
- Auto-save preserves all user responses
- Export generates complete, accurate data

### User Experience
- Smooth, intuitive rating interactions
- Clear visual feedback for all actions
- Efficient navigation between questions
- Responsive design across devices

### Performance
- Scroll tracking doesn't impact conversation viewing
- Survey sidebar renders smoothly
- Auto-save completes within 100ms
- Export generates data within 1 second

## Future Enhancements

### Potential Additions
- Question templates for different conversation types
- Advanced analytics and reporting
- Integration with external assessment tools
- Collaborative rating capabilities
- Machine learning insights from rating patterns

### Scalability Considerations
- Support for unlimited questions per survey
- Efficient storage for large numbers of conversations
- Performance optimization for long conversations
- Modular architecture for easy feature additions
