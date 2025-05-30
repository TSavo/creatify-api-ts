#!/bin/bash

# Test Artifacts Management Script
# Helps manage test videos and artifacts in the test-artifacts branch

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  preserve    - Run integration tests and preserve generated files"
    echo "  collect     - Collect existing test files to artifacts branch"
    echo "  switch      - Switch to test-artifacts branch"
    echo "  list        - List artifacts in test-artifacts branch"
    echo "  cleanup     - Clean up old artifacts (>30 days)"
    echo "  archive     - Archive artifacts by date"
    echo "  setup-lfs   - Set up Git LFS for large files"
    echo "  help        - Show this help message"
    echo
    echo "Examples:"
    echo "  $0 preserve     # Run tests and save artifacts"
    echo "  $0 collect      # Move existing test files to artifacts"
    echo "  $0 list         # Show all preserved artifacts"
}

# Function to run tests and preserve artifacts
preserve_artifacts() {
    print_status "Running integration tests with file preservation..."
    
    # Check if API credentials are set
    if [ -z "$CREATIFY_API_ID" ] || [ -z "$CREATIFY_API_KEY" ]; then
        print_error "API credentials not found. Please set CREATIFY_API_ID and CREATIFY_API_KEY"
        exit 1
    fi
    
    # Set preserve flag and run tests
    export PRESERVE_TEST_FILES=true
    npm run test:integration
    
    # Collect the preserved files
    collect_artifacts
}

# Function to collect artifacts
collect_artifacts() {
    print_status "Collecting test artifacts..."
    
    # Check if test output directory exists
    OUTPUT_DIR="tests/integration/output"
    if [ ! -d "$OUTPUT_DIR" ]; then
        print_warning "No test output directory found: $OUTPUT_DIR"
        return
    fi
    
    # Count files
    FILE_COUNT=$(find "$OUTPUT_DIR" -type f ! -name ".gitignore" | wc -l)
    if [ $FILE_COUNT -eq 0 ]; then
        print_warning "No test files found to collect"
        return
    fi
    
    print_status "Found $FILE_COUNT files to collect"
    
    # Store current branch
    CURRENT_BRANCH=$(git branch --show-current)
    
    # Switch to test-artifacts branch
    if git show-ref --verify --quiet refs/heads/test-artifacts; then
        git checkout test-artifacts
    else
        print_status "Creating test-artifacts branch..."
        git checkout -b test-artifacts
    fi
    
    # Ensure artifact directories exist
    mkdir -p test-artifacts/videos test-artifacts/audio test-artifacts/images test-artifacts/metadata
    
    # Copy files to appropriate directories
    find "$OUTPUT_DIR" -name "*.mp4" -exec cp {} test-artifacts/videos/ \; 2>/dev/null || true
    find "$OUTPUT_DIR" -name "*.mp3" -exec cp {} test-artifacts/audio/ \; 2>/dev/null || true
    find "$OUTPUT_DIR" -name "*.wav" -exec cp {} test-artifacts/audio/ \; 2>/dev/null || true
    find "$OUTPUT_DIR" -name "*.jpg" -exec cp {} test-artifacts/images/ \; 2>/dev/null || true
    find "$OUTPUT_DIR" -name "*.png" -exec cp {} test-artifacts/images/ \; 2>/dev/null || true
    find "$OUTPUT_DIR" -name "*-metadata.json" -exec cp {} test-artifacts/metadata/ \; 2>/dev/null || true
    
    # Count copied files
    VIDEO_COUNT=$(find test-artifacts/videos -name "*.mp4" | wc -l)
    AUDIO_COUNT=$(find test-artifacts/audio -name "*.mp3" -o -name "*.wav" | wc -l)
    IMAGE_COUNT=$(find test-artifacts/images -name "*.jpg" -o -name "*.png" | wc -l)
    METADATA_COUNT=$(find test-artifacts/metadata -name "*.json" | wc -l)
    
    print_success "Collected artifacts:"
    echo "  Videos: $VIDEO_COUNT"
    echo "  Audio: $AUDIO_COUNT"
    echo "  Images: $IMAGE_COUNT"
    echo "  Metadata: $METADATA_COUNT"
    
    # Add and commit
    git add test-artifacts/
    
    if git diff --staged --quiet; then
        print_warning "No new artifacts to commit"
    else
        COMMIT_MSG="Add test artifacts from $(date '+%Y-%m-%d %H:%M:%S')"
        git commit -m "$COMMIT_MSG"
        print_success "Committed new artifacts"
        
        # Ask if user wants to push
        read -p "Push artifacts to remote? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push origin test-artifacts
            print_success "Pushed artifacts to remote"
        fi
    fi
    
    # Switch back to original branch
    git checkout "$CURRENT_BRANCH"
    print_status "Switched back to $CURRENT_BRANCH"
}

# Function to list artifacts
list_artifacts() {
    print_status "Listing test artifacts..."
    
    # Store current branch
    CURRENT_BRANCH=$(git branch --show-current)
    
    # Switch to test-artifacts branch
    if git show-ref --verify --quiet refs/heads/test-artifacts; then
        git checkout test-artifacts
        
        echo
        echo "📹 Videos:"
        find test-artifacts/videos -name "*.mp4" -exec ls -lh {} \; 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
        
        echo
        echo "🎵 Audio:"
        find test-artifacts/audio -name "*.mp3" -o -name "*.wav" -exec ls -lh {} \; 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
        
        echo
        echo "🖼️  Images:"
        find test-artifacts/images -name "*.jpg" -o -name "*.png" -exec ls -lh {} \; 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
        
        echo
        echo "📊 Metadata:"
        find test-artifacts/metadata -name "*.json" -exec ls -lh {} \; 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
        
        # Calculate total size
        TOTAL_SIZE=$(du -sh test-artifacts/ 2>/dev/null | cut -f1)
        echo
        print_success "Total artifacts size: $TOTAL_SIZE"
        
        # Switch back
        git checkout "$CURRENT_BRANCH"
    else
        print_warning "test-artifacts branch does not exist"
    fi
}

# Function to setup Git LFS
setup_lfs() {
    print_status "Setting up Git LFS for test artifacts..."
    
    # Check if Git LFS is installed
    if ! command -v git-lfs &> /dev/null; then
        print_error "Git LFS is not installed. Please install it first:"
        echo "  macOS: brew install git-lfs"
        echo "  Ubuntu: sudo apt install git-lfs"
        exit 1
    fi
    
    # Initialize Git LFS
    git lfs install
    
    # Switch to test-artifacts branch
    CURRENT_BRANCH=$(git branch --show-current)
    if git show-ref --verify --quiet refs/heads/test-artifacts; then
        git checkout test-artifacts
    else
        git checkout -b test-artifacts
    fi
    
    # Track large files
    git lfs track "test-artifacts/videos/*.mp4"
    git lfs track "test-artifacts/audio/*.mp3"
    git lfs track "test-artifacts/audio/*.wav"
    git lfs track "test-artifacts/images/*.jpg"
    git lfs track "test-artifacts/images/*.png"
    
    # Commit LFS configuration
    git add .gitattributes
    git commit -m "Configure Git LFS for test artifacts"
    
    print_success "Git LFS configured for test artifacts"
    
    # Switch back
    git checkout "$CURRENT_BRANCH"
}

# Main script logic
case "${1:-help}" in
    preserve)
        preserve_artifacts
        ;;
    collect)
        collect_artifacts
        ;;
    switch)
        git checkout test-artifacts
        print_success "Switched to test-artifacts branch"
        ;;
    list)
        list_artifacts
        ;;
    setup-lfs)
        setup_lfs
        ;;
    help|*)
        show_usage
        ;;
esac
