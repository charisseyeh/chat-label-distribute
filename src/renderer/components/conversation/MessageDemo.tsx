import React, { useState } from 'react';
import Message from './Message';
import MessageList from './MessageList';

const MessageDemo: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'bubble' | 'minimal'>('bubble');
  const [selectedLayout, setSelectedLayout] = useState<'single' | 'two-column' | 'grid'>('two-column');
  const [showRole, setShowRole] = useState(true);
  const [showTimestamp, setShowTimestamp] = useState(true);

  // Sample messages for demonstration
  const sampleMessages = [
    {
      id: '1',
      role: 'assistant' as const,
      content: "Hello! I'm so glad you reached out to me. It's always a pleasure to connect and assist you. Please let me know how I can help you today. Whether you have questions about our services, need assistance with a specific issue, or just want to chat about something on your mind, I'm here for you.",
      timestamp: Date.now() / 1000 - 3600
    },
    {
      id: '2',
      role: 'user' as const,
      content: "Hello! Your inquiry is important to me. Let's dive into your questions.",
      timestamp: Date.now() / 1000 - 3500
    },
    {
      id: '3',
      role: 'assistant' as const,
      content: "Hello! I'm committed to ensuring you find what you are looking for. How can I help?",
      timestamp: Date.now() / 1000 - 3400
    },
    {
      id: '4',
      role: 'user' as const,
      content: "Hello! I'm eager to assist you with any inquiries you may have. Let's get started!",
      timestamp: Date.now() / 1000 - 3300
    },
    {
      id: '5',
      role: 'assistant' as const,
      content: "Hello! I'm all ears and ready to help. What questions do you have?",
      timestamp: Date.now() / 1000 - 3200
    },
    {
      id: '6',
      role: 'user' as const,
      content: "Hello! I'm thrilled to connect with you. Please share what you need assistance with!",
      timestamp: Date.now() / 1000 - 3100
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-2xl font-bold mb-4">Message Component Demo</h2>
        
        {/* Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Variant</label>
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value as any)}
              className="w-full px-3 py-2 border border-border rounded-lg"
            >
              <option value="default">Default</option>
              <option value="bubble">Bubble</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Layout</label>
            <select
              value={selectedLayout}
              onChange={(e) => setSelectedLayout(e.target.value as any)}
              className="w-full px-3 py-2 border border-border rounded-lg"
            >
              <option value="single">Single Column</option>
              <option value="two-column">Two Column</option>
              <option value="grid">Grid</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showRole"
              checked={showRole}
              onChange={(e) => setShowRole(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showRole" className="text-sm">Show Role</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showTimestamp"
              checked={showTimestamp}
              onChange={(e) => setShowTimestamp(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showTimestamp" className="text-sm">Show Timestamp</label>
          </div>
        </div>

        {/* Message List */}
        <div className="border border-border rounded-lg p-4 bg-gray-50">
          <MessageList
            messages={sampleMessages}
            layout={selectedLayout}
            messageVariant={selectedVariant}
            showRole={showRole}
            showTimestamp={showTimestamp}
            columns={3}
          />
        </div>
      </div>

      {/* Individual Message Examples */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-xl font-bold mb-4">Individual Message Examples</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">User Message</h4>
            <Message
              id="user-example"
              role="user"
              content="This is an example of a user message with the current styling."
              timestamp={Date.now() / 1000}
              variant={selectedVariant}
              showRole={showRole}
              showTimestamp={showTimestamp}
            />
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Assistant Message</h4>
            <Message
              id="assistant-example"
              role="assistant"
              content="This is an example of an AI assistant message with the current styling."
              timestamp={Date.now() / 1000}
              variant={selectedVariant}
              showRole={showRole}
              showTimestamp={showTimestamp}
            />
          </div>
          
          <div>
            <h4 className="font-medium mb-2">System Message</h4>
            <Message
              id="system-example"
              role="system"
              content="This is an example of a system message with the current styling."
              timestamp={Date.now() / 1000}
              variant={selectedVariant}
              showRole={showRole}
              showTimestamp={showTimestamp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDemo;
