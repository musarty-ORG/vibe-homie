/**
 * Check if admin mode is enabled
 * Admin mode requires both:
 * 1. Environment variable ADMIN_MODE_ENABLED=true
 * 2. Query parameter ?admin=1 in the URL
 */
export function isAdminModeEnabled(searchParams: URLSearchParams): boolean {
  const envEnabled = process.env.ADMIN_MODE_ENABLED === 'true'
  const paramEnabled = searchParams.get('admin') === '1'
  
  return envEnabled && paramEnabled
}
