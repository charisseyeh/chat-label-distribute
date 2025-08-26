import React, { useState, useEffect } from 'react';
import { useConversationStore } from '../../stores/conversationStore';
import { ConversationService, ConversationData } from '../../services/conversationService';

const ConversationDisplay: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const { 
    selectedConversationIds, 
    toggleConversationSelection, 
    setSelectedConversations,
    clearSelection 
  } = useConversationStore();

  const conversationService = new ConversationService();

  const handleFileSelect = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.electronAPI) {
        setError('Electron API not available');
        return;
      }

      // Select file using Electron dialog
      const filePath = await window.electronAPI.selectConversationFile();
      if (!filePath) {
        return; // User cancelled
      }

      // Store the file locally
      const storeResult = await window.electronAPI.storeJsonFile(filePath);
      if (!storeResult.success) {
        setError(`Failed to store file: ${storeResult.error}`);
        return;
      }

      setSelectedFile(storeResult.data.storedPath);
      
      // Read conversations from the stored file
      const conversationData = await conversationService.getConversationsFromFile(storeResult.data.storedPath);
      setConversations(conversationData);
      
      // Clear previous selection when loading new file
      clearSelection();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    const allIds = conversations.map(conv => conv.id);
    setSelectedConversations(allIds);
  };

  const handleDeselectAll = () => {
    clearSelection();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Conversation Selection</h2>
        
        {!selectedFile ? (
          <button
            onClick={handleFileSelect}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Select Conversations File
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              File: {selectedFile.split('/').pop()}
            </span>
            <button
              onClick={handleFileSelect}
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              Change File
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {conversations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Conversations ({conversations.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-gray-600 hover:text-gray-700 underline"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedConversationIds.includes(conversation.id) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedConversationIds.includes(conversation.id)}
                    onChange={() => toggleConversationSelection(conversation.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title || 'Untitled Conversation'}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>Created: {formatDate(conversation.createTime)}</span>
                      <span>Messages: {conversation.messageCount}</span>
                      {conversation.model && <span>Model: {conversation.model}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedConversationIds.length > 0 && (
            <div className="p-4 bg-blue-50 border-t border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>{selectedConversationIds.length}</strong> conversation(s) selected for labeling
              </div>
              <div className="mt-2 text-xs text-blue-600">
                Selected IDs: {selectedConversationIds.join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {conversations.length === 0 && selectedFile && (
        <div className="text-center py-8 text-gray-500">
          No conversations found in the selected file.
        </div>
      )}
    </div>
  );
};

export default ConversationDisplay;
