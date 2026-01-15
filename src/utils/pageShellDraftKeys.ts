export const SITE_LAYOUT_HEADER_DRAFT_KEY = 'siteLayout-header'
export const SITE_LAYOUT_FOOTER_DRAFT_KEY = 'siteLayout-footer'

export type PageShellRegion = 'header' | 'footer'

export function getSiteLayoutDraftKey(region: PageShellRegion) {
  return region === 'header' ? SITE_LAYOUT_HEADER_DRAFT_KEY : SITE_LAYOUT_FOOTER_DRAFT_KEY
}

