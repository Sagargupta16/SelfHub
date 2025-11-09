# GitHub Actions Guide

This repository includes automated CI/CD workflows using GitHub Actions.

## Workflows

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` branch

**Jobs:**

#### Build and Test

- Runs on Node.js 18.x and 20.x
- Installs dependencies with pnpm
- Runs type checking (`pnpm typecheck`)
- Builds the project (`pnpm build`)
- Verifies build output
- Uploads build artifacts (for Node 20.x only)

#### Release

- Only runs on push to `main` branch
- Creates a tarball of the built server
- Uploads as release artifact (kept for 30 days)

#### Code Quality

- Checks code formatting
- Runs security audit on production dependencies

**Status Badge:**

```markdown
[![CI/CD](https://github.com/Sagargupta16/SelfHub/actions/workflows/ci.yml/badge.svg)](https://github.com/Sagargupta16/SelfHub/actions/workflows/ci.yml)
```

### 2. Release Workflow (`release.yml`)

**Triggers:**

- Push of version tags (e.g., `v1.0.0`, `v0.1.0`)

**What it does:**

1. Builds the project
2. Creates distribution packages (`.tar.gz` and `.zip`)
3. Generates release notes automatically
4. Creates a GitHub Release with downloadable assets

**How to create a release:**

```bash
# Make sure you're on main and everything is committed
git checkout main
git pull

# Create and push a version tag
git tag v0.1.0
git push origin v0.1.0
```

This will trigger the release workflow and create a new GitHub Release.

### 3. Dependabot (`dependabot.yml`)

**What it does:**

- Automatically checks for dependency updates weekly
- Creates pull requests for npm package updates
- Updates GitHub Actions to latest versions
- Labels PRs as `dependencies` or `github-actions`

**Managing Dependabot PRs:**

- Review the PR
- Check the CI status
- Merge if all tests pass

## Setting Up

### First Time Setup

1. **Push your code to GitHub:**

```bash
git add .
git commit -m "Add GitHub Actions workflows"
git push origin main
```

2. **Verify workflows:**

- Go to your repository on GitHub
- Click the "Actions" tab
- You should see the CI/CD workflow running

### Permissions

The workflows use default GitHub Actions permissions. No additional setup needed unless you want to:

- Enable auto-merge for Dependabot PRs
- Add deployment secrets
- Configure additional integrations

### Adding Status Badges to README

Add these to your README.md:

```markdown
[![CI/CD](https://github.com/Sagargupta16/SelfHub/actions/workflows/ci.yml/badge.svg)](https://github.com/Sagargupta16/SelfHub/actions/workflows/ci.yml)
[![Release](https://github.com/Sagargupta16/SelfHub/actions/workflows/release.yml/badge.svg)](https://github.com/Sagargupta16/SelfHub/actions/workflows/release.yml)
```

## Workflow Customization

### Running tests (when you add them)

Edit `.github/workflows/ci.yml` and add:

```yaml
- name: Run tests
  run: pnpm test
```

### Adding linting

```yaml
- name: Lint code
  run: pnpm lint
```

### Changing Node.js versions

Edit the matrix in `ci.yml`:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 21.x] # Add or remove versions
```

## Release Process

### Manual Release

1. **Update version in package.json:**

```bash
# For patch version (0.1.0 -> 0.1.1)
npm version patch

# For minor version (0.1.0 -> 0.2.0)
npm version minor

# For major version (0.1.0 -> 1.0.0)
npm version major
```

2. **Push the tag:**

```bash
git push origin main
git push origin --tags
```

3. **Check the release:**

- Go to GitHub Actions tab
- Watch the release workflow
- Check the Releases page for the new release

### Automated Release (Future Enhancement)

You can add semantic-release to automate versioning:

```bash
pnpm add -D semantic-release @semantic-release/git @semantic-release/changelog
```

## Troubleshooting

### Workflow fails on type check

```bash
# Run locally first
pnpm typecheck

# Fix any errors, then commit and push
```

### Build artifacts not uploading

- Check Actions permissions in repository settings
- Verify the `build/` directory exists after build

### Release not creating

- Ensure you pushed a tag (not just a version in package.json)
- Tag must start with 'v' (e.g., v0.1.0)
- Check Actions tab for error messages

## Best Practices

1. **Always test locally before pushing:**

```bash
pnpm typecheck
pnpm build
```

2. **Use pull requests for major changes:**

- Create a branch
- Make changes
- Open PR to trigger CI checks
- Merge after passing

3. **Version tags:**

- Use semantic versioning (v1.2.3)
- Add release notes in the GitHub UI if needed
- Link to issues or PRs in release notes

4. **Monitor Actions:**

- Check the Actions tab regularly
- Fix failing workflows quickly
- Review Dependabot PRs weekly

## Artifacts

### Build Artifacts (7 days retention)

- Downloadable from Actions runs
- Contains compiled `build/` directory
- Useful for testing without rebuilding

### Release Packages (30 days retention)

- Available on each push to main
- Full package ready for distribution
- Includes all necessary files

## Future Enhancements

Consider adding:

- [ ] Automated testing with coverage reports
- [ ] Code coverage badges
- [ ] Automated changelog generation
- [ ] Docker image builds
- [ ] NPM package publishing
- [ ] Deployment to hosting service
- [ ] Performance benchmarks

## Support

If workflows fail:

1. Check the workflow run logs on GitHub
2. Run the same commands locally
3. Review recent changes
4. Open an issue with the error details
