# Usage Tracker

A lightweight, standalone Electron desktop application for tracking ZAI/GLM Coding Plan API usage.

## 🎯 Purpose

This application provides real-time monitoring of your API usage without requiring you to leave your development environment. It runs in the background as a system tray application, giving you at-a-glance visibility into your token consumption.

## ✨ Features

- **Real-Time Usage Display**: Live token usage updates every 30 seconds
- **System Tray Integration**: Color-coded status indicator (green/yellow/red)
- **Historical Tracking**: View usage trends and patterns over time
- **Usage Alerts**: Get notified before hitting rate limits
- **Desktop Notifications**: Cross-platform native notifications
- **Settings Management**: Configurable refresh intervals and alert thresholds

## 📁 Project Structure

```
Usage Tracker/
├── docs/                      # Documentation
│   ├── ZAI_API_DOCUMENTATION.md    # Complete API reference
│   └── IMPLEMENTATION_GUIDE.md    # Step-by-step build guide
├── prd/                       # Product Requirements
│   └── PRD.md                     # Full product specification
├── src/                       # Source code
│   ├── main/                    # Electron main process
│   │   ├── index.ts            # Main entry point
│   │   ├── api-service.ts      # ZAI API integration
│   │   ├── ipc-handlers.ts     # IPC communication
│   │   ├── store-service.ts    # Local storage service
│   │   └── tray-manager.ts     # System tray integration
│   ├── preload/                # Preload scripts
│   │   ├── index.ts            # Context bridge setup
│   │   └── dts.ts              # TypeScript definitions
│   └── renderer/               # React UI
│       ├── components/         # UI components
│       │   ├── UsageDisplay.tsx
│       │   ├── SettingsPanel.tsx
│       │   └── HistoryChart.tsx
│       ├── stores/             # Zustand stores
│       │   └── useUsageStore.ts
│       ├── hooks/              # Custom hooks
│       │   └── useUsageData.ts
│       ├── lib/                # Utilities
│       │   └── utils.ts
│       └── types/              # TypeScript types
│           └── index.ts
└── package.json               # Dependencies
```

## 🛠️ Development Status

| Component | Status | Notes |
|-----------|--------|-------|
| Documentation | ✅ Complete | API docs, implementation guide, PRD |
| Project Setup | ✅ Complete | Electron + React + TypeScript configured |
| Type Definitions | ✅ Complete | Full TypeScript types for API and app |
| API Integration | ✅ Complete | ZAI usage endpoint with error handling |
| State Management | ✅ Complete | Zustand store with persistence |
| UI Components | ✅ Complete | UsageDisplay, SettingsPanel, HistoryChart |
| System Tray | ✅ Complete | Tray icon with status color coding |
| IPC Communication | ✅ Complete | Main-renderer communication bridge |
| Local Storage | ✅ Complete | Settings and history persistence |
| Tailwind CSS | ✅ Complete | @tailwindcss/postcss configured |
| **Runtime Fix Needed** | 🔴 Blocked | Electron module injection issue (see below) |

## 🔧 Known Issue: Electron Module Injection

**Status**: The application builds successfully but fails at runtime.

**Problem**: When the app runs, `require('electron')` returns a stub string (path to electron.exe) instead of the Electron API object.

**Error**:
```
TypeError: Cannot read properties of undefined (reading 'requestSingleInstanceLock')
```

**Investigation**:
- Verified with simple test file - `require('electron')` returns `string` not `object`
- File encoding verified correct (hexdump shows 0x3F for `?`)
- Happens with Electron 7.1.14, 28.3.0, and 33.0.0
- Affects both dev and production builds

**Current Configuration**:
- electron-vite 2.3.0
- vite 5.4.11
- Electron 33.0.0
- Build target: node18
- Output: .cjs files

**Being Investigated**: Parallel agent is actively debugging this issue.

## 📖 Documentation

### [ZAI API Documentation](docs/ZAI_API_DOCUMENTATION.md)
Complete reference for the ZAI usage tracking API

### [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md)
Original step-by-step build guide

### [Product Requirements](prd/PRD.md)
Full product specification

## 🚀 Setup & Installation

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Package for Windows
npm run package
```

## 🔍 Background: How ZAI Usage Tracking Works

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

## 📄 License

MIT

## 🙏 Acknowledgments

Based on usage tracking functionality from the **Auto-Claude Marketing Hub** codebase.
