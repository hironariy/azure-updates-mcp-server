#!/bin/bash
set -e

# Azure Updates MCP Server - Release Script
# Automates the release process: version bump, tag, and push

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

RELEASE_CURRENT=false

usage() {
    echo "Usage: bash scripts/release.sh [--current|--no-bump]"
    echo "  --current, --no-bump   Release the current package.json version without bumping it"
}

while [ $# -gt 0 ]; do
    case "$1" in
        --current|--no-bump)
            RELEASE_CURRENT=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo -e "${RED}Error: Unknown argument: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}Error: Must be on main branch to release${NC}"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}Error: Uncommitted changes detected. Please commit or stash them first.${NC}"
    exit 1
fi

# Pull latest changes
echo -e "${GREEN}📥 Pulling latest changes...${NC}"
git pull origin main

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}Current version: ${CURRENT_VERSION}${NC}"

# Guard: don't overwrite existing tag
if git rev-parse "v${CURRENT_VERSION}" >/dev/null 2>&1; then
    echo -e "${RED}Error: Tag v${CURRENT_VERSION} already exists. Aborting.${NC}"
    exit 1
fi

if [ "$RELEASE_CURRENT" = true ]; then
    NEW_VERSION="$CURRENT_VERSION"

    # Run tests
    echo -e "${GREEN}🧪 Running tests...${NC}"
    npm test

    # Build
    echo -e "${GREEN}🔨 Building...${NC}"
    npm run build

    # Create and push tag
    echo -e "${GREEN}🏷️  Creating tag v${NEW_VERSION}...${NC}"
    git tag "v${NEW_VERSION}"

    # Push changes and tag
    echo -e "${GREEN}🚀 Pushing to remote...${NC}"
    git push origin main
    git push origin "v${NEW_VERSION}"

    echo ""
    echo -e "${GREEN}✅ Release v${NEW_VERSION} created successfully!${NC}"
    echo -e "${YELLOW}📦 GitHub Actions will now build and publish the release.${NC}"
    echo -e "${YELLOW}🔗 Check progress at: https://github.com/juyamagu/azure-updates-mcp-server/actions${NC}"
    exit 0
fi

# Calculate version bumps manually to avoid npm version --dry-run side effects
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
NEXT_PATCH="${MAJOR}.${MINOR}.$((PATCH + 1))"
NEXT_MINOR="${MAJOR}.$((MINOR + 1)).0"
NEXT_MAJOR="$((MAJOR + 1)).0.0"

# Prompt for version bump type
echo ""
echo "Select version bump type:"
echo "  1) patch (${CURRENT_VERSION} -> ${NEXT_PATCH})"
echo "  2) minor (${CURRENT_VERSION} -> ${NEXT_MINOR})"
echo "  3) major (${CURRENT_VERSION} -> ${NEXT_MAJOR})"
echo ""
read -r -p "Enter choice (1-3): " choice

case $choice in
    1)
        VERSION_TYPE="patch"
        ;;
    2)
        VERSION_TYPE="minor"
        ;;
    3)
        VERSION_TYPE="major"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Bump version
echo -e "${GREEN}🔢 Bumping version...${NC}"
npm version "$VERSION_TYPE" --no-git-tag-version

NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}New version: ${NEW_VERSION}${NC}"

# Run tests
echo -e "${GREEN}🧪 Running tests...${NC}"
npm test

# Build
echo -e "${GREEN}🔨 Building...${NC}"
npm run build

# Commit version bump
echo -e "${GREEN}📝 Committing version bump...${NC}"
git add package.json package-lock.json
git commit -m "chore: bump version to ${NEW_VERSION}"

# Create and push tag
echo -e "${GREEN}🏷️  Creating tag v${NEW_VERSION}...${NC}"
git tag "v${NEW_VERSION}"

# Push changes and tag
echo -e "${GREEN}🚀 Pushing to remote...${NC}"
git push origin main
git push origin "v${NEW_VERSION}"

echo ""
echo -e "${GREEN}✅ Release v${NEW_VERSION} created successfully!${NC}"
echo -e "${YELLOW}📦 GitHub Actions will now build and publish the release.${NC}"
echo -e "${YELLOW}🔗 Check progress at: https://github.com/juyamagu/azure-updates-mcp-server/actions${NC}"
