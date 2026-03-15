#!/bin/bash
if command -v xdg-open &> /dev/null; then
    xdg-open OPEN_ME.html &
elif command -v open &> /dev/null; then
    open OPEN_ME.html &
else
    echo "Please open OPEN_ME.html in your browser"
fi
