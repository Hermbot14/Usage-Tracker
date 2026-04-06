# Z-AI Usage Tracker

> **Real-time API usage monitoring for ZAI/Claude - Never hit rate limits unexpectedly again**

[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)](README.md)
[![Electron](https://img.shields.io/badge/Electron-32.3.3-blue?style=flat-square)](https://www.electronjs.org/)

---

## 🎯 What Is This?

**Z-AI Usage Tracker** is a lightweight, standalone desktop application that monitors your ZAI/GLM Coding Plan API usage in real-time. It runs quietly in your system tray, giving you at-a-glance visibility into your token consumption with color-coded status indicators and Windows taskbar integration.

### Why This Exists

Developers using ZAI's API often hit rate limits unexpectedly because:
- Usage information is hidden behind CLI commands or web dashboards
- No proactive alerts before hitting limits
- Context switching to check usage interrupts your flow

This app solves that by providing **always-visible usage monitoring** without leaving your development environment.

---

## ✨ Features

### Core Features
- **Real-Time Monitoring** - Live usage updates every 30 seconds
- **System Tray Integration** - Color-coded status (🟢 Green < 50% | 🟡 Yellow 50-79% | 🔴 Red ≥ 80%)
- **Windows Taskbar Overlay** - Percentage badge showing current usage level
- **Multi-Theme Support** - 7 color themes × light/dark modes = 14 combinations
- **Usage Alerts** - Desktop notifications when approaching rate limits
- **Settings Management** - Configurable refresh intervals and alert thresholds
- **Multi-Account Support** - Track multiple API profiles simultaneously

### Visual Design
- Circular progress indicators
- Gradient progress bars
- Card-based responsive layout
- WCAG AA accessibility compliance
- Keyboard navigation support

---

## 📁 Project Structure

```
zai-usage-tracker/
├── docs/                      # Documentation
│   ├── ZAI_API_DOCUMENTATION.md    # Complete API reference
│   └── IMPLEMENTATION_GUIDE.md     # Step-by-step build guide
├── prd/                       # Product Requirements
│   └── PRD.md
├── src/                       # Source code
│   ├── main/                  # Electron main process
│   │   ├── index.ts           # Main entry point
│   │   ├── api-service.ts     # ZAI API integration
│   │   ├── ipc-handlers.ts    # IPC communication
│   │   ├── store-service.ts   # Local storage (electron-store)
│   │   └── tray-manager.ts    # System tray & taskbar
│   ├── preload/               # Preload scripts
│   │   ├── index.ts           # Context bridge setup
│   │   └── dts.ts             # TypeScript definitions
│   └── renderer/              # React UI
│       ├── components/        # UI components
│       │   ├── UsageDisplay.tsx
│       │   ├── SettingsPanel.tsx
│       │   ├── HistoryChart.tsx
│       │   └── ui/            # Reusable components
│       ├── stores/            # Zustand state management
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # Utilities
│       └── types/             # TypeScript types
├── scripts/                   # Build and dev scripts
├── package.json               # Dependencies
├── electron-builder.json      # Packaging config
└── electron.vite.config.ts    # Vite bundler config
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (recommended: 20+)
- npm or bun package manager
- ZAI API access (API key or OAuth)

### Installation

```bash
# Clone the repository
git clone https://github.com/Hermbot14/Usage-Tracker.git
cd Usage-Tracker

# Install dependencies
npm install

# Start development mode
npm run dev
```

### Development Commands

```bash
# Development mode (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Package for Windows
npm run package

# Launch packaged app
npm run launch
```

---

## 📦 Packaged Application

After running `npm run package`, you'll find:

| File | Location | Description |
|------|----------|-------------|
| **Portable .exe** | `dist/win-unpacked/Usage Tracker.exe` | No installation required |
| **NSIS Installer** | `dist/Usage Tracker-1.0.0-x64.exe` | Full installer with shortcuts |

**Packaged Features:**
- Shows "Usage Tracker" in Windows taskbar (not "Electron")
- Taskbar overlay displays percentage (e.g., "45%")
- System tray tooltip with usage details
- Desktop shortcut creation
- Start menu integration

---

## 🎨 Available Themes

| Theme | Description |
|-------|-------------|
| **Default** | Warm neutral tones |
| **Dusk** | Purple/magenta palette |
| **Lime** | Bright green/yellow |
| **Ocean** | Blue/teal gradients |
| **Retro** | Vintage warm colors |
| **Neo** | Modern cool tones |
| **Forest** | Natural green shades |

Each theme supports **light** and **dark** mode variants (14 total combinations).

---

## 🔧 Configuration

### Settings Panel

Access via the system tray menu → Settings:

| Setting | Default | Description |
|---------|---------|-------------|
| **Refresh Interval** | 30s | How often to check API usage |
| **Alert Threshold** | 80% | When to show notifications |
| **Theme** | Default | Color theme selection |
| **Mode** | System | Light / Dark / System |

### Environment Variables (Optional)

Create a `.env` file in the project root for development:

```bash
# Optional: Default API profile
DEFAULT_API_KEY=your-api-key-here

# Optional: Custom refresh interval (ms)
USAGE_CHECK_INTERVAL=30000
```

**Note:** API keys are stored securely in the system keychain, not in `.env` files.

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | Electron 32.3.3 | Cross-platform desktop |
| **Frontend** | React 19 + TypeScript | Component UI with type safety |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **State** | Zustand 5 | Lightweight state management |
| **Build** | Vite 5 + electron-vite | Fast bundling |
| **Storage** | electron-store | Persistent settings |
| **Packaging** | electron-builder | Multi-platform builds |

---

## 📋 Development Status

| Component | Status | Notes |
|-----------|--------|-------|
| Documentation | ✅ Complete | API docs, implementation guide |
| Project Setup | ✅ Complete | Electron + React + TypeScript |
| Type Definitions | ✅ Complete | Full TypeScript coverage |
| API Integration | ✅ Complete | ZAI usage endpoint |
| State Management | ✅ Complete | Zustand with persistence |
| UI Components | ✅ Complete | All core components built |
| System Tray | ✅ Complete | Color-coded status |
| Taskbar Overlay | ✅ Complete | Percentage badge rendering |
| IPC Communication | ✅ Complete | Main-renderer bridge |
| Local Storage | ✅ Complete | Settings persistence |
| Multi-Theme | ✅ Complete | 14 theme combinations |
| Windows Packaging | ✅ Complete | Portable + installer |
| Accessibility | ✅ Complete | WCAG AA compliance |

---

## 🔍 How It Works

### API Endpoint

The app monitors usage via ZAI's quota endpoint:

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

### Monitoring Loop

1. App starts → loads saved API profile
2. Fetches usage from ZAI API every 30 seconds
3. Updates system tray icon color based on usage %
4. Updates taskbar overlay badge with percentage
5. Shows notification if usage exceeds threshold

---

## 🪟 Windows Taskbar Integration

The app provides native Windows taskbar integration:

- **App Name**: Shows "Usage Tracker" (not "Electron")
- **Overlay Icon**: Percentage badge with color coding
  - 🟢 Green: < 50% usage
  - 🟡 Yellow: 50-79% usage
  - 🔴 Red: ≥ 80% usage
- **Window Title**: Updates with percentage and reset time
- **Tooltip**: Detailed usage info on hover

---

## 📄 API Documentation

For detailed API documentation, see:
- [ZAI_API_DOCUMENTATION.md](docs/ZAI_API_DOCUMENTATION.md) - Complete API reference
- [IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md) - Build guide

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute
- 🐛 Report bugs via GitHub Issues
- ✨ Suggest new features
- 📝 Improve documentation
- 💻 Submit pull requests

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to your fork (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Changelog

### Version 1.0.0
- ✅ Fixed Electron runtime issues
- ✅ Implemented multi-theme support (14 combinations)
- ✅ Added Windows taskbar overlay with percentage display
- ✅ Created reusable UI component library
- ✅ WCAG AA accessibility compliance
- ✅ Windows packaging with proper app name

See [CHANGELOG.md](CHANGELOG.md) for full version history.

---

## 🙏 Acknowledgments

- Based on usage tracking patterns from the **Auto-Claude Marketing Hub** codebase
- Design system inspired by **Oscura** and modern design patterns
- Built with ❤️ using Electron, React, and Tailwind CSS

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Repository**: [github.com/Hermbot14/Usage-Tracker](https://github.com/Hermbot14/Usage-Tracker)
- **Issues**: [Report a bug](https://github.com/Hermbot14/Usage-Tracker/issues)
- **Discussions**: [Community forum](https://github.com/Hermbot14/Usage-Tracker/discussions)

---

**Built for developers, by developers** 🚀
