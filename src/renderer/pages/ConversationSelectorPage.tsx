import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversationStore } from '../stores/conversationStore';
import { useNavigationStore } from '../stores/navigationStore';
import { ConversationService, ConversationData } from '../services/conversationService';
import { AIFilteringPanel } from '../components/conversation/AIFilteringPanel';
import { AIRelevancyResult } from '../services/ai-service';
import { useConversationLoader } from '../hooks/useConversationLoader';
import { useFileManager } from '../hooks/useFileManager';
import { FileList } from '../components/conversation/FileList';
import { TwoPanelLayout } from '../components/common';

const ConversationSelectorPage: React.FC = () => {
  const [aiRelevancyResults, setAiRelevancyResults] = useState<AIRelevancyResult[]>([]);
  const navigate = useNavigate();
  
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
      // Restoring loaded conversations from store
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

  const formatDate = (timestamp: number | string) => {
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleDateString();
    }
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
    <TwoPanelLayout
      sidebarContent={
        <>
          
          {currentSourceFile && loadedConversations.length > 0 ? (
            <AIFilteringPanel
              conversations={filteredConversations}
              onFilteredConversations={(filtered) => {
                setFilteredConversations(filtered);
              }}
              onRelevancyResults={(results) => {
                setAiRelevancyResults(results);
                
                // Merge AI relevancy results with conversations
                const updatedFilteredConversations = filteredConversations.map(conv => {
                  const relevancyResult = results.find(result => result.conversationId === conv.title);
                  if (relevancyResult) {
                    return {
                      ...conv,
                      aiRelevancy: {
                        category: relevancyResult.category,
                        explanation: relevancyResult.explanation,
                        relevancyScore: relevancyResult.relevancyScore,
                        qualityScore: relevancyResult.qualityScore,
                        reasoning: relevancyResult.reasoning,
                        timestamp: relevancyResult.timestamp
                      }
                    };
                  }
                  return conv;
                });
                
                // Update filtered conversations with AI relevancy data
                setFilteredConversations(updatedFilteredConversations);
              }}
            />
          ) : (
            <div className="p-4">
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No file loaded</p>
                <p className="text-xs">Load a conversations file to see filtering options</p>
              </div>
            </div>
          )}

          {/* File List moved to sidebar */}
          {storedFiles.length > 0 && (
            <div>
              <FileList
                storedFiles={storedFiles}
                currentSourceFile={currentSourceFile}
                onLoadFile={loadConversationsFromStoredFile}
                onDeleteFile={handleDeleteFile}
                onUploadNew={handleFileSelect}
              />
            </div>
          )}
        </>
      }
    >
      <div className="mb-6">
        {/* Show message when no file is selected OR no files are stored */}
        {(!currentSourceFile || storedFiles.length === 0) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                {storedFiles.length === 0 ? 'No Files Available' : 'No File Selected'}
              </h3>
              <p className="text-blue-600 mb-4">
                {storedFiles.length === 0 
                  ? 'Please upload a conversations.json file to get started.'
                  : 'Please select a conversations.json file to view and select conversations for labeling.'
                }
              </p>
              <button
                onClick={handleFileSelect}
                className="bg-blue-600 hover:text-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {storedFiles.length === 0 ? 'Upload Conversations File' : 'Select Conversations File'}
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

      {currentSourceFile && loadedConversations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Conversations ({filteredConversations.length} of {loadedConversations.length})
              </h2>
              {aiRelevancyResults.length > 0 && (
                <div className="text-sm text-green-600 mt-1">
                  ({aiRelevancyResults.filter(r => r.category === 'relevant').length} AI-relevant)
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Reset AI Filter
              </button>
              {selectedConversationIds.length > 0 && (
                <button
                  onClick={async () => {
                    try {
                      // Save selected conversations to storage
                      await useConversationStore.getState().saveSelectedConversationsToStorage();
                      // Navigate to labeling page
                      navigate('/label-conversations');
                    } catch (error) {
                      console.error('Failed to save selected conversations:', error);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Continue to Labeling ({selectedConversationIds.length} selected)
                </button>
              )}
            </div>
          </div>

          {/* Debug Info */}
          <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs text-gray-600">
            <div className="flex gap-4">
              <span>Total Loaded: {loadedConversations.length}</span>
              <span>Currently Filtered: {filteredConversations.length}</span>
              <span>Selected: {selectedConversationIds.length}</span>
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

          {/* AI Analysis Results Summary */}
          {aiRelevancyResults.length > 0 && (
            <div className="px-4 py-2 bg-green-50 border-b border-green-200">
              <div className="text-sm text-green-800">
                <span className="font-medium">AI Analysis Complete:</span> 
                {aiRelevancyResults.filter(r => r.category === 'relevant').length} relevant, 
                {aiRelevancyResults.filter(r => r.category !== 'relevant').length} not relevant
                {aiRelevancyResults.length > 0 && (
                  <span className="ml-2 text-xs">
                    (Avg Relevancy: {(aiRelevancyResults.reduce((sum, r) => sum + (r.relevancyScore || 0), 0) / aiRelevancyResults.length).toFixed(1)}/10)
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
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
                      <span>Created: {formatDate(conversation.createTime || conversation.createdAt || Date.now())}</span>
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
    </TwoPanelLayout>
  );
};

export default ConversationSelectorPage;
