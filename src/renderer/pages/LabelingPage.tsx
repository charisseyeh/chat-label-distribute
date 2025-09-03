import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * @deprecated This component has been refactored into ConversationPage and ConversationDetail.
 * This redirect maintains backward compatibility during the transition.
 * 
 * New structure:
 * - ConversationPage: Main page component with layout and navigation
 * - ConversationDetail: Component for displaying conversation messages
 * - AssessmentSidebar: Assessment functionality (unchanged)
 */
const LabelingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new conversation route
    if (id) {
      navigate(`/conversation/${id}`, { replace: true });
    } else {
      // Fallback to conversation list if no ID
      navigate('/label-conversations', { replace: true });
    }
  }, [id, navigate]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-muted-foreground">Redirecting to new conversation view...</div>
    </div>
  );
};

export default LabelingPage;
