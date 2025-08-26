#!/bin/bash

# Chat Labeling App Installation Script
# This script helps install the Chat Labeling App on macOS

echo "🚀 Chat Labeling App Installation Script"
echo "========================================"
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is designed for macOS only."
    echo "Please use the appropriate installer for your operating system."
    exit 1
fi

# Check macOS version
MACOS_VERSION=$(sw_vers -productVersion)
echo "✅ macOS version detected: $MACOS_VERSION"

# Check if DMG file exists
DMG_FILE="Chat Labeling App-1.0.0-arm64.dmg"
if [ ! -f "$DMG_FILE" ]; then
    echo "❌ DMG file not found: $DMG_FILE"
    echo "Please ensure the DMG file is in the same directory as this script."
    exit 1
fi

echo "✅ DMG file found: $DMG_FILE"
echo ""

echo "📋 Installation Steps:"
echo "1. Mounting the DMG file..."
echo "2. Installing the application..."
echo "3. Cleaning up..."
echo ""

# Mount the DMG
echo "🔧 Mounting DMG file..."
hdiutil attach "$DMG_FILE" -quiet

# Find the mounted volume
MOUNT_POINT=$(hdiutil info | grep "/Volumes/Chat Labeling App" | awk '{print $3}' | head -1)

if [ -z "$MOUNT_POINT" ]; then
    echo "❌ Failed to mount DMG file"
    exit 1
fi

echo "✅ DMG mounted at: $MOUNT_POINT"

# Check if app exists in mounted volume
APP_PATH="$MOUNT_POINT/Chat Labeling App.app"
if [ ! -d "$APP_PATH" ]; then
    echo "❌ Application not found in mounted volume"
    hdiutil detach "$MOUNT_POINT" -quiet
    exit 1
fi

# Install to Applications folder
echo "📱 Installing to Applications folder..."
cp -R "$APP_PATH" "/Applications/"

if [ $? -eq 0 ]; then
    echo "✅ Application installed successfully!"
else
    echo "❌ Installation failed"
    hdiutil detach "$MOUNT_POINT" -quiet
    exit 1
fi

# Unmount the DMG
echo "🔧 Unmounting DMG file..."
hdiutil detach "$MOUNT_POINT" -quiet

echo ""
echo "🎉 Installation Complete!"
echo "========================="
echo ""
echo "The Chat Labeling App has been installed to your Applications folder."
echo ""
echo "Next steps:"
echo "1. Open Finder and go to Applications"
echo "2. Find 'Chat Labeling App' and double-click to launch"
echo "3. You may see a security warning - click 'Open' to proceed"
echo ""
echo "If you encounter any issues, please refer to the DISTRIBUTION_README.md file."
echo ""
echo "Happy analyzing! 🚀"
