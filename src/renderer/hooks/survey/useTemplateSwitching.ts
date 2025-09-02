import { useCallback } from 'react';
import { useSurveyQuestionStore } from '../../stores/surveyQuestionStore';
import { useSurveyResponseStore } from '../../stores/surveyResponseStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { SurveyTemplate } from '../../types/survey';

export const useTemplateSwitching = () => {
  const { currentTemplate, setCurrentTemplate } = useSurveyQuestionStore();
  const { conversationData, clearAllResponsesForTemplate } = useSurveyResponseStore();
  const { currentTemplateId, setCurrentTemplateId } = useNavigationStore();

  /**
   * Check if switching to a new template will affect existing responses
   */
  const checkTemplateSwitchImpact = useCallback((newTemplate: SurveyTemplate | null) => {
    if (!currentTemplate) {
      return {
        hasExistingResponses: false,
        responseCount: 0,
        willLoseData: false,
        affectedConversations: []
      };
    }

    // Check all conversations for responses using the current template
    const affectedConversations: Array<{
      conversationId: string;
      conversationTitle: string;
      responseCount: number;
      positions: string[];
    }> = [];

    Object.entries(conversationData).forEach(([conversationId, data]) => {
      if (data.responses && data.responses.length > 0) {
        // Check if any responses exist for this conversation
                 affectedConversations.push({
           conversationId,
           conversationTitle: `Conversation ${conversationId.slice(0, 8)}`,
           responseCount: data.responses.length,
           positions: [...new Set(data.responses.map(r => r.position))]
         });
      }
    });

    const hasExistingResponses = affectedConversations.length > 0;
    const totalResponseCount = affectedConversations.reduce((sum, conv) => sum + conv.responseCount, 0);
    
    // Will lose data if switching to a different template and there are existing responses
    const willLoseData = hasExistingResponses && newTemplate && newTemplate.id !== currentTemplate.id;

    return {
      hasExistingResponses,
      responseCount: totalResponseCount,
      willLoseData,
      affectedConversations
    };
  }, [currentTemplate, conversationData]);

  /**
   * Safely switch templates with confirmation
   */
  const switchTemplateSafely = useCallback((
    newTemplate: SurveyTemplate | null,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    const impact = checkTemplateSwitchImpact(newTemplate);

    if (impact.willLoseData) {
      // Show confirmation dialog
      const message = `Switching to "${newTemplate?.name || 'No template'}" will clear all existing survey responses from "${currentTemplate?.name}" template.\n\n` +
        `This will affect ${impact.affectedConversations.length} conversation(s) with ${impact.responseCount} total responses.\n\n` +
        `Are you sure you want to continue? This action cannot be undone.`;

             if (window.confirm(message)) {
         // Clear all responses for the current template
         if (currentTemplate) {
           clearAllResponsesForTemplate(currentTemplate.id);
         }
         
         // Update both stores in the correct order
         setCurrentTemplate(newTemplate);
         if (newTemplate && newTemplate.id !== currentTemplateId) {
           setCurrentTemplateId(newTemplate.id);
         } else if (!newTemplate && currentTemplateId !== null) {
           setCurrentTemplateId(null);
         }
         
         onConfirm();
       } else {
        onCancel?.();
      }
    } else {
      // No data loss, safe to switch
      // Update both stores in the correct order
      setCurrentTemplate(newTemplate);
      if (newTemplate && newTemplate.id !== currentTemplateId) {
        setCurrentTemplateId(newTemplate.id);
      } else if (!newTemplate && currentTemplateId !== null) {
        setCurrentTemplateId(null);
      }
      
      onConfirm();
    }
  }, [currentTemplate, conversationData, checkTemplateSwitchImpact, setCurrentTemplate, setCurrentTemplateId, currentTemplateId]);

  return {
    checkTemplateSwitchImpact,
    switchTemplateSafely,
    currentTemplate
  };
};
