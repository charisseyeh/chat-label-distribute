# 🤝 Contributing to Chat Labeling AI

Thank you for your interest in contributing to Chat Labeling AI! This document provides guidelines and information for contributors.

## 📋 **Table of Contents**

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Code Standards](#code-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Architecture Overview](#architecture-overview)

## 📜 **Code of Conduct**

This project follows a code of conduct that we expect all contributors to follow. Please:

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be constructive in feedback and discussions
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 **Getting Started**

### Prerequisites

- **Node.js** 18+ with npm
- **Git** for version control
- **Code Editor** (VS Code recommended)
- **Basic knowledge** of TypeScript, React, and Electron

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
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

4. **Verify setup**
   - Application should launch
   - DevTools should open automatically
   - No console errors should appear

## 🔧 **Development Guidelines**

### **Project Structure**

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
└── README.md                    # Project documentation
```

### **Architecture Overview**

- **Main Process**: Handles file operations, IPC communication, and business logic
- **Renderer Process**: React frontend with component-based architecture
- **IPC Communication**: Secure communication between processes via preload scripts
- **State Management**: Zustand for global state, React hooks for local state
- **Storage**: Local file-based storage (no database required)

For detailed architecture information, see:
- [Architecture Review](docs/ARCHITECTURE_REVIEW.md)
- [Backend Schema](docs/BACKEND_SCHEMA.md)
- [Frontend Schema](docs/FRONTEND_SCHEMA.md)

## 📝 **Contributing Guidelines**

### **Types of Contributions**

We welcome various types of contributions:

- **Bug Fixes**: Fix existing issues
- **Feature Additions**: Add new functionality
- **Documentation**: Improve documentation
- **Testing**: Add or improve tests
- **Performance**: Optimize performance
- **UI/UX**: Improve user interface and experience

### **Before You Start**

1. **Check existing issues** to see if your contribution is already being worked on
2. **Create an issue** for significant changes to discuss the approach
3. **Fork the repository** and create a feature branch
4. **Read the documentation** to understand the architecture

### **Development Workflow**

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number
   ```

2. **Make your changes**
   - Follow the code standards
   - Add tests if applicable
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and create pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🎯 **Code Standards**

### **TypeScript**

- **Use TypeScript** for all new code
- **Define interfaces** for all data structures
- **Use strict type checking** - no `any` types unless absolutely necessary
- **Export types** from appropriate index files

```typescript
// Good example
interface UserData {
  id: string;
  name: string;
  email: string;
}

// Bad example
const userData: any = { id: 1, name: "John" };
```

### **React Components**

- **Use functional components** with hooks
- **Use TypeScript interfaces** for props
- **Follow naming conventions** (PascalCase for components)
- **Use proper prop validation**

```typescript
// Good example
interface ComponentProps {
  id: string;
  data: DataType;
  onUpdate?: (data: DataType) => void;
}

export const Component: React.FC<ComponentProps> = ({ id, data, onUpdate }) => {
  // Component logic
  return <div>{/* JSX */}</div>;
};
```

### **State Management**

- **Use Zustand stores** for global state
- **Use React hooks** for local component state
- **Implement proper loading states** for async operations
- **Handle errors gracefully**

```typescript
// Good example
const useFeatureStore = create<State & Actions>((set, get) => ({
  data: [],
  loading: false,
  error: null,
  
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
```

### **File Organization**

- **Group related files** in appropriate directories
- **Use index files** for clean exports
- **Follow naming conventions** (camelCase for files, PascalCase for components)
- **Keep files focused** on single responsibilities

### **Error Handling**

- **Use try-catch blocks** for async operations
- **Provide meaningful error messages** to users
- **Log errors** for debugging
- **Implement proper fallbacks**

```typescript
// Good example
try {
  const result = await performOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  };
}
```

## 🔄 **Pull Request Process**

### **Before Submitting**

1. **Ensure tests pass**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

2. **Update documentation** if needed
3. **Add tests** for new functionality
4. **Verify the build** works correctly

### **Pull Request Template**

When creating a pull request, please include:

- **Description**: What changes were made and why
- **Type**: Bug fix, feature, documentation, etc.
- **Testing**: How the changes were tested
- **Screenshots**: If UI changes were made
- **Breaking Changes**: If any breaking changes were introduced

### **Review Process**

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on different platforms
4. **Documentation review** if applicable

## 🐛 **Issue Reporting**

### **Bug Reports**

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed steps to reproduce the bug
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, Node.js version, etc.
- **Screenshots**: If applicable

### **Feature Requests**

When requesting features, please include:

- **Description**: Clear description of the feature
- **Use case**: Why this feature would be useful
- **Proposed solution**: How you think it should work
- **Alternatives**: Other solutions you've considered

## 🧪 **Testing**

### **Running Tests**

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### **Writing Tests**

- **Test components** with React Testing Library
- **Test hooks** with custom test utilities
- **Test services** with mock data
- **Test utilities** with unit tests

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component id="test" data={mockData} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 📚 **Documentation**

### **Code Documentation**

- **Use JSDoc** for functions and classes
- **Add comments** for complex logic
- **Update README** for new features
- **Update architecture docs** for structural changes

```typescript
/**
 * Processes conversation data and extracts relevant information
 * @param conversation - The conversation data to process
 * @param options - Processing options
 * @returns Processed conversation data
 */
export const processConversation = (
  conversation: Conversation,
  options: ProcessingOptions
): ProcessedConversation => {
  // Implementation
};
```

### **Architecture Documentation**

- **Update schema docs** when adding new features
- **Document API changes** in backend schema
- **Document component changes** in frontend schema
- **Update architecture review** for major changes

## 🚀 **Release Process**

### **Version Numbering**

We use semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### **Release Checklist**

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version number updated
- [ ] Changelog updated
- [ ] Build verified
- [ ] Release notes prepared

## 🤔 **Questions?**

If you have questions about contributing:

- **Check existing issues** for similar questions
- **Create a new issue** with the "question" label
- **Join discussions** in GitHub Discussions
- **Read the documentation** in the docs/ folder

## 🙏 **Thank You**

Thank you for contributing to Chat Labeling AI! Your contributions help make this project better for everyone.

---

**Happy coding! 🚀**
