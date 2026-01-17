'use client'

import { useState } from 'react'
import { Preview } from '@/app/preview'
import { CodeIcon, EyeIcon } from 'lucide-react'
import { Panel, PanelHeader } from '@/components/panels/panels'
import { cn } from '@/lib/utils'

export function PreviewCodeTabs({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')

  return (
    <Panel className={className}>
      <PanelHeader>
        <div className="flex items-center space-x-4 w-full">
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              'flex items-center space-x-1 font-mono font-semibold uppercase text-sm',
              activeTab === 'preview' ? 'opacity-100' : 'opacity-50 hover:opacity-75'
            )}
          >
            <EyeIcon className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={cn(
              'flex items-center space-x-1 font-mono font-semibold uppercase text-sm',
              activeTab === 'code' ? 'opacity-100' : 'opacity-50 hover:opacity-75'
            )}
          >
            <CodeIcon className="w-4 h-4" />
            <span>Code</span>
          </button>
        </div>
      </PanelHeader>

      {activeTab === 'preview' ? (
        <Preview className="flex-1 overflow-hidden" />
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="font-mono text-sm text-muted-foreground">
            <p className="mb-4">Code viewer coming soon.</p>
            <p>This will display generated files with syntax highlighting.</p>
          </div>
        </div>
      )}
    </Panel>
  )
}
