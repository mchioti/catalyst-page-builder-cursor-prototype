/**
 * Foundation Typography Test Page
 * 
 * Tests Heading and Text components across all themes:
 * - Wiley DS V2
 * - Classic UX3
 * - IBM Carbon
 * - Ant Design
 */

import React from 'react'
import { Heading, Text } from '../../foundation'

export function FoundationTypographyTest() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📝 Atypon Design Foundation - Typography Test
          </h1>
          <p className="text-gray-600">
            Testing Heading and Text components across all 4 themes.
            Switch themes in the Design Console to see typography adapt.
          </p>
        </div>

        {/* Heading Tests */}
        <Section title="Heading Hierarchy" description="All heading levels (H1-H6) with auto sizing">
          <div className="space-y-6">
            <div>
              <Heading level={1}>H1: The quick brown fox jumps</Heading>
              <Text size="sm" color="muted">Level 1 • Size: xl (auto)</Text>
            </div>
            
            <div>
              <Heading level={2}>H2: The quick brown fox jumps over</Heading>
              <Text size="sm" color="muted">Level 2 • Size: lg (auto)</Text>
            </div>
            
            <div>
              <Heading level={3}>H3: The quick brown fox jumps over the lazy</Heading>
              <Text size="sm" color="muted">Level 3 • Size: md (auto)</Text>
            </div>
            
            <div>
              <Heading level={4}>H4: The quick brown fox jumps over the lazy dog</Heading>
              <Text size="sm" color="muted">Level 4 • Size: sm (auto)</Text>
            </div>
            
            <div>
              <Heading level={5}>H5: The quick brown fox jumps over the lazy dog quickly</Heading>
              <Text size="sm" color="muted">Level 5 • Size: xs (auto)</Text>
            </div>
            
            <div>
              <Heading level={6}>H6: The quick brown fox jumps over the lazy dog very quickly</Heading>
              <Text size="sm" color="muted">Level 6 • Size: xxs (auto)</Text>
            </div>
          </div>
        </Section>

        {/* Heading Sizes */}
        <Section title="Heading Size Overrides" description="Same level (H2), different visual sizes">
          <div className="space-y-6">
            <Heading level={2} size="xl">H2 with XL size (looks like H1)</Heading>
            <Heading level={2} size="lg">H2 with LG size (default)</Heading>
            <Heading level={2} size="md">H2 with MD size (smaller)</Heading>
            <Heading level={2} size="sm">H2 with SM size (even smaller)</Heading>
          </div>
        </Section>

        {/* Heading Colors */}
        <Section title="Heading Colors" description="Different color variants">
          <div className="space-y-4">
            <Heading level={3} color="default">Default Color Heading</Heading>
            <Heading level={3} color="primary">Primary Color Heading</Heading>
            <Heading level={3} color="secondary">Secondary Color Heading</Heading>
            <Heading level={3} color="muted">Muted Color Heading</Heading>
          </div>
        </Section>

        {/* Heading Alignment */}
        <Section title="Heading Alignment" description="Text alignment options">
          <div className="space-y-4">
            <Heading level={3} align="left">Left Aligned Heading</Heading>
            <Heading level={3} align="center">Center Aligned Heading</Heading>
            <Heading level={3} align="right">Right Aligned Heading</Heading>
          </div>
        </Section>

        {/* Text Sizes */}
        <Section title="Body Text Sizes" description="All text size variants">
          <div className="space-y-6">
            <div>
              <Text size="xl">
                XL Body Text: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </Text>
              <Text size="xs" color="muted">Size: xl • Desktop: 20px, Mobile: 18px</Text>
            </div>
            
            <div>
              <Text size="lg">
                LG Body Text: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
              </Text>
              <Text size="xs" color="muted">Size: lg • Desktop: 18px, Mobile: 16px</Text>
            </div>
            
            <div>
              <Text size="md">
                MD Body Text (Standard): Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </Text>
              <Text size="xs" color="muted">Size: md • Desktop: 16px, Mobile: 16px</Text>
            </div>
            
            <div>
              <Text size="sm">
                SM Body Text (Captions): Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </Text>
              <Text size="xs" color="muted">Size: sm • Desktop: 14px, Mobile: 14px</Text>
            </div>
            
            <div>
              <Text size="xs">
                XS Body Text (Fine Print): Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
              </Text>
              <Text size="xs" color="muted">Size: xs • Desktop: 12px, Mobile: 12px</Text>
            </div>
          </div>
        </Section>

        {/* Text Colors */}
        <Section title="Text Colors" description="Different text color variants">
          <div className="space-y-3">
            <Text color="default">Default Color: Standard text color for primary content</Text>
            <Text color="primary">Primary Color: Accent text using theme's primary color</Text>
            <Text color="secondary">Secondary Color: Secondary content hierarchy</Text>
            <Text color="muted">Muted Color: De-emphasized or helper text</Text>
          </div>
        </Section>

        {/* Text Weights */}
        <Section title="Text Weights" description="Font weight variations">
          <div className="space-y-3">
            <Text weight="regular">Regular Weight (400): Standard body text weight</Text>
            <Text weight="medium">Medium Weight (500): Slightly emphasized text</Text>
            <Text weight="semibold">Semibold Weight (600): More pronounced emphasis</Text>
            <Text weight="bold">Bold Weight (700): Strong emphasis for important text</Text>
          </div>
        </Section>

        {/* Context-Aware Colors */}
        <Section title="Context-Aware Colors" description="Light vs Dark background adaptation">
          <div className="grid grid-cols-2 gap-6">
            {/* Light Background */}
            <div className="foundation-context-light bg-white p-6 rounded-lg border border-gray-200">
              <Heading level={4} className="mb-4">Light Background</Heading>
              <div className="space-y-3">
                <Heading level={5} color="primary">Primary Heading</Heading>
                <Text color="primary">Primary colored text adapts to light background</Text>
                <Text color="default">Default text remains readable</Text>
              </div>
            </div>
            
            {/* Dark Background */}
            <div className="foundation-context-dark bg-gray-900 p-6 rounded-lg">
              <Heading level={4} color="inverse" className="mb-4">Dark Background</Heading>
              <div className="space-y-3">
                <Heading level={5} color="primary">Primary Heading</Heading>
                <Text color="primary">Primary colored text adapts to dark background</Text>
                <Text color="inverse">Inverse text for dark backgrounds</Text>
              </div>
            </div>
          </div>
        </Section>

        {/* Responsive Typography */}
        <Section 
          title="Responsive Typography" 
          description="Resize your browser to see text scale between mobile and desktop"
        >
          <div className="space-y-6 border-4 border-dashed border-blue-300 p-6 rounded">
            <Heading level={1}>H1 scales from 36px (mobile) to 48px (desktop)</Heading>
            <Heading level={2}>H2 scales from 32px (mobile) to 40px (desktop)</Heading>
            <Text size="xl">XL text scales from 18px (mobile) to 20px (desktop)</Text>
            <Text size="md">MD text stays 16px on both mobile and desktop</Text>
          </div>
        </Section>

        {/* Real-World Example */}
        <Section title="Real-World Article Example" description="Complete typography in context">
          <article className="max-w-3xl">
            <Heading level={1} className="mb-4">
              The Future of Publishing: Digital Transformation in Academic Journals
            </Heading>
            
            <div className="flex items-center gap-4 mb-6">
              <Text size="sm" color="muted">By Dr. Jane Smith</Text>
              <Text size="sm" color="muted">•</Text>
              <Text size="sm" color="muted">November 10, 2025</Text>
            </div>
            
            <Text size="lg" className="mb-6">
              The academic publishing landscape is undergoing a profound transformation, driven by technological innovation and changing reader expectations. This article explores the key trends shaping the future of scholarly communication.
            </Text>
            
            <Heading level={2} className="mb-3 mt-8">
              The Rise of Open Access
            </Heading>
            
            <Text className="mb-4">
              Open access publishing has emerged as a dominant force in academic literature. By making research freely available to readers worldwide, open access models democratize knowledge and accelerate scientific progress. Studies show that open access articles receive significantly more citations than their paywalled counterparts.
            </Text>
            
            <Heading level={3} className="mb-3 mt-6">
              Benefits for Researchers
            </Heading>
            
            <Text className="mb-4">
              Researchers benefit from increased visibility and impact when their work is openly accessible. The ability to share findings without barriers enables faster peer review, broader collaboration, and more rapid advancement of scientific knowledge.
            </Text>
            
            <Heading level={3} className="mb-3 mt-6">
              Challenges and Solutions
            </Heading>
            
            <Text className="mb-4">
              While open access offers many advantages, it also presents challenges around funding models and quality control. Innovative approaches such as institutional memberships and Read & Publish agreements are emerging to address these concerns.
            </Text>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
              <Text size="sm" weight="semibold" className="mb-2">Key Takeaway</Text>
              <Text size="sm">
                The transition to open access is not just a business model change—it represents a fundamental shift in how scientific knowledge is created, shared, and preserved for future generations.
              </Text>
            </div>
            
            <Heading level={2} className="mb-3 mt-8">
              Conclusion
            </Heading>
            
            <Text className="mb-4">
              As we look to the future, it's clear that digital transformation will continue to reshape academic publishing. Publishers, researchers, and institutions must work together to ensure that these changes serve the broader goal of advancing human knowledge.
            </Text>
            
            <Text size="sm" color="muted" className="mt-8">
              © 2025 Atypon Publishing. All rights reserved.
            </Text>
          </article>
        </Section>

      </div>
    </div>
  )
}

// Helper Components
interface SectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        {description && (
          <p className="text-gray-600 text-sm">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

export default FoundationTypographyTest
