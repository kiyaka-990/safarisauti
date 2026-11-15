import { byId, type CatalogItem } from "./catalog";
import { assertWithinBudget, type Budget } from "./budget";

export interface Itinerary {
  items: CatalogItem[];
  totalKes: number;
  totalDays: number;
}

export function buildItinerary(itemIds: number[], budget: Budget): Itinerary {
  const items = itemIds.map(byId).filter(Boolean) as CatalogItem[];
  if (items.length === 0) {
    throw new Error("Planner: no valid catalog items in proposal");
  }
  const totalKes = items.reduce((s, i) => s + i.priceKes, 0);
  // Budget enforced HERE, in code, before the plan ever reaches the LLM:
  assertWithinBudget(budget, totalKes, "proposed itinerary");
  return {
    items,
    totalKes,
    totalDays: items.reduce((s, i) => s + i.days, 0),
  };
}
