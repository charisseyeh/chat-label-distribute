import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useConversationStore } from '../../stores/conversationStore';
import { useSurveyStore } from '../../stores/surveyStore';
import { FloatingLabelTextarea } from '../common/FloatingLabelTextarea';

const POSITIONS = [
  { id: 'beginning', label: 'Beginning', description: 'Pre-conversation state' },
  { id: 'turn6', label: 'Turn 6', description: 'Mid-conversation state' },
  { id: 'end', label: 'End', description: 'Post-conversation state' }
];

const SurveyForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const conversationId = searchParams.get('conversationId');
  
  const { conversations, getConversationById } = useConversationStore();
  const { 
    dimensions, 
    responses, 
    addResponse, 
    updateResponse,
    getResponsesForConversation 
  } = useSurveyStore();
  
  const [currentPosition, setCurrentPosition] = useState<'beginning' | 'turn6' | 'end'>('beginning');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      loadExistingResponses();
    }
  }, [conversationId, currentPosition, responses]);

  const loadExistingResponses = () => {
    try {
      if (!conversationId) return;
      
      const conversationResponses = getResponsesForConversation(conversationId);
      const currentResponse = conversationResponses.find(r => r.position === currentPosition);
      
      if (currentResponse) {
        setRatings(currentResponse.ratings || {});
        setNotes(currentResponse.notes || '');
      } else {
        setRatings({});
        setNotes('');
      }
    } catch (err) {
      console.error('Error loading existing responses:', err);
    }
  };

  const handleRatingChange = (dimensionId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [dimensionId]: rating
    }));
  };

  const handlePositionChange = (position: 'beginning' | 'turn6' | 'end') => {
    // Save current position data before switching
    saveCurrentPosition();
    
    setCurrentPosition(position);
    
    // Load data for new position
    setTimeout(() => {
      loadExistingResponses();
    }, 100);
  };

  const saveCurrentPosition = () => {
    if (!conversationId || Object.keys(ratings).length === 0) return;

    try {
      const responseId = `${conversationId}_${currentPosition}`;
      const existingResponse = responses.find(r => r.id === responseId);
      
      const responseData = {
        id: responseId,
        conversationId,
        position: currentPosition,
        ratings,
        notes,
        timestamp: new Date().toISOString()
      };
      
      if (existingResponse) {
        updateResponse(responseId, responseData);
      } else {
        addResponse(responseData);
      }
    } catch (err) {
      console.error('Error saving response:', err);
    }
  };

  const handleSave = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      // Validate that all dimensions have ratings
      const missingDimensions = dimensions.filter(dim => !ratings[dim.id]);
      if (missingDimensions.length > 0) {
        setError(`Please rate all dimensions: ${missingDimensions.map(d => d.name).join(', ')}`);
        return;
      }

      // Save current position
      saveCurrentPosition();

      // Check if all positions are completed
      const conversationResponses = getResponsesForConversation(conversationId);
      const completedPositions = conversationResponses.length;

      if (completedPositions >= 3) {
        // All positions completed
        // Could navigate to results or show completion message
      }

      setError(null);
      
    } catch (err) {
      setError('Failed to save response');
      console.error('Error saving response:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    navigate(`/conversations/${conversationId}`);
  };

  if (!conversationId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Survey Form</h1>
          <p className="text-muted-foreground mt-2">
            No conversation selected for survey
          </p>
        </div>
      </div>
    );
  }

  const conversation = getConversationById(conversationId);

  if (!conversation) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Survey Form</h1>
          <p className="text-muted-foreground mt-2">
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Survey Form</h1>
          <p className="text-muted-foreground mt-2">
            Rate conversation: {conversation.title}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleComplete}
            className="btn-outline"
          >
            Complete Survey
          </button>
        </div>
      </div>

      {/* Position Navigation */}
      <div className="card">
        <div className="card-content">
          <div className="flex space-x-1">
            {POSITIONS.map((position) => (
              <button
                key={position.id}
                onClick={() => handlePositionChange(position.id as any)}
                className={`btn flex-1 ${
                  currentPosition === position.id
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                <div className="font-semibold">{position.label}</div>
                <div className="text-xs opacity-80">{position.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Survey Form */}
      <div className="card">
        <div className="card-content space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">
              Rating: {POSITIONS.find(p => p.id === currentPosition)?.label}
            </h2>
            <p className="text-muted-foreground">
              {POSITIONS.find(p => p.id === currentPosition)?.description}
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Rating Scales */}
          <div className="space-y-8">
            {dimensions.map((dimension) => (
              <div key={dimension.id} className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground">{dimension.name}</h3>
                  <p className="text-sm text-muted-foreground">{dimension.description}</p>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {dimension.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleRatingChange(dimension.id, index + 1)}
                      className={`btn btn-sm ${
                        ratings[dimension.id] === index + 1
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                
                {ratings[dimension.id] && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {dimension.options[ratings[dimension.id] - 1]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <FloatingLabelTextarea
              label="Additional Notes (Optional)"
              value={notes}
              onChange={setNotes}
              placeholder="Add any additional observations or notes..."
              rows={3}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSave}
              disabled={loading || Object.keys(ratings).length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Response'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
