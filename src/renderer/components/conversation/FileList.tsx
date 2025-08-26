import React from 'react';

interface StoredFile {
  id: string;
  originalName: string;
  storedPath: string;
  importDate: string;
  fileSize: number;
}

interface FileListProps {
  storedFiles: StoredFile[];
  currentSourceFile?: string | null;
  onLoadFile: (filePath: string) => void;
  onDeleteFile: (fileId: string) => void;
  onUploadNew: () => void;
}

export const FileList: React.FC<FileListProps> = ({
  storedFiles,
  currentSourceFile,
  onLoadFile,
  onDeleteFile,
  onUploadNew
}) => {
  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Available Files</h3>
        <button
          onClick={onUploadNew}
          className="text-blue-600 hover:text-blue-700 text-sm underline"
        >
          Upload New File
        </button>
      </div>
      <div className="space-y-2">
        {storedFiles.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded border">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{file.originalName}</span>
                {currentSourceFile === file.storedPath && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    <span>Viewing</span>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {formatFileSize(file.fileSize)} • {new Date(file.importDate).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLoadFile(file.storedPath)}
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Load Conversations
              </button>
              <button
                onClick={() => onDeleteFile(file.id)}
                className="text-red-600 hover:text-red-700 text-sm underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
