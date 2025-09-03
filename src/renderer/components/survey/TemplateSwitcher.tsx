import React from 'react';
import { useTemplateSwitching } from '../../hooks/survey/useTemplateSwitching';
import { SurveyTemplate } from '../../types/survey';

interface TemplateSwitcherProps {
  templates: SurveyTemplate[];
  onTemplateSwitch?: (template: SurveyTemplate | null) => void;
}

const TemplateSwitcher: React.FC<TemplateSwitcherProps> = ({ 
  templates, 
  onTemplateSwitch 
}) => {
  const { currentTemplate, checkTemplateSwitchImpact, switchTemplateSafely } = useTemplateSwitching();

  const handleTemplateSwitch = (template: SurveyTemplate | null) => {
    const impact = checkTemplateSwitchImpact(template);
    
    if (impact.willLoseData) {
      // Show detailed impact information
      console.log('⚠️ Template switch impact:', impact);
    }

    switchTemplateSafely(
      template,
      () => {
        // Success callback
        console.log('✅ Template switched successfully');
        onTemplateSwitch?.(template);
      },
      () => {
        // Cancel callback
        console.log('❌ Template switch cancelled');
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-h3 text-foreground">Assessment Templates</h3>
        <div className="text-small text-muted-foreground">
          {currentTemplate ? `Current: ${currentTemplate.name}` : 'No template selected'}
        </div>
      </div>
      
      <div className="space-y-2">
        {templates.map((template) => {
          const isCurrent = currentTemplate?.id === template.id;
          const impact = checkTemplateSwitchImpact(template);
          
          return (
            <div
              key={template.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                isCurrent 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleTemplateSwitch(template)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-small-medium text-foreground">{template.name}</h4>
                  <p className="text-small text-muted-foreground">
                    {template.questions.length} questions
                  </p>
                </div>
                
                {isCurrent && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Current
                  </span>
                )}
                
                {impact.willLoseData && !isCurrent && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    ⚠️ Will clear data
                  </span>
                )}
              </div>
              
              {impact.willLoseData && !isCurrent && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  <strong>Warning:</strong> Switching to this template will clear {impact.responseCount} existing responses from {impact.affectedConversations.length} conversation(s).
                </div>
              )}
            </div>
          );
        })}
        
        {/* Option to clear template */}
        <div
          className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors"
          onClick={() => handleTemplateSwitch(null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-small-medium text-foreground">No Template</h4>
              <p className="text-small text-muted-foreground">Clear current template</p>
            </div>
            
            {currentTemplate && checkTemplateSwitchImpact(null).willLoseData && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                ⚠️ Will clear data
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSwitcher;
