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
import { ListItem, List } from '../components/common';

const ConversationSelectorPage: React.FC = () => {
  const [aiRelevancyResults, setAiRelevancyResults] = useState<AIRelevancyResult[]>([]);
  const navigate = useNavigate();
  
  // Use our new custom hooks
  const { loading, error, setError, loadConversationsFromFile, handleNewFileSelect } = useConversationLoader();
  const { storedFiles, deleteFile, loadStoredFiles } = useFileManager();
  
  const { 
    selectedConversationIds, 
    selectedConversations,
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
          {/* Show permanently stored selected conversations */}
          {selectedConversations.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Permanently Stored Conversations</h3>
              <div className="space-y-2">
                {selectedConversations.map((conv) => (
                  <div key={conv.id} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    {conv.title}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-500">
                These conversations are permanently saved and will appear in the labeling page.
              </div>
            </div>
          )}
          
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
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
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
                Deselect All
              </button>
            </div>
          </div>


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
            {/* Show all conversations with proper checkbox functionality */}
            <List
              variant="without-dividers"
              listItemVariant="check-chip-single"
              items={filteredConversations.map((conversation) => {
                const isPermanentlyStored = selectedConversations.some(selected => selected.id === conversation.id);
                const isCurrentlySelected = selectedConversationIds.includes(conversation.id);
                
                return {
                  title: conversation.title || 'Untitled Conversation',
                  metadata: isPermanentlyStored 
                    ? `Permanently stored • Source: ${conversation.sourceFilePath?.split('/').pop() || 'Unknown file'}`
                    : `Created: ${formatDate(conversation.createTime || conversation.createdAt || Date.now())} • Messages: ${conversation.messageCount}${conversation.model ? ` • Model: ${conversation.model}` : ''}`,
                  chip: isPermanentlyStored 
                    ? {
                        variant: 'selected',
                        text: '✓ Stored'
                      }
                    : conversation.aiRelevancy ? {
                        variant: conversation.aiRelevancy.category === 'relevant' ? 'relevant' : 'not-relevant',
                        text: conversation.aiRelevancy.category === 'relevant' ? '✓ Relevant' : '✗ Not Relevant'
                      } : undefined,
                  checked: isPermanentlyStored || isCurrentlySelected,
                  onCheckChange: isPermanentlyStored ? () => {} : () => toggleConversationSelection(conversation.id),
                  selected: isPermanentlyStored || isCurrentlySelected,
                  onClick: isPermanentlyStored ? () => {} : () => toggleConversationSelection(conversation.id)
                };
              })}
            />
            

            

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
