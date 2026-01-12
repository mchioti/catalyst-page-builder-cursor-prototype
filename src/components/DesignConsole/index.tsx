import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Settings, 
  Palette, 
  LayoutTemplate,
  FilePlus2,
  Newspaper,
  ChevronDown, 
  Globe, 
  Layers, 
  Plus,
  ArrowLeft,
  Cog
} from 'lucide-react'
import type { DesignConsoleView } from '../../types'
import { usePageStore } from '../../AppV1'
import { usePrototypeStore } from '../../stores/prototypeStore'
import { SiteManagerTemplates } from '../SiteManager/SiteManagerTemplates'
import { PublicationCards } from '../SiteManager/PublicationCards'
import { ThemeEditor } from '../SiteManager/ThemeEditor'
import { WebsiteTemplates } from '../SiteManager/WebsiteTemplates'
import { WebsiteInheritedStubs } from '../SiteManager/WebsiteInheritedStubs'
import { WebsiteBrandingConfiguration } from '../SiteManager/WebsiteBrandingConfiguration'
import { WebsiteCreationWizard } from '../Wizards/WebsiteCreation'
import { ALL_TEMPLATES } from '../SiteManager/SiteManagerTemplates'
import AllDesigns from './AllDesigns'
import { SiteManagerWebsites } from '../SiteManager/SiteManagerWebsites'
import { WebsiteSettings } from '../SiteManager/WebsiteSettings'
import { ThemePublicationCards } from '../SiteManager/ThemePublicationCards'
import { EscapeHatch } from '../PrototypeControls/EscapeHatch'

// Theme preview images
const themePreviewImages = {
  'classic-ux3-theme': '/theme-previews/classic-ux3-ds.png',
  'wiley-figma-ds-v2': '/theme-previews/wiley-ds.png',
  'ibm-carbon-ds': '/theme-previews/ibm-carbon-ds.png',
  'ant-design': '/theme-previews/ant-ds.png'
}

export function DesignConsole() {
  const { setCurrentView, setSiteManagerView, siteManagerView, themes, websites } = usePageStore()
  const { consoleMode, drawerOpen } = usePrototypeStore()
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(new Set(['modernist-theme'])) // Default expand modernist theme
  const [expandedWebsites, setExpandedWebsites] = useState<Set<string>>(new Set(['catalyst-demo'])) // Default expand catalyst-demo

  // Filter websites based on console mode (controlled by Escape Hatch)
  const displayedWebsites = consoleMode === 'single' 
    ? websites.filter(w => w.id === 'febs-press') // Single website example
    : websites // Show all websites for multi-website publisher

  const toggleTheme = (themeId: string) => {
    const newExpanded = new Set(expandedThemes)
    if (newExpanded.has(themeId)) {
      newExpanded.delete(themeId)
    } else {
      newExpanded.add(themeId)
    }
    setExpandedThemes(newExpanded)
  }

  const isThemeExpanded = (themeId: string) => expandedThemes.has(themeId)

  const toggleWebsite = (websiteId: string) => {
    const newExpanded = new Set(expandedWebsites)
    if (newExpanded.has(websiteId)) {
      newExpanded.delete(websiteId)
    } else {
      newExpanded.add(websiteId)
    }
    setExpandedWebsites(newExpanded)
  }

  const isWebsiteExpanded = (websiteId: string) => expandedWebsites.has(websiteId)
  
  return (
    <div 
      className="min-h-screen bg-slate-50 transition-all duration-300 ease-in-out"
      style={{ marginRight: drawerOpen ? '288px' : '0' }}
    >
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('page-builder')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Page Builder
            </button>
            <h1 className="text-xl font-semibold text-slate-800">Design Console</h1>
            {/* Console Mode moved to Prototype Controls panel (bottom) */}
            </div>
          <div className="flex items-center gap-3">
            <Link
              to="/v1/mock"
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-md hover:bg-amber-200 text-sm font-medium"
              title="View old Mock Live Site (ADVMA/EMBO) for reference"
            >
              📦 Legacy Preview
            </Link>
          </div>
                  </div>
                </div>

      <div className="flex h-[calc(100vh-73px)]">
        <div className="w-64 bg-slate-100 shadow-sm border-r border-slate-200">
          <nav className="p-4">
            <button
              onClick={() => setSiteManagerView('create-website')}
              className="flex items-center gap-3 w-full px-4 py-3 mb-4 text-left text-sm font-medium rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Website
            </button>

            <div className="mb-3">
              <button
                onClick={() => setSiteManagerView('websites')}
                className={`flex items-center gap-3 w-full px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide rounded-md transition-colors ${
                  siteManagerView === 'websites'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'
                }`}
              >
                Websites
              </button>
            </div>
            <div className="space-y-1">
              {displayedWebsites.map((website) => (
                <div key={website.id}>
                  <button
                    onClick={() => toggleWebsite(website.id)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left text-sm rounded-md transition-colors text-gray-700 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span className="font-medium">{website.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      isWebsiteExpanded(website.id) ? 'transform rotate-180' : ''
                    }`} />
                  </button>

                  {isWebsiteExpanded(website.id) && (
                    <div className="ml-6 mt-1 space-y-1">
                      <button
                        onClick={() => setSiteManagerView(`${website.id}-settings` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${website.id}-settings`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        Website Settings
                      </button>

                      <button
                        onClick={() => setSiteManagerView(`${website.id}-branding` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${website.id}-branding`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Palette className="w-4 h-4" />
                        Branding Configuration
                      </button>

                      <button
                        onClick={() => setSiteManagerView(`${website.id}-publication-cards` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${website.id}-publication-cards`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Newspaper className="w-4 h-4" />
                        Publication Cards
                      </button>

                      <button
                        onClick={() => setSiteManagerView(`${website.id}-templates` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${website.id}-templates`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <LayoutTemplate className="w-4 h-4" />
                        Data-driven Pages
                      </button>

                      <button
                        onClick={() => setSiteManagerView(`${website.id}-custom-templates` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${website.id}-custom-templates`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <FilePlus2 className="w-4 h-4" />
                        Other Pages
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
                  
            <div className="mt-6 mb-3">
              <button
                onClick={() => setSiteManagerView('designs')}
                className={`flex items-center gap-3 w-full px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide rounded-md transition-colors ${
                  siteManagerView === 'designs'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'
                }`}
              >
                Designs
              </button>
            </div>
            <div className="space-y-1">
              {themes.map((theme) => (
                <div key={theme.id}>
                  <button
                    onClick={() => toggleTheme(theme.id)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left text-sm rounded-md transition-colors text-gray-700 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      <span className="font-medium">{theme.name}</span>
          </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      isThemeExpanded(theme.id) ? 'transform rotate-180' : ''
                    }`} />
                  </button>

                  {isThemeExpanded(theme.id) && (
                    <div className="ml-6 mt-1 space-y-1">
                      <button
                        onClick={() => setSiteManagerView(`${theme.id}-theme-settings` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${theme.id}-theme-settings`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        Design Settings
                      </button>
                      
                      <button
                        onClick={() => setSiteManagerView(`${theme.id}-publication-cards` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${theme.id}-publication-cards`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Newspaper className="w-4 h-4" />
                        Publication Cards
                      </button>
                      
                      <button
                        onClick={() => setSiteManagerView(`${theme.id}-template-library` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${theme.id}-template-library`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <LayoutTemplate className="w-4 h-4" />
                        Data-driven Pages
                      </button>
                      <button
                        onClick={() => setSiteManagerView(`${theme.id}-starter-library` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${theme.id}-starter-library`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <FilePlus2 className="w-4 h-4" />
                        Other Pages
                      </button>
                      <button
                        onClick={() => setSiteManagerView(`${theme.id}-section-library` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${theme.id}-section-library`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                        Section Library
                      </button>
                        </div>
                  )}
                      </div>
                    ))}
                  </div>
                  
            <div className="mt-6 mb-3">
              <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                System
                          </div>
                        </div>
            <div className="space-y-1">
              <button
                onClick={() => setSiteManagerView('settings')}
                className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                  siteManagerView === 'settings'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Cog className="w-5 h-5" />
                Settings
              </button>
                          </div>
          </nav>
                        </div>

        <div className="flex-1 p-6 bg-slate-50">
          {siteManagerView === 'overview' && (
                        <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Design System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((theme) => (
                  <div key={theme.id} className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{theme.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{theme.description}</p>
                    <div className="space-y-2">
                      <button 
                        onClick={() => setSiteManagerView(`${theme.id}-theme-settings` as DesignConsoleView)}
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Design Settings →
                      </button>
                      <button 
                        onClick={() => setSiteManagerView(`${theme.id}-publication-cards` as DesignConsoleView)}
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Publication Cards →
                      </button>
                      <button 
                        onClick={() => setSiteManagerView(`${theme.id}-template-library` as DesignConsoleView)}
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Data-driven Pages →
                      </button>
                        </div>
                  </div>
                ))}
                {websites.slice(0, 3).map((website) => (
                  <div key={website.id} className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{website.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {website.purpose?.contentTypes.join(', ') || 'Legacy setup'}
                      {website.purpose?.hasSubjectOrganization ? ' • Taxonomy enabled' : ' • Simple organization'}
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSiteManagerView(`${website.id}-settings` as DesignConsoleView)}
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Website Settings →
                      </button>
                      <button
                        onClick={() => setSiteManagerView(`${website.id}-branding` as DesignConsoleView)}
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Branding Configuration →
                      </button>
                      <button
                        onClick={() => setSiteManagerView(`${website.id}-templates` as DesignConsoleView)}
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Data-driven Pages →
                      </button>
                      <button
                        onClick={() => setSiteManagerView(`${website.id}-publication-cards` as DesignConsoleView)}
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Publication Cards →
                      </button>
                      <button
                        onClick={() => setSiteManagerView(`${website.id}-custom-templates` as DesignConsoleView)}
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Other Pages →
                      </button>
                    </div>
                  </div>
                ))}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">All Websites</h3>
                  <p className="text-gray-600 text-sm mb-4">Manage all {displayedWebsites.length} websites and track modifications</p>
                  <button 
                    onClick={() => setSiteManagerView('websites')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All Websites →
                  </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
          {siteManagerView === 'modernist-theme-theme-settings' && (
                  <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Modern Design - Settings</h2>
                <p className="text-slate-600 mt-1">Configure clean, minimalist design with sans-serif fonts, generous white space, and vibrant accents</p>
                      </div>
              <ThemeEditor usePageStore={usePageStore} themeId="modernist-theme" />
                      </div>
          )}
          {siteManagerView === 'modernist-theme-publication-cards' && (
                      <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Modern Design - Publication Cards</h2>
                <p className="text-slate-600 mt-1">Predefined publication card designs with clean, minimalist styling and vibrant accents</p>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 text-sm font-medium">📖 Reference Cards</p>
                  <p className="text-blue-600 text-sm mt-1">These are the out-of-the-box publication cards that come with the Modern design. Websites using this design can customize these cards in their individual Publication Cards settings.</p>
                      </div>
                      </div>
              <ThemePublicationCards themeId="modernist-theme" />
                    </div>
          )}
          {siteManagerView === 'modernist-theme-templates' && (
            <SiteManagerTemplates themeId="modernist-theme" usePageStore={usePageStore} />
          )}
            
          {siteManagerView === 'wiley-main-settings' && (
                      <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Wiley Online Library - Website Settings</h2>
                <p className="text-slate-600 mt-1">Configure domain, purpose, and website-specific settings</p>
                      </div>
              <WebsiteSettings websiteId="wiley-main" />
                      </div>
          )}
          {siteManagerView === 'wiley-main-branding' && (
            <WebsiteBrandingConfiguration websiteId="wiley-main" usePageStore={usePageStore} />
          )}
          {siteManagerView === 'wiley-main-templates' && (
            <WebsiteTemplates
              websiteId="wiley-main"
              websiteName="Wiley Online Library"
              enabledContentTypes={['journals', 'books']}
              hasSubjectOrganization={true}
              allTemplates={ALL_TEMPLATES}
              usePageStore={usePageStore}
              consoleMode={consoleMode}
            />
          )}
          {siteManagerView === 'wiley-main-publication-cards' && (
                      <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Wiley Online Library - Publication Cards</h2>
                <p className="text-slate-600 mt-1">Design publication cards optimized for journals and books with taxonomy features</p>
                      </div>
              <PublicationCards usePageStore={usePageStore} />
                      </div>
          )}
          {siteManagerView === 'wiley-main-custom-templates' && (
            <WebsiteInheritedStubs
              websiteId="wiley-main"
              websiteName="Wiley Online Library"
              usePageStore={usePageStore}
            />
          )}

          {siteManagerView === 'journal-of-science-settings' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Journal of Advanced Science - Website Settings</h2>
                <p className="text-slate-600 mt-1">Configure domain, purpose, and website-specific settings</p>
          </div>
              <WebsiteSettings websiteId="journal-of-science" />
        </div>
          )}
          {siteManagerView === 'journal-of-science-branding' && (
            <WebsiteBrandingConfiguration websiteId="journal-of-science" usePageStore={usePageStore} />
          )}
          {siteManagerView === 'journal-of-science-templates' && (
            <WebsiteTemplates
              websiteId="journal-of-science"
              websiteName="Journal of Advanced Science"
              enabledContentTypes={['journals']}
              hasSubjectOrganization={true}
              allTemplates={ALL_TEMPLATES}
              usePageStore={usePageStore}
              consoleMode={consoleMode}
            />
          )}
          {siteManagerView === 'journal-of-science-publication-cards' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Journal of Advanced Science - Publication Cards</h2>
                <p className="text-slate-600 mt-1">Design publication cards optimized for scientific journals and conferences with taxonomy features</p>
      </div>
              <PublicationCards usePageStore={usePageStore} />
        </div>
          )}
          {siteManagerView === 'journal-of-science-custom-templates' && (
            <WebsiteInheritedStubs
              websiteId="journal-of-science"
              websiteName="Journal of Advanced Science"
              usePageStore={usePageStore}
            />
          )}


          {siteManagerView === 'create-website' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Website</h2>
                <p className="text-gray-600 mt-1">Follow the steps below to configure your new publishing website</p>
              </div>
              <WebsiteCreationWizard 
                onComplete={(website) => {
                  // After wizard completion, navigate to the new website's settings
                  setSiteManagerView(`${website.id}-settings` as DesignConsoleView)
                }}
                onCancel={() => setSiteManagerView('websites')}
                usePageStore={usePageStore}
                themePreviewImages={themePreviewImages}
              />
            </div>
          )}

          {siteManagerView === 'websites' && <SiteManagerWebsites />}
          
          {siteManagerView === 'designs' && <AllDesigns />}
          
          {siteManagerView === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
              <p className="text-gray-600">Global system configuration - Coming soon</p>
            </div>
          )}
          
          {/* Dynamic fallback for any theme settings not explicitly handled */}
          {siteManagerView.endsWith('-theme-settings') && 
           !['modernist-theme-theme-settings'].includes(siteManagerView) && (
            (() => {
              const themeId = siteManagerView.replace('-theme-settings', '')
              const theme = themes.find(t => t.id === themeId)
              return theme ? (
                <div>
                  <div className="mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-slate-800">{theme.name} Theme - Settings</h2>
                    <p className="text-slate-600 mt-1">{theme.description}</p>
                  </div>
                  <ThemeEditor usePageStore={usePageStore} themeId={themeId} />
                </div>
              ) : null
            })()
          )}
          
          {/* Dynamic fallback for any theme publication cards not explicitly handled */}
          {siteManagerView.endsWith('-publication-cards') && siteManagerView.includes('-theme-') &&
           !['modernist-theme-publication-cards'].includes(siteManagerView) && (
            (() => {
              const themeId = siteManagerView.replace('-publication-cards', '')
              const theme = themes.find(t => t.id === themeId)
              return theme ? (
                <div>
                  <div className="mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-slate-800">{theme.name} Theme - Publication Cards</h2>
                    <p className="text-slate-600 mt-1">Predefined publication card designs for this theme</p>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-700 text-sm font-medium">📖 Reference Cards</p>
                      <p className="text-blue-600 text-sm mt-1">These are the out-of-the-box publication cards that come with the {theme.name} theme. Websites using this theme can customize these cards in their individual Publication Cards settings.</p>
                    </div>
                  </div>
                  <ThemePublicationCards themeId={themeId} />
                </div>
              ) : null
            })()
          )}
          
          {/* Dynamic handler for Page Library (Publication pages only) */}
          {siteManagerView.endsWith('-template-library') && (
            (() => {
              const themeId = siteManagerView.replace('-template-library', '')
              const theme = themes.find(t => t.id === themeId)
              return theme ? (
                <SiteManagerTemplates themeId={themeId} usePageStore={usePageStore} libraryType="templates" />
              ) : null
            })()
          )}
          
          {/* Dynamic handler for Stub Library (Website + Supporting pages merged) */}
          {siteManagerView.endsWith('-starter-library') && (
            (() => {
              const themeId = siteManagerView.replace('-starter-library', '')
              const theme = themes.find(t => t.id === themeId)
              return theme ? (
                <SiteManagerTemplates themeId={themeId} usePageStore={usePageStore} libraryType="starters" />
              ) : null
            })()
          )}
          
          {/* Dynamic handler for Section Library (Global + Content sections) */}
          {siteManagerView.endsWith('-section-library') && (
            (() => {
              const themeId = siteManagerView.replace('-section-library', '')
              const theme = themes.find(t => t.id === themeId)
              return theme ? (
                <SiteManagerTemplates themeId={themeId} usePageStore={usePageStore} libraryType="sections" />
              ) : null
            })()
          )}
          
          {/* Dynamic fallback for any website settings not explicitly handled */}
          {siteManagerView.endsWith('-settings') && !siteManagerView.endsWith('-theme-settings') &&
           !['wiley-main-settings', 'journal-of-science-settings'].includes(siteManagerView) && (
            (() => {
              const websiteId = siteManagerView.replace('-settings', '')
              const website = websites.find(w => w.id === websiteId)
              return website ? (
                <div>
                  <div className="mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-slate-800">{website.name} - Website Settings</h2>
                    <p className="text-slate-600 mt-1">Configure domain, purpose, and website-specific settings</p>
                  </div>
                  <WebsiteSettings websiteId={websiteId} />
                </div>
              ) : null
            })()
          )}
          
          {/* Dynamic fallback for any website branding not explicitly handled */}
          {siteManagerView.endsWith('-branding') &&
           !['wiley-main-branding', 'research-hub-branding', 'journal-of-science-branding'].includes(siteManagerView) && (
            (() => {
              const websiteId = siteManagerView.replace('-branding', '')
              const website = websites.find(w => w.id === websiteId)
              return website ? (
                <WebsiteBrandingConfiguration websiteId={websiteId} usePageStore={usePageStore} />
              ) : null
            })()
          )}
          
          {/* Dynamic fallback for any website templates not explicitly handled */}
          {siteManagerView.endsWith('-templates') && !siteManagerView.endsWith('-custom-templates') && !siteManagerView.endsWith('-theme-templates') &&
           !['wiley-main-templates', 'research-hub-templates', 'journal-of-science-templates'].includes(siteManagerView) && (
            (() => {
              const websiteId = siteManagerView.replace('-templates', '')
              const website = websites.find(w => w.id === websiteId)
              return website ? (
                <WebsiteTemplates
                  websiteId={websiteId}
                  websiteName={website.name}
                  enabledContentTypes={(website.purpose?.contentTypes || []) as any}
                  hasSubjectOrganization={website.purpose?.hasSubjectOrganization || false}
                  allTemplates={ALL_TEMPLATES}
                  usePageStore={usePageStore}
                  consoleMode={consoleMode}
                />
              ) : null
            })()
          )}
          
          {/* Dynamic fallback for any website publication cards not explicitly handled */}
          {siteManagerView.endsWith('-publication-cards') && !siteManagerView.includes('-theme-') &&
           !['wiley-main-publication-cards', 'journal-of-science-publication-cards'].includes(siteManagerView) && (
            (() => {
              const websiteId = siteManagerView.replace('-publication-cards', '')
              const website = websites.find(w => w.id === websiteId)
              return website ? (
                <div>
                  <div className="mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-slate-800">{website.name} - Publication Cards</h2>
                    <p className="text-slate-600 mt-1">Design publication cards optimized for this website</p>
                  </div>
                  <PublicationCards usePageStore={usePageStore} />
                </div>
              ) : null
            })()
          )}
          
          {/* Dynamic fallback for any website stubs (inherited from design) */}
          {siteManagerView.endsWith('-custom-templates') &&
           !['wiley-main-custom-templates', 'journal-of-science-custom-templates'].includes(siteManagerView) && (
            (() => {
              const websiteId = siteManagerView.replace('-custom-templates', '')
              const website = websites.find(w => w.id === websiteId)
              return website ? (
                <WebsiteInheritedStubs
                  websiteId={website.id}
                  websiteName={website.name}
                  usePageStore={usePageStore}
                />
              ) : null
            })()
          )}
        </div>
      </div>
      
      {/* Escape Hatch - Prototype Controls (always available) */}
      <EscapeHatch 
        context="design-console"
        websiteId={displayedWebsites[0]?.id}
        websiteName={displayedWebsites[0]?.name}
      />
    </div>
  )
}
