/**
 * Foundation Button Test Page
 * 
 * Side-by-side comparison of old (theme CSS) buttons vs new (Foundation) buttons
 * to validate the Foundation system implementation.
 */

import React from 'react'
import { Button } from '../../foundation'
import { Download, Send, Plus } from 'lucide-react'

export function FoundationTestPage() {
  const [loading, setLoading] = React.useState(false)
  
  const handleLoadingTest = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }
  
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Atypon Design Foundation - Button Test
          </h1>
          <p className="text-gray-600">
            Comparing old theme-based buttons vs new Foundation buttons.
            All buttons use the same token system under the hood.
          </p>
        </div>

        {/* Test Grid */}
        <div className="space-y-12">
          
          {/* SOLID VARIANT */}
          <Section title="Solid Buttons" description="Filled background, high contrast">
            <ButtonGroup label="Primary (color1)">
              <Button variant="solid" color="primary" size="small">
                Small Button
              </Button>
              <Button variant="solid" color="primary" size="medium">
                Medium Button
              </Button>
              <Button variant="solid" color="primary" size="large">
                Large Button
              </Button>
              <Button variant="solid" color="primary" size="medium" disabled>
                Disabled
              </Button>
            </ButtonGroup>
            
            <ButtonGroup label="Secondary (color2)">
              <Button variant="solid" color="secondary" size="small">
                Small Button
              </Button>
              <Button variant="solid" color="secondary" size="medium">
                Medium Button
              </Button>
              <Button variant="solid" color="secondary" size="large">
                Large Button
              </Button>
            </ButtonGroup>
            
            <ButtonGroup label="Tertiary (color3)">
              <Button variant="solid" color="tertiary" size="small">
                Small Button
              </Button>
              <Button variant="solid" color="tertiary" size="medium">
                Medium Button
              </Button>
              <Button variant="solid" color="tertiary" size="large">
                Large Button
              </Button>
            </ButtonGroup>
          </Section>

          {/* OUTLINE VARIANT */}
          <Section title="Outline Buttons" description="Border only, fills on hover">
            <ButtonGroup label="Primary Outline">
              <Button variant="outline" color="primary" size="small">
                Small Outline
              </Button>
              <Button variant="outline" color="primary" size="medium">
                Medium Outline
              </Button>
              <Button variant="outline" color="primary" size="large">
                Large Outline
              </Button>
              <Button variant="outline" color="primary" size="medium" disabled>
                Disabled
              </Button>
            </ButtonGroup>
            
            <ButtonGroup label="Secondary Outline">
              <Button variant="outline" color="secondary" size="medium">
                Secondary Outline
              </Button>
            </ButtonGroup>
            
            <ButtonGroup label="Tertiary Outline">
              <Button variant="outline" color="tertiary" size="medium">
                Tertiary Outline
              </Button>
            </ButtonGroup>
          </Section>

          {/* GHOST VARIANT */}
          <Section title="Ghost Buttons" description="Minimal, background appears on hover">
            <ButtonGroup label="Ghost Variations">
              <Button variant="ghost" color="primary" size="medium">
                Primary Ghost
              </Button>
              <Button variant="ghost" color="secondary" size="medium">
                Secondary Ghost
              </Button>
              <Button variant="ghost" color="tertiary" size="medium">
                Tertiary Ghost
              </Button>
              <Button variant="ghost" color="primary" size="medium" disabled>
                Disabled Ghost
              </Button>
            </ButtonGroup>
          </Section>

          {/* LINK VARIANT */}
          <Section title="Link Buttons" description="Text with underline, no background">
            <ButtonGroup label="Link Variations">
              <Button variant="link" color="primary" size="medium">
                Primary Link
              </Button>
              <Button variant="link" color="secondary" size="medium">
                Secondary Link
              </Button>
              <Button variant="link" color="tertiary" size="medium">
                Tertiary Link
              </Button>
              <Button variant="link" color="primary" size="medium" disabled>
                Disabled Link
              </Button>
            </ButtonGroup>
          </Section>

          {/* WITH ICONS */}
          <Section title="Buttons with Icons" description="Icon support for visual communication">
            <ButtonGroup label="Icon Buttons">
              <Button 
                variant="solid" 
                color="primary" 
                size="medium" 
                iconLeft={<Download size={16} />}
              >
                Download
              </Button>
              <Button 
                variant="solid" 
                color="primary" 
                size="medium" 
                iconRight={<Send size={16} />}
              >
                Send Message
              </Button>
              <Button 
                variant="outline" 
                color="primary" 
                size="medium" 
                iconLeft={<Plus size={16} />}
              >
                Add New
              </Button>
            </ButtonGroup>
          </Section>

          {/* LOADING STATE */}
          <Section title="Loading State" description="Prevents double-clicks, shows spinner">
            <ButtonGroup label="Loading Test">
              <Button 
                variant="solid" 
                color="primary" 
                size="medium" 
                loading={loading}
                onClick={handleLoadingTest}
              >
                {loading ? 'Loading...' : 'Click to Load'}
              </Button>
              <Button 
                variant="outline" 
                color="primary" 
                size="medium" 
                loading={loading}
              >
                Outline Loading
              </Button>
            </ButtonGroup>
          </Section>

          {/* FULL WIDTH */}
          <Section title="Full Width" description="Stretches to container width">
            <div className="space-y-3">
              <Button 
                variant="solid" 
                color="primary" 
                size="large" 
                fullWidth
              >
                Full Width Solid Button
              </Button>
              <Button 
                variant="outline" 
                color="primary" 
                size="large" 
                fullWidth
              >
                Full Width Outline Button
              </Button>
            </div>
          </Section>

          {/* LINK BUTTONS (as <a> tags) */}
          <Section title="Link Buttons (as &lt;a&gt; tags)" description="Renders as anchor tags for navigation">
            <ButtonGroup label="Navigation Links">
              <Button 
                as="link"
                href="/docs"
                variant="solid" 
                color="primary" 
                size="medium"
              >
                Go to Docs
              </Button>
              <Button 
                as="link"
                href="/help"
                variant="outline" 
                color="secondary" 
                size="medium"
              >
                Get Help
              </Button>
              <Button 
                as="link"
                href="/about"
                variant="link" 
                color="primary" 
                size="medium"
              >
                Learn More
              </Button>
            </ButtonGroup>
          </Section>

        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            ✅ Testing Checklist
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Visual Consistency:</strong> All buttons should match the theme's design system</li>
            <li>• <strong>Hover States:</strong> Hover over buttons to see color changes and shadows</li>
            <li>• <strong>Focus States:</strong> Tab through buttons to see focus rings (accessibility)</li>
            <li>• <strong>Active States:</strong> Click and hold to see pressed state</li>
            <li>• <strong>Disabled States:</strong> Disabled buttons should be non-interactive</li>
            <li>• <strong>Loading State:</strong> Click "Click to Load" to test spinner</li>
            <li>• <strong>Keyboard Nav:</strong> Use Enter/Space to activate focused buttons</li>
            <li>• <strong>Brand Switching:</strong> Change brand mode in settings to see color changes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Helper Components

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

function ButtonGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
      <div className="flex flex-wrap gap-3 items-center">
        {children}
      </div>
    </div>
  )
}

