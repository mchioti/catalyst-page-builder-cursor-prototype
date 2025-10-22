import React from 'react';
import { Settings, Palette, BookOpen, Newspaper, Globe, Plus, Edit, Trash2 } from 'lucide-react';
import { useBrandingStore } from '../../stores/brandingStore';
import { BrandItemEditor } from './BrandItemEditor';
import type { SubjectBranding, JournalBranding, BookSeriesBranding } from '../../types/branding';

export const ThemeManager: React.FC = () => {
  const {
    branding,
    themeManager,
    setActiveTab,
    setEditingItem,
    updateWebsiteBranding,
    addSubject,
    updateSubject,
    deleteSubject,
    addJournal,
    updateJournal,
    deleteJournal,
    addBookSeries,
    updateBookSeries,
    deleteBookSeries
  } = useBrandingStore();

  const tabs = [
    { id: 'website' as const, label: 'Website', icon: Globe, description: 'Base website branding' },
    { id: 'subjects' as const, label: 'Subjects', icon: Palette, description: 'Subject category themes' },
    { id: 'journals' as const, label: 'Journals', icon: Newspaper, description: 'Journal-specific branding' },
    { id: 'bookSeries' as const, label: 'Book Series', icon: BookOpen, description: 'Book series themes' }
  ];

  const handleItemEdit = (item: SubjectBranding | JournalBranding | BookSeriesBranding) => {
    if (themeManager.activeTab === 'subjects') {
      updateSubject(item.id, item);
    } else if (themeManager.activeTab === 'journals') {
      updateJournal(item.id, item);
    } else if (themeManager.activeTab === 'bookSeries') {
      updateBookSeries(item.id, item);
    }
    setEditingItem(null);
  };

  const handleItemDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this branding theme?')) {
      if (themeManager.activeTab === 'subjects') {
        deleteSubject(id);
      } else if (themeManager.activeTab === 'journals') {
        deleteJournal(id);
      } else if (themeManager.activeTab === 'bookSeries') {
        deleteBookSeries(id);
      }
      setEditingItem(null);
    }
  };

  const renderWebsiteTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Website Base Branding
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          These colors serve as the fallback branding when no specific subject, journal, or series branding applies.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(branding.website.colors).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: value }}
              />
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">{key}</p>
                <p className="text-xs text-gray-500 font-mono">{value}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <button
            onClick={() => setEditingItem('website')}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Website Colors
          </button>
        </div>
      </div>
    </div>
  );

  const renderItemsList = (
    items: (SubjectBranding | JournalBranding | BookSeriesBranding)[],
    type: 'subjects' | 'journals' | 'bookSeries'
  ) => (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Icon for subjects */}
              {type === 'subjects' && 'icon' in item && (
                <span className="text-2xl">{item.icon}</span>
              )}
              
              {/* Color indicator */}
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: item.colors.primary }}
              />
              
              <div>
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                {item.description && (
                  <p className="text-sm text-gray-500">{item.description}</p>
                )}
                {'publisher' in item && item.publisher && (
                  <p className="text-xs text-gray-400">Publisher: {item.publisher}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingItem(item.id)}
                className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleItemDelete(item.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No {type} configured yet.</p>
          <p className="text-sm">Click "Add New" to create your first theme.</p>
        </div>
      )}
    </div>
  );

  const renderItemsTab = (type: 'subjects' | 'journals' | 'bookSeries') => {
    const items = branding[type];
    const labels = {
      subjects: { singular: 'Subject', plural: 'Subjects' },
      journals: { singular: 'Journal', plural: 'Journals' },
      bookSeries: { singular: 'Book Series', plural: 'Book Series' }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {labels[type].plural} ({items.length})
            </h3>
            <p className="text-sm text-gray-600">
              Manage branding for {type === 'subjects' ? 'subject categories' : type}
            </p>
          </div>
          
          <button
            onClick={() => setEditingItem('new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New {labels[type].singular}
          </button>
        </div>
        
        {renderItemsList(items, type)}
      </div>
    );
  };

  // Handle editing
  if (themeManager.editingItem) {
    if (themeManager.editingItem === 'website') {
      // Website branding editor would go here (simplified for now)
      return (
        <div className="p-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Edit Website Branding</h3>
            <p className="text-gray-600 mb-4">Website branding editor coming soon...</p>
            <button
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </div>
      );
    }
    
    if (themeManager.editingItem === 'new') {
      // New item creation would go here
      return (
        <div className="p-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
            <p className="text-gray-600 mb-4">New item creation coming soon...</p>
            <button
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </div>
      );
    }
    
    // Edit existing item
    const activeItems = branding[themeManager.activeTab === 'subjects' ? 'subjects' : 
                              themeManager.activeTab === 'journals' ? 'journals' : 'bookSeries'];
    const item = activeItems.find(i => i.id === themeManager.editingItem);
    
    if (item) {
      return (
        <div className="p-6">
          <BrandItemEditor
            item={item}
            onSave={handleItemEdit}
            onCancel={() => setEditingItem(null)}
            onDelete={handleItemDelete}
          />
        </div>
      );
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Branding System</h1>
            <p className="text-sm text-gray-600">
              Manage website, subject, journal, and book series branding
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    themeManager.activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {themeManager.activeTab === 'website' && renderWebsiteTab()}
        {themeManager.activeTab === 'subjects' && renderItemsTab('subjects')}
        {themeManager.activeTab === 'journals' && renderItemsTab('journals')}
        {themeManager.activeTab === 'bookSeries' && renderItemsTab('bookSeries')}
      </div>
    </div>
  );
};
