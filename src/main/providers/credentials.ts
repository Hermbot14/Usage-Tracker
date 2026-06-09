/**
 * Local credential readers
 *
 * For `oauthLocal` providers we reuse the subscription token that the provider's
 * own CLI already stored on this machine — so the user adds the account with
 * zero pasting. Ported/condensed from Aperant's credential-utils.ts and
 * codex-oauth.ts.
 *
 *   Claude Code : ~/.claude/.credentials.json  → claudeAiOauth.accessToken
 *                 (Windows fallback: Credential Manager "Claude Code-credentials")
 *   Codex       : ~/.codex/auth.json           → tokens.access_token (+ account_id)
 *   Qwen Code   : ~/.qwen/oauth_creds.json      → access_token   (best-effort)
 */

import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import type { LocalCredentialSource } from './types'

export interface LocalCredential {
  token: string | null
  email?: string | null
  /** Some providers (Codex teams) need an account id alongside the token. */
  accountId?: string | null
  error?: string
}

function safeReadJson(path: string): unknown | null {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Claude Code
// ---------------------------------------------------------------------------

function readClaudeFromFile(): LocalCredential | null {
  const path = join(homedir(), '.claude', '.credentials.json')
  const data = safeReadJson(path) as
    | { claudeAiOauth?: { accessToken?: string; email?: string; emailAddress?: string }; email?: string }
    | null
  const oauth = data?.claudeAiOauth
  if (oauth?.accessToken && typeof oauth.accessToken === 'string') {
    return {
      token: oauth.accessToken,
      email: oauth.email ?? oauth.emailAddress ?? data?.email ?? null,
    }
  }
  return null
}

/**
 * Windows Credential Manager fallback — reads the generic credential
 * "Claude Code-credentials" whose password blob is the same JSON as the file.
 * Uses CredRead via a short PowerShell P/Invoke (ported from Aperant).
 */
function readClaudeFromWindowsCredMan(): LocalCredential | null {
  if (process.platform !== 'win32') return null
  const psScript = `
    $ErrorActionPreference = 'Stop'
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
[StructLayout(LayoutKind.Sequential)]
public struct CREDENTIAL {
  public uint Flags; public uint Type; public IntPtr TargetName; public IntPtr Comment;
  public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
  public uint CredentialBlobSize; public IntPtr CredentialBlob; public uint Persist;
  public uint AttributeCount; public IntPtr Attributes; public IntPtr TargetAlias; public IntPtr UserName;
}
'@
    Add-Type -MemberDefinition @'
[DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
public static extern bool CredRead(string target, uint type, uint reservedFlag, out IntPtr credentialPtr);
[DllImport("advapi32.dll", SetLastError = true)]
public static extern bool CredFree(IntPtr cred);
'@ -Namespace Win32 -Name CredApi
    $credPtr = [IntPtr]::Zero
    $ok = [Win32.CredApi]::CredRead("Claude Code-credentials", 1, 0, [ref]$credPtr)
    if ($ok) {
      try {
        $cred = [Runtime.InteropServices.Marshal]::PtrToStructure($credPtr, [Type][CREDENTIAL])
        if ($cred.CredentialBlobSize -gt 0) {
          $blob = [byte[]]::new($cred.CredentialBlobSize)
          [Runtime.InteropServices.Marshal]::Copy($cred.CredentialBlob, $blob, 0, $cred.CredentialBlobSize)
          Write-Output ([System.Text.Encoding]::Unicode.GetString($blob))
        }
      } finally { [Win32.CredApi]::CredFree($credPtr) | Out-Null }
    } else { Write-Output "" }
  `
  try {
    const psPath = findPowerShell()
    if (!psPath) return null
    const out = execFileSync(
      psPath,
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', psScript],
      { encoding: 'utf-8', timeout: 8000, windowsHide: true },
    ).trim()
    if (!out) return null
    const data = JSON.parse(out) as { claudeAiOauth?: { accessToken?: string; email?: string } }
    const token = data?.claudeAiOauth?.accessToken
    return token ? { token, email: data.claudeAiOauth?.email ?? null } : null
  } catch (err) {
    return { token: null, error: err instanceof Error ? err.message : String(err) }
  }
}

function findPowerShell(): string | null {
  const candidates = [
    join(process.env.ProgramFiles || 'C:\\Program Files', 'PowerShell', '7', 'pwsh.exe'),
    join(
      process.env.SystemRoot || 'C:\\Windows',
      'System32',
      'WindowsPowerShell',
      'v1.0',
      'powershell.exe',
    ),
  ]
  for (const c of candidates) {
    try {
      readFileSync(c)
      return c
    } catch {
      // not here, try next
    }
  }
  // Last resort: rely on PATH resolution.
  return 'powershell.exe'
}

function readClaude(): LocalCredential {
  return (
    readClaudeFromFile() ??
    readClaudeFromWindowsCredMan() ?? { token: null, error: 'No Claude Code credentials found (~/.claude/.credentials.json)' }
  )
}

// ---------------------------------------------------------------------------
// Codex (ChatGPT)
// ---------------------------------------------------------------------------

function readCodex(): LocalCredential {
  const path = join(homedir(), '.codex', 'auth.json')
  const data = safeReadJson(path) as
    | { tokens?: { access_token?: string; account_id?: string; id_token?: string } }
    | null
  const token = data?.tokens?.access_token
  if (token && typeof token === 'string') {
    return { token, accountId: data?.tokens?.account_id ?? null }
  }
  return { token: null, error: 'No Codex credentials found (~/.codex/auth.json)' }
}

// ---------------------------------------------------------------------------
// Qwen Code (best-effort; provider is scaffolded)
// ---------------------------------------------------------------------------

function readQwen(): LocalCredential {
  const path = join(homedir(), '.qwen', 'oauth_creds.json')
  const data = safeReadJson(path) as { access_token?: string } | null
  return data?.access_token
    ? { token: data.access_token }
    : { token: null, error: 'No Qwen credentials found (~/.qwen/oauth_creds.json)' }
}

/** Read a locally-stored OAuth token for an `oauthLocal` provider. */
export function readLocalCredential(source: LocalCredentialSource): LocalCredential {
  switch (source) {
    case 'claude':
      return readClaude()
    case 'codex':
      return readCodex()
    case 'qwen':
      return readQwen()
    default:
      return { token: null, error: `Unknown credential source: ${source}` }
  }
}

/** Quick check used by the UI to show "detected" badges for local accounts. */
export function detectLocalAccounts(): Array<{ source: LocalCredentialSource; email?: string | null }> {
  const found: Array<{ source: LocalCredentialSource; email?: string | null }> = []
  for (const source of ['claude', 'codex', 'qwen'] as const) {
    const cred = readLocalCredential(source)
    if (cred.token) found.push({ source, email: cred.email })
  }
  return found
}
