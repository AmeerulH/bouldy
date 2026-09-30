export const ROUTE_COLOURS = [
  "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink",
  "Teal", "Mint", "Black", "White", "Grey", "Brown", "Transparent",
] as const;

export const ROUTE_STYLES = [
  "Slab", "Vertical", "Overhang", "Roof", "Crimps", "Slopers",
  "Pinches", "Jugs", "Pockets", "Dyno", "Deadpoint", "Static",
  "Coordination", "Compression", "Balance", "Mantle", "Heel Hook",
  "Toe Hook", "Gaston",
] as const;

export function normaliseRouteColour(colour?: string | null) {
  const value = colour?.trim().toLowerCase() ?? "";
  return ROUTE_COLOURS.find((option) => option.toLowerCase() === value)?.toLowerCase() ?? null;
}
