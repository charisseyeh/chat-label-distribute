# 📋 Conversation.json Parsing Guide - Chat Labeling System

This document explains how the `conversation.json` file is parsed for display and preview functionality in the chat labeling system.

## 🏗️ **File Structure and Loading**

The system loads conversations from `uploads/conversations.json` using a simple fetch request:

```javascript
const response = await fetch('uploads/conversations.json');
const data = await response.json();
```

## 📊 **Conversation Data Structure**

Each conversation in the JSON has this structure:

```javascript
{
  title: "Conversation Title",
  create_time: timestamp,
  mapping: {
    // Node IDs as keys
    "node_id_1": {
      message: {
        author: { role: "user" | "assistant" },
        content: {
          content_type: "text",
          parts: ["message content"]
        },
        create_time: timestamp
      }
    },
    "node_id_2": { /* next message */ }
  }
}
```

## 🔧 **Core Parsing Function: `extractMessages()`**

The main parsing happens in `js/features/labeling/export.js`:

```javascript
export function extractMessages(conversation) {
    const messages = [];
    
    if (!conversation.mapping) {
        return messages;
    }
    
    // Get all nodes and filter for valid text messages
    const allNodes = Object.values(conversation.mapping).filter(node => 
        node.message && 
        node.message.content && 
        node.message.content.content_type === 'text' &&
        node.message.content.parts?.[0]?.trim() !== ''
    );
    
    // Sort by creation time for chronological order
    allNodes.sort((a, b) => {
        const timeA = a.message.create_time || 0;
        const timeB = b.message.create_time || 0;
        return timeA - timeB;
    });
    
    // Extract role and content from each node
    allNodes.forEach(node => {
        const role = node.message.author?.role || 'user';
        const content = node.message.content.parts?.[0] || '';
        
        if (content && content.trim() !== '') {
            messages.push({
                role: role,
                content: content.trim()
            });
        }
    });
    
    return messages;
}
```

## 🖥️ **Display Rendering**

For full conversation display in `js/features/conversation/conversation-display.js`:

```javascript
// Extract messages from the complex structure
const messages = extractMessages(conversation);

// Render each message with markdown support
messages.forEach((message, messageIndex) => {
    const role = message.role;
    const content = message.content;
    
    // Skip system messages and empty messages
    if (role === 'system' || !content || content.trim() === '') {
        return;
    }
    
    // Convert markdown to HTML using marked library
    const htmlContent = marked.parse(content);
    
    html += `
        <div class="message ${role}" data-message-index="${messageCount + 1}">
            <div class="message-content">${htmlContent}</div>
        </div>
    `;
    
    messageCount++;
});
```

## 👁️ **Preview Rendering**

For conversation previews in `js/features/labeling/conversation-selector.js`:

```javascript
// Get messages for preview
const messages = extractMessages(conversation);

// Render preview with truncated content
messages.forEach(message => {
    const role = message.role;
    const content = message.content;
    
    if (role === 'system' || !content || content.trim() === '') {
        return;
    }
    
    // Truncate content to 200 characters for preview
    html += `
        <div class="preview-message ${role}">
            <div class="preview-avatar ${role}">${role === 'user' ? 'U' : 'A'}</div>
            <div class="preview-content">${escapeHtml(content.substring(0, 200))}${content.length > 200 ? '...' : ''}</div>
        </div>
    `;
});
```

## ✨ **Key Features for Portability**

### **Message Extraction Logic:**
- Filters out system messages and empty content
- Sorts by `create_time` for chronological order
- Handles nested content structure with `parts` array
- Provides clean `{role, content}` objects

### **Display Features:**
- Markdown parsing support (using marked library)
- Role-based styling (user/assistant)
- Message indexing for scroll-based features
- Survey integration at specific message points

### **Preview Features:**
- Content truncation (200 character limit)
- Avatar display (U for user, A for assistant)
- HTML escaping for security

## 📦 **Dependencies to Carry Over**

To use this parsing logic elsewhere, you'll need:

1. **The `extractMessages()` function** - Core parsing logic
2. **Markdown parsing library** - marked.js for content rendering
3. **CSS classes for styling** - `.message`, `.user`, `.assistant`, etc.
4. **HTML escaping utility function** - For security in previews

## 🔄 **Alternative Parsing Function**

There's also an alternative function in `js/features/ai-analysis/ai-labeling.js`:

```javascript
export function extractMessagesForExport(conversation) {
  const mapping = conversation.mapping || {};
  const nodes = Object.values(mapping).filter(n => 
    n?.message?.content?.content_type === 'text' && 
    (n.message.content.parts?.[0]?.trim() || '') !== ''
  );
  nodes.sort((a, b) => (a.message.create_time || 0) - (b.message.create_time || 0));
  
  const msgs = [];
  nodes.forEach(n => {
    const role = n.message.author?.role || 'user';
    const content = n.message.content.parts?.[0] || '';
    if (role === 'system') return;
    if (content && content.trim() !== '') msgs.push({ role, text: content.trim() });
  });
  return msgs;
}
```

## 📝 **Summary**

This parsing system is designed to handle the complex nested structure of ChatGPT conversation exports while providing clean, display-ready message objects that can be easily rendered in any UI framework. The core `extractMessages()` function transforms the complex `mapping` structure into a simple array of `{role, content}` objects, making it easy to integrate with any frontend framework or display system.

The system handles:
- ✅ Complex nested JSON structures
- ✅ Chronological message ordering
- ✅ Role-based message categorization
- ✅ Content filtering and validation
- ✅ Markdown content support
- ✅ Preview generation with truncation
- ✅ HTML-safe rendering
