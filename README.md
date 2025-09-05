# 🏷️ Chat Labeling AI

A sophisticated desktop application for conversation analysis and labeling using AI assistance. Import ChatGPT conversations, apply human ratings across psychological dimensions, and compare human assessments with AI-generated labels - all while keeping your data completely local and private.

## ✨ Features

### 🗣️ **Conversation Management**
- **Import ChatGPT Data**: Upload and parse ChatGPT JSON exports
- **Conversation Navigation**: Browse through conversations with intuitive navigation
- **Advanced Filtering**: Filter by date ranges, model versions, conversation length, and more
- **Search Functionality**: Find specific conversations quickly
- **Local Storage**: All data stored securely on your machine

### 📊 **Assessment System**
- **Multi-Position Rating**: Assess conversations at 3 key points:
  - **Beginning** (pre-conversation state)
  - **Turn 6** (mid-conversation state)
  - **End** (post-conversation state)
- **Psychological Dimensions**: Rate across 5 core dimensions:
  - Mood State (Very negative → Very positive)
  - Emotional Regulation (Poor → Excellent control)
  - Stress Level (Extremely stressed → No stress)
  - Energy Level (Very low → Very high energy)
  - Overall Wellbeing (Very poor → Excellent)
- **7-Point Rating Scale**: Precise Likert scale ratings
- **Customizable Templates**: Create and modify assessment templates
- **Default Templates**: Pre-built templates for common assessment needs

### 🤖 **AI Integration**
- **OpenAI API Integration**: Generate automated labels using GPT models
- **AI vs Human Comparison**: Compare human ratings with AI-generated assessments
- **Accuracy Metrics**: Calculate Mean Absolute Error (MAE) and agreement statistics
- **Confidence Scoring**: AI confidence levels for generated labels
- **Batch Processing**: Process multiple conversations efficiently

### 📈 **Data Export & Analysis**
- **Research-Ready Exports**: Generate JSON files in standardized research format
- **Multiple Export Types**: Human-only, AI-only, or combined datasets
- **Comparison Data**: Include accuracy metrics and agreement statistics
- **Export History**: Track and manage export operations
- **Data Validation**: Ensure data integrity and quality

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ with npm
- **Git** for version control
- **macOS, Windows, or Linux** (cross-platform support)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chat-label-ai.git
   cd chat-label-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### First Run

1. **Launch the application**
2. **Import conversations**: Click "Select File" to import ChatGPT JSON exports
3. **Choose assessment template**: Select from default templates or create custom ones
4. **Start labeling**: Navigate through conversations and apply ratings
5. **Generate AI labels**: Use AI integration for automated labeling
6. **Export data**: Generate research-ready datasets

## 🏗️ Architecture

### Technology Stack

- **Desktop Framework**: Electron with TypeScript
- **Frontend**: React 18 + TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom design system
- **File Storage**: Local JSON files (no database required)
- **AI Integration**: OpenAI API

### Project Structure

```
chat-label-ai/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── managers/            # Business logic managers
│   │   ├── handlers/            # IPC communication handlers
│   │   └── main.ts              # Main process entry point
│   ├── renderer/                # React frontend
│   │   ├── components/          # UI components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── stores/              # Zustand state stores
│   │   ├── services/            # Business logic services
│   │   ├── pages/               # Route components
│   │   └── types/               # TypeScript definitions
│   ├── shared/                  # Shared code between processes
│   └── preload/                 # Secure IPC bridge
├── docs/                        # Documentation
│   ├── ARCHITECTURE_REVIEW.md   # Complete architecture review
│   ├── BACKEND_SCHEMA.md        # Backend architecture schema
│   └── FRONTEND_SCHEMA.md       # Frontend architecture schema
└── README.md                    # This file
```

## 📚 Documentation

### Architecture Documentation

- **[Architecture Review](docs/ARCHITECTURE_REVIEW.md)**: Comprehensive overview of the current implementation
- **[Backend Schema](docs/BACKEND_SCHEMA.md)**: Detailed backend architecture and IPC communication
- **[Frontend Schema](docs/FRONTEND_SCHEMA.md)**: Frontend component structure and patterns

### Key Concepts

#### **Assessment Templates**
Assessment templates define the questions and rating scales used for conversation evaluation. The application includes several default templates:

- **Emotional Wellbeing Assessment**: Mood, emotional regulation, stress, energy, overall wellbeing
- **Communication Skills Assessment**: Clarity, listening, empathy, confidence, effectiveness
- **Problem-Solving Assessment**: Analysis, creativity, logic, perspective-taking, effectiveness
- **Leadership Potential Assessment**: Inspiration, initiative, conflict handling, delegation, decisiveness

#### **Data Flow**
1. **Import**: Upload ChatGPT JSON files
2. **Parse**: Extract conversations and metadata
3. **Store**: Save locally in user's Documents folder
4. **Assess**: Apply human ratings using templates
5. **AI Analysis**: Generate automated labels (optional)
6. **Compare**: Analyze human vs AI agreement
7. **Export**: Generate research-ready datasets

## 🔧 Development

### Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Organization

#### **Adding New Features**

**For Main Process (Backend):**
1. Create manager class in `src/main/managers/`
2. Add IPC handlers in appropriate handler file
3. Register handlers in `src/main/ipc-handlers.ts`
4. Update preload script to expose new API

**For Renderer Process (Frontend):**
1. Create service in `src/renderer/services/`
2. Add custom hook in `src/renderer/hooks/`
3. Create components in appropriate feature folder
4. Update stores if state management needed

#### **State Management**
- **Global State**: Use Zustand stores in `src/renderer/stores/`
- **Local State**: Use React hooks for component-specific state
- **Service Integration**: Use custom hooks for API calls

#### **Component Development**
- **Feature Components**: Create in appropriate domain folder
- **Common Components**: Add to `src/renderer/components/common/`
- **Page Components**: Add to `src/renderer/pages/`

## 🔐 Security & Privacy

### Data Privacy
- **Local Storage**: All data stored on your machine
- **No Cloud Dependencies**: Works completely offline
- **Data Ownership**: You have complete control over your data
- **Secure IPC**: Protected communication between processes

### Security Features
- **Context Isolation**: Renderer process cannot access Node.js APIs directly
- **Node Integration Disabled**: Prevents security vulnerabilities
- **Path Validation**: All file operations validate paths
- **Type Safety**: All IPC communication is type-checked

## 🎯 Use Cases

### Research Applications
- **Conversation Analysis**: Study patterns in human-AI interactions
- **Psychological Assessment**: Evaluate emotional and cognitive states
- **AI Model Evaluation**: Compare human and AI labeling accuracy
- **Dataset Creation**: Generate labeled datasets for machine learning

### Educational Applications
- **Learning Assessment**: Evaluate student interactions with AI
- **Communication Training**: Assess communication skills development
- **Critical Thinking**: Analyze problem-solving approaches
- **Leadership Development**: Evaluate leadership potential

### Business Applications
- **Customer Service Analysis**: Evaluate customer interaction quality
- **Training Assessment**: Measure training effectiveness
- **Performance Evaluation**: Assess employee communication skills
- **Quality Assurance**: Ensure consistent interaction quality

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Use Prettier for code formatting
- **Testing**: Add tests for new features
- **Documentation**: Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI**: For providing the AI API integration
- **Electron**: For the desktop application framework
- **React**: For the user interface framework
- **Tailwind CSS**: For the styling system
- **Zustand**: For state management

## 📞 Support

- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/yourusername/chat-label-ai/issues)
- **Discussions**: Join community discussions on [GitHub Discussions](https://github.com/yourusername/chat-label-ai/discussions)
- **Documentation**: Check the [docs](docs/) folder for detailed documentation

## 🗺️ Roadmap

### Upcoming Features
- [ ] **Advanced Analytics**: Statistical analysis and visualization
- [ ] **Collaboration Features**: Multi-user support and shared projects
- [ ] **API Integration**: REST API for external integrations
- [ ] **Plugin System**: Extensible architecture for custom features
- [ ] **Mobile Support**: Mobile app for on-the-go assessment

### Recent Updates
- ✅ **v1.0.0**: Initial release with core functionality
- ✅ **Assessment Templates**: Customizable rating templates
- ✅ **AI Integration**: OpenAI API integration
- ✅ **Data Export**: Research-ready export functionality
- ✅ **Local Storage**: Complete privacy with local data storage

---

**Built with ❤️ for researchers, educators, and analysts who need powerful conversation analysis tools while maintaining complete data privacy.**