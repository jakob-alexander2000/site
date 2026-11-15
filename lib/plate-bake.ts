/** Width bands for baked plate textures. The band is chosen from the drawing box. */
export const PLATE_BANDS = [1100, 1280, 1440] as const;

export type PlateBand = (typeof PLATE_BANDS)[number];

/** CSS pixel size of the names baked into the plate. Measured by the raster. */
export const BAKED_LABEL_PX = 12;

/**
 * Pixel width of the citebot drawing in each bake.
 * A display at least this wide keeps the baked type at 12px or larger.
 */
export const BAKED_WIDTH: Record<PlateBand, number> = {
  1100: 1060,
  1280: 1280,
  1440: 1520,
};

export function bandForWidth(width: number): PlateBand {
  if (width < 1280) return 1100;
  if (width < 1440) return 1280;
  return 1440;
}
