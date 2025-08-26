import React, { useState } from 'react';
import { FloatingLabelInput } from './FloatingLabelInput';
import { FloatingLabelSelect } from './FloatingLabelSelect';
import { FloatingLabelTextarea } from './FloatingLabelTextarea';

export const FloatingLabelDemo: React.FC = () => {
  const [textValue, setTextValue] = useState('gpt4o');
  const [passwordValue, setPasswordValue] = useState('sk-');
  const [emailValue, setEmailValue] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Floating Label Components Demo</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Text Input</h3>
          <FloatingLabelInput
            label="Pre-selected range"
            value={textValue}
            onChange={setTextValue}
            placeholder="Enter text..."
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Password Input</h3>
          <FloatingLabelInput
            label="OpenAI API Key"
            value={passwordValue}
            onChange={setPasswordValue}
            type="password"
            placeholder="sk-..."
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Email Input</h3>
          <FloatingLabelInput
            label="Email Address"
            value={emailValue}
            onChange={setEmailValue}
            type="email"
            placeholder="Enter your email..."
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Date Input</h3>
          <FloatingLabelInput
            label="Start Date"
            value={dateValue}
            onChange={setDateValue}
            type="date"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Dropdown</h3>
          <FloatingLabelSelect
            label="AI Model"
            value={selectValue}
            onChange={setSelectValue}
            options={[
              { value: "", label: "-- Select a model --" },
              { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Cheapest)" },
              { value: "gpt-4", label: "GPT-4 (More Accurate)" },
              { value: "gpt-4-turbo", label: "GPT-4 Turbo (Balanced)" }
            ]}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Textarea</h3>
          <FloatingLabelTextarea
            label="Additional Notes"
            value={textareaValue}
            onChange={setTextareaValue}
            placeholder="Enter your notes here..."
            rows={4}
          />
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Features:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Labels float inside the input when focused or filled</li>
          <li>• Smooth transitions and animations</li>
          <li>• Consistent styling across all input types</li>
          <li>• Responsive design with proper spacing</li>
          <li>• Support for text, password, email, date, select, and textarea</li>
        </ul>
      </div>
    </div>
  );
};
