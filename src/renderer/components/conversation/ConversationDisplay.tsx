import React, { useState, useEffect } from 'react';
import { useConversationStore } from '../../stores/conversationStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { ConversationService, ConversationData } from '../../services/conversationService';
import { AIFilteringPanel } from './AIFilteringPanel';
import { AIRelevancyResult } from '../../services/ai-service';

interface StoredFile {
  id: string;
  originalName: string;
  storedPath: string;
  importDate: string;
  fileSize: number;
}

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  averageSize: number;
}

const ConversationDisplay: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ConversationData[]>([]);
  const [aiRelevancyResults, setAiRelevancyResults] = useState<AIRelevancyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [showFileManager, setShowFileManager] = useState(false);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  
  const { 
    selectedConversationIds, 
    toggleConversationSelection, 
    setSelectedConversations,
    clearSelection 
  } = useConversationStore();

  const conversationService = new ConversationService();

  // Load stored files on component mount
  useEffect(() => {
    loadStoredFiles();
  }, []);

  // Load stored files and set the most recent one as selected
  const loadStoredFiles = async () => {
    try {
      if (!window.electronAPI) {
        setError('Electron API not available');
        return;
      }

      const result = await window.electronAPI.getStoredFiles();
      if (result.success && result.data) {
        const files = result.data as StoredFile[];
        setStoredFiles(files);
        
        // If there are stored files, automatically load the most recent one
        if (files.length > 0) {
          const mostRecentFile = files[0]; // Files are already sorted by date
          await loadConversationsFromStoredFile(mostRecentFile.storedPath);
          setSelectedFile(mostRecentFile.storedPath);
        }
      }

      // Load storage statistics
      await loadStorageStats();
    } catch (error) {
      console.error('Failed to load stored files:', error);
    }
  };

  // Load storage statistics
  const loadStorageStats = async () => {
    try {
      if (!window.electronAPI) return;
      
      const result = await window.electronAPI.getStorageStats();
      if (result.success && result.data) {
        setStorageStats(result.data as StorageStats);
      }
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  };

  // Load conversations from a stored file
  const loadConversationsFromStoredFile = async (filePath: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new conversation index method instead of loading all conversations
      const conversationData = await conversationService.getConversationIndex(filePath);
      
      setConversations(conversationData);
      // Filter conversations to only show those with more than 8 messages
      const filteredData = conversationData.filter(conv => conv.messageCount > 8);
      setFilteredConversations(filteredData);
      clearSelection();
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

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
      
      // Read conversations from the stored file using the new method
      const conversationData = await conversationService.getConversationIndex(storeResult.data.storedPath);
      setConversations(conversationData);
      // Filter conversations to only show those with more than 8 messages
      const filteredData = conversationData.filter(conv => conv.messageCount > 8);
      setFilteredConversations(filteredData);
      
      // Clear previous selection when loading new file
      clearSelection();
      
      // Reload stored files list
      await loadStoredFiles();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      if (!window.electronAPI) {
        setError('Electron API not available');
        return;
      }

      const result = await window.electronAPI.deleteStoredFile(fileId);
      if (result.success) {
        // Reload stored files
        await loadStoredFiles();
        
        // If the deleted file was the currently selected one, clear the selection
        const deletedFile = storedFiles.find(f => f.id === fileId);
        if (deletedFile && deletedFile.storedPath === selectedFile) {
          setSelectedFile(null);
          setConversations([]);
          setFilteredConversations([]);
          clearSelection();
        }
      } else {
        setError(`Failed to delete file: ${result.error}`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete file');
    }
  };

  // Cleanup duplicate files
  const handleCleanupDuplicates = async () => {
    try {
      if (!window.electronAPI) {
        setError('Electron API not available');
        return;
      }

      const result = await window.electronAPI.cleanupDuplicateFiles();
      if (result.success) {
        const { removed, savedSpace } = result.data;
        if (removed > 0) {
          alert(`Cleaned up ${removed} duplicate file(s) and saved ${formatFileSize(savedSpace)} of space!`);
          // Reload files and stats
          await loadStoredFiles();
        } else {
          alert('No duplicate files found.');
        }
      } else {
        setError(`Failed to cleanup duplicates: ${result.error}`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to cleanup duplicates');
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

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
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
        
        {/* File Management Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Stored Files</h3>
            <div className="flex items-center gap-2">
              {storageStats && (
                <div className="text-sm text-gray-600">
                  {storageStats.totalFiles} file(s) • {formatFileSize(storageStats.totalSize)} total
                </div>
              )}
              <button
                onClick={handleCleanupDuplicates}
                className="text-orange-600 hover:text-orange-700 text-sm underline"
                title="Remove duplicate files to save space"
              >
                Cleanup Duplicates
              </button>
              <button
                onClick={() => setShowFileManager(!showFileManager)}
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                {showFileManager ? 'Hide' : 'Manage Files'}
              </button>
            </div>
          </div>
          
          {showFileManager && (
            <div className="space-y-3">
              {storedFiles.length === 0 ? (
                <p className="text-gray-500 text-sm">No files stored yet.</p>
              ) : (
                storedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{file.originalName}</div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(file.fileSize)} • {new Date(file.importDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadConversationsFromStoredFile(file.storedPath)}
                        className="text-blue-600 hover:text-blue-700 text-sm underline"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-600 hover:text-red-700 text-sm underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Upload Button - Only show if no files are stored */}
        {storedFiles.length === 0 && (
          <button
            onClick={handleFileSelect}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Select Conversations File
          </button>
        )}

        {/* Current File Display */}
        {selectedFile && (
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-gray-600">
              Current File: {selectedFile.split('/').pop()}
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
        {selectedFile && conversations.length > 0 && (
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
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {conversations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Conversations ({filteredConversations.length} of {conversations.length})
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
          {conversations.length > filteredConversations.length && (
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
                  onClick={() => {
                    // Update conversation store with selected conversations and file path
                    const selectedConvs = filteredConversations
                      .filter(conv => selectedConversationIds.includes(conv.id))
                      .map(conv => ({
                        id: conv.id,
                        title: conv.title || 'Untitled Conversation',
                        sourceFilePath: selectedFile || ''
                      }));
                    
                    // Store in conversation store for persistence
                    useConversationStore.getState().setSelectedConversationsWithFile(selectedConvs);
                    useConversationStore.getState().setCurrentSourceFile(selectedFile || '');
                    
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

      {conversations.length === 0 && selectedFile && (
        <div className="text-center py-8 text-gray-500">
          No conversations found in the selected file.
        </div>
      )}

      {conversations.length > 0 && filteredConversations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg font-medium mb-2">No conversations meet the display criteria</div>
          <div className="text-sm">
            Only conversations with more than 8 messages (user + bot exchanges) are displayed.
            <br />
            The selected file contains {conversations.length} conversation(s), but none have enough messages.
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationDisplay;
