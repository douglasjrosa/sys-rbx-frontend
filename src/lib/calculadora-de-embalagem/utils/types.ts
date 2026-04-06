export interface ElegibleTemplateResult {
  name: string;
  priceResult?: {
    info?: { vFinal?: number; titulo?: string; preco?: number };
    error?: string;
  };
}
