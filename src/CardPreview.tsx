import React, { useMemo } from "react";
import "./CardPreview.css";
import {manaTokenToPath, parseManaCost} from "./lib/mana";
import {ScryfallCard} from "./lib/scryfall";

type Props = {
  card: ScryfallCard | null;
  artworkUrl?: string; // objectURL du fichier upload
  overrides?: {
    jpTitle?: string;
    typeLine?: string;
    oracleText?: string;
  };
};

export default function CardPreview({ card, artworkUrl, overrides }: Props) {
  const mana = useMemo(() => parseManaCost(card?.mana_cost), [card?.mana_cost]);

  if (!card) {
    return (
      <div className="cardRoot cardEmpty">
        <div className="cardEmptyText">Fetch a card to preview</div>
      </div>
    );
  }

  const title = overrides?.jpTitle?.trim() || card.printed_name || card.name;
  const typeLine = overrides?.typeLine?.trim() || card.type_line;
  const oracle = (overrides?.oracleText?.trim() ?? card.oracle_text ?? "").trim();
  const flavor = (card.flavor_text ?? "").trim();

  const isCreature = card.power != null && card.toughness != null;
  const isPW = card.loyalty != null;

  const stats = isCreature ? `${card.power}/${card.toughness}` : isPW ? `${card.loyalty}` : "";

  return (
    <div className="cardRoot" id="card-preview">

      <div id="model" ></div>

      {/* Artwork */}
      <div className="layer layerArt">
        {artworkUrl ? (
          <img className="artImg" src={artworkUrl} alt="" />
        ) : (
          <div className="artPlaceholder">Upload artwork</div>
        )}
      </div>


      {/* Hanko seal */}
      <img className="layer layerHanko" src={new URL("../assets/frame/hanko.svg", import.meta.url).toString()} alt="" />

      {/* Title panel (vertical) */}
      <div className="layer titlePanel">
        <div className="titleVertical" aria-label={title}>
          {Array.from(title).map((ch, idx) => (
            <span key={idx} className="titleChar">{ch}</span>
          ))}
        </div>
      </div>

      {/* Mana cost */}
      <div className="layer manaRow">
        {mana.reverse().map((t, i) => (
          <div className="manaIconWrap" key={`${t}-${i}`}>
            <img className="manaIcon" src={manaTokenToPath(t)} alt={t} />
          </div>
        ))}
      </div>

      {/* Type line */}
      <div className="layer typeLine">
        <div className="typeText">{typeLine}</div>
      </div>

      {/* Rules box */}
      <div className="layer rulesBox">
        {oracle && <div className="oracleText">{oracle}</div>}
        {oracle && flavor && <div className="rulesGap" />}
        {flavor && <div className="flavorText">{flavor}</div>}
      </div>

      {/* Stats */}
      {stats ? (
        <div className="layer statsBox">
          <div className="statsText">{stats}</div>
        </div>
      ) : null}
    </div>
  );
}