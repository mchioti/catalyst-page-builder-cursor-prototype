/**
 * V2 Preview - Preview draft changes before publishing
 */

export function Preview() {
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              P
            </div>
            <div>
              <div className="font-semibold text-amber-900">Preview Mode</div>
              <div className="text-xs text-amber-700">Viewing unpublished changes</div>
            </div>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
            Publish Changes
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm min-h-96">
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-4">🚧 Preview Mode Coming Soon</p>
            <p className="text-sm">
              See how your changes will look before publishing. 
              Track what's changed from the live version.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

