/**
 * WebsiteMyTemplates - User-saved page templates
 * 
 * Shows templates saved via "Save as Copy" in the editor.
 * Templates are shared across all websites using the same design.
 */

import { useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Layout, Eye, Edit3, Trash2, Plus, Info, Layers } from 'lucide-react'
import { mockWebsites } from '../../data/mockWebsites'
import type { CustomStarterPage } from '../../types/widgets'

interface WebsiteMyTemplatesProps {
  websiteId: string
  websiteName: string
  usePageStore: any
}

export function WebsiteMyTemplates({ 
  websiteId, 
  websiteName,
  usePageStore 
}: WebsiteMyTemplatesProps) {
  const navigate = useNavigate()
  
  // Get current website's design ID for template filtering
  const v2Website = mockWebsites.find(w => w.id === websiteId)
  const currentDesignId = (v2Website as any)?.themeId || (v2Website as any)?.designId || ''
  const designName = currentDesignId ? currentDesignId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Default'
  
  // Get user-saved templates (CustomStarterPages with source='user')
  // Templates are shared across all websites of the SAME DESIGN
  const customStarterPages: CustomStarterPage[] = usePageStore((state: any) => state.customStarterPages) || []
  const removeCustomStarterPage = usePageStore((state: any) => state.removeCustomStarterPage)
  const setPageCanvas = usePageStore((state: any) => state.setPageCanvas)
  const addNotification = usePageStore((state: any) => state.addNotification)
  
  const userSavedTemplates = useMemo(() => {
    return customStarterPages.filter(page => {
      if (page.source !== 'user') return false
      // Match by design - templates shared across websites of same design
      const templateWebsite = mockWebsites.find(w => w.id === page.websiteId)
      const templateDesignId = (templateWebsite as any)?.themeId || (templateWebsite as any)?.designId || ''
      return templateDesignId === currentDesignId || !templateDesignId
    })
  }, [customStarterPages, currentDesignId])
  
  // Handle delete template
  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    if (!window.confirm(
      `Delete template "${templateName}"?\n\n` +
      `This will permanently remove this template.\n` +
      `Pages synced with this template will keep their current content but lose sync.\n` +
      `This action cannot be undone.`
    )) {
      return
    }
    
    removeCustomStarterPage(templateId)
    
    addNotification?.({
      type: 'success',
      title: 'Template Deleted',
      message: `"${templateName}" has been deleted`
    })
  }
  
  // Handle edit template - opens template in editor
  const handleEditTemplate = (template: CustomStarterPage) => {
    // Save template content to pageCanvas so editor can load it
    setPageCanvas('template', template.id, template.canvasItems)
    
    // Navigate to editor with template context
    navigate(`/edit/template/${template.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{websiteName} - My Page Templates</h2>
            <p className="text-gray-600 mt-1">
              Reusable templates shared across all websites using the <span className="font-medium">{designName}</span> design
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-indigo-900 mb-1">About Page Templates</h4>
          <p className="text-sm text-indigo-700">
            Templates are created using <strong>"Save as Copy"</strong> from the Page Builder editor. 
            They are shared across all websites using the same design, making it easy to maintain consistent page layouts.
            When creating a new page, you can choose to use these templates as either an independent copy or sync with the template for updates.
          </p>
        </div>
      </div>

      {/* Templates List */}
      {userSavedTemplates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
            <Layout className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates saved yet</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Create page templates by editing any page in the Page Builder and clicking "Save as Copy" in the top toolbar.
            Templates can then be reused across all websites using this design.
          </p>
          <Link
            to={`/edit/${websiteId}/`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Open Page Builder
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Template</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Source Website</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sections</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userSavedTemplates.map(template => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                        <Layout className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{template.name}</span>
                        {template.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{template.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">
                      {template.websiteName || template.websiteId}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {template.canvasItems?.length || 0} sections
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Preview */}
                      <Link
                        to={`/preview/template/${template.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Preview template"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {/* Edit */}
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit template"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteTemplate(template.id, template.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Usage Tip */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-2">💡 How to Use Templates</h4>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Go to <strong>Other Pages</strong> and click <strong>+ New Page</strong></li>
          <li>Select <strong>"From Template"</strong> as your starting point</li>
          <li>Choose a template and decide: <strong>Copy</strong> (independent) or <strong>Sync with Master</strong> (inherits updates)</li>
        </ol>
      </div>
    </div>
  )
}

export default WebsiteMyTemplates
