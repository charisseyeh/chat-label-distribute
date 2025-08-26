# 🏗️ Cursor Architecture Direction - Chat Labeling System Rebuild

## 🎯 **High-Level Architecture Overview**

This document provides architectural direction for rebuilding the Chat Labeling System with a modern, robust architecture. Follow these patterns and structures when implementing components and features.

## 🏛️ **Core Architecture Patterns**

### **1. Domain-Driven Design (DDD)**
- **Bounded Contexts**: Separate concerns into clear domains
- **Entities**: Core business objects with identity and lifecycle
- **Value Objects**: Immutable objects without identity
- **Services**: Business logic that doesn't belong to entities
- **Repositories**: Data access abstraction layer

### **2. Clean Architecture**
- **Presentation Layer**: UI components and user interactions
- **Application Layer**: Use cases and application services
- **Domain Layer**: Business logic and entities
- **Infrastructure Layer**: External concerns (database, APIs, file system)

### **3. Event-Driven Architecture**
- **Domain Events**: Business events that trigger reactions
- **Event Handlers**: Process events and update state
- **Event Store**: Persistent event log for audit and replay

## 🧩 **Core Components Architecture**

### **Frontend Components Structure**

```
src/
├── components/
│   ├── common/                    # Reusable UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Loading/
│   │   ├── ErrorBoundary/
│   │   └── Toast/
│   ├── layout/                    # Layout and navigation
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Navigation/
│   │   └── PageContainer/
│   ├── conversation/              # Conversation management
│   │   ├── ConversationList/
│   │   ├── ConversationViewer/
│   │   ├── MessageBubble/
│   │   ├── ConversationFilters/
│   │   └── ConversationUpload/
│   ├── survey/                    # Survey and rating system
│   │   ├── RatingScale/
│   │   ├── SurveyForm/
│   │   ├── SurveyNavigation/
│   │   ├── ResponseSummary/
│   │   └── DimensionSelector/
│   ├── ai-analysis/               # AI integration features
│   │   ├── AILabelGenerator/
│   │   ├── ComparisonView/
│   │   ├── AccuracyMetrics/
│   │   └── AISettings/
│   └── export/                    # Data export and analytics
│       ├── ExportOptions/
│       ├── DataPreview/
│       ├── AnalyticsCharts/
│       └── ExportHistory/
```

### **Backend Services Structure**

```
src/
├── services/
│   ├── conversation/              # Conversation management
│   │   ├── ConversationService.ts
│   │   ├── MessageService.ts
│   │   ├── UploadService.ts
│   │   └── FilterService.ts
│   ├── survey/                    # Survey and rating system
│   │   ├── SurveyService.ts
│   │   ├── RatingService.ts
│   │   ├── DimensionService.ts
│   │   └── ResponseService.ts
│   ├── ai-analysis/               # AI integration
│   │   ├── AIService.ts
│   │   ├── LabelingService.ts
│   │   ├── ComparisonService.ts
│   │   └── MetricsService.ts
│   ├── export/                    # Data export
│   │   ├── ExportService.ts
│   │   ├── AnalyticsService.ts
│   │   └── ValidationService.ts
│   └── infrastructure/            # Cross-cutting concerns
│       ├── FileService.ts
│       ├── ValidationService.ts
│       ├── ErrorHandlingService.ts
│       └── LoggingService.ts
```

## 🔄 **State Management Architecture**

### **Frontend State Management**

#### **1. React Context + Hooks (Local State)**
```typescript
// For component-specific state
const useConversationState = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  
  return {
    conversations,
    currentConversation,
    loading,
    setConversations,
    setCurrentConversation,
    setLoading
  };
};
```

#### **2. Zustand (Global State)**
```typescript
// For application-wide state
interface AppState {
  // User preferences
  darkMode: boolean;
  language: string;
  
  // Application state
  currentView: 'conversations' | 'survey' | 'ai-analysis' | 'export';
  sidebarCollapsed: boolean;
  
  // Actions
  toggleDarkMode: () => void;
  setCurrentView: (view: AppState['currentView']) => void;
  toggleSidebar: () => void;
}

const useAppStore = create<AppState>((set) => ({
  darkMode: false,
  language: 'en',
  currentView: 'conversations',
  sidebarCollapsed: false,
  
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setCurrentView: (view) => set({ currentView: view }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
}));
```

#### **3. React Query (Server State)**
```typescript
// For API data management
const useConversations = (filters: FilterOptions) => {
  return useQuery({
    queryKey: ['conversations', filters],
    queryFn: () => conversationAPI.getConversations(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000  // 10 minutes
  });
};

const useCreateSurveyResponse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (response: SurveyResponse) => surveyAPI.createResponse(response),
    onSuccess: () => {
      queryClient.invalidateQueries(['survey-responses']);
      queryClient.invalidateQueries(['conversations']);
    }
  });
};
```

### **Backend State Management**

#### **1. Repository Pattern**
```typescript
interface ConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  findByFilters(filters: FilterOptions): Promise<Conversation[]>;
  save(conversation: Conversation): Promise<void>;
  delete(id: string): Promise<void>;
  countByFilters(filters: FilterOptions): Promise<number>;
}

class PostgresConversationRepository implements ConversationRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findById(id: string): Promise<Conversation | null> {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: { messages: true, surveyResponses: true }
    });
  }
  
  // ... other implementations
}
```

#### **2. Service Layer Pattern**
```typescript
class ConversationService {
  constructor(
    private conversationRepo: ConversationRepository,
    private eventBus: EventBus
  ) {}
  
  async createConversation(data: CreateConversationData): Promise<Conversation> {
    const conversation = await this.conversationRepo.save(data);
    
    this.eventBus.publish(new ConversationCreated(conversation));
    return conversation;
  }
  
  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const conversation = await this.conversationRepo.findById(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    const updated = { ...conversation, ...updates };
    await this.conversationRepo.save(updated);
    
    this.eventBus.publish(new ConversationUpdated(updated));
    return updated;
  }
}
```

## 🎭 **Component Design Patterns**

### **1. Container/Presenter Pattern**
```typescript
// Container component (logic)
const ConversationListContainer = () => {
  const { data: conversations, isLoading, error } = useConversations();
  const { mutate: deleteConversation } = useDeleteConversation();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <ConversationList
      conversations={conversations}
      onDelete={deleteConversation}
    />
  );
};

// Presenter component (UI)
const ConversationList = ({ conversations, onDelete }: ConversationListProps) => {
  return (
    <div className="conversation-list">
      {conversations.map(conversation => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          onDelete={() => onDelete(conversation.id)}
        />
      ))}
    </div>
  );
};
```

### **2. Compound Component Pattern**
```typescript
// For complex components with multiple parts
const SurveyForm = ({ children, onSubmit }: SurveyFormProps) => {
  const [formData, setFormData] = useState<SurveyFormData>({});
  
  return (
    <SurveyFormContext.Provider value={{ formData, setFormData }}>
      <form onSubmit={onSubmit}>
        {children}
      </form>
    </SurveyFormContext.Provider>
  );
};

SurveyForm.Dimension = ({ dimension }: { dimension: Dimension }) => {
  const { formData, setFormData } = useContext(SurveyFormContext);
  
  return (
    <div className="dimension">
      <label>{dimension.name}</label>
      <RatingScale
        value={formData[dimension.id]}
        onChange={(value) => setFormData(prev => ({ ...prev, [dimension.id]: value }))}
      />
    </div>
  );
};

// Usage
<SurveyForm onSubmit={handleSubmit}>
  <SurveyForm.Dimension dimension={moodDimension} />
  <SurveyForm.Dimension dimension={stressDimension} />
  <button type="submit">Submit</button>
</SurveyForm>
```

### **3. Custom Hook Pattern**
```typescript
// Encapsulate complex logic
const useConversationNavigation = (conversationId: string) => {
  const [currentPosition, setCurrentPosition] = useState<'beginning' | 'turn6' | 'end'>('beginning');
  const { data: conversation } = useConversation(conversationId);
  
  const nextPosition = useCallback(() => {
    const positions: Array<'beginning' | 'turn6' | 'end'> = ['beginning', 'turn6', 'end'];
    const currentIndex = positions.indexOf(currentPosition);
    const nextIndex = (currentIndex + 1) % positions.length;
    setCurrentPosition(positions[nextIndex]);
  }, [currentPosition]);
  
  const previousPosition = useCallback(() => {
    const positions: Array<'beginning' | 'turn6' | 'end'> = ['beginning', 'turn6', 'end'];
    const currentIndex = positions.indexOf(currentPosition);
    const prevIndex = currentIndex === 0 ? positions.length - 1 : currentIndex - 1;
    setCurrentPosition(positions[prevIndex]);
  }, [currentPosition]);
  
  return {
    currentPosition,
    nextPosition,
    previousPosition,
    conversation
  };
};
```

## 🔌 **API Architecture**

### **1. RESTful API Design**
```typescript
// API endpoints structure
const API_ROUTES = {
  // Conversations
  conversations: '/api/conversations',
  conversation: (id: string) => `/api/conversations/${id}`,
  conversationMessages: (id: string) => `/api/conversations/${id}/messages`,
  
  // Survey
  surveyResponses: '/api/survey-responses',
  surveyResponse: (id: string) => `/api/survey-responses/${id}`,
  conversationSurveyResponses: (conversationId: string) => 
    `/api/conversations/${conversationId}/survey-responses`,
  
  // AI Analysis
  aiLabels: '/api/ai-labels',
  generateLabels: (conversationId: string) => 
    `/api/conversations/${conversationId}/ai-labels`,
  
  // Export
  export: '/api/export',
  exportConversation: (id: string) => `/api/export/conversations/${id}`,
  exportAll: '/api/export/all'
};
```

### **2. API Response Patterns**
```typescript
// Standard API response structure
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
  };
}

// Success response
const successResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  meta: {
    timestamp: new Date().toISOString()
  }
});

// Error response
const errorResponse = (code: string, message: string, details?: any): ApiResponse<never> => ({
  success: false,
  error: { code, message, details },
  meta: {
    timestamp: new Date().toISOString()
  }
});
```

## 🗄️ **Database Architecture**

### **1. Core Tables Structure**
```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  model_version TEXT,
  conversation_length INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sequence_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(conversation_id, sequence_order)
);

-- Survey dimensions table
CREATE TABLE survey_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  options JSONB NOT NULL, -- Array of rating options
  scale INTEGER NOT NULL DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey responses table
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  position TEXT NOT NULL CHECK (position IN ('beginning', 'turn6', 'end')),
  ratings JSONB NOT NULL, -- { dimensionId: ratingValue }
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(conversation_id, position)
);

-- AI labels table
CREATE TABLE ai_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  position TEXT NOT NULL CHECK (position IN ('beginning', 'turn6', 'end')),
  model_used TEXT NOT NULL,
  ratings JSONB NOT NULL,
  confidence_scores JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(conversation_id, position, model_used)
);
```

### **2. Indexing Strategy**
```sql
-- Performance indexes
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_conversations_model_version ON conversations(model_version);
CREATE INDEX idx_conversations_length ON conversations(conversation_length);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sequence_order ON messages(conversation_id, sequence_order);

CREATE INDEX idx_survey_responses_conversation_id ON survey_responses(conversation_id);
CREATE INDEX idx_survey_responses_position ON survey_responses(position);

CREATE INDEX idx_ai_labels_conversation_id ON ai_labels(conversation_id);
CREATE INDEX idx_ai_labels_model_used ON ai_labels(model_used);
```

## 🚀 **Implementation Phases**

### **Phase 1: Foundation (Weeks 1-4)**
- [ ] Project setup with TypeScript, React, Node.js
- [ ] Database schema and migrations
- [ ] Basic API structure and error handling
- [ ] Core conversation management (CRUD operations)
- [ ] Basic file upload and parsing

### **Phase 2: Core Features (Weeks 5-8)**
- [ ] Survey system implementation
- [ ] Rating interface components
- [ ] Data persistence and validation
- [ ] Basic UI components and layout
- [ ] Navigation and routing

### **Phase 3: AI Integration (Weeks 9-12)**
- [ ] OpenAI API integration
- [ ] Automated labeling system
- [ ] Comparison and accuracy metrics
- [ ] AI settings and configuration
- [ ] Performance optimization

### **Phase 4: Polish & Launch (Weeks 13-16)**
- [ ] Data export functionality
- [ ] Analytics and visualization
- [ ] UI/UX refinement
- [ ] Testing and bug fixes
- [ ] Documentation and deployment

## 🎨 **UI/UX Design Principles**

### **1. Component Design System**
- **Consistent Spacing**: Use 8px grid system
- **Typography Scale**: Clear hierarchy with consistent font sizes
- **Color Palette**: Semantic colors for different states
- **Component Variants**: Primary, secondary, tertiary button styles

### **2. Responsive Design**
- **Mobile-First**: Design for mobile, enhance for desktop
- **Breakpoints**: xs (320px), sm (768px), md (1024px), lg (1440px)
- **Flexible Layouts**: Use CSS Grid and Flexbox for responsive layouts

### **3. Accessibility**
- **WCAG 2.1 AA**: Ensure compliance with accessibility standards
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 contrast ratio

## 🔧 **Development Guidelines**

### **1. Code Quality**
- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Enforce consistent code style and best practices
- **Prettier**: Automatic code formatting
- **Pre-commit Hooks**: Run linting and tests before commits

### **2. Testing Strategy**
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Test Coverage**: Aim for 80%+ coverage

### **3. Performance**
- **Code Splitting**: Lazy load routes and components
- **Memoization**: Use React.memo and useMemo appropriately
- **Bundle Analysis**: Monitor bundle size and optimize
- **Lighthouse**: Maintain 90+ performance scores

## 📚 **Key Implementation Files to Create**

### **Frontend Core Files**
```
src/
├── types/                          # TypeScript type definitions
│   ├── conversation.ts
│   ├── survey.ts
│   ├── ai-analysis.ts
│   └── api.ts
├── hooks/                          # Custom React hooks
│   ├── useConversation.ts
│   ├── useSurvey.ts
│   ├── useAI.ts
│   └── useExport.ts
├── utils/                          # Utility functions
│   ├── api-client.ts
│   ├── validation.ts
│   ├── formatting.ts
│   └── constants.ts
└── context/                        # React context providers
    ├── AppContext.tsx
    ├── ThemeContext.tsx
    └── AuthContext.tsx
```

### **Backend Core Files**
```
src/
├── types/                          # TypeScript type definitions
│   ├── entities.ts
│   ├── dto.ts
│   └── api.ts
├── middleware/                     # Express middleware
│   ├── error-handler.ts
│   ├── validation.ts
│   ├── authentication.ts
│   └── logging.ts
├── config/                         # Configuration files
│   ├── database.ts
│   ├── openai.ts
│   └── environment.ts
└── utils/                          # Utility functions
    ├── validation.ts
    ├── formatting.ts
    └── helpers.ts
```

## 🎯 **Success Metrics**

### **Technical Metrics**
- **Performance**: < 2s page load time, < 100ms API response
- **Reliability**: 99.9% uptime, < 0.1% error rate
- **Code Quality**: 80%+ test coverage, 0 linting errors
- **Security**: No critical security vulnerabilities

### **User Experience Metrics**
- **Usability**: < 3 clicks to complete main tasks
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsiveness**: Works seamlessly on all device sizes
- **Error Handling**: Clear, helpful error messages

### **Business Metrics**
- **Data Quality**: Accurate labeling and export functionality
- **AI Integration**: Reliable automated labeling
- **Export Functionality**: Complete, research-ready data exports
- **User Satisfaction**: High user retention and positive feedback

---

**Remember**: This architecture is designed for scalability, maintainability, and user experience. Follow these patterns consistently throughout development to ensure a robust, professional-grade application.
