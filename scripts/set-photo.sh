#!/usr/bin/env bash
# Install Sabiha's real portrait into the website.
#
#   ./scripts/set-photo.sh /path/to/photo.jpg
#
# Copies the JPEG to website/public/sabiha.jpg — every page picks it up
# automatically (the Portrait component defaults to that path).
# Deliberately boring: no resizing, no filters, no AI. Her photo, as-is.
set -euo pipefail

SRC="${1:-}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/website/public/sabiha.jpg"

if [ -z "$SRC" ]; then
  echo "usage: $0 /path/to/photo.jpg" >&2
  exit 1
fi
if [ ! -f "$SRC" ]; then
  echo "✗ file not found: $SRC" >&2
  exit 1
fi

# JPEG magic bytes: FF D8 FF
if [ "$(head -c 3 "$SRC" | od -An -tx1 | tr -d ' \n')" != "ffd8ff" ]; then
  echo "✗ not a JPEG: $SRC" >&2
  echo "  export/save the photo as .jpg first (phone photos already are)." >&2
  exit 1
fi

mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
echo "✓ installed $(du -h "$DEST" | cut -f1) portrait → website/public/sabiha.jpg"
echo "  the website, /about and the admin preview pick it up on next load."
