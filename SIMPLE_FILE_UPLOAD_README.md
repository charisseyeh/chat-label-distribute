# Simple JSON File Upload

This application has been simplified to provide a clean, simple JSON file upload functionality.

## What It Does

- **Simple Upload**: Click a button to select and upload JSON files
- **Local Storage**: Files are stored in your local Documents folder
- **No Complex Features**: Just upload and store - no reading, parsing, or complex management

## How It Works

1. **Click Upload**: Click the "Select & Upload JSON File" button
2. **Select File**: Choose a JSON file from your computer using the file dialog
3. **Automatic Storage**: The file is automatically copied to your local storage directory
4. **Success Message**: You'll see a confirmation message when the upload completes

## Storage Location

Files are stored in: `~/Documents/JSONFileReader/stored-files/`

Each file gets a unique ID prefix to avoid conflicts.

## Technical Details

- **Frontend**: Simple React component with upload button and status messages
- **Backend**: Electron main process with minimal IPC handlers
- **File Management**: Basic file copying to local directory
- **No Database**: Simple file system storage only

## Files Modified

- `src/renderer/components/conversation/ConversationList.tsx` - Simplified UI
- `src/main/ipc-handlers.ts` - Minimal IPC handlers
- `src/main/file-manager.ts` - Basic file storage
- `src/preload/preload.ts` - Simplified API exposure
- `src/renderer/types/global.d.ts` - Type definitions

## Running the App

```bash
npm run dev
```

The app will open with a simple upload interface. No complex setup or configuration needed.
