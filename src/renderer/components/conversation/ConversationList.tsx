import React, { useState } from 'react';

const ConversationList: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleFileUpload = async () => {
    try {
      setUploading(true);
      setMessage('');

      if (!window.electronAPI) {
        setMessage('Electron API not available');
        return;
      }

      // Select file using Electron dialog
      const filePath = await window.electronAPI.selectConversationFile();
      if (!filePath) {
        setMessage('No file selected');
        return;
      }

      // Store the file
      const result = await window.electronAPI.storeJsonFile(filePath);
      
      if (result.success) {
        setMessage(`File uploaded successfully! Stored as: ${result.data.originalName}`);
      } else {
        setMessage(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">JSON File Upload</h1>
        <p className="text-gray-600">Upload JSON files to your local storage directory</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <button
            onClick={handleFileUpload}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {uploading ? 'Uploading...' : 'Select & Upload JSON File'}
          </button>
          
          {message && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
