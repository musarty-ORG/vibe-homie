import { NextResponse, type NextRequest } from 'next/server'
import { Sandbox } from '@vercel/sandbox'
import { getRichError } from '@/ai/tools/get-rich-error'
import JSZip from 'jszip'

// Sanitize file path to prevent path traversal and log injection
function sanitizeFilePath(filePath: string): string {
  // Remove any null bytes and newlines to prevent log injection
  const sanitized = filePath.replace(/[\0\r\n]/g, '')
  // Normalize path separators
  return sanitized.replace(/\\/g, '/')
}

// Validate file path to prevent path traversal attacks
function isValidFilePath(filePath: string): boolean {
  if (!filePath || typeof filePath !== 'string') {
    return false
  }
  
  // Reject paths with null bytes, newlines, or carriage returns
  if (/[\0\r\n]/.test(filePath)) {
    return false
  }
  
  // Reject absolute paths and path traversal attempts
  if (filePath.startsWith('/') || filePath.includes('..')) {
    return false
  }
  
  // Basic sanity check - path should not be too long
  if (filePath.length > 1000) {
    return false
  }
  
  return true
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sandboxId: string }> }
) {
  const { sandboxId } = await params

  try {
    const body = await request.json()
    const { files }: { files: string[] } = body

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided for download' },
        { status: 400 }
      )
    }

    // Validate all file paths before processing
    const invalidPaths = files.filter(f => !isValidFilePath(f))
    if (invalidPaths.length > 0) {
      // Use structured logging without including user input
      console.error('Invalid file paths detected', { 
        count: invalidPaths.length,
        sandboxId 
      })
      return NextResponse.json(
        { error: 'Invalid file paths provided' },
        { status: 400 }
      )
    }

    const sandbox = await Sandbox.get({ sandboxId })

    // Create ZIP archive
    const zip = new JSZip()

    // Add each file to the ZIP
    for (const filePath of files) {
      try {
        const sanitizedPath = sanitizeFilePath(filePath)
        const stream = await sandbox.readFile({ path: sanitizedPath })
        if (!stream) {
          // Structured logging without unsanitized user input
          console.warn('File not found in sandbox', { 
            sandboxId,
            pathLength: filePath.length 
          })
          continue
        }

        const chunks: (Uint8Array | string | Buffer)[] = []

        for await (const chunk of stream) {
          chunks.push(chunk)
        }

        const content = Buffer.concat(chunks.map(chunk =>
          typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk
        ))
        // Preserve directory structure in ZIP using sanitized path
        zip.file(sanitizedPath, content)
      } catch (error) {
        // Structured logging without unsanitized user input
        console.warn('Failed to read file from sandbox', { 
          sandboxId,
          pathLength: filePath.length,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        })
        // Continue with other files rather than failing the whole download
      }
    }

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })

    // Return ZIP file with appropriate headers
    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="code-homie-project.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    })

  } catch (error) {
    const richError = getRichError({
      action: 'Creating download ZIP',
      args: { sandboxId },
      error,
    })

    console.error('Download error:', richError.error)
    return NextResponse.json(
      { error: 'Failed to create download' },
      { status: 500 }
    )
  }
}
