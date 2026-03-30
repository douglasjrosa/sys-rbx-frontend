const TEMPLATE_IMAGE_DIR = "/img/templates";
const TEMPLATE_IMAGE_EXT = ".jpg";

/**
 * Public URL for a packaging template preview image (matches filenames in public/img/templates).
 */
export function getTemplateImageSrc( templateName: string ): string {
  const safe = encodeURIComponent( templateName );
  return `${TEMPLATE_IMAGE_DIR}/${safe}${TEMPLATE_IMAGE_EXT}`;
}
