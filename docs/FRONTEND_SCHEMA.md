# 🎨 Frontend Architecture Schema - Chat Labeling AI

## 📋 **Overview**

This document provides a detailed schema of the frontend architecture for the Chat Labeling AI application, focusing on the React renderer process, component structure, state management, and service layer patterns.

## 🏗️ **Frontend Architecture Overview**

### **Core Architecture Pattern**
```
React App (Renderer Process)
├── Pages (Route Components)
├── Components (Feature Components)
├── Hooks (Custom Logic Hooks)
├── Stores (Zustand State Management)
├── Services (Business Logic Layer)
├── Types (TypeScript Definitions)
└── Utils (Utility Functions)
```

## 🗂️ **Component Architecture Schema**

### **Page Components (Route Level)**
```typescript
// Main application pages
├── ConversationSelectorPage     # File import and conversation selection
├── LabelConversationsPage       # Assessment interface
├── ConversationPage            # Individual conversation viewing
├── AssessmentTemplatesPage     # Template management
├── AssessmentQuestionsPage     # Question editing interface
└── AIComparisonsPage          # AI analysis and comparison
```

### **Feature Components (Organized by Domain)**

#### **Conversation Components**
```typescript
// Core conversation functionality
├── ConversationDisplay.tsx     # Main conversation renderer
├── ConversationDetail.tsx      # Detailed conversation view
├── MessageList.tsx            # Message container
├── Message.tsx                # Individual message component
├── FileList.tsx               # File management interface
├── ConversationSelector.tsx   # Conversation selection UI
└── ConversationNavigation.tsx # Navigation controls
```

#### **Assessment Components**
```typescript
// Assessment and rating functionality
├── AssessmentForm.tsx         # Main assessment form
├── AssessmentHeader.tsx       # Assessment page header
├── AssessmentSection.tsx      # Individual assessment section
├── AssessmentSidebar.tsx      # Assessment navigation sidebar
├── EditableQuestionCard.tsx   # Question editing interface
├── QuestionDisplay.tsx        # Question display component
├── RatingScale.tsx           # 7-point rating scale
├── TemplateCreationForm.tsx  # Template creation form
└── TemplateSwitcher.tsx      # Template selection interface
```

#### **AI Analysis Components**
```typescript
// AI integration and comparison
├── AIComparisonSidebar.tsx    # AI comparison panel
├── AIConfigurationPanel.tsx   # AI settings configuration
├── ComparisonResultsDisplay.tsx # Results visualization
├── ConversationSelector.tsx   # AI conversation selection
├── ExportComparisonModal.tsx  # Export functionality
├── ProgressTracker.tsx        # AI processing progress
└── PromptReviewModal.tsx      # Prompt review interface
```

#### **Common Components**
```typescript
// Reusable UI components
├── layout/
│   ├── Header.tsx            # Application header
│   ├── Sidebar.tsx           # Main navigation sidebar
│   ├── Footer.tsx            # Application footer
│   └── TwoPanelLayout.tsx    # Two-panel layout wrapper
├── atoms/
│   ├── CheckToggle.tsx       # Toggle switch component
│   └── Chip.tsx              # Chip/tag component
├── molecules/
│   ├── label/
│   │   ├── FloatingLabelInput.tsx    # Floating label input
│   │   ├── FloatingLabelSelect.tsx   # Floating label select
│   │   └── FloatingLabelTextarea.tsx # Floating label textarea
│   └── list/
│       ├── List.tsx          # Generic list component
│       └── ListItem.tsx      # List item component
└── navigation/
    ├── NavigationItem.tsx    # Navigation item component
    ├── NavigationItemNested.tsx # Nested navigation item
    └── NavigationSection.tsx # Navigation section wrapper
```

## 🏪 **State Management Schema (Zustand)**

### **Store Architecture**
```typescript
// Centralized state management with Zustand
├── conversationStore.ts      # Conversation state and operations
├── assessmentQuestionStore.ts # Assessment template management
├── assessmentResponseStore.ts # Assessment response data
├── assessmentStore.ts        # General assessment state
├── navigationStore.ts        # Application navigation state
├── settingsStore.ts          # User settings and preferences
├── aiComparisonStore.ts      # AI analysis and comparison state
└── pageActionsStore.ts       # Page-specific actions and state
```

### **Store Patterns**

#### **ConversationStore Schema**
```typescript
interface ConversationState {
  // Data
  conversations: Conversation[];
  currentConversation: Conversation | null;
  selectedConversationIds: string[];
  selectedConversations: SelectedConversation[];
  currentSourceFile: string | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  loadedConversations: ConversationData[];
  filteredConversations: ConversationData[];
  preventReload: boolean;
  
  // Filtering
  activeFilters: {
    relevant: boolean;
    notRelevant: boolean;
  };
  
  // Data Storage
  fullConversationData: Map<string, any>;
}

interface ConversationActions {
  // State Management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Conversation Management
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  
  // Selection Management
  toggleConversationSelection: (id: string) => void;
  setSelectedConversations: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Data Loading
  setLoadedConversations: (conversations: ConversationData[]) => void;
  setFilteredConversations: (conversations: ConversationData[]) => void;
  setCurrentSourceFile: (filePath: string | null) => void;
  
  // Filtering
  setActiveFilters: (filters: Partial<FilterState>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}
```

#### **AssessmentQuestionStore Schema**
```typescript
interface AssessmentQuestionState {
  // Template Data
  templates: AssessmentTemplate[];
  currentTemplate: AssessmentTemplate | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Template Management
  createTemplate: (template: Omit<AssessmentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<AssessmentTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  setCurrentTemplate: (template: AssessmentTemplate | null) => void;
  
  // Question Management
  addQuestion: (templateId: string, question: Omit<Question, 'id'>) => Promise<void>;
  updateQuestion: (templateId: string, questionId: string, updates: Partial<Question>) => Promise<void>;
  deleteQuestion: (templateId: string, questionId: string) => Promise<void>;
  reorderQuestions: (templateId: string, questionIds: string[]) => Promise<void>;
  
  // Data Loading
  loadTemplates: () => Promise<void>;
  loadTemplate: (id: string) => Promise<void>;
  initializeDefaultTemplate: () => Promise<void>;
}
```

## 🎣 **Custom Hooks Schema**

### **Hook Categories**

#### **Assessment Hooks**
```typescript
// Assessment-related custom hooks
├── useAssessmentQuestions.ts    # Template management
├── useAssessmentResponses.ts    # Response handling
├── useAssessmentExport.ts       # Export functionality
├── usePendingChanges.ts         # Change tracking
└── useTemplateSwitching.ts      # Template navigation
```

#### **Conversation Hooks**
```typescript
// Conversation-related custom hooks
├── useConversations.ts          # Conversation management
├── useConversationDetail.ts     # Individual conversation handling
├── useConversationLoader.ts     # File loading operations
├── useConversationSelection.ts  # Selection management
└── useConversationService.ts    # Service integration
```

#### **AI Hooks**
```typescript
// AI integration custom hooks
├── useAIConfiguration.ts        # AI settings management
├── useAIGeneration.ts           # AI label generation
└── useAIPrompt.ts               # Prompt management
```

#### **Core Hooks**
```typescript
// Core utility hooks
├── useFileManager.ts            # File operations
├── usePerformanceOptimization.ts # Performance utilities
├── useScrollTracking.ts         # Scroll position management
└── useStartupLoading.ts         # Application startup
```

### **Hook Patterns**

#### **Data Management Hook Pattern**
```typescript
export const useFeatureData = (id?: string) => {
  const {
    data,
    loading,
    error,
    actions
  } = useFeatureStore();
  
  // Computed values
  const currentData = useMemo(() => {
    if (!id) return null;
    return data.find(item => item.id === id);
  }, [id, data]);
  
  // Action handlers
  const handleAction = useCallback(async (params: ActionParams) => {
    try {
      await actions.performAction(params);
    } catch (error) {
      console.error('Action failed:', error);
    }
  }, [actions]);
  
  return {
    // State
    data: currentData,
    loading,
    error,
    
    // Actions
    performAction: handleAction,
    
    // Utilities
    clearError: actions.clearError
  };
};
```

#### **Service Integration Hook Pattern**
```typescript
export const useFeatureService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const performServiceOperation = useCallback(async (params: ServiceParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await window.electronAPI.serviceOperation(params);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    loading,
    error,
    performOperation: performServiceOperation,
    clearError: () => setError(null)
  };
};
```

## 🔧 **Service Layer Schema**

### **Service Architecture**
```typescript
// Business logic services organized by domain
├── conversation/
│   ├── conversationService.ts      # Main conversation processing
│   ├── conversationParser.ts       # JSON parsing and validation
│   ├── messageExtractor.ts         # Message extraction utilities
│   └── messageProcessingService.ts # Message processing logic
├── assessment/
│   ├── questionService.ts          # Question management
│   ├── assessmentExportService.ts  # Export functionality
│   ├── assessmentFileStorageService.ts # File operations
│   ├── aiPromptService.ts          # AI prompt generation
│   └── scrollTrackingService.ts    # UI scroll tracking
├── ai/
│   ├── ai-service.ts               # OpenAI API integration
│   └── aiComparisonService.ts      # Comparison logic
└── core/
    └── dateFilterService.ts        # Date filtering utilities
```

### **Service Patterns**

#### **Data Processing Service Pattern**
```typescript
export class DataProcessingService {
  // Main processing method
  async processData(input: InputData): Promise<ProcessedData> {
    try {
      // Validation
      this.validateInput(input);
      
      // Processing steps
      const step1 = await this.step1(input);
      const step2 = await this.step2(step1);
      const result = await this.step3(step2);
      
      // Validation
      this.validateOutput(result);
      
      return result;
    } catch (error) {
      throw new ProcessingError('Data processing failed', error);
    }
  }
  
  // Validation methods
  private validateInput(input: InputData): void {
    if (!input) throw new ValidationError('Input is required');
    // Additional validation logic
  }
  
  private validateOutput(output: ProcessedData): void {
    if (!output) throw new ValidationError('Output is invalid');
    // Additional validation logic
  }
  
  // Processing steps
  private async step1(input: InputData): Promise<IntermediateData> {
    // Implementation
  }
  
  private async step2(data: IntermediateData): Promise<IntermediateData> {
    // Implementation
  }
  
  private async step3(data: IntermediateData): Promise<ProcessedData> {
    // Implementation
  }
}
```

#### **API Integration Service Pattern**
```typescript
export class APIService {
  private baseURL: string;
  private timeout: number;
  
  constructor(config: APIConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
  }
  
  async callAPI<T>(endpoint: string, params: APIParams): Promise<APIResponse<T>> {
    try {
      const response = await this.makeRequest(endpoint, params);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  private async makeRequest(endpoint: string, params: APIParams): Promise<Response> {
    // Implementation
  }
  
  private handleResponse<T>(response: Response): APIResponse<T> {
    // Implementation
  }
  
  private handleError(error: Error): APIResponse<never> {
    // Implementation
  }
}
```

## 🎨 **UI Component Schema**

### **Component Patterns**

#### **Feature Component Pattern**
```typescript
interface FeatureComponentProps {
  // Required props
  id: string;
  data: FeatureData;
  
  // Optional props
  onUpdate?: (data: FeatureData) => void;
  onDelete?: (id: string) => void;
  className?: string;
  
  // Event handlers
  onAction?: (action: ActionType, payload: any) => void;
}

export const FeatureComponent: React.FC<FeatureComponentProps> = ({
  id,
  data,
  onUpdate,
  onDelete,
  className,
  onAction
}) => {
  // Hooks
  const { loading, error, performAction } = useFeatureData(id);
  const { handleAction } = useFeatureActions();
  
  // Event handlers
  const handleUpdate = useCallback((updates: Partial<FeatureData>) => {
    onUpdate?.(updates);
  }, [onUpdate]);
  
  const handleDelete = useCallback(() => {
    onDelete?.(id);
  }, [id, onDelete]);
  
  // Render
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className={cn("feature-component", className)}>
      {/* Component JSX */}
    </div>
  );
};
```

#### **Form Component Pattern**
```typescript
interface FormComponentProps {
  initialData?: FormData;
  onSubmit: (data: FormData) => void;
  onCancel?: () => void;
  validationSchema?: ValidationSchema;
}

export const FormComponent: React.FC<FormComponentProps> = ({
  initialData,
  onSubmit,
  onCancel,
  validationSchema
}) => {
  // Form setup
  const form = useForm<FormData>({
    defaultValues: initialData,
    resolver: validationSchema ? zodResolver(validationSchema) : undefined
  });
  
  // Form handlers
  const handleSubmit = useCallback((data: FormData) => {
    onSubmit(data);
  }, [onSubmit]);
  
  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Form fields */}
      <div className="form-actions">
        <Button type="submit">Submit</Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
```

## 🎯 **Routing Schema**

### **Route Structure**
```typescript
// Main application routes
const routes = [
  {
    path: '/',
    component: ConversationSelectorPage,
    title: 'Select Conversations'
  },
  {
    path: '/select-conversations',
    component: ConversationSelectorPage,
    title: 'Select Conversations'
  },
  {
    path: '/label-conversations',
    component: LabelConversationsPage,
    title: 'Label Conversations'
  },
  {
    path: '/conversation/:id',
    component: ConversationPage,
    title: 'Conversation Detail'
  },
  {
    path: '/assessment-templates',
    component: AssessmentTemplatesPage,
    title: 'Assessment Templates'
  },
  {
    path: '/assessment-template/:id',
    component: AssessmentQuestionsPage,
    title: 'Assessment Questions'
  },
  {
    path: '/ai-comparisons',
    component: AIComparisonsPage,
    title: 'AI Comparisons'
  }
];
```

### **Navigation Management**
```typescript
// Navigation state management
interface NavigationState {
  currentPage: Page;
  previousPage: Page | null;
  canGoBack: boolean;
  setCurrentPage: (page: Page) => void;
  goBack: () => void;
  goToPage: (page: Page) => void;
}

// Page types
type Page = 
  | 'select-conversations'
  | 'label-conversations'
  | 'ai-comparisons'
  | 'assessment-templates'
  | 'assessment-questions';
```

## 🎨 **Styling Schema**

### **Design System Structure**
```css
/* Design system organization */
styles/
├── design-system/
│   ├── base/
│   │   ├── elements.css        # Base HTML elements
│   │   └── index.css          # Base styles index
│   ├── components/
│   │   ├── atoms.css          # Atomic components
│   │   ├── buttons.css        # Button components
│   │   ├── forms.css          # Form components
│   │   ├── lists.css          # List components
│   │   ├── messages.css       # Message components
│   │   ├── molecules.css      # Molecular components
│   │   └── navigation.css     # Navigation components
│   ├── theme/
│   │   ├── colors.css         # Color system
│   │   ├── typography.css     # Typography system
│   │   ├── spacing.css        # Spacing system
│   │   ├── border-radius.css  # Border radius system
│   │   └── containers.css     # Container system
│   └── utilities/
│       └── index.css          # Utility classes
```

### **Component Styling Pattern**
```css
/* Component-specific styling */
.feature-component {
  @apply bg-background border border-border rounded-lg p-4;
  
  /* States */
  &.loading {
    @apply opacity-50 pointer-events-none;
  }
  
  &.error {
    @apply border-error bg-error/5;
  }
  
  /* Variants */
  &.variant-primary {
    @apply bg-primary text-primary-foreground;
  }
  
  &.variant-secondary {
    @apply bg-secondary text-secondary-foreground;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    @apply p-2;
  }
}
```

## 🔧 **Development Guidelines**

### **Component Development**
1. **Use TypeScript** for all components
2. **Follow naming conventions** (PascalCase for components)
3. **Implement proper prop validation** with TypeScript interfaces
4. **Use custom hooks** for complex logic
5. **Follow accessibility guidelines** (ARIA attributes, keyboard navigation)
6. **Implement proper error boundaries** for error handling

### **State Management**
1. **Use Zustand stores** for global state
2. **Use local state** for component-specific state
3. **Implement proper loading states** for async operations
4. **Handle errors gracefully** with user-friendly messages
5. **Use memoization** for expensive computations

### **Service Integration**
1. **Use custom hooks** for service integration
2. **Implement proper error handling** in services
3. **Use TypeScript** for service interfaces
4. **Implement caching** for expensive operations
5. **Use proper loading states** for async operations

### **Testing Strategy**
1. **Unit tests** for individual components
2. **Integration tests** for component interactions
3. **Hook tests** for custom hooks
4. **Service tests** for business logic
5. **E2E tests** for complete user workflows

---

**This schema provides a comprehensive understanding of the frontend architecture, enabling engineers to effectively develop and maintain the Chat Labeling AI application's user interface.**
