# Usage Tracker

A lightweight, standalone Electron desktop application for tracking ZAI/GLM Coding Plan API usage with modern UI themes and Windows taskbar integration.

## 🎯 Purpose

This application provides real-time monitoring of your API usage without requiring you to leave your development environment. It runs in the background as a system tray application, giving you at-a-glance visibility into your token consumption via Windows taskbar overlays.

## ✨ Features

- **Real-Time Usage Display**: Live token usage updates every 30 seconds
- **System Tray Integration**: Color-coded status indicator (green/yellow/red)
- **Windows Taskbar Overlay**: Percentage badge showing current usage level
- **Multi-Theme Support**: 7 color themes (default, dusk, lime, ocean, retro, neo, forest) × light/dark modes
- **Usage Alerts**: Get notified before hitting rate limits
- **Desktop Notifications**: Cross-platform native notifications
- **Settings Management**: Configurable refresh intervals and alert thresholds
- **Modern UI Components**: Circular progress indicators, gradient progress bars, card-based layout

## 📁 Project Structure

```
Usage Tracker/
├── docs/                      # Documentation
│   ├── ZAI_API_DOCUMENTATION.md    # Complete API reference
│   └── IMPLEMENTATION_GUIDE.md    # Step-by-step build guide
├── development/               # Active development
│   └── active/                   # PRD tracking
├── src/                       # Source code
│   ├── main/                    # Electron main process
│   │   ├── index.ts            # Main entry point
│   │   ├── api-service.ts      # ZAI API integration
│   │   ├── ipc-handlers.ts     # IPC communication
│   │   ├── store-service.ts    # Local storage service
│   │   └── tray-manager.ts     # System tray & taskbar overlay
│   ├── preload/                # Preload scripts
│   │   ├── index.ts            # Context bridge setup
│   │   └── dts.ts              # TypeScript definitions
│   └── renderer/               # React UI
│       ├── components/         # UI components
│       │   ├── UsageDisplay.tsx      # Usage display with progress circles
│       │   ├── SettingsPanel.tsx     # Settings modal
│       │   └── ui/                   # Reusable UI components
│       │       ├── Card.tsx
│       │       ├── Button.tsx
│       │       ├── Badge.tsx
│       │       ├── ProgressCircle.tsx
│       │       └── ThemeSelector.tsx
│       ├── stores/             # Zustand stores
│       │   └── useUsageStore.ts
│       ├── lib/                # Utilities
│       │   └── utils.ts
│       └── types/              # TypeScript types
│           └── index.ts
├── package.json               # Dependencies
└── electron-builder.json     # Packaging configuration
```

## 🛠️ Development Status

| Component | Status | Notes |
|-----------|--------|-------|
| Documentation | ✅ Complete | API docs, implementation guide |
| Project Setup | ✅ Complete | Electron + React + TypeScript configured |
| Type Definitions | ✅ Complete | Full TypeScript types for API and app |
| API Integration | ✅ Complete | ZAI usage endpoint with error handling |
| State Management | ✅ Complete | Zustand store with persistence |
| UI Components | ✅ Complete | UsageDisplay, SettingsPanel, ProgressCircle, ThemeSelector |
| System Tray | ✅ Complete | Tray icon with status color coding |
| Taskbar Overlay | ✅ Complete | Percentage badge with bitmap font rendering |
| IPC Communication | ✅ Complete | Main-renderer communication bridge |
| Local Storage | ✅ Complete | Settings and history persistence |
| Multi-Theme System | ✅ Complete | 7 themes × 2 variants = 14 combinations |
| Windows Packaging | ✅ Complete | Portable .exe and NSIS installer |
| Accessibility | ✅ Complete | WCAG AA compliance, keyboard navigation |

## 🎨 Themes

Available color themes:
- **Default** - Warm neutral tones
- **Dusk** - Purple/magenta palette
- **Lime** - Bright green/yellow
- **Ocean** - Blue/teal gradients
- **Retro** - Vintage warm colors
- **Neo** - Modern cool tones
- **Forest** - Natural green shades

Each theme supports light and dark mode variants.

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

## 📦 Packaged Application

The packaged application is available at:
- **Portable .exe**: `dist/win-unpacked/Usage Tracker.exe`
- **NSIS Installer**: `dist/Usage Tracker-1.0.0-x64.exe`

**Features in packaged app:**
- Shows "Usage Tracker" in Windows taskbar (not "Electron")
- Taskbar overlay displays percentage number (e.g., "45%")
- System tray tooltip shows usage details and reset time
- Desktop shortcut creation
- Start menu integration

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

## 🎯 Windows Taskbar Integration

The application features advanced Windows taskbar integration:

- **App Name**: Shows "Usage Tracker" instead of "Electron"
- **Overlay Icon**: Displays current usage percentage as a colored badge with white text
  - Green: < 50% usage
  - Yellow: 50-79% usage
  - Red: 80%+ usage
- **Window Title**: Updates dynamically with percentage and reset time
- **Tooltip**: Shows detailed usage information on hover

## 🎨 Visual Design System

The app uses a custom CSS variable-based design system with:
- 14 theme combinations (7 themes × 2 variants)
- CSS custom properties for colors, spacing, shadows
- Reusable UI components (Card, Button, Badge, ProgressCircle)
- Smooth animations with GPU acceleration
- WCAG AA accessibility compliance

## 📄 License

MIT

## 🙏 Acknowledgments

Based on usage tracking functionality from the **Auto-Claude Marketing Hub** codebase.
Design system inspired by **Oscura** and modern design patterns.

## 📝 Recent Updates

### Version 1.0.0
- ✅ Fixed Electron runtime issues
- ✅ Implemented multi-theme support (14 theme combinations)
- ✅ Added Windows taskbar overlay with percentage display
- ✅ Created reusable UI component library
- ✅ WCAG AA accessibility compliance
- ✅ Windows packaging with proper app name display
