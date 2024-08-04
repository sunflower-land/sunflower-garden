import Decimal from "decimal.js-light";
import { fromWei } from "web3-utils";
import {
  Bumpkin,
  GameState,
  Inventory,
  ExpansionConstruction,
  PlacedItem,
} from "../types/game";
import { getKeys } from "../types/craftables";
import { BumpkinParts, tokenUriBuilder } from "lib/utils/tokenUriBuilder";
import { Equipped } from "../types/bumpkin";
import { SeedName } from "../types/seeds";

// Our "zoom" factor
export const PIXEL_SCALE = 2.625;

// How many pixels a raw green square is
export const SQUARE_WIDTH = 16;

export const GRID_WIDTH_PX = PIXEL_SCALE * SQUARE_WIDTH;

export const CHICKEN_TIME_TO_EGG = 1000 * 60 * 60 * 24 * 2; // 48 hours
export const MUTANT_CHICKEN_BOOST_AMOUNT = 0.1;
export const HEN_HOUSE_CAPACITY = 10;
export const CHICKEN_COOP_MULTIPLIER = 1.5;

export const POPOVER_TIME_MS = 1000;

export const makeMegaStoreAvailableDates = () => {
  const now = new Date();

  const currentMonthStart = new Date(now);
  const nextMonthStart = new Date(now);

  // Set "from" as the first day of the current month
  currentMonthStart.setUTCDate(1);
  currentMonthStart.setUTCHours(0, 0, 0, 0);

  // Set "to" as the first day of the next month
  nextMonthStart.setUTCMonth(nextMonthStart.getMonth() + 1);
  nextMonthStart.setUTCDate(1);
  nextMonthStart.setUTCHours(0, 0, 0, 0);

  return {
    from: currentMonthStart.getTime(),
    to: nextMonthStart.getTime(),
  };
};

export function isBuildingReady(building: PlacedItem[]) {
  return building.some((b) => b.readyAt <= Date.now());
}
export const INITIAL_STOCK = (state?: GameState): Inventory => {
  const tools = {
    Axe: new Decimal(200),
    Pickaxe: new Decimal(60),
    "Stone Pickaxe": new Decimal(20),
    "Iron Pickaxe": new Decimal(5),
    "Gold Pickaxe": new Decimal(5),
    "Oil Drill": new Decimal(5),
    Rod: new Decimal(50),
  };

  // increase in 50% tool stock if you have a toolshed
  if (state?.buildings.Toolshed && isBuildingReady(state.buildings.Toolshed)) {
    for (const tool in tools) {
      tools[tool as keyof typeof tools] = new Decimal(
        Math.ceil(tools[tool as keyof typeof tools].toNumber() * 1.5),
      );
    }
  }

  const seeds: Record<SeedName, Decimal> = {
    "Sunflower Seed": new Decimal(400),
    "Potato Seed": new Decimal(200),
    "Pumpkin Seed": new Decimal(150),
    "Carrot Seed": new Decimal(100),
    "Cabbage Seed": new Decimal(90),
    "Soybean Seed": new Decimal(90),
    "Beetroot Seed": new Decimal(80),
    "Cauliflower Seed": new Decimal(80),
    "Parsnip Seed": new Decimal(60),
    "Eggplant Seed": new Decimal(50),
    "Corn Seed": new Decimal(50),
    "Radish Seed": new Decimal(40),
    "Wheat Seed": new Decimal(40),
    "Kale Seed": new Decimal(30),

    "Grape Seed": new Decimal(10),
    "Olive Seed": new Decimal(10),
    "Rice Seed": new Decimal(10),

    "Tomato Seed": new Decimal(10),
    "Blueberry Seed": new Decimal(10),
    "Orange Seed": new Decimal(10),
    "Apple Seed": new Decimal(10),
    "Banana Plant": new Decimal(10),
    "Lemon Seed": new Decimal(10),

    "Sunpetal Seed": new Decimal(16),
    "Bloom Seed": new Decimal(8),
    "Lily Seed": new Decimal(4),
  };

  if (
    state?.buildings.Warehouse &&
    isBuildingReady(state.buildings.Warehouse)
  ) {
    // Multiply each seed quantity by 1.2 and round up
    for (const seed in seeds) {
      seeds[seed as keyof typeof seeds] = new Decimal(
        Math.ceil(seeds[seed as keyof typeof seeds].toNumber() * 1.2),
      );
    }
  }

  return {
    // Tools
    ...tools,
    // Seeds
    ...seeds,

    Shovel: new Decimal(1),
    "Rusty Shovel": new Decimal(100),
    "Sand Shovel": new Decimal(25),
    "Sand Drill": new Decimal(5),
    Chicken: new Decimal(5),

    "Magic Bean": new Decimal(5),
    "Immortal Pear": new Decimal(1),
  };
};

export const INVENTORY_LIMIT = (state?: GameState): Inventory => {
  const seeds: Record<SeedName, Decimal> = {
    "Sunflower Seed": new Decimal(1000),
    "Potato Seed": new Decimal(500),
    "Pumpkin Seed": new Decimal(400),
    "Carrot Seed": new Decimal(250),
    "Cabbage Seed": new Decimal(240),
    "Soybean Seed": new Decimal(240),
    "Beetroot Seed": new Decimal(220),
    "Cauliflower Seed": new Decimal(200),
    "Parsnip Seed": new Decimal(150),
    "Eggplant Seed": new Decimal(120),
    "Corn Seed": new Decimal(120),
    "Radish Seed": new Decimal(100),
    "Wheat Seed": new Decimal(100),
    "Kale Seed": new Decimal(80),

    "Tomato Seed": new Decimal(50),
    "Lemon Seed": new Decimal(45),
    "Blueberry Seed": new Decimal(40),
    "Orange Seed": new Decimal(33),
    "Apple Seed": new Decimal(25),
    "Banana Plant": new Decimal(25),

    "Rice Seed": new Decimal(50),
    "Grape Seed": new Decimal(50),
    "Olive Seed": new Decimal(50),

    "Sunpetal Seed": new Decimal(40),
    "Bloom Seed": new Decimal(20),
    "Lily Seed": new Decimal(10),
  };

  if (
    state?.buildings.Warehouse &&
    isBuildingReady(state.buildings.Warehouse)
  ) {
    // Multiply each seed quantity by 1.2
    for (const seed in seeds) {
      seeds[seed as keyof typeof seeds] = new Decimal(
        Math.ceil(seeds[seed as keyof typeof seeds].toNumber() * 1.2),
      );
    }
  }

  return seeds;
};

export const INITIAL_GOLD_MINES: GameState["gold"] = {
  0: {
    stone: {
      amount: 0.1,
      minedAt: 0,
    },
    x: -4,
    y: 2,
    height: 1,
    width: 1,
  },
};

export const INITIAL_EXPANSION_IRON: GameState["iron"] = {
  0: {
    stone: {
      amount: 0.1,
      minedAt: 0,
    },
    x: 2,
    y: -1,
    height: 1,
    width: 1,
  },
};

export const GENESIS_LAND_EXPANSION: ExpansionConstruction = {
  createdAt: 1,
  readyAt: 0,
};

export const TREE_RECOVERY_TIME = 2 * 60 * 60;
export const STONE_RECOVERY_TIME = 4 * 60 * 60;
export const IRON_RECOVERY_TIME = 8 * 60 * 60;
export const GOLD_RECOVERY_TIME = 24 * 60 * 60;
export const CRIMSTONE_RECOVERY_TIME = 24 * 60 * 60;
export const SUNSTONE_RECOVERY_TIME = 3 * 24 * 60 * 60;

export const INITIAL_RESOURCES: Pick<
  GameState,
  | "crops"
  | "trees"
  | "stones"
  | "iron"
  | "gold"
  | "fruitPatches"
  | "flowers"
  | "crimstones"
  | "sunstones"
  | "beehives"
  | "oilReserves"
> = {
  crops: {},
  trees: {
    1: {
      createdAt: Date.now(),
      wood: {
        amount: 2,
        choppedAt: 0,
      },
      x: -3,
      y: 3,
      height: 2,
      width: 2,
    },
    2: {
      createdAt: Date.now(),
      wood: {
        amount: 1,
        choppedAt: 0,
      },
      x: 5,
      y: 0,
      height: 2,
      width: 2,
    },

    3: {
      createdAt: Date.now(),
      wood: {
        amount: 2,
        choppedAt: 0,
      },
      x: 7,
      y: 9,
      height: 2,
      width: 2,
    },
  },
  stones: {
    1: {
      createdAt: Date.now(),
      stone: {
        amount: 1,
        minedAt: 0,
      },
      x: 7,
      y: 5,
      height: 1,
      width: 1,
    },
    2: {
      createdAt: Date.now(),
      stone: {
        amount: 1,
        minedAt: 0,
      },
      x: 3,
      y: 6,
      height: 1,
      width: 1,
    },
  },
  fruitPatches: {},
  gold: {},
  iron: {},
  crimstones: {},
  flowers: {
    discovered: {},
    flowerBeds: {},
  },
  sunstones: {},
  beehives: {},
  oilReserves: {},
};

export const INITIAL_EXPANSIONS = 3;

const INITIAL_EQUIPMENT: BumpkinParts = {
  background: "Farm Background",
  body: "Beige Farmer Potion",
  hair: "Basic Hair",
  shoes: "Black Farmer Boots",
  pants: "Farmer Overalls",
  tool: "Farmer Pitchfork",
  shirt: "Red Farmer Shirt",
};

export const INITIAL_BUMPKIN: Bumpkin = {
  equipped: INITIAL_EQUIPMENT as Equipped,
  experience: 0,

  id: 1,
  skills: {},
  tokenUri: `1_${tokenUriBuilder(INITIAL_EQUIPMENT)}`,
  achievements: {},

  activity: {},
};

export const INITIAL_FARM: GameState = {
  coins: 0,
  balance: new Decimal(0),
  previousBalance: new Decimal(0),
  inventory: {
    "Town Center": new Decimal(1),
    Market: new Decimal(1),
    Workbench: new Decimal(1),
    "Basic Land": new Decimal(INITIAL_EXPANSIONS),
    "Crop Plot": new Decimal(getKeys(INITIAL_RESOURCES.crops).length),
    Tree: new Decimal(getKeys(INITIAL_RESOURCES.trees).length),
    "Stone Rock": new Decimal(getKeys(INITIAL_RESOURCES.stones).length),
    Axe: new Decimal(10),
    "Block Buck": new Decimal(1),
    Rug: new Decimal(1),
    Wardrobe: new Decimal(1),
    Shovel: new Decimal(1),
  },
  previousInventory: {},
  wardrobe: {},
  previousWardrobe: {},
  pots: {},

  bumpkin: INITIAL_BUMPKIN,

  minigames: {
    games: {},
    prizes: {},
  },

  megastore: {
    available: {
      from: 0,
      to: 0,
    },
    collectibles: [],
    wearables: [],
  },

  mysteryPrizes: {},
  stockExpiry: {},
  mushrooms: {
    mushrooms: {},
    spawnedAt: 0,
  },

  island: {
    type: "basic",
  },

  home: {
    collectibles: {
      Wardrobe: [
        {
          id: "1",
          createdAt: Date.now(),
          coordinates: {
            x: 1,
            y: 3,
          },
          readyAt: Date.now(),
        },
      ],
      Rug: [
        {
          id: "2",
          createdAt: Date.now(),
          coordinates: {
            x: 0,
            y: 2,
          },
          readyAt: Date.now(),
        },
      ],
    },
  },
  farmHands: { bumpkins: {} },
  greenhouse: {
    oil: 100,
    pots: {},
  },

  createdAt: new Date().getTime(),

  ...INITIAL_RESOURCES,

  conversations: ["hank-intro"],

  fishing: {
    dailyAttempts: {},
    weather: "Sunny",
    wharf: {},
    beach: {},
  },
  mailbox: {
    read: [],
  },

  stock: INITIAL_STOCK(),
  chickens: {},
  trades: {},
  buildings: {
    "Town Center": [
      {
        id: "123",
        readyAt: 0,
        coordinates: {
          x: -1,
          y: 1,
        },
        createdAt: 0,
      },
    ],
    Workbench: [
      {
        id: "123",
        readyAt: 0,
        coordinates: {
          x: 4,
          y: 8,
        },
        createdAt: 0,
      },
    ],

    Market: [
      {
        id: "123",
        readyAt: 0,
        coordinates: {
          x: 5,
          y: 3,
        },
        createdAt: 0,
      },
    ],
  },
  collectibles: {},
  pumpkinPlaza: {},
  treasureIsland: {
    holes: {},
  },
  auctioneer: {},
  delivery: {
    fulfilledCount: 0,
    orders: [
      {
        createdAt: Date.now(),
        readyAt: Date.now(),
        from: "betty",
        reward: {
          items: {},
          coins: 64,
        },
        id: "1",
        items: {
          Sunflower: 30,
        },
      },
      {
        createdAt: Date.now(),
        readyAt: Date.now(),
        from: "grubnuk",
        reward: {
          items: {},
          coins: 64,
        },
        id: "2",
        items: {
          "Pumpkin Soup": 1,
        },
      },
      {
        createdAt: Date.now(),
        readyAt: Date.now(),
        from: "grimbly",
        reward: {
          items: {},
          coins: 48,
        },
        id: "3",
        items: {
          "Mashed Potato": 2,
        },
      },
    ],
    milestone: {
      goal: 10,
      total: 10,
    },
  },
  farmActivity: {},
  milestones: {},
  specialEvents: {
    history: {},
    current: {},
  },
  goblinMarket: {
    resources: {},
  },
  kingdomChores: {
    chores: [],
    choresCompleted: 0,
    choresSkipped: 0,
  },
  desert: {
    digging: {
      grid: [],
      patterns: [],
    },
  },
};

export const TEST_FARM: GameState = {
  coins: 0,
  balance: new Decimal(0),
  previousBalance: new Decimal(0),
  inventory: {
    Sunflower: new Decimal(5),
    Potato: new Decimal(12),
    Carrot: new Decimal("502.079999999999991"),
    "Roasted Cauliflower": new Decimal(1),
    "Carrot Cake": new Decimal(1),
    Radish: new Decimal(100),
    Wheat: new Decimal(100),
    Egg: new Decimal(30),
    "Rusty Shovel": new Decimal(1),
    Axe: new Decimal(3),
    Pickaxe: new Decimal(3),
    "Stone Pickaxe": new Decimal(3),
    "Iron Pickaxe": new Decimal(5),
    "Trading Ticket": new Decimal(50),
    "Chef Hat": new Decimal(1),
    "Boiled Eggs": new Decimal(3),
    "Sunflower Cake": new Decimal(1),
    "Basic Land": new Decimal(3),
  },
  previousInventory: {},
  minigames: {
    games: {},
    prizes: {},
  },
  pots: {},
  kingdomChores: {
    chores: [],
    choresCompleted: 0,
    choresSkipped: 0,
  },
  stock: INITIAL_STOCK(),
  chickens: {},
  farmActivity: {},
  milestones: {},
  home: { collectibles: {} },
  island: { type: "basic" },
  farmHands: { bumpkins: {} },
  fishing: {
    weather: "Sunny",
    wharf: {},
    beach: {},
    dailyAttempts: {},
  },
  greenhouse: {
    pots: {},
    oil: 0,
  },
  wardrobe: {},
  previousWardrobe: {},
  createdAt: new Date().getTime(),
  conversations: [],
  mailbox: {
    read: [],
  },
  trades: {},
  crops: {
    1: {
      createdAt: Date.now(),
      crop: { name: "Sunflower", plantedAt: 0, amount: 1 },
      x: -2,
      y: 0,
      height: 1,
      width: 1,
    },
    2: {
      createdAt: Date.now(),
      crop: { name: "Sunflower", plantedAt: 0, amount: 1 },
      x: -1,
      y: 0,
      height: 1,
      width: 1,
    },
    3: {
      createdAt: Date.now(),
      crop: { name: "Sunflower", plantedAt: 0, amount: 1 },
      x: 0,
      y: 0,
      height: 1,
      width: 1,
    },
    4: {
      createdAt: Date.now(),
      x: -2,
      y: -1,
      height: 1,
      width: 1,
    },
    5: {
      createdAt: Date.now(),
      x: -1,
      y: -1,
      height: 1,
      width: 1,
    },
    6: {
      createdAt: Date.now(),
      x: 0,
      y: -1,
      height: 1,
      width: 1,
    },

    7: {
      createdAt: Date.now(),
      x: -2,
      y: 1,
      height: 1,
      width: 1,
    },
    8: {
      createdAt: Date.now(),
      x: -1,
      y: 1,
      height: 1,
      width: 1,
    },
    9: {
      createdAt: Date.now(),
      x: 0,
      y: 1,
      height: 1,
      width: 1,
    },
  },
  mysteryPrizes: {},
  stockExpiry: {
    "Sunflower Cake": "1970-06-06",
    "Potato Cake": "1970-01-01T00:00:00.000Z",
    "Pumpkin Cake": "1970-01-01T00:00:00.000Z",
    "Carrot Cake": "2022-08-30T00:00:00.000Z",
    "Cabbage Cake": "1970-01-01T00:00:00.000Z",
    "Beetroot Cake": "1970-01-01T00:00:00.000Z",
    "Cauliflower Cake": "1970-01-01T00:00:00.000Z",
    "Parsnip Cake": "1970-01-01T00:00:00.000Z",
    "Radish Cake": "2025-01-01T00:00:00.000Z",
    "Wheat Cake": "1970-01-01T00:00:00.000Z",
  },
  pumpkinPlaza: {},
  delivery: {
    fulfilledCount: 0,
    orders: [],
    milestone: {
      goal: 10,
      total: 10,
    },
  },
  auctioneer: {},
  buildings: {
    "Fire Pit": [
      {
        id: "123",
        readyAt: 0,
        coordinates: {
          x: 4,
          y: 8,
        },
        createdAt: 0,
      },
    ],
    Market: [
      {
        id: "123",
        readyAt: 0,
        coordinates: {
          x: 2,
          y: 2,
        },
        createdAt: 0,
      },
    ],
    Workbench: [
      {
        id: "123",
        readyAt: 0,
        coordinates: {
          x: -2,
          y: 8,
        },
        createdAt: 0,
      },
    ],
  },
  airdrops: [],
  collectibles: {},
  warCollectionOffer: {
    warBonds: 10,
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 10000).toISOString(),
    ingredients: [
      {
        amount: 50,
        name: "Wood",
      },
    ],
  },
  bumpkin: INITIAL_BUMPKIN,

  dailyRewards: { streaks: 0 },

  fruitPatches: {},
  flowers: {
    discovered: {},
    flowerBeds: {},
  },
  gold: {},
  iron: {},
  stones: {
    1: {
      stone: {
        amount: 1,
        minedAt: 0,
      },
      x: 7,
      y: 3,
      height: 1,
      width: 1,
    },
    2: {
      stone: {
        amount: 1,
        minedAt: 0,
      },
      x: 3,
      y: 6,
      height: 1,
      width: 1,
    },
  },
  crimstones: {},
  oilReserves: {},
  trees: {
    1: {
      wood: {
        amount: 2,
        choppedAt: 0,
      },
      x: -3,
      y: 3,
      height: 2,
      width: 2,
    },
    2: {
      wood: {
        amount: 1,
        choppedAt: 0,
      },
      x: 7,
      y: 0,
      height: 2,
      width: 2,
    },

    3: {
      wood: {
        amount: 2,
        choppedAt: 0,
      },
      x: 7,
      y: 9,
      height: 2,
      width: 2,
    },
  },
  sunstones: {},
  mushrooms: {
    spawnedAt: 0,
    mushrooms: {},
  },
  beehives: {},
  megastore: {
    available: makeMegaStoreAvailableDates(),
    collectibles: [],
    wearables: [],
  },
  specialEvents: {
    current: {},
    history: {},
  },
  goblinMarket: {
    resources: {},
  },
  desert: {
    digging: {
      patterns: [],

      grid: [],
    },
  },
};

export const EMPTY: GameState = {
  coins: 0,
  balance: new Decimal(fromWei("0")),
  previousBalance: new Decimal(fromWei("0")),
  createdAt: new Date().getTime(),
  inventory: {
    "Chicken Coop": new Decimal(1),
    Wood: new Decimal(50),
    Gold: new Decimal(10),
    Stone: new Decimal(10),
  },
  minigames: {
    games: {},
    prizes: {},
  },
  pots: {},

  previousInventory: {},
  chickens: {},
  stock: {},
  stockExpiry: {},
  wardrobe: {},
  previousWardrobe: {},
  conversations: [],
  farmHands: {
    bumpkins: {},
  },
  kingdomChores: {
    chores: [],
    choresCompleted: 0,
    choresSkipped: 0,
  },
  greenhouse: {
    pots: {},
    oil: 0,
  },
  mailbox: {
    read: [],
  },
  delivery: {
    fulfilledCount: 0,
    orders: [],
    milestone: {
      goal: 10,
      total: 10,
    },
  },
  home: { collectibles: {} },
  island: { type: "basic" },
  buildings: {},
  collectibles: {},
  mysteryPrizes: {},
  pumpkinPlaza: {},
  dailyRewards: { streaks: 0 },
  auctioneer: {},

  trades: {},
  fruitPatches: {},
  beehives: {},
  flowers: {
    discovered: {},
    flowerBeds: {},
  },
  gold: {},
  iron: {},
  crops: {},
  stones: {},
  crimstones: {},
  oilReserves: {},
  trees: {},
  sunstones: {},
  farmActivity: {},
  milestones: {},
  fishing: {
    weather: "Sunny",
    wharf: {},
    beach: {},
    dailyAttempts: {},
  },
  mushrooms: {
    spawnedAt: 0,
    mushrooms: {},
  },
  megastore: {
    available: makeMegaStoreAvailableDates(),
    collectibles: [],
    wearables: [],
  },
  specialEvents: {
    current: {},
    history: {},
  },
  goblinMarket: {
    resources: {},
  },
  desert: {
    digging: {
      patterns: [],
      grid: [],
    },
  },
};
