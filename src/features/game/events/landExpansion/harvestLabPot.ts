import cloneDeep from "lodash.clonedeep";

import { GameState } from "features/game/types/game";
import Decimal from "decimal.js-light";
import {
  BumpkinActivityName,
  trackActivity,
} from "features/game/types/bumpkinActivity";
import { LAB_PLANTS, LabPlantName } from "features/game/types/labPlants";

export function getReadyAt({
  game,
  plant,
  createdAt = Date.now(),
}: {
  game: GameState;
  plant: LabPlantName;
  createdAt?: number;
}) {
  const seconds = LAB_PLANTS[plant].harvestSeconds;

  return createdAt + seconds * 1000;
}

export type HarvestLabPotAction = {
  type: "pot.harvested";
  id: number;
};

type Options = {
  state: Readonly<GameState>;
  action: HarvestLabPotAction;
  createdAt?: number;
};

const MAX_POTS = 16;
export function harvestPot({
  state,
  action,
  createdAt = Date.now(),
}: Options): GameState {
  const game = cloneDeep(state) as GameState;

  // TODO - check level!

  if (!game.bumpkin) {
    throw new Error("No Bumpkin");
  }

  const potId = action.id;
  if (!Number.isInteger(potId) || potId <= 0 || potId > MAX_POTS) {
    throw new Error("Pot does not exist");
  }

  const pot = game.pots[potId] ?? {};

  if (!pot.plant) {
    throw new Error("Plant does not exist");
  }

  if (
    createdAt <
    getReadyAt({ game, plant: pot.plant.name, createdAt: pot.plant.plantedAt })
  ) {
    throw new Error("Plant is not ready");
  }

  // TODO = Add Coins

  // Tracks Analytics
  // const activityName: BumpkinActivityName = `${pot.plant.name} Harvested`;

  // game.bumpkin.activity = trackActivity(activityName, game.bumpkin.activity);

  // Clears Pot
  delete pot.plant;

  return game;
}
