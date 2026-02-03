#!/bin/bash

# Script to create a completely clean repository with only feedback-insights
# This removes all history and creates a fresh start

set -e

CLEAN_DIR="$HOME/cloudflare-feedback-clean"
SOURCE_DIR="/Users/user/Cloudflare_Project_Manager_assignment/feedback-insights"

echo "Creating clean repository directory..."
rm -rf "$CLEAN_DIR"
mkdir -p "$CLEAN_DIR"
cd "$CLEAN_DIR"

echo "Copying files from feedback-insights..."
cp -r "$SOURCE_DIR"/* .
cp "$SOURCE_DIR"/.gitignore . 2>/dev/null || true
cp -r "$SOURCE_DIR"/.github . 2>/dev/null || true

echo "Removing helper/documentation files..."
rm -f GITHUB_PUSH_INSTRUCTIONS.md PUSH_TO_GITHUB.md push-to-github.sh setup-clean-repo.sh CLEAN_REPO_SETUP.md COMPILE_PDF.md fix-git-push.sh QUICK_FIX.md REMOVE_OTHER_PROJECTS.md REMOVE_FROM_HISTORY.md REMOVE_FROM_HISTORY_COMPLETE.md CLEANUP_COMMANDS.md 2>/dev/null || true

echo "Removing build artifacts..."
rm -rf node_modules .wrangler dist

echo "Initializing fresh git repository..."
git init
git add -A
git commit -m "Initial commit: Feedback Insights prototype for Cloudflare PM assignment

- Built with Cloudflare Workers, D1, and Workers AI
- Implements feedback aggregation and analysis dashboard
- Includes mock data ingestion and AI-powered theme extraction
- Uses Llama 3 8B Instruct model for sentiment analysis
- Complete submission documents (LaTeX and Markdown)
- Dashboard screenshot included"

echo ""
echo "=========================================="
echo "Clean repository created at: $CLEAN_DIR"
echo "=========================================="
echo ""
echo "To push to GitHub (this will overwrite the existing repo):"
echo "  cd $CLEAN_DIR"
echo "  git remote add origin https://github.com/Web8080/Cloudflare-product-feedback-analyzer.git"
echo "  git branch -M main"
echo "  git push -u origin main --force"
echo ""
echo "WARNING: --force will completely overwrite the GitHub repository!"
echo "This will remove all history including Recruitment_CRM_ATS"
echo ""
