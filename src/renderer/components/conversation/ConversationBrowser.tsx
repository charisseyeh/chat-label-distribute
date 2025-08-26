import React, { useState, useEffect } from 'react';
import { useConversationStore } from '../../stores/conversationStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { ConversationService, ConversationData } from '../../services/conversationService';
import { AIFilteringPanel } from './AIFilteringPanel';
import { AIRelevancyResult } from '../../services/ai-service';
import { useConversationLoader } from '../../hooks/useConversationLoader';
import { useFileManager } from '../../hooks/useFileManager';
import { FileList } from './FileList';



const ConversationBrowser: React.FC = () => {
  const [aiRelevancyResults, setAiRelevancyResults] = useState<AIRelevancyResult[]>([]);
  
  // Use our new custom hooks
  const { loading, error, setError, loadConversationsFromFile, handleNewFileSelect } = useConversationLoader();
  const { storedFiles, deleteFile, loadStoredFiles } = useFileManager();
  
  const { 
    selectedConversationIds, 
    toggleConversationSelection, 
    setSelectedConversations,
    clearSelection,
    loadedConversations,
    filteredConversations,
    currentSourceFile,
    setFilteredConversations
  } = useConversationStore();

  // Check if we have loaded conversations on mount and restore them
  useEffect(() => {
    if (currentSourceFile && loadedConversations.length > 0) {
      console.log('🔄 Restoring loaded conversations from store:', loadedConversations.length, 'conversations');
    }
  }, [currentSourceFile, loadedConversations]);

  // Load conversations from a stored file
  const loadConversationsFromStoredFile = async (filePath: string) => {
    // Use our hook's function instead
    await loadConversationsFromFile(filePath);
  };

  const handleFileSelect = async () => {
    // Use our hook's function instead
    await handleNewFileSelect();
    // Reload stored files list after successful upload
    await loadStoredFiles();
  };

  const handleDeleteFile = async (fileId: string) => {
    const success = await deleteFile(fileId);
    if (success) {
      // If the deleted file was the currently selected one, clear the selection
      const deletedFile = storedFiles.find(f => f.id === fileId);
      if (deletedFile && deletedFile.storedPath === currentSourceFile) {
        useConversationStore.getState().setCurrentSourceFile(null);
        useConversationStore.getState().clearLoadedConversations();
        clearSelection();
      }
    }
  };

  const handleSelectAll = () => {
    const allIds = filteredConversations.map(conv => conv.id);
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
        
        {/* Upload Button - Only show if no files are stored */}
        {storedFiles.length === 0 && (
          <button
            onClick={handleFileSelect}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Select Conversations File
          </button>
        )}

        {/* Show file list when files exist */}
        {storedFiles.length > 0 && (
          <FileList
            storedFiles={storedFiles}
            onLoadFile={loadConversationsFromStoredFile}
            onDeleteFile={handleDeleteFile}
            onUploadNew={handleFileSelect}
          />
        )}

        {/* Current File Display */}
        {currentSourceFile && (
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-gray-600">
              Current File: {currentSourceFile.split('/').pop()}
            </span>
            <button
              onClick={handleFileSelect}
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              Upload New File
            </button>
          </div>
        )}

        {/* AI Filtering Panel */}
        {currentSourceFile && loadedConversations.length > 0 && (
          <div>
            <AIFilteringPanel
              conversations={filteredConversations}
              onFilteredConversations={(filtered) => {
                setFilteredConversations(filtered);
              }}
              onRelevancyResults={(results) => {
                setAiRelevancyResults(results);
              }}
            />
          </div>
        )}

        {/* Show message when no file is selected */}
        {!currentSourceFile && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-medium text-blue-800 mb-2">No File Selected</h3>
              <p className="text-blue-600 mb-4">
                Please select a conversations.json file to view and select conversations for labeling.
              </p>
              <button
                onClick={handleFileSelect}
                className="bg-blue-600 hover:text-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Select Conversations File
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Debug info - remove this after fixing */}
      {currentSourceFile && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>Debug Info:</strong> Selected file: {currentSourceFile} | 
            Conversations loaded: {loadedConversations.length} | 
            Filtered conversations: {filteredConversations.length}
          </div>
        </div>
      )}

      {currentSourceFile && loadedConversations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Conversations ({filteredConversations.length} of {loadedConversations.length})
              {aiRelevancyResults.length > 0 && (
                <span className="ml-2 text-sm font-normal text-green-600">
                  ({aiRelevancyResults.filter(r => r.category === 'relevant').length} relevant)
                </span>
              )}
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
                Reset AI Filter
              </button>
            </div>
          </div>

          {/* Filtering info */}
          {loadedConversations.length > filteredConversations.length && (
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
              <div className="text-sm text-blue-800">
                <span className="font-medium">Filtering:</span> Only showing conversations with more than 8 messages (user + bot exchanges)
              </div>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {filteredConversations.map((conversation) => (
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
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.title || 'Untitled Conversation'}
                      </h4>
                      {conversation.aiRelevancy && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          conversation.aiRelevancy.category === 'relevant' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {conversation.aiRelevancy.category === 'relevant' ? '✓ Relevant' : '✗ Not Relevant'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>Created: {formatDate(conversation.createTime)}</span>
                      <span>Messages: {conversation.messageCount}</span>
                      {conversation.model && <span>Model: {conversation.model}</span>}
                    </div>
                    {conversation.aiRelevancy?.explanation && (
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>AI Analysis:</strong> {conversation.aiRelevancy.explanation}
                      </div>
                    )}
                    {conversation.conversationPreview && (
                      <div className="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                        <strong>Preview:</strong> {conversation.conversationPreview}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedConversationIds.length > 0 && (
            <div className="p-4 bg-blue-50 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-800">
                    <strong>{selectedConversationIds.length}</strong> conversation(s) selected for labeling
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Selected IDs: {selectedConversationIds.join(', ')}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    // Update conversation store with selected conversations and file path
                    const selectedConvs = filteredConversations
                      .filter(conv => selectedConversationIds.includes(conv.id))
                      .map(conv => ({
                        id: conv.id,
                        title: conv.title || 'Untitled Conversation',
                        sourceFilePath: currentSourceFile || ''
                      }));
                    
                    // Store in conversation store for persistence
                    useConversationStore.getState().setSelectedConversationsWithFile(selectedConvs);
                    useConversationStore.getState().setCurrentSourceFile(currentSourceFile || '');
                    
                    // Save to permanent storage
                    await useConversationStore.getState().saveSelectedConversationsToStorage();
                    
                    // Also update navigation store for backward compatibility
                    useNavigationStore.getState().setSelectedConversations(selectedConvs.map(conv => ({
                      id: conv.id,
                      title: conv.title
                    })));
                    useNavigationStore.getState().setCurrentPage('label-conversations');
                    
                    // Navigate to labeling page
                    window.history.pushState({}, '', '/label-conversations');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Go to Labeling
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {currentSourceFile && loadedConversations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No conversations found in the selected file.
        </div>
      )}

      {currentSourceFile && loadedConversations.length > 0 && filteredConversations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg font-medium mb-2">No conversations meet the display criteria</div>
          <div className="text-sm">
            Only conversations with more than 8 messages (user + bot exchanges) are displayed.
            <br />
            The selected file contains {loadedConversations.length} conversation(s), but none have enough messages.
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationBrowser;
