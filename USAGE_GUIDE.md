# Chat Labeling App - Usage Guide

## 🚀 **Getting Started**

### **1. Start the Development Server**
```bash
npm run dev:renderer
```

The app will be available at: `http://localhost:3000`

### **2. Import Your First Conversation**

1. **Click "Import Conversation"** on the main page
2. **Select a JSON file** exported from ChatGPT
3. **File Format**: The app expects ChatGPT export format JSON files
4. **Sample File**: Use `test-conversation.json` for testing

## 📋 **Core Features Implemented**

### **✅ Conversation Management**
- **Import JSON files** from ChatGPT exports
- **View conversation list** with metadata
- **Browse conversations** with next/previous navigation
- **Conversation details** including message count, model version, creation date

### **✅ Survey System (CRITICAL FEATURE)**
- **5-Dimensional Rating System**:
  - Mood State (Very negative → Very positive)
  - Emotional Regulation (Poor → Excellent control)
  - Stress Level (Extremely stressed → No stress)
  - Energy Level (Very low → Very high energy)
  - Overall Wellbeing (Very poor → Excellent)

- **3-Position Assessment**:
  - **Beginning**: Pre-conversation state
  - **Turn 6**: Mid-conversation state
  - **End**: Post-conversation state

- **7-Point Likert Scale** for each dimension
- **Notes field** for additional observations
- **Progress tracking** across all positions

### **✅ Conversation Viewer**
- **Message display** with role identification (User/Assistant/System)
- **Message threading** and chronological order
- **Survey progress** visualization
- **Navigation** between survey and conversation view

### **✅ Data Export System**
- **JSON export** with customizable options
- **Export options**:
  - Include conversation metadata
  - Include survey responses
  - Include conversation messages
  - Filter by completion status
- **Export history** tracking
- **Research-ready format** for academic use

## 🔄 **Workflow Example**

### **Step 1: Import Conversation**
1. Click "Import Conversation"
2. Select your ChatGPT export JSON file
3. App will parse and display conversation metadata

### **Step 2: Complete Survey**
1. Click "Survey" button on conversation
2. Navigate between 3 positions (Beginning, Turn 6, End)
3. Rate each dimension on 7-point scale
4. Add notes if needed
5. Save responses for each position

### **Step 3: Review & Export**
1. View conversation details and survey progress
2. Go to Export panel
3. Configure export options
4. Download JSON file with all data

## 📁 **File Structure**

### **Sample ChatGPT Export Format**
```json
{
  "title": "Conversation Title",
  "create_time": 1693000000,
  "mapping": {
    "node_1": {
      "id": "node_1",
      "message": {
        "content": { "parts": [{"content": "Message text"}] },
        "role": "user",
        "create_time": 1693000000
      }
    }
  },
  "conversation_id": "unique_id",
  "model": "gpt-4"
}
```

### **Export Data Structure**
```json
{
  "exportInfo": {
    "timestamp": "2024-08-25T18:51:00.000Z",
    "version": "1.0.0"
  },
  "conversations": [...],
  "surveyResponses": [...],
  "messages": [...]
}
```

## 🎯 **Current Status**

### **✅ Completed (Phase 1)**
- [x] **CRITICAL**: JSON file upload and parsing
- [x] **CRITICAL**: Conversation titles display and selection
- [x] **CRITICAL**: Basic survey system (5 dimensions, 7-point scales)
- [x] **CRITICAL**: Data export functionality
- [x] Conversation viewer with message display
- [x] Survey progress tracking
- [x] Local storage persistence

### **🔄 In Progress**
- Database integration (Prisma schema ready)
- AI analysis integration
- Enhanced UI/UX

### **📋 Next Steps**
- Database setup and migration
- AI service integration
- Advanced filtering and search
- UI polish and responsive design

## 🧪 **Testing the App**

### **Test File**
Use the provided `test-conversation.json` file to test:
1. **Import functionality**
2. **Survey system**
3. **Conversation viewing**
4. **Export features**

### **Test Workflow**
1. Import the test conversation
2. Complete surveys for all 3 positions
3. View conversation details
4. Export data with different options
5. Verify export file structure

## 🚨 **Known Limitations**

### **Current Implementation**
- **Local Storage**: Data is stored in browser localStorage (temporary)
- **File Size**: Large conversations may impact performance
- **Browser Only**: Currently web-based, Electron integration pending

### **Planned Improvements**
- **Database**: SQLite with Prisma ORM
- **File Processing**: Server-side file handling
- **AI Integration**: OpenAI API for automated labeling
- **Desktop App**: Full Electron integration

## 🔧 **Technical Details**

### **Frontend Stack**
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Local Storage** for data persistence

### **Data Flow**
1. **Import**: JSON → Parse → Store in localStorage
2. **Survey**: User input → Validate → Save to localStorage
3. **View**: Load from localStorage → Display
4. **Export**: Collect from localStorage → Generate JSON → Download

### **State Management**
- **Local State**: React useState for component state
- **Persistence**: localStorage for data storage
- **Navigation**: React Router for page routing

## 📞 **Support**

### **Issues & Questions**
- Check browser console for errors
- Verify file format matches ChatGPT export structure
- Ensure all required fields are completed in surveys

### **Development**
- All components are functional and tested
- Code follows React best practices
- TypeScript interfaces are comprehensive
- Error handling is implemented throughout

---

**App Version**: 1.0.0  
**Last Updated**: August 25, 2024  
**Status**: Phase 1 Complete - Core Features Working
