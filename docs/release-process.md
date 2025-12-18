# Release Process

This document describes how to create a new release of the Azure Updates MCP Server.

## Prerequisites

- You must be on the `main` branch
- All changes must be committed
- All tests must pass
- You must have push access to the repository

## Automated Release (Recommended)

Use the release script to automate the entire process:

```bash
bash scripts/release.sh
```

If the version is already set in `package.json` (e.g., you want to release the current version without bumping), use:

```bash
bash scripts/release.sh --current
```

The script will:
1. Verify you're on the main branch with no uncommitted changes
2. Pull the latest changes

Default mode (`bash scripts/release.sh`):
3. Prompt you to select a version bump type (patch/minor/major)
4. Run tests and build the project
5. Update `package.json` with the new version
6. Create a git commit and tag
7. Push the commit and tag to GitHub
8. Trigger the GitHub Actions workflow to build and publish the release

No-bump mode (`bash scripts/release.sh --current`):
3. Run tests and build the project
4. Create a git tag for the current `package.json` version
5. Push the tag to GitHub
6. Trigger the GitHub Actions workflow to build and publish the release

## Manual Release

If you prefer to release manually:

### 1. Update Version

Choose the appropriate version bump:

```bash
# Patch release (1.2.0 -> 1.2.1) - Bug fixes
npm version patch --no-git-tag-version

# Minor release (1.2.0 -> 1.3.0) - New features
npm version minor --no-git-tag-version

# Major release (1.2.0 -> 2.0.0) - Breaking changes
npm version major --no-git-tag-version

# Custom version
npm version 1.3.0 --no-git-tag-version
```

### 2. Run Tests and Build

```bash
npm test
npm run build
```

### 3. Commit and Tag

```bash
git add package.json package-lock.json
git commit -m "chore: bump version to X.Y.Z"
git tag vX.Y.Z
```

### 4. Push to GitHub

```bash
git push origin main
git push origin vX.Y.Z
```

This will trigger the GitHub Actions workflow that:
- Builds the project
- Runs tests
- Creates a `.tgz` package
- Creates a GitHub Release with the package attached

## Post-Release

1. Verify the GitHub Actions workflow completed successfully:
   - Visit: https://github.com/juyamagu/azure-updates-mcp-server/actions
   
2. Check the new release:
   - Visit: https://github.com/juyamagu/azure-updates-mcp-server/releases
   
3. Verify the `.tgz` file is attached to the release

4. Update documentation if needed (especially if there are breaking changes)

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version: Incompatible API changes
- **MINOR** version: Add functionality in a backward compatible manner
- **PATCH** version: Backward compatible bug fixes

## Rollback

If you need to rollback a release:

1. Delete the tag locally and remotely:
   ```bash
   git tag -d vX.Y.Z
   git push origin :refs/tags/vX.Y.Z
   ```

2. Delete the release on GitHub:
   - Go to Releases page
   - Click on the release
   - Click "Delete this release"

3. Revert the version commit:
   ```bash
   git revert HEAD
   git push origin main
   ```
