# 🖥️ Chat Labeling Desktop App - Electron Architecture Plan

## 🎯 **Project Overview**

**Chat Labeling Desktop App** is a sophisticated desktop application built with Electron that provides conversation analysis and labeling using AI assistance. Users can import conversation data (primarily from ChatGPT), review conversations, apply human ratings across multiple dimensions, and compare human assessments with AI-generated labels - all while keeping their data completely local.

### **Core Purpose**
- **Data Labeling**: Apply structured ratings to conversations across psychological/emotional dimensions
- **AI Integration**: Generate automated labels using OpenAI's API for comparison with human ratings
- **Research Tool**: Export labeled datasets for analysis, model training, or research purposes
- **Quality Assessment**: Compare human vs. AI labeling accuracy and consistency
- **Local Storage**: Complete privacy with all data stored on user's machine

## 🏗️ **Technology Stack**

### **Frontend**
- **Framework**: React 18 + TypeScript
- **UI Components**: Shadcn/ui + custom design system
- **Styling**: Tailwind CSS + custom color palette
- **State Management**: Zustand (global state) + React Query (local data)
- **Forms**: React Hook Form + Zod validation

### **Desktop Framework**
- **Runtime**: Electron with TypeScript
- **Main Process**: Node.js backend for file operations and database
- **Renderer Process**: React frontend for user interface
- **IPC Communication**: Secure inter-process communication

### **Data & Storage**
- **Database**: SQLite with Prisma ORM
- **File Storage**: Local file system with Electron file APIs
- **Data Format**: JSON for conversation imports and exports
- **Backup**: Automatic local database backups

## 🏛️ **Project Structure**

### **Main Application Structure**
```
chat-labeling-app/
├── src/
│   ├── main/                       # Electron main process
│   │   ├── main.ts                 # Main process entry point
│   │   ├── ipc-handlers.ts         # IPC communication handlers
│   │   ├── file-manager.ts         # Local file operations
│   │   ├── database-manager.ts     # SQLite database management
│   │   ├── ai-service.ts           # OpenAI API integration
│   │   └── export-service.ts       # Data export functionality
│   ├── renderer/                   # React frontend (renderer process)
│   │   ├── components/             # Shadcn/ui + custom components
│   │   │   ├── ui/                 # Shadcn/ui components
│   │   │   ├── common/             # Reusable components
│   │   │   ├── conversation/        # Conversation components
│   │   │   ├── survey/             # Survey components
│   │   │   ├── ai-analysis/        # AI analysis components
│   │   │   └── export/             # Export components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── stores/                 # Zustand stores
│   │   ├── types/                  # TypeScript definitions
│   │   ├── utils/                  # Utility functions
│   │   ├── App.tsx                 # Main React component
│   │   └── main.tsx                # Renderer entry point
│   ├── shared/                     # Shared code between processes
│   │   ├── types/                  # Common TypeScript types
│   │   ├── constants/              # App constants
│   │   └── utils/                  # Shared utilities
│   └── preload/                    # Preload scripts for security
│       └── preload.ts              # Secure IPC bridge
├── electron-builder.json           # Electron build configuration
├── package.json
├── tailwind.config.js              # Tailwind + custom colors
├── tsconfig.json
├── prisma/                         # Database schema and migrations
│   └── schema.prisma
└── assets/                         # App icons and resources
    ├── icons/
    └── images/
```

## 🗄️ **Database Schema (SQLite)**

### **Core Tables**

#### **1. Conversations Table**
```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY, -- UUID or simple ID
  title TEXT NOT NULL,
  model_version TEXT,
  conversation_length INTEGER NOT NULL,
  metadata TEXT, -- JSON stored as TEXT in SQLite
  file_path TEXT NOT NULL, -- Local file path
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

#### **2. Messages Table**
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sequence_order INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  UNIQUE(conversation_id, sequence_order)
);
```

#### **3. Survey Dimensions Table**
```sql
CREATE TABLE survey_dimensions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  options TEXT NOT NULL, -- JSON stored as TEXT
  scale INTEGER NOT NULL DEFAULT 7,
  order_index INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1, -- SQLite boolean as integer
  created_at TEXT DEFAULT (datetime('now'))
);
```

#### **4. Survey Responses Table**
```sql
CREATE TABLE survey_responses (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('beginning', 'turn6', 'end')),
  ratings TEXT NOT NULL, -- JSON stored as TEXT
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  UNIQUE(conversation_id, position)
);
```

#### **5. AI Labels Table**
```sql
CREATE TABLE ai_labels (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('beginning', 'turn6', 'end')),
  model_used TEXT NOT NULL,
  ratings TEXT NOT NULL, -- JSON stored as TEXT
  confidence_scores TEXT, -- JSON stored as TEXT
  prompt_used TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  UNIQUE(conversation_id, position, model_used)
);
```

#### **6. Export History Table**
```sql
CREATE TABLE export_history (
  id TEXT PRIMARY KEY,
  export_type TEXT NOT NULL,
  filters TEXT, -- JSON stored as TEXT
  file_path TEXT,
  record_count INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

## 🔄 **Data Flow Architecture**

### **1. File Import Flow**
```
User Select File → Electron File Dialog → Local File Copy → JSON Parsing → SQLite Storage → Conversation Creation
```

### **2. Survey Response Flow**
```
User Rating → Form Validation → SQLite Storage → State Update → UI Refresh
```

### **3. AI Analysis Flow**
```
Request AI Labels → OpenAI API Call → Response Processing → SQLite Storage → Comparison Calculation
```

### **4. Export Flow**
```
Export Request → Data Aggregation → Format Conversion → Local File Generation → User Download
```

## 🎨 **UI/UX Design System**

### **1. Shadcn/ui Integration**
- **Base Components**: Use Shadcn/ui for foundational components
- **Custom Theme**: Override default theme with your color palette
- **Component Variants**: Extend components with your design variants
- **Responsive Layout**: Desktop-optimized layouts

### **2. Desktop-Specific Features**
- **File Menu**: Standard desktop application menu
- **Keyboard Shortcuts**: Desktop-appropriate shortcuts
- **Drag & Drop**: Support for dragging JSON files
- **System Integration**: Proper app icons and dock/taskbar integration
- **Window Management**: Resizable windows, minimize/maximize

### **3. Color System Integration**
```css
/* Custom color variables */
:root {
  --primary: #your-primary-color;
  --secondary: #your-secondary-color;
  --accent: #your-accent-color;
  --background: #your-background-color;
  --foreground: #your-foreground-color;
  --success: #your-success-color;
  --warning: #your-warning-color;
  --error: #your-error-color;
  --muted: #your-muted-color;
  --border: #your-border-color;
}
```

## 🚀 **Implementation Phases**

### **Phase 1: Electron Foundation (Weeks 1-3)**
- [ ] Project setup with Electron + TypeScript
- [ ] Basic window management and IPC setup
- [ ] Local file system integration
- [ ] SQLite database setup with Prisma
- [ ] Basic React frontend integration

### **Phase 2: Core Features (Weeks 4-7)**
- [ ] File import and parsing system
- [ ] Conversation management with local storage
- [ ] Survey system implementation
- [ ] Basic UI components with Shadcn/ui

### **Phase 3: AI Integration (Weeks 8-11)**
- [ ] OpenAI API integration (requires internet)
- [ ] Local AI label storage and comparison
- [ ] Offline-first data management
- [ ] Performance optimization for local data

### **Phase 4: Polish & Distribution (Weeks 12-14)**
- [ ] Data export to local file system
- [ ] Desktop app packaging and distribution
- [ ] Auto-updater implementation
- [ ] User documentation and help system

## 🔧 **Technical Implementation Details**

### **1. IPC Communication Pattern**
```typescript
// Main process handles file operations
ipcMain.handle('file:select-conversation', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  });
  return result.filePaths[0];
});

// Renderer process requests file operations
const handleFileSelect = async () => {
  const filePath = await window.electronAPI.selectConversationFile();
  if (filePath) {
    // Process the selected file
  }
};
```

### **2. Local Storage Strategy**
- **Conversation Files**: `~/Documents/ChatLabelingApp/conversations/`
- **Database**: `~/Documents/ChatLabelingApp/data/app.db`
- **Exports**: `~/Documents/ChatLabelingApp/exports/`
- **Settings**: `~/Documents/ChatLabelingApp/settings.json`

### **3. File System Security**
- **Sandboxed Access**: Electron's security model
- **Path Validation**: Prevent directory traversal attacks
- **File Type Validation**: Ensure only JSON files are processed

## 📦 **Distribution & Packaging**

### **1. Build Process**
- **Electron Builder**: Automated builds for all platforms
- **Code Signing**: Proper app signing for distribution
- **Auto-Updater**: Built-in update mechanism

### **2. Platform Support**
- **Windows**: .exe installer and portable versions
- **macOS**: .dmg files with proper app bundle
- **Linux**: .AppImage and package manager support

## 💾 **Local Storage Benefits**

### **1. Privacy & Security**
- **No Cloud Dependencies**: All data stays on user's machine
- **Offline Capability**: Works without internet connection
- **Data Ownership**: Users have complete control over their data

### **2. Performance**
- **Fast Access**: Local database and file system
- **No Network Latency**: Instant data retrieval
- **Large Dataset Support**: Can handle extensive conversation collections

### **3. User Experience**
- **Instant Loading**: No waiting for server responses
- **Always Available**: Works regardless of internet status
- **Familiar Interface**: Standard desktop application behavior

## 🎯 **Success Metrics**

### **Technical Metrics**
- **Performance**: < 1s app startup, < 100ms data operations
- **Reliability**: 99.9% uptime, robust error handling
- **Code Quality**: 80%+ test coverage, 0 linting errors
- **Security**: No critical security vulnerabilities

### **User Experience Metrics**
- **Usability**: < 3 clicks to complete main tasks
- **Accessibility**: WCAG 2.1 AA compliance
- **Desktop Integration**: Native feel and behavior
- **Error Handling**: Clear, helpful error messages

### **Business Metrics**
- **Data Quality**: Accurate labeling and export functionality
- **AI Integration**: Reliable automated labeling
- **Export Functionality**: Complete, research-ready data exports
- **User Satisfaction**: High user retention and positive feedback

## 🔍 **Key Features to Implement**

### **1. Conversation Management**
- Import ChatGPT JSON exports
- Browse and navigate conversations
- Filter by date, model version, length
- Search within conversations

### **2. Survey System**
- 7-point rating scales for 5 dimensions
- Multi-position assessment (beginning/middle/end)
- Customizable survey questions
- Response storage and retrieval

### **3. AI Integration**
- OpenAI API integration for automated labeling
- Comparison between human and AI ratings
- Accuracy metrics and analysis
- Confidence scoring

### **4. Data Export**
- JSON export in research format
- Multiple export types (human, AI, combined)
- Export history and management
- Data validation and quality checks

## 🚀 **Getting Started Checklist**

### **Immediate Next Steps**
- [ ] Set up development environment
- [ ] Initialize Electron project with TypeScript
- [ ] Configure React + Tailwind + Shadcn/ui
- [ ] Set up SQLite database with Prisma
- [ ] Create basic IPC communication
- [ ] Implement file import functionality

### **Development Environment Requirements**
- **Node.js**: Version 18+ with npm/yarn
- **TypeScript**: Latest stable version
- **Git**: Version control system
- **Code Editor**: VS Code with recommended extensions
- **Database Tool**: SQLite browser or similar

---

**This architecture provides a robust foundation for a professional desktop application that users can download, install, and use completely offline while maintaining all the sophisticated features of the chat labeling system.**

**Ready to start implementation! 🚀**
