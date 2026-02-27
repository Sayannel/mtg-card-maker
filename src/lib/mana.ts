// src/lib/mana.ts

/**
 * Transforme "{2}{R}{U}" → ["2", "R", "U"]
 */
export function parseManaCost(manaCost?: string): string[] {
  if (!manaCost) return [];

  const matches = manaCost.match(/\{[^}]+\}/g);
  if (!matches) return [];

  return matches.map(token => normalizeToken(token.slice(1, -1)));
}

/**
 * Normalise les tokens Scryfall vers des noms de fichiers
 * Ex:
 *  U/B   → UB
 *  G/P   → G_P
 *  2/W   → 2_W
 */
function normalizeToken(raw: string): string {
  const s = raw.toUpperCase().replace(/\s+/g, "");

  // Generic number
  if (/^\d+$/.test(s)) return s;

  // X
  if (s === "X") return "X";

  // Colorless diamond
  if (s === "C") return "C";

  // Snow
  if (s === "S") return "S";

  // Phyrexian single (G/P)
  if (/^[WUBRG]\/P$/.test(s)) return s.replace("/", "_");

  // Hybrid phyrexian (W/U/P)
  if (/^[WUBRG]\/[WUBRG]\/P$/.test(s)) return s.replaceAll("/", "_");

  // Hybrid normal (U/B)
  if (/^[WUBRG]\/[WUBRG]$/.test(s)) return s.replace("/", "");

  // Two hybrid (2/W)
  if (/^2\/[WUBRG]$/.test(s)) return s.replace("/", "_");

  // Mono color
  if (/^[WUBRG]$/.test(s)) return s;

  // fallback
  return s.replaceAll("/", "_");
}

/**
 * Retourne le chemin vers l'icône locale
 * ⚠️ Assure-toi que les fichiers existent :
 *   src/assets/mana/R.svg
 *   src/assets/mana/UB.svg
 *   src/assets/mana/G_P.svg
 * etc.
 */
export function manaTokenToPath(token: string): string {
  return new URL(
    `../assets/mana/${token}.svg`,
    import.meta.url
  ).toString();
}