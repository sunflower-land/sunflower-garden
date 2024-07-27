import { GameState, PlantedCrop } from "../../types/game";
import {
  Crop,
  CropName,
  CROPS,
  GREENHOUSE_CROPS,
  GreenHouseCropName,
} from "../../types/crops";
import Decimal from "decimal.js-light";
import cloneDeep from "lodash.clonedeep";
import {
  BumpkinActivityName,
  trackActivity,
} from "features/game/types/bumpkinActivity";
import { CropPlot } from "features/game/types/game";
import { SELLABLE } from "./sellCrop";
import { getSellPrice } from "features/game/expansion/lib/boosts";

export type LandExpansionHarvestAction = {
  type: "crop.harvested";
  index: string;
};

type Options = {
  state: GameState;
  action: LandExpansionHarvestAction;
  createdAt?: number;
};

export const isBasicCrop = (cropName: CropName) => {
  const cropDetails = CROPS()[cropName];
  return cropDetails.harvestSeconds <= CROPS()["Pumpkin"].harvestSeconds;
};

export const isMediumCrop = (cropName: CropName) => {
  return !(isBasicCrop(cropName) || isAdvancedCrop(cropName));
};

export const isAdvancedCrop = (cropName: CropName) => {
  const cropDetails = CROPS()[cropName];
  return cropDetails.harvestSeconds >= CROPS()["Eggplant"].harvestSeconds;
};

function isCrop(plant: GreenHouseCropName | CropName): plant is CropName {
  return (plant as CropName) in CROPS();
}

export const isOvernightCrop = (cropName: CropName | GreenHouseCropName) => {
  if (isCrop(cropName)) {
    const cropDetails = CROPS()[cropName];
    return cropDetails.harvestSeconds >= CROPS()["Radish"].harvestSeconds;
  }

  const details = GREENHOUSE_CROPS()[cropName];
  return (
    details.harvestSeconds >= 24 * 60 * 60 &&
    details.harvestSeconds <= 36 * 60 * 60
  );
};

export const isReadyToHarvest = (
  createdAt: number,
  plantedCrop: PlantedCrop,
  cropDetails: Crop,
) => {
  return createdAt - plantedCrop.plantedAt >= cropDetails.harvestSeconds * 1000;
};

export function isCropGrowing(plot: CropPlot) {
  const crop = plot.crop;
  if (!crop) return false;

  const cropDetails = CROPS()[crop.name];
  return !isReadyToHarvest(Date.now(), crop, cropDetails);
}

export function harvest({
  state,
  action,
  createdAt = Date.now(),
}: Options): GameState {
  const stateCopy = cloneDeep(state) as GameState;
  const { bumpkin, crops: plots } = stateCopy;

  if (!bumpkin) {
    throw new Error("You do not have a Bumpkin!");
  }

  const plot = plots[action.index];

  if (!plot) {
    throw new Error("Plot does not exist");
  }

  if (!plot.crop) {
    throw new Error("Nothing was planted");
  }

  const { name: cropName, plantedAt, amount = 1, reward } = plot.crop;

  const { harvestSeconds, sellPrice } = CROPS()[cropName];

  if (createdAt - plantedAt < harvestSeconds * 1000) {
    throw new Error("Not ready");
  }

  const activityName: BumpkinActivityName = `${cropName} Harvested`;

  bumpkin.activity = trackActivity(activityName, bumpkin.activity);

  const sellables = SELLABLE[plot.crop.name];
  const price = getSellPrice({
    item: sellables,
    game: stateCopy,
    now: new Date(createdAt),
  });

  const coinsEarned = price;
  bumpkin.activity = trackActivity(
    "Coins Earned",
    bumpkin.activity,
    new Decimal(coinsEarned),
  );

  stateCopy.coins = stateCopy.coins + coinsEarned;

  // Increase XP
  bumpkin.experience += sellPrice;

  // Remove crop data for plot
  delete plot.crop;

  delete plot.fertiliser;

  // const cropCount = stateCopy.inventory[cropName] || new Decimal(0);

  // stateCopy.inventory = {
  //   ...stateCopy.inventory,
  //   [cropName]: cropCount.add(amount),
  // };

  return stateCopy;
}
