import { Seed } from "./seeds";

export type SproutName =
  | "Starflower Sprout"
  | "Mystery Sprout"
  | "Wiggly Sprout";

export type Sprout = {
  buyPrice: number;
  sellPrice: number;
};

export const SPROUTS: Record<SproutName, Seed> = {
  "Starflower Sprout": {
    bumpkinLevel: 1,
    description: "Starflower Sprout",
    plantingSpot: "Greenhouse",
    price: 100,
    yield: "Red Starflower",
    plantSeconds: 10,
  },
  "Mystery Sprout": {
    bumpkinLevel: 1,
    description: "Starflower Sprout",
    plantingSpot: "Greenhouse",
    price: 100,
    yield: "Red Starflower",
    plantSeconds: 10,
  },
  "Wiggly Sprout": {
    bumpkinLevel: 1,
    description: "Starflower Sprout",
    plantingSpot: "Greenhouse",
    price: 100,
    yield: "Red Starflower",
    plantSeconds: 10,
  },
};

export type LabPlantName = "Yellow Starflower" | "Red Starflower";

type LabPlant = {
  sellPrice: number;
  harvestSeconds: number;
};

export const LAB_PLANTS: Record<LabPlantName, LabPlant> = {
  "Red Starflower": {
    sellPrice: 200,
    harvestSeconds: 3,
  },
  "Yellow Starflower": {
    sellPrice: 200,
    harvestSeconds: 3,
  },
};
