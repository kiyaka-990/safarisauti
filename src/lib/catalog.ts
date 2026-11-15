export type Kind = "safari" | "flight" | "lodge";
export interface CatalogItem {
  id: number; kind: Kind; name: string; priceKes: number;
  days: number; tags: string[]; location: string;
}

export const CATALOG: CatalogItem[] = [
  { id: 1, kind: "safari", name: "Maasai Mara Classic 3-Day", priceKes: 65000, days: 3, tags: ["big-five", "budget"], location: "Maasai Mara" },
  { id: 2, kind: "safari", name: "Amboseli Elephants 2-Day", priceKes: 42000, days: 2, tags: ["elephants", "budget"], location: "Amboseli" },
  { id: 3, kind: "safari", name: "Tsavo East Explorer 3-Day", priceKes: 58000, days: 3, tags: ["red-dust", "lions"], location: "Tsavo" },
  { id: 4, kind: "safari", name: "Luxury Mara Fly-in 4-Day", priceKes: 185000, days: 4, tags: ["luxury", "big-five"], location: "Maasai Mara" },
  { id: 5, kind: "flight", name: "NBO–Mara return (2 pax)", priceKes: 28000, days: 0, tags: ["flight"], location: "Nairobi" },
  { id: 6, kind: "flight", name: "NBO–Kilimanjaro return (2 pax)", priceKes: 34000, days: 0, tags: ["flight"], location: "Nairobi" },
  { id: 7, kind: "flight", name: "NBO–Diani return (2 pax)", priceKes: 22000, days: 0, tags: ["flight", "beach"], location: "Nairobi" },
  { id: 8, kind: "lodge", name: "Mara Budget Tented Camp (2n)", priceKes: 18000, days: 2, tags: ["budget", "tents"], location: "Maasai Mara" },
  { id: 9, kind: "lodge", name: "Amboseli Sopa Lodge (2n)", priceKes: 26000, days: 2, tags: ["midrange"], location: "Amboseli" },
  { id: 10, kind: "lodge", name: "Mara Luxury Camp (4n)", priceKes: 96000, days: 4, tags: ["luxury"], location: "Maasai Mara" },
];

export function searchCatalog(kind: Kind, maxKes?: number): CatalogItem[] {
  return CATALOG.filter(
    (i) => i.kind === kind && (maxKes === undefined || i.priceKes <= maxKes)
  );
}

export function byId(id: number): CatalogItem | undefined {
  return CATALOG.find((i) => i.id === id);
}
