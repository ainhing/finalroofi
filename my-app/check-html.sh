#!/bin/bash
# Script kiểm tra HTML structure nhanh (Linux/Mac)
# Usage: chmod +x check-html.sh && ./check-html.sh

echo "Checking HTML files..."

ERRORS=0

find src/app -name "*.html" | while read file; do
    OPEN_DIVS=$(grep -o '<div[^>]*>' "$file" | wc -l)
    CLOSE_DIVS=$(grep -o '</div>' "$file" | wc -l)
    
    if [ "$OPEN_DIVS" -ne "$CLOSE_DIVS" ]; then
        echo "❌ $file: Div tags mismatch (Open: $OPEN_DIVS, Close: $CLOSE_DIVS)"
        ERRORS=$((ERRORS + 1))
    else
        echo "✓ $(basename "$file"): OK"
    fi
done

if [ $ERRORS -gt 0 ]; then
    echo ""
    echo "Errors found!"
    exit 1
else
    echo ""
    echo "All HTML files are valid!"
    exit 0
fi

