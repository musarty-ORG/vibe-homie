'use client'

import { useState, useMemo } from 'react'
import { Preview } from '@/app/preview'
import { CodeIcon, EyeIcon, FileIcon } from 'lucide-react'
import { Panel, PanelHeader } from '@/components/panels/panels'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { FileContent } from '@/components/file-explorer/file-content'
import { buildFileTree, type FileNode } from '@/components/file-explorer/build-file-tree'
import { useSandboxStore } from '@/app/state'
import { cn } from '@/lib/utils'

export function PreviewCodeTabs({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const { sandboxId, generatedFiles } = useSandboxStore()
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  
  const generatedFilesArray = useMemo(() => Array.from(generatedFiles), [generatedFiles])
  const fileTree = useMemo(() => buildFileTree(generatedFilesArray), [generatedFilesArray])

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
        {activeTab === 'code' && selectedFile && (
          <span className="ml-auto text-xs text-muted-foreground font-mono">
            {selectedFile}
          </span>
        )}
      </PanelHeader>

      {activeTab === 'preview' ? (
        <Preview className="flex-1 overflow-hidden" />
      ) : (
        <div className="flex text-sm h-[calc(100%-2rem-1px)]">
          {generatedFilesArray.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="font-mono text-sm text-muted-foreground text-center p-4">
                <FileIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No generated files yet.</p>
                <p className="text-xs mt-1">Files will appear here as they are created.</p>
              </div>
            </div>
          ) : (
            <>
              {/* File List */}
              <ScrollArea className="w-1/4 border-r border-primary/18 flex-shrink-0">
                <div className="py-1">
                  {renderFileTree(fileTree, 0, selectedFile, (path) => setSelectedFile(path))}
                </div>
              </ScrollArea>
              
              {/* File Content */}
              {selectedFile && sandboxId ? (
                <ScrollArea className="w-3/4 flex-shrink-0">
                  <FileContent
                    sandboxId={sandboxId}
                    path={selectedFile.startsWith('/') ? selectedFile.substring(1) : selectedFile}
                  />
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="font-mono text-sm text-muted-foreground">
                    Select a file to view its content
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Panel>
  )
}

// Helper function to render file tree
function renderFileTree(
  nodes: FileNode[], 
  depth: number,
  selectedFile: string | null,
  onSelectFile: (path: string) => void
): React.ReactNode {
  return nodes.map((node) => (
    <FileTreeNode
      key={node.path}
      node={node}
      depth={depth}
      selectedFile={selectedFile}
      onSelectFile={onSelectFile}
    />
  ))
}

// File tree node component
function FileTreeNode({
  node,
  depth,
  selectedFile,
  onSelectFile,
}: {
  node: FileNode
  depth: number
  selectedFile: string | null
  onSelectFile: (path: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  
  const handleClick = () => {
    if (node.type === 'folder') {
      setExpanded(!expanded)
    } else {
      onSelectFile(node.path)
    }
  }

  return (
    <div>
      <div
        className={cn(
          'flex items-center py-0.5 px-1 hover:bg-secondary/50 cursor-pointer text-sm',
          { 'bg-secondary': selectedFile === node.path }
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'folder' ? (
          <>
            <FileIcon className="w-3.5 h-3.5 mr-2 opacity-50" />
            <span className="font-medium">{node.name}</span>
          </>
        ) : (
          <>
            <div className="w-3.5 mr-2" />
            <FileIcon className="w-3.5 h-3.5 mr-2 opacity-50" />
            <span>{node.name}</span>
          </>
        )}
      </div>

      {node.type === 'folder' && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  )
}
