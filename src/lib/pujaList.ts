import { toggleShortlistId } from "@shared/shortlistRules";

export const SAVED_PANDALS_KEY = "pujoparikroma-saved";
export const VISITED_PANDALS_KEY = "pujoparikroma-visited";

function readIds(key: string, legacyKey?: string) {
  try {
    const current = localStorage.getItem(key) ?? (legacyKey ? localStorage.getItem(legacyKey) : null) ?? "[]";
    const parsed = JSON.parse(current);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function saveIds(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("pujoparikroma:list-updated", { detail: { key, ids } }));
}

export function getSavedPandalIds() { return readIds(SAVED_PANDALS_KEY, "pujopath-favourites"); }
export function getVisitedPandalIds() { return readIds(VISITED_PANDALS_KEY, "pujopath-visited"); }
export function setSavedPandalIds(ids: string[]) { saveIds(SAVED_PANDALS_KEY, ids); }
export function setVisitedPandalIds(ids: string[]) { saveIds(VISITED_PANDALS_KEY, ids); }
export function toggleSavedPandal(id: string) {
  const next = toggleShortlistId(getSavedPandalIds(), id);
  setSavedPandalIds(next);
  return next;
}
