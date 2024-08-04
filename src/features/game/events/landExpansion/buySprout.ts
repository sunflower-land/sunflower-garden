import { GameState } from "features/game/types/game";
import { SproutName, SPROUTS } from "features/game/types/labPlants";
import cloneDeep from "lodash.clonedeep";

export type BuySproutAction = {
  type: "sprout.planted";
  name: SproutName;
  potId: string;
};

type Options = {
  state: Readonly<GameState>;
  action: BuySproutAction;
  createdAt?: number;
};

export function plantSprout({
  state,
  action,
  createdAt = Date.now(),
}: Options) {
  const stateCopy: GameState = cloneDeep(state);
  const { name } = action;
  const sprout = SPROUTS[name];

  if (!sprout) {
    throw new Error("This item is not a decoration");
  }

  const { bumpkin } = stateCopy;

  if (!bumpkin) {
    throw new Error("Bumpkin not found");
  }

  const price = sprout.price ?? 0;

  if (price && stateCopy.coins < price) {
    throw new Error("Insufficient coins");
  }

  const pot = stateCopy.pots[action.potId];
  if (!pot) {
    throw new Error("Pot does not exist");
  }

  if (pot.plant) {
    throw new Error("Pot already has plant");
  }

  pot.plant = {
    name: "Red Starflower", // TODO determine type
    plantedAt: createdAt,
    events: [],
  };

  stateCopy.coins = stateCopy.coins - price;

  return stateCopy;
}
