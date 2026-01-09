'use client'

import { DownloadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSandboxStore } from '@/app/state'

export function FloatingDownloadButton() {
  const { sandboxId, generatedFiles } = useSandboxStore()

  // Only show if there are generated files and a sandbox
  if (!sandboxId || generatedFiles.size === 0) {
    return null
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/sandboxes/${sandboxId}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: Array.from(generatedFiles),
        }),
      })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      // Create a blob from the response and trigger download
      const blob = await response.blob()
      const url = globalThis.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'generated-project.zip'
      document.body.appendChild(a)
      a.click()
      a.remove()
      globalThis.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      // Could show a toast notification here
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleDownload}
        size="lg"
        className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <DownloadIcon className="w-5 h-5 mr-2" />
        Download ZIP
      </Button>
    </div>
  )
}