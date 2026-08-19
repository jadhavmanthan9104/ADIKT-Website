import React from "react"

export function JsonLd({ schema }: { schema: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      className="hidden"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
