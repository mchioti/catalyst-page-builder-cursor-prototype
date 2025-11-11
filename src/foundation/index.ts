/**
 * Atypon Design Foundation
 * 
 * A headless design system providing component behavior, accessibility,
 * and token contracts for publishing platforms.
 * 
 * @see README.md for architecture and usage
 */

// ============================================================================
// COMPONENTS
// ============================================================================

export { Button } from './components/Button'
export type {
  ButtonProps,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  ButtonAsButtonProps,
  ButtonAsLinkProps
} from './components/Button'

export { Heading } from './components/Heading'
export type {
  HeadingProps,
  HeadingLevel,
  HeadingSize,
  HeadingColor,
  HeadingWeight,
  HeadingAlign
} from './components/Heading'

export { Text } from './components/Text'
export type {
  TextProps,
  TextSize,
  TextColor,
  TextWeight,
  TextAlign
} from './components/Text'

// ============================================================================
// TOKEN CONTRACTS
// ============================================================================

export type {
  FoundationTokens,
  ActionColorTokens,
  SurfaceColorTokens,
  ContentColorTokens,
  FeedbackColorTokens,
  TypographyTokens,
  HeadingTokens,
  TextTokens,
  SpacingTokens,
  ButtonTokens,
  MotionTokens,
  TokenReference,
  TokenValue,
  PartialFoundationTokens
} from './tokens/contracts'

// ============================================================================
// TOKEN RESOLVER
// ============================================================================

export {
  isTokenReference,
  parseTokenReference,
  resolveTokenValue,
  resolveAllTokens,
  generateCSSVariables,
  generateFoundationCSS,
  cssVar,
  isValidTokenSet,
  validateTokens
} from './tokens/resolver'

// ============================================================================
// ADAPTERS (Theme Mappers)
// ============================================================================

export { mapWileyDSV2ToFoundation } from './adapters/wiley-ds-v2'
export { mapClassicUX3ToFoundation } from './adapters/classic-ux3'
export { mapCarbonToFoundation } from './adapters/ibm-carbon'
export { mapAntDesignToFoundation } from './adapters/ant-design'

// ============================================================================
// VERSION
// ============================================================================

export const FOUNDATION_VERSION = '1.0.0-alpha.1'

