// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchCardByExactName, type ScryfallCard } from "./lib/scryfall";
import { toPng } from "html-to-image";
import CardPreview from "./CardPreview";

type Status =
  | { kind: "idle" }
  | { kind: "loading"; msg: string }
  | { kind: "error"; msg: string }
  | { kind: "ready"; msg?: string };

export default function App() {
  const [cardName, setCardName] = useState("Chaos Warp");
  const [jpTitle, setJpTitle] = useState("");
  const [typeOverride, setTypeOverride] = useState("");
  const [oracleOverride, setOracleOverride] = useState("");

  const [card, setCard] = useState<ScryfallCard | null>(null);
  const [artFile, setArtFile] = useState<File | null>(null);
  const [artworkUrl, setArtworkUrl] = useState<string | undefined>(undefined);

  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const canExport = useMemo(() => !!card, [card]);

  // Create/revoke object URL for the uploaded artwork
  useEffect(() => {
    if (!artFile) {
      setArtworkUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(artFile);
    setArtworkUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [artFile]);

  async function onFetchCard(e: React.FormEvent) {
    e.preventDefault();
    const name = cardName.trim();
    if (!name) return;

    try {
      setStatus({ kind: "loading", msg: "Fetching from Scryfall…" });
      const c = await fetchCardByExactName(name);
      setCard(c);
      setStatus({ kind: "ready", msg: "Loaded" });
    } catch (err: any) {
      setCard(null);
      setStatus({ kind: "error", msg: err?.message ?? "Failed to fetch card" });
    }
  }

  async function onExportPNG() {
    const node = document.getElementById("card-preview");
    if (!node) return;

    try {
      setStatus({ kind: "loading", msg: "Exporting PNG…" });
      const dataUrl = await toPng(node, {
        pixelRatio: 2, // increase for sharper export
        cacheBust: true,
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${(card?.name ?? "mtg-card").replaceAll(" ", "_")}.png`;
      a.click();

      setStatus({ kind: "ready" });
    } catch (e: any) {
      setStatus({ kind: "error", msg: e?.message ?? "Export failed" });
    }
  }

  return (
    <div className="container">
      <h1 style={{ margin: "0 0 12px" }}>MTG Japanese Frame Card Maker</h1>

      <div className="grid">
        <div className="card">
          <form onSubmit={onFetchCard}>
            <label>Card name (exact)</label>
            <input
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Chaos Warp"
            />

            <div style={{ height: 10 }} />

            <label>Artwork image (you provide it)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setArtFile(e.target.files?.[0] ?? null)}
            />

            <div style={{ height: 12 }} />

            <div className="row">
              <div>
                <label>Override JP title (optional)</label>
                <input
                  value={jpTitle}
                  onChange={(e) => setJpTitle(e.target.value)}
                  placeholder={card?.printed_name ?? "混沌のねじれ"}
                />
              </div>
              <div>
                <label>Override type line (optional)</label>
                <input
                  value={typeOverride}
                  onChange={(e) => setTypeOverride(e.target.value)}
                  placeholder={card?.type_line ?? "Instant"}
                />
              </div>
            </div>

            <div style={{ height: 12 }} />

            <label>Override oracle text (optional)</label>
            <textarea
              value={oracleOverride}
              onChange={(e) => setOracleOverride(e.target.value)}
              placeholder={card?.oracle_text ?? "Oracle text…"}
            />

            <div style={{ height: 12 }} />

            <div className="actions">
              <button type="submit">Fetch from Scryfall</button>

              <button
                type="button"
                onClick={onExportPNG}
                disabled={!canExport}
                title={!canExport ? "Fetch a card first" : "Export PNG"}
              >
                Export PNG
              </button>
            </div>

            <div className="small">
              Status:{" "}
              {status.kind === "loading"
                ? status.msg
                : status.kind === "error"
                  ? `❌ ${status.msg}`
                  : status.kind === "ready"
                    ? "✅ Ready"
                    : "—"}
            </div>

            {card && (
              <div className="small" style={{ marginTop: 10, lineHeight: 1.4 }}>
                <div>
                  <b>Loaded:</b> {card.name}
                </div>
                {card.printed_name && (
                  <div>
                    <b>JP:</b> {card.printed_name}
                  </div>
                )}
                <div>
                  <b>Mana:</b> {card.mana_cost ?? "—"}
                </div>
                <div>
                  <b>Type:</b> {card.type_line}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="card canvasWrap">
          <CardPreview
            card={card}
            artworkUrl={artworkUrl}
            overrides={{
              jpTitle: jpTitle || undefined,
              typeLine: typeOverride || undefined,
              oracleText: oracleOverride || undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}