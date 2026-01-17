'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { 
  SendIcon, 
  ImageIcon, 
  XIcon, 
  StopCircleIcon,
  Loader2Icon
} from 'lucide-react'

export interface PromptInputAttachment {
  url: string
  type: 'file'
  mediaType: string
  name?: string
}

export interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (text: string, attachments?: PromptInputAttachment[]) => void
  placeholder?: string
  disabled?: boolean
  status?: 'ready' | 'streaming' | 'submitted' | 'error'
  className?: string
  onStop?: () => void
  showModelSelector?: React.ReactNode
  showSettings?: React.ReactNode
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type your message...',
  disabled = false,
  status = 'ready',
  className,
  onStop,
  showModelSelector,
  showSettings,
}: PromptInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const [attachments, setAttachments] = React.useState<PromptInputAttachment[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Auto-grow textarea
  React.useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'
    // Set height to scrollHeight (capped at max-height via CSS)
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }, [value])

  const handleSubmit = React.useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      if (value.trim() || attachments.length > 0) {
        onSubmit(value, attachments.length > 0 ? attachments : undefined)
        setAttachments([])
      }
    },
    [value, attachments, onSubmit]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const handleFileChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type (support images)
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
        const reader = new FileReader()
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string
          if (dataUrl) {
            setAttachments((prev) => [
              ...prev,
              {
                url: dataUrl,
                type: 'file',
                mediaType: file.type,
                name: file.name,
              },
            ])
          }
          // Reset the input
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('File upload error:', error)
        alert('Failed to upload file')
      }
    },
    []
  )

  const removeAttachment = React.useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const isDisabled = disabled || status === 'streaming' || status === 'submitted'
  const canSubmit = !isDisabled && (value.trim() || attachments.length > 0)

  return (
    <form
      className={cn(
        'flex flex-col border-t border-primary/18 bg-background',
        className
      )}
      onSubmit={handleSubmit}
    >
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border-b border-primary/10">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="relative group rounded-md border border-border overflow-hidden"
            >
              <img
                src={attachment.url}
                alt={attachment.name || 'Attachment'}
                className="h-16 w-16 object-cover"
              />
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="absolute top-1 right-1 bg-destructive/80 hover:bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-1 p-2">
        {/* Settings and Model Selector */}
        {showSettings}
        {showModelSelector}

        {/* Attachment Button */}
        <div className="relative shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isDisabled}
            title="Attach image"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isDisabled}
            className="pointer-events-none"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          className="min-h-[40px] max-h-[200px] flex-1 font-mono text-sm rounded-sm border-0 bg-background"
          rows={1}
        />

        {/* Submit/Stop Button */}
        {status === 'streaming' || status === 'submitted' ? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onStop}
            disabled={!onStop}
          >
            {status === 'submitted' ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              <StopCircleIcon className="w-4 h-4" />
            )}
          </Button>
        ) : (
          <Button type="submit" size="icon" disabled={!canSubmit}>
            <SendIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
    </form>
  )
}
