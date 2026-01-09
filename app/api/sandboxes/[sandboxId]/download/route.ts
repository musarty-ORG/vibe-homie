import { NextResponse, type NextRequest } from 'next/server'
import { Sandbox } from '@vercel/sandbox'
import { getRichError } from '@/ai/tools/get-rich-error'
import JSZip from 'jszip'

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

    const sandbox = await Sandbox.get({ sandboxId })

    // Create ZIP archive
    const zip = new JSZip()

    // Add each file to the ZIP
    for (const filePath of files) {
      try {
        const stream = await sandbox.readFile({ path: filePath })
        if (!stream) {
          console.warn(`File not found: ${filePath}`)
          continue
        }

        const chunks: (Uint8Array | string | Buffer)[] = []

        for await (const chunk of stream) {
          chunks.push(chunk)
        }

        const content = Buffer.concat(chunks.map(chunk =>
          typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk
        ))
        // Preserve directory structure in ZIP
        zip.file(filePath, content)
      } catch (error) {
        console.warn(`Failed to read file ${filePath}:`, error)
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
