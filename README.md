# Usage Tracker

A lightweight, standalone Electron desktop application for tracking ZAI/GLM Coding Plan API usage.

## 🎯 Purpose

This application provides real-time monitoring of your API usage without requiring you to leave your development environment. It runs in the background as a system tray application, giving you at-a-glance visibility into your token consumption.

## ✨ Features

- **Real-Time Usage Display**: Live token usage updates every 30 seconds
- **System Tray Integration**: Color-coded status indicator (green/yellow/red)
- **Multi-Account Support**: Track multiple API accounts simultaneously
- **Historical Tracking**: View usage trends and patterns over time
- **Usage Alerts**: Get notified before hitting rate limits
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 📁 Project Structure

```
Usage Tracker/
├── docs/                      # Documentation
│   ├── ZAI_API_DOCUMENTATION.md    # Complete API reference
│   └── IMPLEMENTATION_GUIDE.md    # Step-by-step build guide
├── prd/                       # Product Requirements
│   └── PRD.md                     # Full product specification
├── src/                       # Source code (to be implemented)
│   ├── main/                    # Electron main process
│   ├── preload/                 # Preload scripts
│   └── renderer/                # React UI
└── package.json               # Dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation (Coming Soon)

```bash
# Clone the repository
git clone https://github.com/yourusername/usage-tracker.git
cd usage-tracker

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Package for distribution
npm run package
```

## 📖 Documentation

### [ZAI API Documentation](docs/ZAI_API_DOCUMENTATION.md)
Complete reference for the ZAI usage tracking API, including:
- API endpoints
- Authentication methods
- Request/response formats
- Error handling
- Rate limits and caching

### [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md)
Step-by-step guide for building the app:
- Tech stack recommendations
- Project structure
- Core modules
- Code examples
- Testing strategy
- Building & packaging

### [Product Requirements](prd/PRD.md)
Full product specification including:
- Problem statement
- Solution overview
- Key features
- Technical requirements
- Success metrics

## 🔍 Background: How ZAI Usage Tracking Works

This project was extracted from the **Auto-Claude Marketing Hub** codebase analysis. The original implementation includes:

### API Endpoint
```
GET https://api.z.ai/api/monitor/usage/quota/limit
Authorization: Bearer {token}
```

### Response Format
```json
{
  "data": {
    "limits": [
      {
        "type": "TOKENS_LIMIT",
        "percentage": 72.5,
        "currentValue": 362500,
        "usage": 500000,
        "nextResetTime": 1738612800000
      }
    ]
  }
}
```

### Key Components from Original Codebase

1. **Usage Monitor Service** (`apps/frontend/src/main/claude-profile/usage-monitor.ts`)
   - Fetches usage every 30 seconds
   - Handles ZAI-specific response format
   - Manages cooldown and error handling

2. **Usage Indicator Component** (`apps/frontend/src/renderer/components/UsageIndicator.tsx`)
   - Real-time usage display with progress bars
   - Profile switching interface
   - Color-coded status indicators

3. **Rate Limit Store** (`apps/frontend/src/main/stores/rate-limit-store.ts`)
   - Zustand store for usage state
   - IPC communication between main and renderer processes

## 🎨 UI Preview (Planned)

```
System Tray (Windows)
┌─────────┐
│  🔴 95% │  ← Color-coded by usage level
└─────────┘

Main Window
┌─────────────────────────────────────────────┐
│ Usage Tracker                      [_] [□] [×] │
├─────────────────────────────────────────────┤
│ ZAI Account - Primary                           │
│                                                  │
│ Session Usage (5 Hours)    Weekly (Monthly)    │
│ ┌─────────────────────┐   ┌──────────────────┐ │
│ │ ████████████░░░ 72% │   │ ██████░░░░ 60%  │ │
│ └─────────────────────┘   └──────────────────┘ │
│                                                  │
│ 360K / 500K tokens                             │
│ Reset in: 2h 15m                                │
└─────────────────────────────────────────────┘
```

## 🛠️ Development Status

| Component | Status | Notes |
|-----------|--------|-------|
| Documentation | ✅ Complete | API docs, implementation guide, PRD |
| Project Setup | ⏳ Pending | Initialize Electron + React |
| API Integration | ⏳ Pending | ZAI usage endpoint |
| UI Components | ⏳ Pending | Usage display, settings |
| System Tray | ⏳ Pending | Tray icon, tooltip, menu |
| Testing | ⏳ Pending | Unit tests, E2E tests |
| Packaging | ⏳ Pending | electron-builder config |

## 🤝 Contributing

This project is currently in the planning/exploration phase. Contributions are welcome once development begins.

## 📄 License

TBD - License to be determined before first release.

## 🙏 Acknowledgments

This project is based on usage tracking functionality discovered in the **Auto-Claude Marketing Hub** codebase:
- Original `usage-monitor.ts` by Auto-Claude team
- ZAI API integration patterns
- Electron + React best practices

---

**Note**: This is a research and planning phase. The application is not yet built or functional.
