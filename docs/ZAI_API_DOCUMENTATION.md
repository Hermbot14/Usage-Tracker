# ZAI Usage Tracker API Documentation

## Overview

The ZAI Usage Tracker monitors Claude API usage through the ZAI provider's quota monitoring endpoint. This documentation provides comprehensive details for interacting with the ZAI Usage Monitoring API.

**Base URL**: `https://api.z.ai/api/anthropic`

**Usage Endpoint**: `https://api.z.ai/api/monitor/usage/quota/limit`

---

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Request/Response Formats](#requestresponse-formats)
4. [Error Handling](#error-handling)
5. [Rate Limits and Caching Strategy](#rate-limits-and-caching-strategy)
6. [Security Considerations](#security-considerations)
7. [Provider Detection](#provider-detection)
8. [Code Examples](#code-examples)

---

## Authentication

### Method: Bearer Token

All API requests require authentication using a Bearer token obtained from the `ANTHROPIC_AUTH_TOKEN` environment variable.

**Authorization Header Format:**

```http
Authorization: Bearer <token>
```

**Example:**

```typescript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Token Sources

1. **API Profiles**: Uses the API key directly from the profile configuration
2. **OAuth Profiles**: Reads fresh tokens from the system keychain (not cached OAuth tokens)

**Important**: OAuth tokens expire in 8-12 hours. The system always reads fresh tokens from the keychain to avoid 401 errors.

---

## API Endpoints

### Get Quota Limits

**Endpoint**: `GET /api/monitor/usage/quota/limit`

**Full URL**: `https://api.z.ai/api/monitor/usage/quota/limit`

**Description**: Retrieves current usage statistics and quota limits for the authenticated account.

**Authentication**: Required (Bearer Token)

**Content-Type**: `application/json`

#### Request Parameters

No query parameters or request body required.

#### Request Example

```typescript
const response = await fetch('https://api.z.ai/api/monitor/usage/quota/limit', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${credential}`,
    'Content-Type': 'application/json'
  }
});
```

#### Response (200 OK)

**Structure:**

```json
{
  "data": {
    "limits": [
      {
        "type": "TOKENS_LIMIT",
        "percentage": 75.5,
        "unit": "tokens",
        "number": 5,
        "usage": 1000000,
        "currentValue": 755000,
        "remaining": 245000,
        "nextResetTime": 1737123456789
      },
      {
        "type": "TIME_LIMIT",
        "percentage": 45.2,
        "currentValue": 12345,
        "usage": 50000,
        "usageDetails": {
          "unit": "seconds",
          "window": "monthly"
        }
      }
    ]
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `data` | object | Wrapper object containing the actual response data |
| `data.limits` | array | Array of limit objects (TOKENS_LIMIT, TIME_LIMIT) |
| `type` | string | Type of limit: `TOKENS_LIMIT` or `TIME_LIMIT` |
| `percentage` | number | Usage percentage (0-100) |
| `unit` | string | Unit of measurement (e.g., "tokens") |
| `number` | number | Number of time units (e.g., 5 for 5-hour window) |
| `usage` | number | Total allowed usage limit |
| `currentValue` | number | Current usage value |
| `remaining` | number | Remaining quota |
| `nextResetTime` | number | Unix timestamp (milliseconds) of next reset |

#### Usage Types

| Limit Type | Description | Window |
|------------|-------------|--------|
| `TOKENS_LIMIT` | Token usage quota | 5-hour rolling window |
| `TIME_LIMIT` | MCP tools quota | Monthly window |

---

## Request/Response Formats

### Request Format

**HTTP Method**: GET

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer <token>` | Yes |
| `Content-Type` | `application/json` | Yes |

### Response Format

**Success Response (200 OK):**

```json
{
  "data": {
    "limits": [...]
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "error": {
    "type": "authentication_error",
    "message": "Invalid token or expired credentials"
  }
}
```

**Error Response (403 Forbidden):**

```json
{
  "error": {
    "type": "permission_error",
    "message": "Access denied"
  }
}
```

**Error Response (429 Rate Limited):**

```json
{
  "error": {
    "type": "rate_limit_error",
    "message": "Too many requests"
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Status Code | Meaning | Action |
|-------------|---------|--------|
| 200 | Success | Process response data |
| 401 | Unauthorized | Re-authenticate user, clear keychain cache |
| 403 | Forbidden | Check API key permissions |
| 429 | Rate Limited | Implement exponential backoff |
| 500 | Server Error | Retry with cooldown |
| 503 | Service Unavailable | Retry with cooldown |

### Error Detection Patterns

The system detects authentication failures by checking:

1. **Status codes**: 401, 403
2. **Response body patterns**:
   - "unauthorized"
   - "authentication"
   - "invalid token"
   - "invalid api key"
   - "expired token"
   - "forbidden"
   - "access denied"
   - "credentials"
   - "auth failed"

### Error Handling Strategy

```typescript
try {
  const response = await fetch(endpoint, { headers });

  if (!response.ok) {
    // Check for auth failures
    if (response.status === 401 || response.status === 403) {
      const error = new Error('API Auth Failure');
      error.statusCode = response.status;
      throw error;
    }

    // Check response body for auth error patterns
    const errorData = await response.json();
    const errorText = JSON.stringify(errorData).toLowerCase();
    const authErrorPatterns = ['unauthorized', 'authentication', 'invalid token'];

    if (authErrorPatterns.some(pattern => errorText.includes(pattern))) {
      throw new Error('API Auth Failure detected in response body');
    }

    // Record failure for cooldown retry
    apiFailureTimestamps.set(profileId, Date.now());
    return null;
  }
} catch (error) {
  // Handle auth failures with profile swap
  if (error.message.includes('Auth Failure')) {
    await handleAuthFailure(profileId);
  }
}
```

### Cooldown-Based Retry

After API failures, the system implements a cooldown period:

- **API Failure Cooldown**: 2 minutes (`API_FAILURE_COOLDOWN_MS = 120,000ms`)
- **Auth Failure Cooldown**: 5 minutes (`AUTH_FAILURE_COOLDOWN_MS = 300,000ms`)

---

## Rate Limits and Caching Strategy

### Update Interval

Usage monitoring runs on a **30-second interval** (`30000ms`):

```typescript
const interval = settings.usageCheckInterval || 30000; // 30 seconds
```

### Caching Strategy

The system uses a multi-level caching strategy:

#### 1. Active Profile Cache

- **Storage**: In-memory (`currentUsage`)
- **Update Frequency**: Every 30 seconds
- **Scope**: Single active profile

#### 2. Inactive Profile Cache

- **Storage**: Map indexed by profile ID (`allProfilesUsageCache`)
- **TTL**: 60 seconds (`PROFILE_USAGE_CACHE_TTL_MS = 60,000ms`)
- **Scope**: All non-active profiles
- **Parallel Fetching**: Inactive profiles fetched in parallel

#### 3. Persistent Storage

- **Storage**: Profile usage data persisted to disk
- **Format**: JSON files in profile configuration
- **Fields**: `sessionUsagePercent`, `weeklyUsagePercent`, `lastUpdated`

### Cache Invalidation

Caches are invalidated when:

1. Profile is re-authenticated (clear keychain cache)
2. Cache TTL expires (60 seconds)
3. Active profile changes
4. API failure cooldown expires

### Parallel Fetching

Inactive profiles are fetched in parallel to minimize blocking delays:

```typescript
const fetchPromises = profilesToFetch.map(async ({ profile, index }) => {
  return await this.fetchUsageForInactiveProfile(profile);
});

const fetchResults = await Promise.all(fetchPromises);
```

---

## Security Considerations

### Domain Allowlist

Only requests to authorized domains are permitted:

```typescript
const ALLOWED_USAGE_API_DOMAINS = new Set([
  'api.anthropic.com',
  'api.z.ai',
  'open.bigmodel.cn',
]);
```

**Domain Validation:**

```typescript
const endpointUrl = new URL(usageEndpoint);
const endpointHostname = endpointUrl.hostname;

if (!ALLOWED_USAGE_API_DOMAINS.has(endpointHostname)) {
  console.error('Blocked request to unauthorized domain:', endpointHostname);
  return null;
}
```

### Credential Fingerprinting

For debug logging, credentials are fingerprinted to prevent sensitive data leakage:

```typescript
function getCredentialFingerprint(credential: string): string {
  if (!credential) return 'null';
  if (credential.length <= 16) {
    return credential.slice(0, 4) + '...' + credential.slice(-2);
  }
  return credential.slice(0, 8) + '...' + credential.slice(-4);
}

// Example: "sk-ant-oa...xyz9"
```

### Keychain Integration

OAuth tokens are stored and retrieved from the system keychain:

- **macOS**: Keychain Access
- **Windows**: Credential Manager
- **Linux**: Secret Service API

**Token Refresh**: The Claude CLI automatically refreshes tokens. The system always reads fresh tokens from the keychain rather than using cached values.

---

## Provider Detection

### Detection Patterns

The system detects the ZAI provider from the base URL:

```typescript
const PROVIDER_PATTERNS = [
  {
    provider: 'zai',
    domainPatterns: ['api.z.ai', 'z.ai']
  }
];
```

### Detection Examples

| Base URL | Detected Provider |
|----------|-------------------|
| `https://api.z.ai/api/anthropic` | `zai` |
| `https://z.ai/api/paas/v4` | `zai` |
| `https://api.anthropic.com` | `anthropic` |
| `https://open.bigmodel.cn/api/paas/v4` | `zhipu` |
| `https://unknown.com/api` | `unknown` |

### Provider-Specific Endpoints

| Provider | Usage Endpoint |
|----------|----------------|
| `anthropic` | `/api/oauth/usage` |
| `zai` | `/api/monitor/usage/quota/limit` |
| `zhipu` | `/api/monitor/usage/quota/limit` |

### Endpoint Construction

```typescript
export function getUsageEndpoint(provider: ApiProvider, baseUrl: string): string | null {
  const endpointConfig = PROVIDER_USAGE_ENDPOINTS.find(e => e.provider === provider);
  if (!endpointConfig) return null;

  const url = new URL(baseUrl);
  url.pathname = endpointConfig.usagePath;

  return url.toString();
}

// Example:
// getUsageEndpoint('zai', 'https://api.z.ai/api/anthropic')
// Returns: 'https://api.z.ai/api/monitor/usage/quota/limit'
```

---

## Code Examples

### Basic Usage Fetch

```typescript
import { getUsageEndpoint, detectProvider } from './usage-monitor';

async function fetchZAIUsage(credential: string): Promise<ClaudeUsageSnapshot | null> {
  const baseUrl = 'https://api.z.ai/api/anthropic';
  const provider = detectProvider(baseUrl);
  const usageEndpoint = getUsageEndpoint(provider, baseUrl);

  if (!usageEndpoint) {
    console.error('Unknown provider - no usage endpoint configured');
    return null;
  }

  const response = await fetch(usageEndpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${credential}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    console.error('API error:', response.status, response.statusText);
    return null;
  }

  const rawData = await response.json();
  const responseData = rawData.data || rawData;

  return normalizeZAIResponse(responseData);
}
```

### Normalization Function

```typescript
function normalizeZAIResponse(
  data: any,
  profileId: string,
  profileName: string,
  profileEmail?: string
): ClaudeUsageSnapshot | null {
  if (!data || !Array.isArray(data.limits)) {
    console.warn('Invalid response format - missing limits array');
    return null;
  }

  const tokensLimit = data.limits.find((item: any) => item.type === 'TOKENS_LIMIT');
  const timeLimit = data.limits.find((item: any) => item.type === 'TIME_LIMIT');

  const sessionPercent = tokensLimit?.percentage !== undefined
    ? Math.round(tokensLimit.percentage)
    : 0;

  const weeklyPercent = timeLimit?.percentage !== undefined
    ? Math.round(timeLimit.percentage)
    : 0;

  const now = new Date();
  let sessionResetTimestamp: string;

  if (tokensLimit?.nextResetTime && typeof tokensLimit.nextResetTime === 'number') {
    sessionResetTimestamp = new Date(tokensLimit.nextResetTime).toISOString();
  } else {
    sessionResetTimestamp = new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString();
  }

  const nextMonth = new Date(now);
  nextMonth.setUTCMonth(now.getUTCMonth() + 1, 1);
  nextMonth.setUTCHours(0, 0, 0, 0);
  const weeklyResetTimestamp = nextMonth.toISOString();

  return {
    sessionPercent,
    weeklyPercent,
    sessionResetTimestamp,
    weeklyResetTimestamp,
    profileId,
    profileName,
    profileEmail,
    fetchedAt: new Date(),
    limitType: 'session', // ZAI prioritizes token usage
    usageWindows: {
      sessionWindowLabel: 'common:usage.window5HoursQuota',
      weeklyWindowLabel: 'common:usage.windowMonthlyToolsQuota'
    },
    sessionUsageValue: tokensLimit?.currentValue,
    sessionUsageLimit: tokensLimit?.usage,
    weeklyUsageValue: timeLimit?.currentValue,
    weeklyUsageLimit: timeLimit?.usage
  };
}
```

### Error Handling with Cooldown

```typescript
class UsageMonitor {
  private apiFailureTimestamps: Map<string, number> = new Map();
  private static API_FAILURE_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

  private shouldUseApiMethod(profileId: string): boolean {
    const lastFailure = this.apiFailureTimestamps.get(profileId);
    if (!lastFailure) return true;

    const elapsed = Date.now() - lastFailure;
    return elapsed >= UsageMonitor.API_FAILURE_COOLDOWN_MS;
  }

  async fetchUsageWithRetry(profileId: string): Promise<ClaudeUsageSnapshot | null> {
    if (!this.shouldUseApiMethod(profileId)) {
      console.log('API in cooldown period, using fallback method');
      return await this.fetchUsageViaCLI(profileId);
    }

    try {
      const usage = await this.fetchUsageViaAPI(profileId);
      return usage;
    } catch (error) {
      // Record failure timestamp for cooldown retry
      this.apiFailureTimestamps.set(profileId, Date.now());
      throw error;
    }
  }
}
```

### Monitoring Loop

```typescript
class UsageMonitor {
  private intervalId: NodeJS.Timeout | null = null;

  start(): void {
    if (this.intervalId) return;

    const interval = 30000; // 30 seconds

    // Check immediately
    this.checkUsageAndSwap();

    // Then check periodically
    this.intervalId = setInterval(() => {
      this.checkUsageAndSwap();
    }, interval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkUsageAndSwap(): Promise<void> {
    const usage = await this.fetchUsage();
    if (!usage) return;

    this.currentUsage = usage;
    this.emit('usage-updated', usage);

    // Check if proactive swap is needed
    if (usage.sessionPercent >= 80) {
      await this.performProactiveSwap();
    }
  }
}
```

---

## Type Definitions

```typescript
/**
 * API Provider type for usage monitoring
 */
export type ApiProvider = 'anthropic' | 'zai' | 'zhipu' | 'unknown';

/**
 * Usage snapshot from monitoring API
 */
export interface ClaudeUsageSnapshot {
  profileId: string;
  profileName: string;
  profileEmail?: string;
  sessionPercent: number;        // 0-100
  weeklyPercent: number;         // 0-100
  sessionResetTimestamp?: string; // ISO 8601
  weeklyResetTimestamp?: string;  // ISO 8601
  fetchedAt: Date;
  limitType: 'session' | 'weekly';
  usageWindows?: {
    sessionWindowLabel: string;
    weeklyWindowLabel: string;
  };
  sessionUsageValue?: number;
  sessionUsageLimit?: number;
  weeklyUsageValue?: number;
  weeklyUsageLimit?: number;
}

/**
 * Profile usage summary
 */
export interface ProfileUsageSummary {
  profileId: string;
  profileName: string;
  profileEmail?: string;
  sessionPercent: number;
  weeklyPercent: number;
  sessionResetTimestamp?: string;
  weeklyResetTimestamp?: string;
  isAuthenticated: boolean;
  isRateLimited: boolean;
  rateLimitType?: 'session' | 'weekly';
  availabilityScore: number;
  isActive: boolean;
  lastFetchedAt?: string;
}

/**
 * All profiles usage data
 */
export interface AllProfilesUsage {
  activeProfile: ClaudeUsageSnapshot;
  allProfiles: ProfileUsageSummary[];
  fetchedAt: Date;
}
```

---

## Additional Resources

- **Implementation**: `apps/frontend/src/main/claude-profile/usage-monitor.ts`
- **Provider Detection**: `apps/frontend/src/shared/utils/provider-detection.ts`
- **Tests**: `apps/frontend/src/main/claude-profile/usage-monitor.test.ts`
- **Profile Service**: `apps/frontend/src/main/services/profile/profile-service.ts`

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-17 | Initial documentation with ZAI quota/limit endpoint support |
