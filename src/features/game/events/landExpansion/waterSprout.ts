import { GameState } from "features/game/types/game";
import cloneDeep from "lodash.clonedeep";

export type WaterSproutAction = {
  type: "sprout.watered";
  potId: string;
};

type Options = {
  state: Readonly<GameState>;
  action: WaterSproutAction;
  createdAt?: number;
};

export function waterSprout({
  state,
  action,
  createdAt = Date.now(),
}: Options) {
  const stateCopy: GameState = cloneDeep(state);

  const pot = stateCopy.pots[action.potId];
  if (!pot?.plant) {
    throw new Error("Plant does not exist");
  }

  pot.plant.events = [
    ...pot.plant.events,
    { name: "sprout.watered", createdAt },
  ];

  stateCopy.coins += 50;

  return stateCopy;
}
