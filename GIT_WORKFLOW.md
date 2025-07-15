# Git Workflow Rules for Laravel CMS

## Overview
This document outlines the Git workflow rules for the Laravel 12 + React CMS Starter Kit project. These rules are designed for solo developers but follow industry best practices for maintainability and scalability.

## Branch Strategy

### Main Branches
- **`main`** - Production-ready code. Always stable and deployable.
- **`dev`** - Integration branch for features. Pre-production code.

### Feature Branches
- **`feature/`** - New features or enhancements
- **`bugfix/`** - Bug fixes for existing features
- **`hotfix/`** - Critical fixes that need immediate deployment to production

### Branch Naming Convention
```
feature/user-profile-image-upload
feature/role-permissions-enhancement
bugfix/user-deletion-validation
hotfix/security-patch-auth
```

## Workflow Process

### 1. Starting a New Feature
```bash
# Switch to dev branch
git checkout dev

# Pull latest changes
git pull origin dev

# Create new feature branch
git checkout -b feature/feature-name

# Start development...
```

### 2. Working on Feature
```bash
# Make commits with clear messages
git add .
git commit -m "feat: add user profile image upload functionality"

# Push to remote regularly
git push origin feature/feature-name
```

### 3. Completing a Feature
```bash
# Switch to dev and pull latest
git checkout dev
git pull origin dev

# Merge feature branch (use --no-ff for merge commit)
git merge --no-ff feature/feature-name

# Push to dev
git push origin dev

# Delete feature branch
git branch -d feature/feature-name
git push origin --delete feature/feature-name
```

### 4. Preparing for Production
```bash
# Switch to main and pull latest
git checkout main
git pull origin main

# Merge dev into main
git merge --no-ff dev

# Push to main
git push origin main
```

### 5. Hotfix Process
```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/security-patch-auth

# Make the fix
git add .
git commit -m "fix: resolve authentication vulnerability"

# Merge to main
git checkout main
git merge --no-ff hotfix/security-patch-auth
git push origin main

# Also merge to dev
git checkout dev
git merge --no-ff hotfix/security-patch-auth
git push origin dev

# Delete hotfix branch
git branch -d hotfix/security-patch-auth
git push origin --delete hotfix/security-patch-auth
```

## Commit Message Standards

### Format
```
<type>(<scope>): <description>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or modifying tests
- **chore**: Maintenance tasks

### Examples
```bash
feat(auth): add two-factor authentication
fix(users): resolve user deletion permission check
docs(readme): update installation instructions
style(components): format user management components
refactor(permissions): simplify role-based access control
test(auth): add login functionality tests
chore(deps): update Laravel to version 12.1
```

## Tagging Strategy

### Version Format
Use Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Tag Types
- **Release tags**: `v1.0.0`, `v1.1.0`, `v1.0.1`
- **Pre-release tags**: `v1.1.0-alpha`, `v1.1.0-beta`, `v1.1.0-rc1`

### Creating Tags
```bash
# Create annotated tag for releases
git tag -a v1.0.0 -m "Release version 1.0.0: Initial CMS release"

# Push tags to remote
git push origin v1.0.0

# Push all tags
git push origin --tags
```

### Tag Examples
```bash
v1.0.0    # Initial release
v1.1.0    # Added role management feature
v1.1.1    # Fixed user deletion bug
v1.2.0    # Added file upload functionality
v2.0.0    # Major refactor with breaking changes
```

## File Security Guidelines

### Image/File Upload Features
When implementing file upload features, always:

1. **Validate file types** using both extension and MIME type
2. **Limit file sizes** appropriately
3. **Sanitize file names** to prevent directory traversal
4. **Store files outside web root** when possible
5. **Use secure file naming** (UUIDs or hashes)
6. **Implement virus scanning** for production environments

### Security Commit Example
```bash
feat(uploads): add secure image upload for user profiles

- Add file type validation (jpg, png, gif only)
- Implement file size limits (2MB max)
- Store files outside public directory
- Generate secure filenames using UUIDs
- Add image optimization and resizing
- Include malware scanning integration

Security measures:
- Validate MIME types server-side
- Prevent directory traversal attacks
- Sanitize all user inputs
- Log all upload attempts
```

## Code Quality Standards

### Before Committing
- [ ] Run PHP tests: `php artisan test`
- [ ] Run frontend tests: `npm run test`
- [ ] Check code style: `php artisan pint`
- [ ] Verify TypeScript compilation: `npm run build`
- [ ] Review security implications
- [ ] Update documentation if needed

### Pre-commit Hook Example
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run PHP tests
php artisan test
if [ $? -ne 0 ]; then
    echo "PHP tests failed. Commit aborted."
    exit 1
fi

# Run frontend tests
npm run test
if [ $? -ne 0 ]; then
    echo "Frontend tests failed. Commit aborted."
    exit 1
fi

# Check PHP code style
php artisan pint --test
if [ $? -ne 0 ]; then
    echo "Code style check failed. Run 'php artisan pint' and try again."
    exit 1
fi
```

## Release Process

### 1. Prepare Release
```bash
# Ensure dev is up to date
git checkout dev
git pull origin dev

# Create release branch
git checkout -b release/v1.1.0

# Update version numbers in relevant files
# Update CHANGELOG.md
# Run final tests
```

### 2. Finalize Release
```bash
# Merge to main
git checkout main
git merge --no-ff release/v1.1.0

# Create tag
git tag -a v1.1.0 -m "Release v1.1.0: Add role management features"

# Push main and tags
git push origin main
git push origin v1.1.0

# Merge back to dev
git checkout dev
git merge --no-ff release/v1.1.0
git push origin dev

# Delete release branch
git branch -d release/v1.1.0
```

### 3. Post-Release
- Deploy to production
- Update documentation
- Create GitHub release with changelog
- Notify stakeholders

## Emergency Procedures

### Reverting a Release
```bash
# Revert to previous version
git revert -m 1 <merge-commit-hash>

# Or reset to previous tag
git reset --hard v1.0.0
git push origin main --force-with-lease
```

### Quick Hotfix
```bash
# For critical security issues
git checkout main
git checkout -b hotfix/critical-security-fix

# Make minimal changes
git commit -m "fix: resolve critical security vulnerability"

# Fast-track to production
git checkout main
git merge hotfix/critical-security-fix
git tag -a v1.0.1 -m "Hotfix v1.0.1: Critical security patch"
git push origin main
git push origin v1.0.1

# Deploy immediately
```

## Best Practices

### Do's
- Keep commits small and focused
- Write clear, descriptive commit messages
- Test thoroughly before merging
- Document breaking changes
- Tag releases consistently
- Backup before major changes

### Don'ts
- Don't commit directly to main
- Don't merge without testing
- Don't force push to main or dev
- Don't include sensitive data in commits
- Don't mix unrelated changes in one commit

## Tools and Automation

### Recommended Tools
- **Git hooks** for automated testing
- **GitHub Actions** for CI/CD
- **Dependabot** for dependency updates
- **CodeQL** for security scanning

### Useful Git Aliases
```bash
# Add to ~/.gitconfig
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = !gitk
    graph = log --graph --oneline --decorate --all
    cleanup = "!git branch --merged | grep -v '\\*\\|main\\|dev' | xargs -n 1 git branch -d"
```

## Troubleshooting

### Common Issues
1. **Merge conflicts**: Use `git mergetool` or resolve manually
2. **Accidental commits**: Use `git reset` or `git revert`
3. **Lost commits**: Use `git reflog` to recover
4. **Branch confusion**: Use `git branch -vv` to check tracking

### Recovery Commands
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Recover deleted branch
git checkout -b <branch-name> <commit-hash>
```

---

**Last Updated**: `date +%Y-%m-%d`
**Version**: 1.0.0
**Author**: Fadjar Irfan
**Project**: Dev Tools