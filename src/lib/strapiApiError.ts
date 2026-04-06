/**
 * Human-readable message from Strapi REST error payloads (create/update).
 */
export function getStrapiErrorDescription(body: unknown): string | undefined {
  if (!body || typeof body !== "object") {
    return undefined;
  }
  const o = body as {
    message?: string;
    error?: {
      message?: string;
      details?: { errors?: { message?: string }[] };
    };
  };
  if (typeof o.message === "string" && o.message.length > 0) {
    return o.message;
  }
  const em = o.error?.message;
  if (typeof em === "string" && em.length > 0) {
    return em;
  }
  const first = o.error?.details?.errors?.[0]?.message;
  if (typeof first === "string" && first.length > 0) {
    return first;
  }
  return undefined;
}
