export const GLOBAL_HEADER_SELECTION_ID = '__global_region_header__'
export const GLOBAL_FOOTER_SELECTION_ID = '__global_region_footer__'

export type GlobalRegionSelection = 'header' | 'footer'

export function getGlobalRegionSelectionId(type: GlobalRegionSelection) {
  return type === 'header' ? GLOBAL_HEADER_SELECTION_ID : GLOBAL_FOOTER_SELECTION_ID
}

export function isGlobalRegionSelectionId(id: string | null | undefined): id is string {
  return id === GLOBAL_HEADER_SELECTION_ID || id === GLOBAL_FOOTER_SELECTION_ID
}

export function getGlobalRegionTypeFromSelectionId(id: string): GlobalRegionSelection | null {
  if (id === GLOBAL_HEADER_SELECTION_ID) return 'header'
  if (id === GLOBAL_FOOTER_SELECTION_ID) return 'footer'
  return null
}

