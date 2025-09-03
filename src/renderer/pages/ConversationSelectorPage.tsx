import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConversationService, type ConversationData } from '../services/conversation';
import { AIRelevancyResult } from '../services/ai/ai-service';
import { AIFilteringPanel } from '../components/conversation/filtering';
import { useConversationStore } from '../stores/conversationStore';
import { useConversationLoader } from '../hooks/conversation/useConversationLoader';
import { useFileManager } from '../hooks/core/useFileManager';
import { FileList } from '../components/conversation/management';
import { TwoPanelLayout } from '../components/common';
import { ListItem } from '../components/common';
import ConversationSelector from '../components/ai-analysis/ConversationSelector';

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
    clearTemporarySelection,
    loadedConversations,
    filteredConversations,
    currentSourceFile,
    setFilteredConversations,
    activeFilters,
    toggleFilter,
    clearFilters,
    applyFilters
  } = useConversationStore();

  // Check if we have loaded conversations on mount and restore them
  useEffect(() => {
    if (currentSourceFile && loadedConversations.length > 0) {
      // Restoring loaded conversations from store
    }
  }, [currentSourceFile, loadedConversations]);

  // Apply filters when conversations or filters change
  useEffect(() => {
    if (loadedConversations.length > 0) {
      // Only apply filters if we have conversations with more than 9 messages
      const validConversations = loadedConversations.filter(conv => conv.messageCount > 9);
      if (validConversations.length !== loadedConversations.length) {
        // Silent warning - no console log needed
      }
      
      applyFilters();
    }
  }, [loadedConversations, activeFilters, applyFilters]);

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
    clearTemporarySelection();
  };



  const formatDate = (timestamp: number | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-large">Loading conversations...</div>
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
              onFilteredConversations={(filtered: ConversationData[]) => {
                setFilteredConversations(filtered);
              }}
              onRelevancyResults={(results: AIRelevancyResult[]) => {
                setAiRelevancyResults(results);
                
                // Use the store function to merge AI relevancy results
                useConversationStore.getState().mergeAIRelevancyResults(results);
                
                // Don't call applyFilters here - let the user manually apply filters
                // The date filters should remain active
              }}
            />
          ) : (
            <div className="p-4">
              <div className="text-center text-muted-foreground py-8">
                <p>No file loaded</p>
                <p>Load a conversations file to see filtering options</p>
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
      {/* Show message when no file is selected OR no files are stored */}
      {(!currentSourceFile || storedFiles.length === 0) && (
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="text-center">
            <h3 className="text-h3 text-primary-800 mb-2">
              {storedFiles.length === 0 ? 'No Files Available' : 'No File Selected'}
            </h3>
            <p className="text-body-secondary mb-4">
              {storedFiles.length === 0 
                ? 'Please upload a conversations.json file to get started.'
                : 'Please select a conversations.json file to view and select conversations for labeling.'
              }
            </p>
            <button
              onClick={handleFileSelect}
              className="bg-primary-600 hover:text-primary-700 text-white text-body py-2 px-4 rounded-lg transition-colors"
            >
              {storedFiles.length === 0 ? 'Upload Conversations File' : 'Select Conversations File'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-error/10 text-error/80 border border-error/20 rounded-lg">
          {error}
        </div>
      )}

      {currentSourceFile && loadedConversations.length > 0 && (
        <div className="flex flex-col pl-4 pr-4">
          {/* Sticky Filter Controls - This will stick to the top during scroll */}
          <div className="sticky top-0 z-10 border-b border-border bg-primary">
            <div className="flex items-center justify-between align-end p-4">
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="btn-outline btn-sm"
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="btn-outline btn-sm"
                >
                  Deselect All
                </button>
              </div>
              
              {/* Filter Buttons */}
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => {
                    toggleFilter('relevant');
                    setTimeout(applyFilters, 0);
                  }}
                  className={`btn-filter relevant btn-sm ${activeFilters.relevant ? 'active' : ''}`}
                >
                  Relevant
                </button>
                <button
                  onClick={() => {
                    toggleFilter('notRelevant');
                    setTimeout(applyFilters, 0);
                  }}
                  className={`btn-filter not-relevant btn-sm ${activeFilters.notRelevant ? 'active' : ''}`}
                >
                  Non-relevant
                </button>
                <button
                  onClick={() => {
                    clearFilters();
                    setTimeout(applyFilters, 0);
                  }}
                  className="btn-filter-clear btn-sm"
                >
                  Clear filters
                </button>
              </div>
            </div>

            {/* AI Analysis Results Summary - Also sticky */}
            {aiRelevancyResults.length > 0 && (
              <div className="px-4 py-2 bg-success/10 border-b border-success/20">
                <div className="text-small text-success/80">
                  <span className="text-body">AI Analysis Complete:</span> 
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
          </div>

          {/* Scrollable Conversation List */}
          <div className="overflow-y-auto flex-1">
            {/* Show all conversations with proper checkbox functionality */}
            <ConversationSelector
              conversations={filteredConversations}
              selectedConversations={selectedConversations.map(conv => conv.id)}
              onConversationToggle={toggleConversationSelection}
            />
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-2 bg-gray-100 text-xs">
                <div>Debug: Filtered conversations count: {filteredConversations.length}</div>
                <div>Debug: Message count range: {filteredConversations.length > 0 ? `${Math.min(...filteredConversations.map(c => c.messageCount))} - ${Math.max(...filteredConversations.map(c => c.messageCount))}` : 'N/A'}</div>
                <div>Debug: Conversations with ≤9 messages: {filteredConversations.filter(c => c.messageCount <= 9).length}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {currentSourceFile && loadedConversations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No conversations found in the selected file.
        </div>
      )}

      {currentSourceFile && loadedConversations.length > 0 && filteredConversations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-h3 mb-2">No conversations meet the display criteria</div>
          <div className="text-small">
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
