"use client"

import React, { useState, useRef } from "react"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading,
  Minus,
  Sparkles,
  Eye,
  Edit3,
  RotateCcw,
} from "lucide-react"

export interface RichTextEditorProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  rows?: number
  label?: string
  helperText?: string
}

export function FormattedTextRenderer({ content }: { content: string }) {
  if (!content || !content.trim()) return null

  // Split lines and render formatted blocks
  const lines = content.split("\n")

  return (
    <div className="space-y-2 text-xs text-zinc-300 leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />
        }

        // Heading 3 or 2
        if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
          const headingText = trimmed.replace(/^#{2,3}\s+/, "")
          return (
            <h4
              key={idx}
              className="font-bold text-white text-xs uppercase tracking-wider pt-2 mb-1 first:pt-0"
            >
              {headingText}
            </h4>
          )
        }

        // Horizontal Divider
        if (trimmed === "---" || trimmed === "***") {
          return <hr key={idx} className="border-zinc-800 my-2" />
        }

        // Bullet point
        if (
          trimmed.startsWith("• ") ||
          trimmed.startsWith("- ") ||
          trimmed.startsWith("* ")
        ) {
          const itemText = trimmed.replace(/^[•\-\*]\s+/, "")
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-accent font-bold mt-0.5">•</span>
              <span>{parseInlineFormatting(itemText)}</span>
            </div>
          )
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-zinc-500 font-mono text-[11px] min-w-[16px]">
                {numMatch[1]}.
              </span>
              <span>{parseInlineFormatting(numMatch[2])}</span>
            </div>
          )
        }

        // Standard Paragraph
        return <p key={idx}>{parseInlineFormatting(trimmed)}</p>
      })}
    </div>
  )
}

function parseInlineFormatting(text: string): React.ReactNode {
  // Simple regex parser for **bold** and *italic*
  const parts: React.ReactNode[] = []
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[2]) {
      // Bold **...**
      parts.push(
        <strong key={match.index} className="font-bold text-white">
          {match[2]}
        </strong>
      )
    } else if (match[3]) {
      // Italic *...*
      parts.push(
        <em key={match.index} className="italic text-zinc-200">
          {match[3]}
        </em>
      )
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  rows = 8,
  label,
  helperText,
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const applyWrap = (prefix: string, suffix: string, defaultText = "text") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentVal = value || ""
    const selectedText = currentVal.substring(start, end) || defaultText

    const replacement = `${prefix}${selectedText}${suffix}`
    const updated =
      currentVal.substring(0, start) + replacement + currentVal.substring(end)

    onChange(updated)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      )
    }, 50)
  }

  const applyLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentVal = value || ""

    const before = currentVal.substring(0, start)
    const lineStart = before.lastIndexOf("\n") + 1
    const selectedText = currentVal.substring(lineStart, end)

    const lines = selectedText.split("\n")
    const prefixedLines = lines.map((l) =>
      l.startsWith(prefix) ? l.replace(prefix, "") : `${prefix}${l}`
    )
    const replacement = prefixedLines.join("\n")

    const updated =
      currentVal.substring(0, lineStart) + replacement + currentVal.substring(end)

    onChange(updated)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(lineStart, lineStart + replacement.length)
    }, 50)
  }

  const insertTemplate = () => {
    const template = `### Fabric & Engineering
100% Combed Compact Cotton • 240 GSM heavyweight weave • Pre-shrunk & bio-washed in South India.

### Model & Fit Advisory
Model is 6'1" (185cm), wearing size L

### Garment Care
• Machine wash cold inside out with like colors
• Do not bleach or tumble dry
• Iron on reverse; do not iron direct print
• Dry flat in shade to preserve garment shape`

    onChange(template)
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-300">{label}</label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={insertTemplate}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-accent hover:text-white px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 transition-colors"
              title="Insert standard 3-part layout (Fabric, Model Fit, Care)"
            >
              <Sparkles className="h-3 w-3" /> Load Default Template
            </button>
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                isPreview
                  ? "bg-accent text-white border-accent"
                  : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              {isPreview ? (
                <>
                  <Edit3 className="h-3 w-3" /> Edit Mode
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" /> Live Preview
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Editor Box */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden focus-within:border-accent transition-colors">
        {/* Toolbar */}
        {!isPreview && (
          <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 text-zinc-400">
            <button
              type="button"
              onClick={() => applyWrap("**", "**", "Bold Text")}
              className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors"
              title="Bold (**text**)"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyWrap("*", "*", "Italic Text")}
              className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors"
              title="Italic (*text*)"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <div className="h-4 w-px bg-zinc-800 mx-1" />
            <button
              type="button"
              onClick={() => applyLinePrefix("### ")}
              className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-0.5 text-[11px] font-bold"
              title="Heading (### Title)"
            >
              <Heading className="h-3.5 w-3.5" />
              <span className="text-[10px]">H3</span>
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix("• ")}
              className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors"
              title="Bullet List (• Item)"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix("1. ")}
              className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors"
              title="Numbered List (1. Item)"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const updated = (value || "") + "\n\n---\n\n"
                onChange(updated)
              }}
              className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors"
              title="Divider Line (---)"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <div className="h-4 w-px bg-zinc-800 mx-1" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 rounded hover:bg-zinc-800 hover:text-red-400 text-zinc-500 transition-colors ml-auto"
              title="Clear all text"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Textarea or Preview */}
        {isPreview ? (
          <div className="p-4 min-h-[160px] bg-zinc-950/80">
            {value && value.trim() ? (
              <FormattedTextRenderer content={value} />
            ) : (
              <p className="text-xs text-zinc-600 italic">
                (No content to preview. Switch back to Edit Mode and enter your text.)
              </p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              placeholder ||
              "Write product specifications, fabric engineering, model advisory, and garment care...\n\nUse toolbar buttons or type **bold**, *italics*, ### headings, and • bullet points."
            }
            className="w-full bg-transparent px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none font-sans leading-relaxed resize-y"
          />
        )}
      </div>

      {helperText && <p className="text-[10px] text-zinc-500">{helperText}</p>}
    </div>
  )
}
