/**
 * Widget Builder - Factory function for creating widgets from library items
 * 
 * Extracted from AppV1.tsx for better modularity.
 */

import { nanoid } from 'nanoid'
import type { 
  Widget, 
  Skin, 
  TextWidget, 
  ImageWidget, 
  NavbarWidget, 
  MenuWidget, 
  HTMLWidget, 
  CodeWidget, 
  HeadingWidget, 
  ButtonWidget, 
  PublicationListWidget, 
  PublicationDetailsWidget 
} from '../types/widgets'
import { type LibraryItem as SpecItem } from '../library'
import { MOCK_SCHOLARLY_ARTICLES, DEFAULT_PUBLICATION_CARD_CONFIG } from '../constants'

/**
 * Build a new widget instance from a library item specification
 */
export function buildWidget(item: SpecItem): Widget {
  const baseWidget = {
    id: nanoid(),
    skin: (item.skin as Skin) || 'minimal'
  };

  switch (item.type) {
    case 'text':
      return {
        ...baseWidget,
        type: 'text',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        align: 'left'
      } as TextWidget;
    
    case 'heading':
      return {
        ...baseWidget,
        type: 'heading',
        text: 'Your Heading Text',
        level: 2,
        align: 'left',
        style: 'default',
        color: 'default',
        size: 'auto',
        icon: {
          enabled: false,
          position: 'left',
          emoji: '🎯'
        }
      } as HeadingWidget;
    
    case 'image':
      return {
        ...baseWidget,
        type: 'image',
        src: '', // Start with empty src to show placeholder
        alt: 'Image description',
        ratio: '16:9',
        caption: '',
        link: '',
        alignment: 'center',
        width: 'full',
        objectFit: 'cover'
      } as ImageWidget;
    
    case 'navbar':
      return {
        ...baseWidget,
        type: 'navbar',
        links: [
          { label: 'Home', href: '#' },
          { label: 'About', href: '#' },
          { label: 'Contact', href: '#' }
        ]
      } as NavbarWidget;
    
    case 'button':
      return {
        ...baseWidget,
        type: 'button',
        text: 'Button Text',
        variant: 'primary',
        size: 'medium',
        href: '#'
      } as ButtonWidget;
    
    case 'html-block':
      return {
        ...baseWidget,
        type: 'html',
        title: 'HTML Widget',
        htmlContent: ''
      } as HTMLWidget;
    
    case 'code-block':
      return {
        ...baseWidget,
        type: 'code',
        title: 'Code Block',
        language: 'javascript',
        codeContent: '// Your code here\nconsole.log("Hello, world!");',
        showLineNumbers: true,
        theme: 'light'
      } as CodeWidget;
    
    case 'publication-list':
      return {
        ...baseWidget,
        type: 'publication-list',
        contentSource: 'dynamic-query',
        publications: MOCK_SCHOLARLY_ARTICLES,
        cardConfig: DEFAULT_PUBLICATION_CARD_CONFIG,
        cardVariantId: 'compact-variant',
        layout: 'list',
        maxItems: 6,
        aiSource: {
          prompt: '',
          lastGenerated: undefined,
          generatedContent: undefined
        },
        // List pattern system defaults
        spanningConfig: {
          enabled: false,
          preset: 'uniform'
        },
        internalGridColumns: 3 // Default for grid layout
      } as PublicationListWidget;
    
    case 'publication-details':
      return {
        ...baseWidget,
        type: 'publication-details',
        contentSource: 'context',
        publication: MOCK_SCHOLARLY_ARTICLES[0], // Use first article as default
        cardConfig: DEFAULT_PUBLICATION_CARD_CONFIG,
        cardVariantId: 'compact-variant',
        layout: 'default',
        aiSource: {
          prompt: '',
          lastGenerated: undefined,
          generatedContent: undefined
        }
      } as PublicationDetailsWidget;
    
    case 'menu':
      // Start with sample menu items so widget is visible
      return {
        ...baseWidget,
        type: 'menu',
        menuType: 'global',
        style: 'horizontal',
        items: [
          {
            id: nanoid(),
            label: 'Home',
            url: '#',
            target: '_self',
            displayCondition: 'always',
            order: 0
          },
          {
            id: nanoid(),
            label: 'About',
            url: '#',
            target: '_self',
            displayCondition: 'always',
            order: 1
          },
          {
            id: nanoid(),
            label: 'Contact',
            url: '#',
            target: '_self',
            displayCondition: 'always',
            order: 2
          }
        ]
      } as MenuWidget;
    
    case 'tabs':
      // Start with 2 empty tabs so widget is visible
      return {
        ...baseWidget,
        type: 'tabs',
        tabs: [
          {
            id: nanoid(),
            label: 'Tab 1',
            widgets: []
          },
          {
            id: nanoid(),
            label: 'Tab 2',
            widgets: []
          }
        ],
        activeTabIndex: 0,
        tabStyle: 'underline',
        align: 'left'
      } as any; // TabsWidget
    
    case 'divider':
      // Horizontal rule for visual separation
      return {
        ...baseWidget,
        type: 'divider',
        style: 'solid',
        thickness: '1px',
        color: '#e5e7eb', // gray-200
        marginTop: '1rem',
        marginBottom: '1rem'
      } as any; // DividerWidget
    
    case 'spacer':
      // Vertical spacing
      return {
        ...baseWidget,
        type: 'spacer',
        height: '2rem' // Default 32px spacing
      } as any; // SpacerWidget
    
    case 'editorial-card':
      // SharePoint-inspired editorial/marketing card
      return {
        ...baseWidget,
        type: 'editorial-card',
        layout: 'image-overlay',
        content: {
          preheader: {
            enabled: true,
            text: 'ADD SECTION OR CATEGORY NAME'
          },
          headline: {
            enabled: true,
            text: 'Add a headline'
          },
          description: {
            enabled: true,
            text: 'Describe what your story is about'
          },
          callToAction: {
            enabled: true,
            text: 'Learn more',
            url: '#',
            type: 'button'
          }
        },
        image: {
          src: '',
          alt: 'Editorial card image'
        },
        config: {
          contentAlignment: 'left',
          imagePosition: 'top',
          overlayOpacity: 60,
          useAccentColor: true
        }
      } as any; // EditorialCardWidget
    
    case 'collapse':
      // Start with 2 empty panels so widget is visible
      return {
        ...baseWidget,
        type: 'collapse',
        panels: [
          {
            id: nanoid(),
            label: 'Panel 1',
            title: 'Panel 1',
            isOpen: true,  // First panel open by default
            widgets: []
          },
          {
            id: nanoid(),
            label: 'Panel 2',
            title: 'Panel 2',
            isOpen: false,
            widgets: []
          }
        ],
        allowMultiple: false, // Accordion behavior by default
        iconPosition: 'right',
        style: 'default'
      } as any; // CollapseWidget
    
    default:
      // Fallback to text widget
      return {
        ...baseWidget,
        type: 'text',
        text: `${item.label} widget (not implemented)`,
        align: 'left'
      } as TextWidget;
  }
}

