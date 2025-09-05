#!/bin/bash

# Script to create ICNS file from PNG
# Usage: ./create_icns.sh input.png output.icns

if [ $# -ne 2 ]; then
    echo "Usage: $0 input.png output.icns"
    echo "Example: $0 icon.png icon.icns"
    exit 1
fi

INPUT_PNG="$1"
OUTPUT_ICNS="$2"

# Check if input file exists
if [ ! -f "$INPUT_PNG" ]; then
    echo "Error: Input file '$INPUT_PNG' not found"
    exit 1
fi

# Create iconset directory
ICONSET_DIR="${OUTPUT_ICNS%.icns}.iconset"
mkdir -p "$ICONSET_DIR"

echo "Creating ICNS file from $INPUT_PNG..."

# Generate all required sizes
sips -z 16 16     "$INPUT_PNG" --out "$ICONSET_DIR/icon_16x16.png"
sips -z 32 32     "$INPUT_PNG" --out "$ICONSET_DIR/icon_16x16@2x.png"
sips -z 32 32     "$INPUT_PNG" --out "$ICONSET_DIR/icon_32x32.png"
sips -z 64 64     "$INPUT_PNG" --out "$ICONSET_DIR/icon_32x32@2x.png"
sips -z 128 128   "$INPUT_PNG" --out "$ICONSET_DIR/icon_128x128.png"
sips -z 256 256   "$INPUT_PNG" --out "$ICONSET_DIR/icon_128x128@2x.png"
sips -z 256 256   "$INPUT_PNG" --out "$ICONSET_DIR/icon_256x256.png"
sips -z 512 512   "$INPUT_PNG" --out "$ICONSET_DIR/icon_256x256@2x.png"
sips -z 512 512   "$INPUT_PNG" --out "$ICONSET_DIR/icon_512x512.png"
sips -z 1024 1024 "$INPUT_PNG" --out "$ICONSET_DIR/icon_512x512@2x.png"

# Create the ICNS file
iconutil -c icns "$ICONSET_DIR" -o "$OUTPUT_ICNS"

# Clean up the iconset directory
rm -rf "$ICONSET_DIR"

echo "✅ ICNS file created: $OUTPUT_ICNS"
