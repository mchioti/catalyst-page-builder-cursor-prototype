/**
 * V2 Design Console - Manage websites, shared sections, themes
 */

import { SharedSectionsList } from './SharedSectionsList'

export function DesignConsole() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <SharedSectionsList />
      </div>
    </div>
  )
}

