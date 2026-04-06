/**
 * Resolves Strapi REST base URL (…/api). Server routes may set STRAPI_API_URL;
 * client/build may use NEXT_PUBLIC_STRAPI_API_URL. Appends /api when missing.
 */
export function getStrapiRestBaseUrl(): string {
  const raw =
    process.env.STRAPI_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_STRAPI_API_URL?.trim() ||
    "";
  if (!raw) {
    return "";
  }
  const noTrailing = raw.replace(/\/+$/, "");
  return noTrailing.endsWith("/api") ? noTrailing : `${noTrailing}/api`;
}
