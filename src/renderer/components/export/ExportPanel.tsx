import React, { useState, useEffect } from 'react';
import { useAssessmentResponseStore } from '../../stores/assessmentResponseStore';

interface Conversation {
  id: string;
  title: string;
  modelVersion?: string;
  conversationLength: number;
  createdAt: string;
  messageCount: number;
}

interface AssessmentResponse {
  position: string;
  ratings: Record<string, number>;
  notes: string;
  timestamp: string;
}

interface ExportOptions {
  includeConversations: boolean;
  includeAssessmentResponses: boolean;
  includeMessages: boolean;
  format: 'json' | 'csv';
  filterCompleted: boolean;
}

const ExportPanel: React.FC = () => {
  const { conversationData } = useAssessmentResponseStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeConversations: true,
    includeAssessmentResponses: true,
    includeMessages: false,
    format: 'json',
    filterCompleted: false
  });
  const [loading, setLoading] = useState(false);
  const [exportHistory, setExportHistory] = useState<any[]>([]);

  useEffect(() => {
    loadConversations();
    loadExportHistory();
  }, []);

  const loadConversations = () => {
    try {
      const savedConversations = localStorage.getItem('conversations');
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  const loadExportHistory = () => {
    try {
      const savedHistory = localStorage.getItem('export_history');
      if (savedHistory) {
        setExportHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error('Error loading export history:', err);
    }
  };

  const getAssessmentResponses = (conversationId: string) => {
    try {
      // Use the store data instead of localStorage
      const storeData = conversationData[conversationId];
      console.log('🔍 Store data for conversation:', conversationId, storeData);
      
      if (storeData && storeData.responses) {
        console.log('🔍 Store responses:', storeData.responses);
        
        // Convert the responses array to the expected format
        const formattedResponses: Record<string, any> = {};
        
        // Group responses by position
        const beginningResponses = storeData.responses.filter(r => r.position === 'beginning');
        const turn6Responses = storeData.responses.filter(r => r.position === 'turn6');
        const endResponses = storeData.responses.filter(r => r.position === 'end');
        
        console.log('🔍 Responses by position:', {
          beginning: beginningResponses,
          turn6: turn6Responses,
          end: endResponses
        });
        
        if (beginningResponses.length > 0) {
          formattedResponses.beginning = beginningResponses.reduce((acc, r) => {
            acc[r.questionId] = r.rating;
            return acc;
          }, {} as Record<string, number>);
        }
        
        if (turn6Responses.length > 0) {
          formattedResponses.turn6 = turn6Responses.reduce((acc, r) => {
            acc[r.questionId] = r.rating;
            return acc;
          }, {} as Record<string, number>);
        }
        
        if (endResponses.length > 0) {
          formattedResponses.end = endResponses.reduce((acc, r) => {
            acc[r.questionId] = r.rating;
            return acc;
          }, {} as Record<string, number>);
        }
        
        console.log('🔍 Formatted responses:', formattedResponses);
        return formattedResponses;
      }
      
      // Fallback to localStorage for backward compatibility
      const savedResponses = localStorage.getItem(`assessment_responses_${conversationId}`);
      console.log('🔍 Fallback localStorage responses:', savedResponses);
      return savedResponses ? JSON.parse(savedResponses) : {};
    } catch (err) {
      console.error('Error loading assessment responses:', err);
      return {};
    }
  };

  const getConversationMessages = (conversationId: string) => {
    try {
      const savedData = localStorage.getItem(`conversation_${conversationId}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        const messages: any[] = [];
        
        Object.values(data.mapping).forEach((node: any) => {
          if (node.message && node.message.content) {
            messages.push({
              id: node.id,
              role: node.message.role,
              content: node.message.content.parts[0]?.content || '',
              create_time: node.message.create_time
            });
          }
        });
        
        return messages.sort((a, b) => a.create_time - b.create_time);
      }
      return [];
    } catch (err) {
      console.error('Error loading messages:', err);
      return [];
    }
  };

  const isConversationComplete = (conversationId: string) => {
    // Use store data to check completion
    const storeData = conversationData[conversationId];
    if (storeData && storeData.completedSections) {
      return storeData.completedSections.length >= 3; // beginning, turn6, end
    }
    
    // Fallback to old method
    const responses = getAssessmentResponses(conversationId);
    const positions = ['beginning', 'turn6', 'end'];
    return positions.every(pos => responses[pos]);
  };

  const generateExportData = () => {
    const exportData: any = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        options: exportOptions
      },
      conversations: [],
      assessmentResponses: [],
      messages: []
    };

    conversations.forEach(conversation => {
      // Check if we should include this conversation based on completion filter
      if (exportOptions.filterCompleted && !isConversationComplete(conversation.id)) {
        return;
      }

      if (exportOptions.includeConversations) {
        exportData.conversations.push({
          id: conversation.id,
          title: conversation.title,
          modelVersion: conversation.modelVersion,
          conversationLength: conversation.conversationLength,
          createdAt: conversation.createdAt,
          messageCount: conversation.messageCount
        });
      }

      if (exportOptions.includeAssessmentResponses) {
        const responses = getAssessmentResponses(conversation.id);
        if (Object.keys(responses).length > 0) {
          // Get all human responses from the store, not just the current template
          const storeData = conversationData[conversation.id];
          let allHumanResponses = responses;
          
          if (storeData && storeData.responses) {
            // Create a comprehensive response object with all human data
            allHumanResponses = {
              beginning: {},
              turn6: {},
              end: {}
            };
            
            // Group all responses by position
            storeData.responses.forEach(response => {
              if (!allHumanResponses[response.position]) {
                allHumanResponses[response.position] = {};
              }
              allHumanResponses[response.position][response.questionId] = response.rating;
            });
          }
          
          exportData.assessmentResponses.push({
            conversationId: conversation.id,
            conversationTitle: conversation.title,
            responses: allHumanResponses,
            // Include metadata about what template was used for human responses
            humanResponseTemplate: {
              questionIds: Object.keys(responses.beginning || {}).concat(
                Object.keys(responses.turn6 || {}),
                Object.keys(responses.end || {})
              ).filter((id, index, arr) => arr.indexOf(id) === index) // Remove duplicates
            }
          });
        }
      }

      if (exportOptions.includeMessages) {
        const messages = getConversationMessages(conversation.id);
        if (messages.length > 0) {
          exportData.messages.push({
            conversationId: conversation.id,
            conversationTitle: conversation.title,
            messages
          });
        }
      }
    });

    return exportData;
  };

  const downloadFile = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      setLoading(true);

      // Generate export data
      const exportData = generateExportData();
      
      // Create filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `chat-labeling-export-${timestamp}.json`;
      
      // Download file
      downloadFile(exportData, filename);
      
      // Save to export history
      const historyEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        filename,
        recordCount: exportData.conversations.length,
        options: exportOptions
      };
      
      const updatedHistory = [historyEntry, ...exportHistory];
      setExportHistory(updatedHistory);
      localStorage.setItem('export_history', JSON.stringify(updatedHistory));
      
      
      
    } catch (err) {
      console.error('Error during export:', err);
    } finally {
      setLoading(false);
    }
  };

  const getExportSummary = () => {
    const totalConversations = conversations.length;
    const completedConversations = conversations.filter(c => isConversationComplete(c.id)).length;
    const totalAssessmentResponses = conversations.reduce((total, c) => {
      const responses = getAssessmentResponses(c.id);
      return total + Object.keys(responses).length;
    }, 0);
    
    return {
      totalConversations,
      completedConversations,
      totalAssessmentResponses,
      completionRate: totalConversations > 0 ? (completedConversations / totalConversations * 100).toFixed(1) : '0'
    };
  };

  const summary = getExportSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Data Export</h1>
        <p className="text-muted-foreground mt-2">
          Export labeled datasets for research and analysis
        </p>
      </div>

      {/* Export Summary */}
      <div className="card">
        <div className="card-content">
          <h3 className="text-lg font-medium text-foreground mb-4">Export Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary">{summary.totalConversations}</div>
              <div className="text-sm text-muted-foreground">Total Conversations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{summary.completedConversations}</div>
              <div className="text-sm text-muted-foreground">Completed Assessments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{summary.totalAssessmentResponses}</div>
              <div className="text-sm text-muted-foreground">Assessment Responses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{summary.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <div className="card-content">
          <h3 className="text-lg font-medium text-foreground mb-4">Export Options</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeConversations}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeConversations: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span>Include conversation metadata</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeAssessmentResponses}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeAssessmentResponses: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span>Include assessment responses</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeMessages}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeMessages: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span>Include conversation messages</span>
                </label>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.filterCompleted}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, filterCompleted: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span>Only export completed Assessments</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Export Format
                  </label>
                  <select
                    value={exportOptions.format}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'json' | 'csv' }))}
                    className="w-full p-2 border border-input rounded-lg bg-background text-foreground"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV (Coming Soon)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-center">
        <button
          onClick={handleExport}
          disabled={loading || conversations.length === 0}
          className="btn-primary btn-xl"
        >
          {loading ? 'Exporting...' : 'Export Data'}
        </button>
      </div>

      {/* Export History */}
      {exportHistory.length > 0 && (
        <div className="card">
          <div className="card-content">
            <h3 className="text-lg font-medium text-foreground mb-4">Export History</h3>
            <div className="space-y-2">
              {exportHistory.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{entry.filename}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()} • {entry.recordCount} records
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Could implement re-export functionality here
              
                    }}
                    className="btn-outline text-sm"
                  >
                    Re-export
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPanel;
