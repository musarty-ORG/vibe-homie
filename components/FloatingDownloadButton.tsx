'use client'

import { DownloadIcon, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSandboxStore } from '@/app/state'
import { useCallback } from 'react'
import { useSharedChatContext } from '@/lib/chat-context'
import { useChat } from '@ai-sdk/react'
import type { ChatUIMessage } from '@/components/chat/types'
import { useSettings } from '@/components/settings/use-settings'

export function FloatingDownloadButton() {
  const { sandboxId, generatedFiles } = useSandboxStore()
  const { chat } = useSharedChatContext()
  const { modelId, reasoningEffort } = useSettings()
  const { sendMessage } = useChat<ChatUIMessage>({ chat })

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    try {
      // Convert file to data URL for sending
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        if (dataUrl) {
          // Send image to chat using the useChat hook
          sendMessage({
            text: 'Please analyze this image:',
            files: [{
              url: dataUrl,
              type: 'file',
              mediaType: file.type
            }]
          }, { body: { modelId, reasoningEffort } })
        }
        // Reset the input
        event.target.value = ''
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Failed to upload image')
    }
  }, [sendMessage, modelId, reasoningEffort])

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2">
      {/* Image Upload Button */}
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Upload image for analysis"
        />
        <Button
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <ImageIcon className="w-5 h-5 mr-2" />
          Upload Image
        </Button>
      </div>

      {/* Download Button - Only show if there are generated files and a sandbox */}
      {sandboxId && generatedFiles.size > 0 && (
        <Button
          onClick={handleDownload}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          Download ZIP
        </Button>
      )}
    </div>
  )
}
