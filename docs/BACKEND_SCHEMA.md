# 🔧 Backend Architecture Schema - Chat Labeling AI

## 📋 **Overview**

This document provides a detailed schema of the backend architecture for the Chat Labeling AI application, focusing on the Electron main process, IPC communication, and data flow patterns.

## 🏗️ **Main Process Architecture**

### **Core Components Hierarchy**

```
main.ts (Entry Point)
├── IPCHandlers (Central Coordinator)
│   ├── ConversationManager
│   ├── AssessmentManager
│   └── AssessmentHandlers
├── Window Management
└── Application Lifecycle
```

### **Component Responsibilities**

#### **1. Main Process Entry (`main.ts`)**
```typescript
// Primary responsibilities:
- Application initialization
- Window creation and management
- IPC handler setup
- Default template initialization
- Application lifecycle events

// Key initialization sequence:
1. Create main window with security settings
2. Initialize IPC handlers
3. Initialize default assessment templates
4. Set up application event listeners
```

#### **2. IPC Communication Hub (`ipc-handlers.ts`)**
```typescript
class IPCHandlers {
  // Central coordinator for all IPC communication
  private conversationManager: ConversationManager;
  private assessmentManager: AssessmentManager;
  private assessmentHandlers: AssessmentHandlers;
  
  // Handles:
  - File operations (conversation imports)
  - Conversation management
  - Assessment template operations
  - OpenAI API integration
  - Test operations
}
```

## 🔄 **IPC Communication Schema**

### **Channel Categories**

#### **File Operations**
| Channel | Handler | Parameters | Returns | Purpose |
|---------|---------|------------|---------|---------|
| `file:select-conversation` | IPCHandlers | None | `string \| null` | Open file dialog for JSON selection |
| `file:store-json` | IPCHandlers | `filePath: string` | `StoredFile` | Store uploaded JSON file locally |
| `file:get-stored-files` | IPCHandlers | None | `StoredFile[]` | Get list of all stored files |
| `file:delete-stored-file` | IPCHandlers | `fileId: string` | `boolean` | Delete stored file |
| `file:get-storage-stats` | IPCHandlers | None | `StorageStats` | Get storage statistics |
| `file:cleanup-duplicates` | IPCHandlers | None | `CleanupResult` | Remove duplicate files |

#### **Conversation Operations**
| Channel | Handler | Parameters | Returns | Purpose |
|---------|---------|------------|---------|---------|
| `conversations:get-index` | IPCHandlers | `filePath: string` | `ConversationIndex` | Get conversation index from file |
| `conversations:read-single-conversation` | IPCHandlers | `filePath: string, conversationId: string` | `Conversation` | Read individual conversation |
| `conversations:store-selected` | IPCHandlers | `conversations: Conversation[]` | `boolean` | Store selected conversations |
| `conversations:get-selected` | IPCHandlers | None | `Conversation[]` | Get stored selected conversations |

#### **Assessment Template Operations**
| Channel | Handler | Parameters | Returns | Purpose |
|---------|---------|------------|---------|---------|
| `assessment:create-template` | AssessmentHandlers | `template: AssessmentTemplate` | `boolean` | Create new assessment template |
| `assessment:get-template` | AssessmentHandlers | `templateId: string` | `AssessmentTemplate` | Get specific template |
| `assessment:get-all-templates` | AssessmentHandlers | None | `AssessmentTemplate[]` | Get all templates |
| `assessment:update-template` | AssessmentHandlers | `templateId: string, updates: Partial<AssessmentTemplate>` | `boolean` | Update existing template |
| `assessment:delete-template` | AssessmentHandlers | `templateId: string` | `boolean` | Delete template |
| `assessment:get-template-stats` | AssessmentHandlers | None | `TemplateStats` | Get template statistics |
| `assessment:initialize-default-templates` | AssessmentHandlers | None | `InitializationResult` | Initialize default templates |
| `assessment:is-first-run` | AssessmentHandlers | None | `boolean` | Check if first application run |

#### **AI Operations**
| Channel | Handler | Parameters | Returns | Purpose |
|---------|---------|------------|---------|---------|
| `call-openai-api` | IPCHandlers | `AIParams` | `AIResponse` | Call OpenAI API for labeling |

#### **Test Operations**
| Channel | Handler | Parameters | Returns | Purpose |
|---------|---------|------------|---------|---------|
| `test:ping` | IPCHandlers | None | `{ success: boolean, message: string }` | Test IPC communication |

## 🗂️ **Manager Classes Schema**

### **ConversationManager (`conversation-manager.ts`)**

```typescript
class ConversationManager {
  private storageDir: string; // ~/Documents/ChatLabelingApp/conversations/
  
  // File Management
  async storeJsonFile(filePath: string): Promise<StoredFile>
  async getStoredFiles(): Promise<StoredFile[]>
  async deleteStoredFile(fileId: string): Promise<boolean>
  async getStorageStats(): Promise<StorageStats>
  async cleanupDuplicateFiles(): Promise<CleanupResult>
  
  // Conversation Processing
  async getConversationIndex(filePath: string): Promise<ConversationIndex>
  async readSingleConversation(filePath: string, conversationId: string): Promise<Conversation>
  async storeSelectedConversations(conversations: Conversation[]): Promise<boolean>
  async getSelectedConversations(): Promise<Conversation[]>
  
  // Utility Methods
  private generateFileId(): string
  private analyzeContentQuality(conversation: any): ContentQualityAnalysis
  private getFileSize(filePath: string): number
}
```

**Data Models:**
```typescript
interface StoredFile {
  id: string;
  originalName: string;
  storedPath: string;
  fileSize: number;
  originalPath: string;
}

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  averageSize: number;
}

interface ConversationIndex {
  conversations: ConversationSummary[];
  totalCount: number;
  filePath: string;
}

interface ConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  model?: string;
  createTime?: number;
}
```

### **AssessmentManager (`assessment-manager.ts`)**

```typescript
class AssessmentManager {
  private assessmentTemplatesDir: string; // ~/Documents/ChatLabelingApp/question-templates/
  private writeOperations: Map<string, Promise<boolean>>; // Prevent concurrent writes
  
  // Template Management
  async storeAssessmentTemplate(template: AssessmentTemplate): Promise<boolean>
  async getAssessmentTemplate(templateId: string): Promise<AssessmentTemplate | null>
  async getAllAssessmentTemplates(): Promise<AssessmentTemplate[]>
  async updateAssessmentTemplate(templateId: string, updates: Partial<AssessmentTemplate>): Promise<boolean>
  async deleteAssessmentTemplate(templateId: string): Promise<boolean>
  async getAssessmentTemplateStats(): Promise<TemplateStats>
  
  // Initialization
  async initializeDefaultTemplates(): Promise<boolean>
  async isFirstRun(): Promise<boolean>
  
  // Utility Methods
  private getTemplateFilePath(templateId: string): string
  private validateTemplate(template: AssessmentTemplate): boolean
  private generateTemplateId(): string
}
```

**Data Models:**
```typescript
interface AssessmentTemplate {
  id: string;
  name: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

interface Question {
  id: string;
  text: string;
  scale: 7;
  labels: Record<number, string>;
  order: number;
}

interface TemplateStats {
  totalTemplates: number;
  totalQuestions: number;
  averageQuestionsPerTemplate: number;
  lastUpdated: string;
}
```

## 🔐 **Security Architecture**

### **Preload Script (`preload.ts`)**

```typescript
// Security layer between main and renderer processes
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations (sanitized)
  selectConversationFile: () => ipcRenderer.invoke('file:select-conversation'),
  storeJsonFile: (filePath: string) => ipcRenderer.invoke('file:store-json', filePath),
  
  // Conversation operations (validated)
  getConversationIndex: (filePath: string) => ipcRenderer.invoke('conversations:get-index', filePath),
  readSingleConversation: (filePath: string, conversationId: string) => ipcRenderer.invoke('conversations:read-single-conversation', filePath, conversationId),
  
  // Assessment operations (type-safe)
  createAssessmentTemplate: (template: any) => ipcRenderer.invoke('assessment:create-template', template),
  getAllAssessmentTemplates: () => ipcRenderer.invoke('assessment:get-all-templates'),
  
  // AI operations (secure)
  callOpenAIAPI: (params: AIParams) => ipcRenderer.invoke('call-openai-api', params),
});
```

### **Security Features**
- **Context Isolation**: Renderer process cannot access Node.js APIs directly
- **Node Integration Disabled**: Prevents security vulnerabilities
- **Path Validation**: All file operations validate paths to prevent directory traversal
- **Type Safety**: All IPC communication is type-checked
- **Sandboxed File Access**: Limited file system access through controlled APIs

## 📁 **File System Architecture**

### **Storage Structure**
```
~/Documents/ChatLabelingApp/
├── conversations/                    # Stored conversation files
│   ├── {fileId}.json               # Individual conversation files
│   └── metadata.json               # File metadata and indexing
├── question-templates/              # Assessment templates
│   ├── {templateId}.json          # Individual template files
│   └── index.json                 # Template index
└── exports/                        # Export files (future)
    └── {timestamp}-export.json    # Generated exports
```

### **File Naming Conventions**
- **Conversation Files**: `{uuid}.json` (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890.json`)
- **Template Files**: `{templateId}.json` (e.g., `default_emotional_wellbeing.json`)
- **Metadata Files**: `metadata.json`, `index.json`

### **File Operations**
```typescript
// File operations are atomic and include:
1. Validation of file paths
2. Backup creation for critical operations
3. Error handling and rollback
4. Concurrent write protection
5. File integrity verification
```

## 🔄 **Data Flow Patterns**

### **1. File Import Flow**
```
User Action → File Dialog → Path Validation → File Copy → JSON Parsing → 
Storage → Index Update → UI Notification
```

### **2. Template Management Flow**
```
User Action → Validation → File Write → Index Update → State Sync → UI Update
```

### **3. Conversation Reading Flow**
```
User Request → File Path Validation → File Read → JSON Parsing → 
Data Validation → Response → UI Update
```

### **4. AI Integration Flow**
```
User Request → Parameter Validation → OpenAI API Call → Response Processing → 
Data Storage → Comparison Calculation → UI Update
```

## 🛠️ **Error Handling Schema**

### **Error Types**
```typescript
interface APIError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

interface APISuccess<T> {
  success: true;
  data: T;
}
```

### **Error Handling Patterns**
```typescript
// Standard error handling in IPC handlers
try {
  const result = await manager.operation(params);
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  };
}
```

### **Error Recovery**
- **File Operations**: Automatic retry with exponential backoff
- **Template Operations**: Validation before write operations
- **API Calls**: Timeout handling and retry logic
- **Data Corruption**: Backup restoration mechanisms

## 📊 **Performance Considerations**

### **Optimization Strategies**
1. **Lazy Loading**: Conversations loaded on-demand
2. **Caching**: Template data cached in memory
3. **Batch Operations**: Multiple operations batched together
4. **File Streaming**: Large files processed in chunks
5. **Memory Management**: Proper cleanup of large objects

### **Monitoring Points**
- File operation timing
- Memory usage patterns
- IPC communication latency
- Template loading performance
- API response times

## 🔧 **Development Guidelines**

### **Adding New IPC Channels**
1. **Define Handler**: Add handler method in appropriate manager
2. **Register Channel**: Add IPC handler registration
3. **Update Preload**: Expose new API in preload script
4. **Add Types**: Update TypeScript definitions
5. **Test Integration**: Verify end-to-end functionality

### **File Operation Best Practices**
1. **Always validate file paths** before operations
2. **Use atomic operations** for critical data
3. **Implement proper error handling** with rollback
4. **Add logging** for debugging and monitoring
5. **Test with large files** and edge cases

### **Template Management Guidelines**
1. **Validate templates** before storage
2. **Use unique IDs** for all templates
3. **Implement versioning** for template updates
4. **Handle concurrent access** properly
5. **Maintain backward compatibility**

## 🎯 **Testing Strategy**

### **Unit Testing**
- Manager class methods
- Utility functions
- Data validation logic
- Error handling scenarios

### **Integration Testing**
- IPC communication flows
- File operation sequences
- Template management workflows
- AI integration scenarios

### **End-to-End Testing**
- Complete user workflows
- File import and processing
- Assessment creation and management
- Export functionality

---

**This schema provides a comprehensive understanding of the backend architecture, enabling engineers to effectively work with and extend the Chat Labeling AI application.**
