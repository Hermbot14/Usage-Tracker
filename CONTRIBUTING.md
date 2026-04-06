# Contributing to Z-AI Usage Tracker

First off, thank you for considering contributing to Z-AI Usage Tracker! It's people like you that make this project better for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

**Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g., Windows 11, macOS 14, Ubuntu 22.04]
- Node version: [e.g., 20.10.0]
- App version: [e.g., 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Features

Feature suggestions are always welcome! Please create an issue with the following template:

**Template:**

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Pull Requests

Before submitting a pull request:

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Ensure your code passes linting**

**PR Checklist:**

```markdown
- [ ] My code follows the project's coding standards
- [ ] I have tested my changes manually
- [ ] I have updated the documentation accordingly
- [ ] My changes do not break existing functionality
- [ ] I have read the CONTRIBUTING.md file
```

---

## Development Setup

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or bun
- Git

### Setup Steps

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/Usage-Tracker.git
cd Usage-Tracker

# 2. Install dependencies
npm install

# 3. Start development mode
npm run dev

# 4. Make your changes and test
# The app will auto-reload on changes

# 5. Build for production
npm run build
```

### Running Tests

```bash
# Run unit tests (when available)
npm test

# Run E2E tests (when available)
npm run test:e2e

# Run linting
npm run lint
```

---

## Coding Standards

### TypeScript/React

This project uses TypeScript for type safety. Follow these guidelines:

**Naming Conventions:**
- Components: PascalCase (`UsageDisplay`, `SettingsPanel`)
- Functions/variables: camelCase (`fetchUsage`, `currentUsage`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`, `REFRESH_INTERVAL`)
- Types/Interfaces: PascalCase with descriptive names (`UsageSnapshot`, `ProfileConfig`)

**Code Style:**
- 2 spaces for indentation
- Single quotes for strings
- No semicolons (except when required)
- Max line length: 100 characters
- Explicit return types on functions

**Example:**

```typescript
// ✅ Good
interface UsageSnapshot {
  sessionPercent: number
  weeklyPercent: number
  fetchedAt: Date
}

const fetchUsage = async (apiKey: string): Promise<UsageSnapshot | null> => {
  // Implementation
}

// ❌ Avoid
const fetch_usage = async (apiKey: string) => {
  // No explicit return type
}
```

### File Organization

```
src/
├── main/           # Electron main process
├── preload/        # Preload scripts (context bridge)
└── renderer/       # React UI
    ├── components/ # React components
    │   ├── ui/     # Reusable UI components
    │   └── ...     # Feature components
    ├── stores/     # Zustand stores
    ├── hooks/      # Custom hooks
    ├── lib/        # Utilities
    └── types/      # TypeScript types
```

### Component Structure

```typescript
import React from 'react'
import { useUsageStore } from '../stores/useUsageStore'

interface UsageDisplayProps {
  className?: string
}

export const UsageDisplay: React.FC<UsageDisplayProps> = ({ className = '' }) => {
  const { sessionPercent, weeklyPercent } = useUsageStore()

  return (
    <div className={className}>
      {/* Component JSX */}
    </div>
  )
}
```

---

## Commit Guidelines

### Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style changes (formatting) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
feat(taskbar): add percentage overlay to Windows taskbar

# Bug fix
fix(api): handle 401 errors with proper token refresh

# Documentation
docs(readme): add installation instructions

# Refactor
refactor(store): migrate from Context to Zustand

# Breaking change
feat(auth): replace API key auth with OAuth

BREAKING CHANGE: API key configuration is no longer supported.
```

### Commit Best Practices

1. **Keep commits atomic** - One logical change per commit
2. **Write clear subjects** - 50 characters or less
3. **Use imperative mood** - "Add feature" not "Added feature"
4. **No period at the end** - It's a title, not a sentence
5. **Reference issues** - Add `#123` in body or footer

---

## Architecture Decisions

### State Management

We use **Zustand** for state management because:
- Minimal boilerplate
- TypeScript-friendly
- Built-in persistence
- No provider wrapping needed

### Styling

We use **Tailwind CSS** because:
- Utility-first approach
- Consistent design tokens
- Small bundle size with PurgeCSS
- Easy to maintain

### IPC Communication

Electron's IPC is used for main-renderer communication:
- All API calls happen in main process
- Renderer requests data via IPC
- Sensitive data (API keys) never exposed to renderer

---

## Questions?

If you have questions or need help, please:

1. Check existing [documentation](docs/)
2. Search existing [issues](https://github.com/Hermbot14/Usage-Tracker/issues)
3. Create a new [discussion](https://github.com/Hermbot14/Usage-Tracker/discussions)

---

## Thank You!

Every contribution, no matter how small, makes this project better. Whether it's reporting a bug, suggesting a feature, or submitting a pull request - your help is appreciated! 🎉
