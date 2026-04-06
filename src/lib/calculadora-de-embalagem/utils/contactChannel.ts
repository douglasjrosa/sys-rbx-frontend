/** Preferred contact channel (Tela 2 — preferências de contato). */
export type ContactChannel = "email" | "call" | "text" | "audio" | "any";

export const CONTACT_CHANNEL_OPTIONS: ReadonlyArray<{
  value: ContactChannel;
  label: string;
}> = [
  { value: "email", label: "Prefiro tratar somente por e-mail." },
  { value: "call", label: "Prefiro tratar somente por telefone." },
  { value: "text", label: "Somente Whatsapp - gosto mais de texto." },
  { value: "audio", label: "Somente Whatsapp - gosto mais de áudio." },
  { value: "any", label: "Tanto faz, qualquer canal me serve." },
];

export function contactChannelShowsEmail(ch: ContactChannel): boolean {
  return ch === "email" || ch === "any";
}

export function contactChannelShowsPhone(ch: ContactChannel): boolean {
  return ch === "call" || ch === "text" || ch === "audio" || ch === "any";
}

type ContactFields = {
  contactChannel?: ContactChannel;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

function optionalEmailValid(
  raw: string | undefined,
  validateEmailFn: (email: string) => boolean,
): boolean {
  const t = (raw ?? "").trim();
  if (t === "") {
    return true;
  }
  return validateEmailFn(t);
}

/**
 * True when channel is chosen, name is filled, and each field meets its rule:
 * email/phone required or optional by channel; if optional, empty is OK, else
 * format must be valid (email) or non-empty (phone).
 */
export function isContactPreferencesStepComplete(
  form: ContactFields,
  validateEmailFn: (email: string) => boolean,
): boolean {
  const ch = form.contactChannel;
  if (ch == null) {
    return false;
  }
  if (!(form.customerName || "").trim()) {
    return false;
  }
  const email = (form.customerEmail || "").trim();
  if (contactChannelShowsEmail(ch)) {
    if (!email || !validateEmailFn(email)) {
      return false;
    }
  } else if (!optionalEmailValid(form.customerEmail, validateEmailFn)) {
    return false;
  }
  const phone = (form.customerPhone || "").trim();
  if (contactChannelShowsPhone(ch)) {
    if (!phone) {
      return false;
    }
  }
  return true;
}
