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
    <div className="container-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-h3">Files for conversationss</h3>
        <button
          onClick={onUploadNew}
          className="text-blue-600 hover:text-blue-700 text-xs underline"
        >
          Upload New
        </button>
      </div>
      <div className="space-y-2">
        {storedFiles.map((file) => (
          <div key={file.id} className="text-small">
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-body-primary truncate">{file.originalName}</span>
                {currentSourceFile === file.storedPath && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                    <span>Viewing</span>
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {formatFileSize(file.fileSize)} • {new Date(file.importDate).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLoadFile(file.storedPath)}
                className="text-blue-600 hover:text-blue-700 text-xs underline"
              >
                Load
              </button>
              <button
                onClick={() => onDeleteFile(file.id)}
                className="text-red-600 hover:text-red-700 text-xs underline"
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
