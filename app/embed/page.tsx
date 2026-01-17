import { Chat } from '../chat'
import { Horizontal } from '@/components/layout/panels'
import { PreviewCodeTabs } from '@/components/preview-code-tabs'
import { Welcome } from '@/components/modals/welcome'
import { cookies } from 'next/headers'
import { getHorizontal } from '@/components/layout/sizing'
import { hideBanner } from '@/app/actions'

export default async function EmbedPage() {
  const store = await cookies()
  const banner = store.get('banner-hidden')?.value !== 'true'
  const horizontalSizes = getHorizontal(store)
  
  return (
    <>
      <Welcome defaultOpen={banner} onDismissAction={hideBanner} />
      {/* Full-bleed layout for embedding - no outer padding, no header */}
      <div className="flex flex-col h-screen max-h-screen w-screen overflow-hidden">
        <div className="flex-1 w-full min-h-0 overflow-hidden">
          <Horizontal
            defaultLayout={horizontalSizes ?? [50, 50]}
            left={<Chat className="flex-1 overflow-hidden" />}
            right={<PreviewCodeTabs className="flex-1 overflow-hidden" />}
          />
        </div>
      </div>
    </>
  )
}
