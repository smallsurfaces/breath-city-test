/**
 * AnnotationLayer — Type Definitions
 *
 * Shared types for AnnotationLayer.tsx and consuming components.
 * Import these when implementing a MapAdapter or integrating the component.
 *
 * @see AnnotationLayer.tsx for the component implementation
 */

/**
 * A single annotation pin placed by a reviewer.
 * Coordinates are stored as normalised viewport fractions (0–1),
 * not pixels, so they survive viewport resize.
 */
export type Annotation = {
  id: string
  /** Normalised horizontal position: 0 = left edge, 1 = right edge */
  x: number
  /** Normalised vertical position: 0 = top edge, 1 = bottom edge */
  y: number
  text: string
  authorName: string
  /** Unix timestamp in milliseconds */
  createdAt: number
  resolved: boolean
}

/**
 * Adapter interface for freezing/unfreezing an underlying interactive layer
 * (e.g. a Mapbox map) during annotation mode.
 *
 * Implement freeze() to disable pan/zoom/interaction when the annotator is placing pins.
 * Implement unfreeze() to restore full interaction when annotation mode exits.
 * Omit mapAdapter entirely for plain viewport use.
 */
export type MapAdapter = {
  freeze: () => void
  unfreeze: () => void
}

/**
 * Configuration props for the AnnotationLayer component.
 * Pass as props when using <AnnotationLayer ... />.
 */
export type AnnotationLayerConfig = {
  /**
   * Required. localStorage key for persisting annotations.
   * Use format: [project-slug]-[view-slug]
   * Example: "bc-direction1", "clienta-concept-b"
   * Must be unique per project/view to prevent annotation collision.
   */
  storageKey: string

  /** Optional. Label shown in the toggle pill. Defaults to "Annotations". */
  label?: string

  /**
   * Optional. Implement freeze/unfreeze to pause an underlying map or
   * interactive layer during annotation mode.
   */
  mapAdapter?: MapAdapter

  /**
   * Optional. Fires when annotation mode is entered.
   * Use to clear open popups, tooltips, or other UI state in the host.
   */
  onEnterMode?: () => void

  /** Optional. Fires when annotation mode is exited. */
  onExitMode?: () => void

  /**
   * Optional. Viewport width (px) below which cards use bottom-sheet positioning.
   * Defaults to 768.
   */
  mobileBreakpoint?: number

  /**
   * Optional. Override the toggle pill CSS position.
   * Defaults to top: '180px', right: '1rem'.
   */
  togglePosition?: {
    top?: string
    bottom?: string
    right?: string
    left?: string
  }
}
