export type ScryfallCard = {
  name: string;
  printed_name?: string; // nom japonais (ou autre langue)
  mana_cost?: string;
  type_line: string;
  oracle_text?: string;
  flavor_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  color_identity?: string[];
};

/**
 * Cherche le printed_name japonais via Scryfall search.
 * Renvoie undefined si aucune impression JP n'existe.
 */
async function fetchJapaneseName(exactName: string): Promise<string | undefined> {
  try {
    const q = `!"${exactName}" lang:ja`;
    const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(q)}&unique=prints&order=released&dir=desc`;
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const json = await res.json();
    const card = json.data?.[0];
    if (!card) return undefined;
    // Pour les cartes double-face, prendre la première face
    if (card.card_faces?.length) {
      return card.card_faces[0].printed_name ?? card.printed_name;
    }
    return card.printed_name;
  } catch {
    return undefined;
  }
}

export async function fetchCardByExactName(name: string): Promise<ScryfallCard> {
  const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) {
    let msg = `Scryfall error (${res.status})`;
    try {
      const json = await res.json();
      if (json?.details) msg = json.details;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();

  // Fetch le nom japonais en parallèle (non bloquant)
  const jpName = await fetchJapaneseName(json.name);

  if (json.card_faces?.length) {
    const f0 = json.card_faces[0];
    return {
      name: f0.name ?? json.name,
      printed_name: jpName,
      mana_cost: f0.mana_cost ?? json.mana_cost,
      type_line: f0.type_line ?? json.type_line,
      oracle_text: f0.oracle_text ?? json.oracle_text,
      flavor_text: f0.flavor_text ?? json.flavor_text,
      power: f0.power ?? json.power,
      toughness: f0.toughness ?? json.toughness,
      loyalty: f0.loyalty ?? json.loyalty,
      color_identity: json.color_identity ?? [],
    };
  }

  return {
    name: json.name,
    printed_name: jpName,
    mana_cost: json.mana_cost,
    type_line: json.type_line,
    oracle_text: json.oracle_text,
    flavor_text: json.flavor_text,
    power: json.power,
    toughness: json.toughness,
    loyalty: json.loyalty,
    color_identity: json.color_identity ?? [],
  };
}