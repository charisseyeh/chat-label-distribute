# Chat Labeling Desktop App

A sophisticated desktop application built with Electron for conversation analysis and labeling using AI assistance.

## 🎯 Project Overview

This application allows users to:
- Import ChatGPT conversation exports (JSON format)
- Apply structured ratings across psychological/emotional dimensions
- Generate AI-powered labels using OpenAI's API
- Compare human vs. AI labeling accuracy
- Export labeled datasets for research purposes
- Keep all data completely local for privacy

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Shadcn/ui
- **Desktop Framework**: Electron with TypeScript
- **Database**: SQLite with Prisma ORM
- **File Storage**: Local file system
- **State Management**: Zustand + React Query

## 🚀 Current Status

### ✅ Completed
- [x] Project structure and configuration
- [x] Electron main process setup
- [x] React renderer process with Vite
- [x] Tailwind CSS configuration with custom design system
- [x] Prisma database schema and client generation
- [x] Basic component structure (Header, Sidebar, Navigation)
- [x] Database manager and file manager services
- [x] TypeScript configuration for both main and renderer processes

### 🔄 In Progress
- [ ] Full UI component implementation
- [ ] File import and parsing system
- [ ] Survey system implementation
- [ ] AI integration with OpenAI
- [ ] Data export functionality

### 📋 Next Steps
1. **Complete UI Components**: Finish implementing all React components
2. **File Import System**: Implement conversation file import and parsing
3. **Survey System**: Build the rating interface for conversations
4. **AI Integration**: Connect OpenAI API for automated labeling
5. **Testing & Polish**: Test all functionality and refine UI/UX

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd chat-labeling-app

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Start development
npm run dev
```

### Development Scripts
- `npm run dev` - Start both main and renderer processes
- `npm run dev:main` - Build and start Electron main process
- `npm run dev:renderer` - Start Vite development server
- `npm run build` - Build both processes for production
- `npm run dist` - Create distributable packages

### Project Structure
```
chat-labeling-app/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # React frontend
│   ├── shared/         # Shared code
│   └── preload/        # Preload scripts
├── prisma/             # Database schema
├── dist/               # Compiled main process
└── assets/             # App icons and resources
```

## 🎨 Design System

The app uses a custom design system built on top of Shadcn/ui components with:
- **Custom Color Palette**: Primary, secondary, and accent colors
- **Responsive Layout**: Desktop-optimized interface
- **Component Variants**: Consistent button and input styles
- **Dark Mode Support**: Built-in theme switching

## 🗄️ Database Schema

The SQLite database includes tables for:
- **Conversations**: Imported chat data
- **Messages**: Individual chat messages
- **Survey Dimensions**: Rating scales and questions
- **Survey Responses**: Human ratings
- **AI Labels**: Automated assessments
- **Export History**: Data export tracking

## 🔌 API Integration

- **OpenAI API**: For automated conversation labeling
- **Local File System**: For conversation imports and exports
- **SQLite Database**: For data persistence and querying

## 📦 Distribution

The app can be packaged for:
- **Windows**: .exe installer and portable versions
- **macOS**: .dmg files with proper app bundle
- **Linux**: .AppImage and package manager support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**Status**: 🚧 Under Development  
**Version**: 1.0.0  
**Last Updated**: August 2024
