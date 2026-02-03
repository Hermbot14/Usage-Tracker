# Product Requirements Document (PRD)
# Usage Tracker - Standalone Desktop Application

**Version**: 1.0
**Date**: February 3, 2026
**Status**: Draft

---

## 1. Executive Summary

**Usage Tracker** is a lightweight, standalone Electron desktop application designed to monitor and display API usage statistics for the ZAI/GLM Coding Plan platform. The application provides real-time usage visibility, historical tracking, and proactive alerts to help developers manage their API consumption effectively.

### Key Benefits
- **Real-time Monitoring**: Live usage updates every 30 seconds
- **Multi-Platform Support**: Works with ZAI, Anthropic, and compatible APIs
- **Standalone Design**: No dependencies on other applications - runs independently
- **Cross-Platform**: Windows, macOS, and Linux support
- **Minimal Resource Usage**: Lightweight background application

---

## 2. Problem Statement

### Current Pain Points

1. **Hidden Usage Information**: Developers must actively check usage through CLI commands or web interfaces
2. **No Historical Context**: Usage data is only available for the current session
3. **Surprise Rate Limits**: Unexpected quota exhaustion interrupts development workflow
4. **Multi-Account Complexity**: Managing multiple API accounts across different projects is cumbersome
5. **Platform Fragmentation**: Each API platform has different usage tracking mechanisms

### User Impact
- **Workflow Interruptions**: Rate limits hit unexpectedly during active development
- **Cost Overruns**: No visibility into consumption patterns until limits are reached
- **Context Switching**: Must leave development environment to check usage statistics

---

## 3. Solution Overview

### Product Vision
Usage Tracker is a **system tray application** that runs in the background, continuously monitoring API usage and providing at-a-glance visibility through:

1. **System Tray Icon**: Color-coded status indicator (green/yellow/red)
2. **Tooltip Preview**: Quick usage overview on hover
3. **Main Window**: Detailed usage dashboard with history and analytics
4. **Desktop Notifications**: Alerts when approaching or hitting limits

### Core Value Proposition
> **"See your API usage at a glance, never get rate limited again"**

---

## 4. Target Users

### Primary Users
| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| **Solo Developers** | Individual developers using ZAI/GLM for personal projects | Simple setup, minimal overhead |
| **Teams/Enterprises** | Development teams with shared API accounts | Multi-account tracking, usage breakdown |
| **Platform Hoppers** | Developers switching between ZAI, Anthropic, etc. | Unified interface across platforms |

### User Personas
- **Alex, Solo Dev**: "I just want to know if I'm about to hit my limit without leaving my IDE"
- **Sam, Team Lead**: "I need to track which team member is consuming our quota"
- **Jordan, Platform User**: "I switch between ZAI and Anthropic based on pricing"

---

## 5. Key Features

### 5.1 Core Features (MVP)

#### F1. Real-Time Usage Display
- **Description**: Display current token usage percentage with visual progress bar
- **Details**:
  - Session usage (5-hour window) as primary metric
  - Monthly tools quota as secondary metric
  - Updates every 30 seconds
  - Color-coded indicators:
    - 🟢 Green: < 50% usage
    - 🟡 Yellow: 50-80% usage
    - 🔴 Red: > 80% usage

#### F2. Multi-Account Support
- **Description**: Add and track multiple API accounts simultaneously
- **Details**:
  - Support for API keys (direct tokens)
  - Support for OAuth tokens (future)
  - Account switching for viewing detailed stats
  - Per-account usage tracking

#### F3. Historical Usage Tracking
- **Description**: Store and display historical usage data over time
- **Details**:
  - Daily usage summaries
  - Usage trends graph
  - Export to CSV/JSON
  - Configurable retention period (default: 90 days)

#### F4. Usage Alerts
- **Description**: Proactive notifications when approaching limits
- **Details**:
  - Alert thresholds (e.g., 80%, 90%, 100%)
  - Desktop notifications
  - Optional sound alerts
  - Snooze functionality

#### F5. System Tray Integration
- **Description**: Run in background with system tray icon
- **Details**:
  - Color-coded tray icon
  - Tooltip with current usage
  - Single-click to open main window
  - Right-click context menu (Quick View, Settings, Quit)

### 5.2 Advanced Features (Post-MVP)

#### F6. Usage Predictions
- ML-based prediction of when limits will be reached
- "At current rate, you'll hit your limit in 2 days"

#### F7. Cost Estimation
- Calculate estimated API costs based on usage
- Support for different pricing tiers

#### F8. Project-Based Tracking
- Tag usage by project/IDE session
- "Project A used 500K tokens this week"

#### F9. Multi-Platform Support
- Add support for Anthropic, OpenAI, etc.
- Unified dashboard across providers

#### F10. Team Features
- Shared usage dashboards
- Per-team member breakdown
- Admin alerts for team quotas

---

## 6. Technical Requirements

### 6.1 Technology Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Framework** | Electron | Cross-platform desktop apps |
| **Frontend** | React + TypeScript | Component-based UI, type safety |
| **Styling** | Tailwind CSS | Rapid UI development |
| **State Management** | Zustand | Lightweight, simple API |
| **Build Tool** | Vite | Fast dev server, optimized builds |
| **Packaging** | electron-builder | Multi-platform packaging |
| **Storage** | SQLite | Local data persistence |

### 6.2 Platform Support

| Platform | Priority | Notes |
|----------|----------|-------|
| **Windows 10/11** | P0 | Primary development platform |
| **macOS 12+** | P1 | Intel and Apple Silicon |
| **Linux (Ubuntu/Fedora)** | P2 | Best effort |

### 6.3 Resource Requirements

| Resource | Target | Maximum |
|----------|--------|----------|
| **Memory** | < 100 MB | < 200 MB |
| **CPU** | < 1% idle | < 5% |
| **Disk** | < 50 MB | < 100 MB (with history) |
| **Network** | Minimal | ~1KB per API call |

### 6.4 Security Requirements

1. **API Key Storage**: Encrypt at rest using OS keychain
2. **Secure Communication**: HTTPS only for API calls
3. **No Data Collection**: No telemetry or data sent to external servers
4. **Local Only**: All data stored locally, no cloud sync

---

## 7. User Interface Design

### 7.1 System Tray States

```
State 1: Healthy (< 50%)     State 2: Warning (50-80%)   State 3: Critical (> 80%)
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│  🟢     │                  │  🟡     │                  │  🔴     │
│  45%    │                  │  72%    │                  │  95%    │
└─────────┘                  └─────────┘                  └─────────┘
```

### 7.2 Main Window Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Usage Tracker                                    [_] [□] [×] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  ZAI Account - Primary                               │  │
│  │                                                      │  │
│  │  Session Usage (5 Hours)          Weekly (Monthly) │  │
│  │  ┌─────────────────────────────┐  ┌───────────────┐  │  │
│  │  │ ████████████░░░░░ 72%     │  │ ██████░░░░░ 60% │  │  │
│  │  └─────────────────────────────┘  └───────────────┘  │  │
│  │                                                      │  │
│  │  360K / 500K tokens                             │  │
│  │  Reset in: 2h 15m                                │  │
│  │                                                      │  │
│  │  + Add Account                                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Usage History (Last 7 Days)                        │  │
│  │                                                      │  │
│  │  Day        Tokens    Tools    Cost                │  │
│  │  Mon        450K      120      $0.45               │  │
│  │  Tue        520K      95       $0.52               │  │
│  │  Wed        380K      150      $0.38               │  │
│  │  Thu        410K      110      $0.41               │  │
│  │  Fri        350K      130      $0.35               │  │
│  │  Sat        120K      45       $0.12               │  │
│  │  Sun        180K      60       $0.18               │  │
│  │                                                      │  │
│  │  Total:     2.41M    710      $2.41               │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  [Settings]  [Export]  [Refresh]                    │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Data Model

### 8.1 Stored Data

```typescript
// Account
interface Account {
  id: string;
  name: string;
  provider: 'zai' | 'anthropic' | 'openai';
  apiKey: string; // encrypted
  baseUrl: string;
  isActive: boolean;
}

// Usage Snapshot
interface UsageSnapshot {
  id: string;
  accountId: string;
  timestamp: Date;
  sessionUsage: number;
  sessionLimit: number;
  sessionPercent: number;
  weeklyUsage: number;
  weeklyLimit: number;
  weeklyPercent: number;
  resetTime: Date;
}

// Settings
interface Settings {
  refreshInterval: number; // seconds
  alertThresholds: number[]; // [80, 90, 100]
  enableNotifications: boolean;
  enableSoundAlert: boolean;
  retentionDays: number;
}
```

### 8.2 API Response Format

```typescript
interface ZAIUsageResponse {
  data: {
    limits: Array<{
      type: 'TOKENS_LIMIT' | 'TIME_LIMIT';
      percentage: number;
      currentValue: number;
      usage: number;
      nextResetTime: number;
    }>
  };
}
```

---

## 9. Success Metrics

### 9.1 Product Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **DAU/MAU** | 100/500 | Number of active users |
| **Retention** | 60% Day 7 | Users returning after first week |
| **Satisfaction** | 4.5/5 | User surveys |

### 9.2 Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **App Size** | < 100 MB | Installed application size |
| **Memory Usage** | < 150 MB | Average memory consumption |
| **Startup Time** | < 3 seconds | Time to tray icon |
| **API Accuracy** | 99% | Correct usage display vs actual API |

### 9.3 User Success

**Success Statement**: "A developer can install Usage Tracker, add their API credentials, and see accurate usage statistics within 2 minutes without referencing documentation."

---

## 10. Development Roadmap

### Phase 1: MVP (Weeks 1-4)
- ✅ Core Electron + React setup
- ✅ ZAI API integration
- ✅ Real-time usage display
- ✅ System tray integration
- ✅ Single account support

### Phase 2: Enhancement (Weeks 5-8)
- ⏳ Multi-account management
- ⏳ Historical tracking
- ⏳ Usage alerts
- ⏳ Export functionality

### Phase 3: Expansion (Weeks 9-12)
- ⏳ Multi-platform support (Anthropic, OpenAI)
- ⏳ Usage predictions
- ⏳ Cost estimation
- ⏳ Dark theme

### Phase 4: Polish (Weeks 13+)
- ⏳ Project-based tracking
- ⏳ Team features
- ⏳ Mobile app (React Native)

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **API Changes** | High | Version API responses, graceful degradation |
| **Platform Deprecation** | Medium | Multiple platform support, fallback options |
| **Security Vulnerabilities** | High | Regular audits, dependency updates |
| **User Adoption** | Medium | Simple onboarding, clear value prop |

---

## 12. Appendix

### A. References
- ZAI API Documentation
- Auto-Claude Usage Indicator Component
- Electron Best Practices

### B. Competitive Analysis
| Tool | Pros | Cons |
|------|------|------|
| **Built-in IDE indicators** | Integrated | Platform-specific |
| **Web dashboards** | Rich features | Requires context switch |
| **CLI tools** | Precise data | Manual invocation |
| **Usage Tracker** | Always visible, unified | New tool to learn |

### C. Glossary
- **Session Usage**: Token usage in a rolling 5-hour window
- **Weekly Usage**: Monthly MCP tools quota
- **Rate Limit**: API quota that resets after a time period
- **Tray Icon**: System notification area icon

---

**End of PRD**
