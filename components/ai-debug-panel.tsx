"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { formatAIDiagnostics, type AIDiagnostics } from "@/lib/ai-debug-config"

interface AIDebugPanelProps {
  diagnostics: AIDiagnostics | null
}

export function AIDebugPanel({ diagnostics }: AIDebugPanelProps) {
  const [copied, setCopied] = useState(false)

  if (!diagnostics) return null

  const copyDetails = async () => {
    const text = formatAIDiagnostics(diagnostics)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      textarea.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <details style={{ marginTop: 14, border: "1px solid var(--border-default)", borderRadius: 10, backgroundColor: "var(--bg-muted)", color: "var(--text-secondary)" }}>
      <summary style={{ cursor: "pointer", padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 13 }}>
        What happened
      </summary>
      <div style={{ padding: "0 14px 14px", fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.55, overflowWrap: "anywhere" }}>
        <dl style={{ display: "grid", gridTemplateColumns: "minmax(120px, auto) minmax(0, 1fr)", gap: "5px 12px", margin: "0 0 12px" }}>
          <dt>Step and route</dt><dd style={{ margin: 0 }}>{diagnostics.step}, {diagnostics.route}</dd>
          <dt>HTTP status</dt><dd style={{ margin: 0 }}>{diagnostics.httpStatus}</dd>
          <dt>Failure stage</dt><dd style={{ margin: 0 }}>{diagnostics.stage}</dd>
          <dt>Exact error</dt><dd style={{ margin: 0 }}>{diagnostics.exactErrorMessage}</dd>
          <dt>Model</dt><dd style={{ margin: 0 }}>{diagnostics.model}</dd>
          <dt>Anthropic request ID</dt><dd style={{ margin: 0 }}>{diagnostics.anthropicRequestId ?? "not available"}</dd>
          <dt>Retry ran</dt><dd style={{ margin: 0 }}>{diagnostics.retryRan ? "Yes" : "No"}</dd>
          <dt>Retry result</dt><dd style={{ margin: 0 }}>{diagnostics.retryResult}</dd>
          <dt>Time taken</dt><dd style={{ margin: 0 }}>{diagnostics.timeTakenMs} ms</dd>
        </dl>
        <p style={{ margin: "0 0 5px" }}>Raw model output, first 1500 characters</p>
        <pre style={{ margin: "0 0 12px", whiteSpace: "pre-wrap", font: "inherit" }}>{diagnostics.rawModelOutput ?? "Not available"}</pre>
        <p style={{ margin: "0 0 5px" }}>Attempts</p>
        <pre style={{ margin: "0 0 12px", whiteSpace: "pre-wrap", font: "inherit" }}>{diagnostics.attempts.map((attempt) => `Attempt ${attempt.attempt}: ${attempt.result}\nStage: ${attempt.stage}\nAnthropic status: ${attempt.httpStatus ?? "not available"}\nRequest ID: ${attempt.requestId ?? "not available"}\nError: ${attempt.errorMessage}\nRaw model output: ${attempt.rawModelOutput ?? "not available"}`).join("\n\n")}</pre>
        <button type="button" onClick={copyDetails} style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 36, padding: "6px 10px", border: "1px solid var(--border-default)", borderRadius: 7, background: "var(--bg-surface)", color: "var(--text-secondary)", font: "inherit", cursor: "pointer" }}>
          {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          {copied ? "Copied" : "Copy details"}
        </button>
        <span role="status" aria-live="polite" className="sr-only">{copied ? "Diagnostic details copied" : ""}</span>
      </div>
    </details>
  )
}
