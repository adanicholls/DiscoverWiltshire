import { splitTradeAndTown } from "./searchParse";

/** Where a "what + where" search should go, or null if there's nothing to
 * search for. Shared by every search box so they all behave the same: a
 * combined phrase typed into "what" alone (e.g. "electrician Melksham") is
 * split into trade + town, and a town picked with nothing typed is town
 * browsing rather than a search, so it goes straight to that town's hub. */
export function searchHref(tradeInput: string, townInput: string): string | null {
  let tradeText = tradeInput.trim();
  let townId = townInput;

  if (!townId && tradeText) {
    const parsed = splitTradeAndTown(tradeText);
    tradeText = parsed.trade;
    townId = parsed.townId;
  }

  if (!tradeText) return townId ? `/towns/${townId}` : null;

  const qs = new URLSearchParams({ q: tradeText });
  if (townId) qs.set("town", townId);
  return `/search?${qs.toString()}`;
}
