import Decimal from "decimal.js-light";
import { Coordinates } from "features/game/expansion/components/MapPlacement";
import { TOTAL_EXPANSION_NODES } from "features/game/expansion/lib/expansionNodes";
import { EXPIRY_COOLDOWNS } from "features/game/lib/collectibleBuilt";
import { INITIAL_FARM } from "features/game/lib/constants";
import { getKeys } from "features/game/types/craftables";
import {
  GameState,
  Inventory,
  InventoryItemName,
  IslandType,
} from "features/game/types/game";

import cloneDeep from "lodash.clonedeep";

type GardenUpgrade = {
  plots: Coordinates[];
  coins: number;
};

const UPGRADES: GardenUpgrade[] = [
  {
    plots: [
      { x: -1, y: 1 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },

      { x: -1, y: -1 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
    ],
    coins: 200,
  },
  {
    plots: [
      { x: -2, y: -1 },
      { x: -2, y: 0 },
      { x: -2, y: 1 },

      { x: -3, y: -1 },
      { x: -3, y: 0 },
      { x: -3, y: 1 },
    ],
    coins: 500,
  },
  {
    plots: [
      { x: -3, y: -2 },
      { x: -2, y: -2 },
      { x: -1, y: -2 },
      { x: 0, y: -2 },
      { x: 1, y: -2 },
    ],
    coins: 500,
  },
];

export function getNextUpgrade({ game }: { game: GameState }) {
  let initialCount = getKeys(INITIAL_FARM.crops).length;
  let cropCount = getKeys(game.crops).length;

  return UPGRADES.find((_, index) => {
    const total = UPGRADES.slice(0, index + 1).reduce((total, upgrade) => {
      return total + upgrade.plots.length;
    }, initialCount);

    return total > cropCount;
  });
}

export type UpgradeGardenAction = {
  type: "garden.upgraded";
};

type Options = {
  state: Readonly<GameState>;
  action: UpgradeGardenAction;
  createdAt?: number;
};

export function upgradeGarden({
  state,
  action,
  createdAt = Date.now(),
}: Options) {
  let game = cloneDeep(state) as GameState;

  const upgrade = getNextUpgrade({ game });

  if (!upgrade) {
    throw new Error("No upgrades available");
  }
  // Check requirements
  if (game.coins < upgrade.coins) {
    throw new Error("Not enough coins");
  }

  // Add plots
  upgrade.plots.forEach((plot, index) => {
    const crops = getKeys(game.crops).length;
    game.crops[crops + 2] = {
      x: plot.x,
      y: plot.y,
      createdAt,
      height: 1,
      width: 1,
      crop: {
        name: "Sunflower",
        plantedAt: 0,
        amount: 1,
      },
    };
  });

  console.log({ cropKeys: getKeys(game.crops) });

  // Subtract coins
  game.coins -= upgrade.coins;

  return {
    ...game,
  };
}
