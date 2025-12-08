import { usePageStore } from '../../AppV1'

export function WebsiteSettings({ websiteId }: { websiteId: string }) {
  const { websites, updateWebsite } = usePageStore()
  const website = websites.find(w => w.id === websiteId)
  
  if (!website) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Not Found</h3>
        <p className="text-gray-600">Could not find website with ID: {websiteId}</p>
      </div>
    )
  }

  const handlePurposeUpdate = (field: string, value: any) => {
    const updatedWebsite = {
      ...website,
      purpose: {
        contentTypes: [],
        hasSubjectOrganization: false,
        publishingTypes: [],
        ...website.purpose,
        [field]: value
      },
      updatedAt: new Date()
    }
    updateWebsite(website.id, updatedWebsite)
  }

  const handleContentTypeToggle = (contentType: string) => {
    const currentTypes = website.purpose?.contentTypes || []
    const newTypes = currentTypes.includes(contentType)
      ? currentTypes.filter(type => type !== contentType)
      : [...currentTypes, contentType]
    
    handlePurposeUpdate('contentTypes', newTypes)
  }



  const handleBasicUpdate = (field: string, value: any) => {
    const updatedWebsite = {
      ...website,
      [field]: value,
      updatedAt: new Date()
    }
    updateWebsite(website.id, updatedWebsite)
  }

  const contentTypes = [
    { id: 'journals', label: 'Journals', description: 'Academic journals and research publications' },
    { id: 'books', label: 'Books', description: 'eBooks, textbooks, monographs, and reference works' },
    { id: 'conferences', label: 'Conference Proceedings', description: 'Conference papers, abstracts, and presentations' },
    { id: 'magazines', label: 'Magazines', description: 'Popular magazines and trade publications' },
    { id: 'newsletters', label: 'Newsletters', description: 'Periodic newsletters and bulletins' },
    { id: 'reports', label: 'Reports', description: 'Technical reports and white papers' }
  ]

  const websiteTypes = [
    { id: 'single-journal', label: 'Single Journal Website', description: 'Dedicated site for one specific journal' },
    { id: 'journal-hub', label: 'Hub of Journals', description: 'Portal hosting multiple related journals' },
    { id: 'digital-library', label: 'Digital Library', description: 'Comprehensive library of journals, books, and resources' },
    { id: 'publisher-portal', label: 'Publisher Portal', description: 'Main website for a publishing organization' },
    { id: 'conference-site', label: 'Conference Website', description: 'Dedicated site for conference proceedings and events' }
  ]

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website Name</label>
            <input
              type="text"
              value={website.name}
              onChange={(e) => handleBasicUpdate('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
            <input
              type="url"
              value={website.domain}
              onChange={(e) => handleBasicUpdate('domain', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={website.status}
            onChange={(e) => handleBasicUpdate('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="staging">Staging</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Website Purpose Configuration */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Purpose & Content Types</h3>
        <p className="text-gray-600 mb-6">Define what type of content this website publishes and how it should be organized.</p>
        
        {/* Website Type Selection */}
        <div className="mb-8">
          <h4 className="text-base font-medium text-gray-900 mb-4">Website Type</h4>
          <p className="text-sm text-gray-600 mb-4">Choose the primary purpose and structure of this website:</p>
          <div className="space-y-3">
            {websiteTypes.map((type) => (
              <label key={type.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`website-type-${website.id}`}
                  checked={website.purpose?.publishingTypes?.includes(type.id) || false}
                  onChange={() => {
                    // For radio buttons, set only this type
                    handlePurposeUpdate('publishingTypes', [type.id])
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
            </div>
              </label>
            ))}
          </div>
        </div>

        {/* Content Types */}
        <div className="mb-8">
          <h4 className="text-base font-medium text-gray-900 mb-4">Content Types Published</h4>
          <p className="text-sm text-gray-600 mb-4">Select all types of content that will be published on this website:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contentTypes.map((contentType) => (
              <label key={contentType.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={website.purpose?.contentTypes?.includes(contentType.id) || false}
                  onChange={() => handleContentTypeToggle(contentType.id)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{contentType.label}</div>
                  <div className="text-xs text-gray-600">{contentType.description}</div>
          </div>
              </label>
            ))}
        </div>
    </div>

        {/* Subject Organization */}
        <div className="mb-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">Content Organization</h4>
          <div className="space-y-3">
            <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={`subject-org-${website.id}`}
                checked={website.purpose?.hasSubjectOrganization === true}
                onChange={() => handlePurposeUpdate('hasSubjectOrganization', true)}
                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Enable Subject-Based Organization</div>
                <div className="text-sm text-gray-600">Content organized by subject areas, categories, and taxonomy with advanced filtering</div>
              </div>
            </label>
            <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={`subject-org-${website.id}`}
                checked={website.purpose?.hasSubjectOrganization === false}
                onChange={() => handlePurposeUpdate('hasSubjectOrganization', false)}
                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Simple Organization</div>
                <div className="text-sm text-gray-600">Basic content organization without subject-based categorization</div>
              </div>
            </label>
          </div>
        </div>
      </div>


      {/* Current Configuration Summary */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Current Configuration Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Website Type:</span>
            <span className="text-blue-700 ml-2">
              {website.purpose?.publishingTypes?.length 
                ? websiteTypes.find(t => website.purpose?.publishingTypes?.includes(t.id))?.label || 'Not specified'
                : 'Not specified'
              }
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Content Types:</span>
            <span className="text-blue-700 ml-2">
              {website.purpose?.contentTypes?.length 
                ? website.purpose.contentTypes.map(type => 
                    contentTypes.find(ct => ct.id === type)?.label || type
                  ).join(', ')
                : 'Not specified'
              }
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Subject Organization:</span>
            <span className="text-blue-700 ml-2">
              {website.purpose?.hasSubjectOrganization ? 'Enabled' : 'Simple'}
            </span>
        </div>
          <div>
            <span className="font-medium text-blue-800">Status:</span>
            <span className="text-blue-700 ml-2 capitalize">{website.status}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Theme Deviation:</span>
            <span className="text-blue-700 ml-2">{website.deviationScore}%</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Last Updated:</span>
            <span className="text-blue-700 ml-2">{website.updatedAt.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      {/* Site Layout Settings */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Site Layout</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure global header and footer that appear on all pages. Individual pages can override these settings.
        </p>
        
        <div className="space-y-4">
          {/* Header Settings */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Global Header</h4>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(website as any)?.siteLayout?.headerEnabled !== false}
                  onChange={(e) => {
                    const siteLayout = (website as any)?.siteLayout || {}
                    updateWebsite(website.id, {
                      ...website,
                      siteLayout: { ...siteLayout, headerEnabled: e.target.checked },
                      updatedAt: new Date()
                    })
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-gray-700">Enable header</span>
              </label>
            </div>
            <div className="text-sm text-gray-600">
              {(website as any)?.siteLayout?.header?.length > 0 ? (
                <span className="text-green-600">✓ Custom header configured ({(website as any).siteLayout.header.length} section{(website as any).siteLayout.header.length > 1 ? 's' : ''})</span>
              ) : (
                <span className="text-gray-500">Using default header</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              To customize: Add a Header section in the Page Builder, then save it to this website's Site Layout.
            </p>
          </div>
          
          {/* Footer Settings */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Global Footer</h4>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(website as any)?.siteLayout?.footerEnabled !== false}
                  onChange={(e) => {
                    const siteLayout = (website as any)?.siteLayout || {}
                    updateWebsite(website.id, {
                      ...website,
                      siteLayout: { ...siteLayout, footerEnabled: e.target.checked },
                      updatedAt: new Date()
                    })
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-gray-700">Enable footer</span>
              </label>
            </div>
            <div className="text-sm text-gray-600">
              {(website as any)?.siteLayout?.footer?.length > 0 ? (
                <span className="text-green-600">✓ Custom footer configured ({(website as any).siteLayout.footer.length} section{(website as any).siteLayout.footer.length > 1 ? 's' : ''})</span>
              ) : (
                <span className="text-gray-500">Using default footer</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              To customize: Add a Footer section in the Page Builder, then save it to this website's Site Layout.
            </p>
          </div>
          
          {/* Page Overrides Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Page-Level Overrides</h4>
            <p className="text-sm text-blue-800">
              Individual pages can override the global header/footer:
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li><strong>Inherit</strong> - Use the global header/footer (default)</li>
              <li><strong>Hide</strong> - Hide the header/footer on specific pages</li>
              <li><strong>Custom</strong> - Use a different header/footer for specific pages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
