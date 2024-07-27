import { useActor } from "@xstate/react";
import { Box } from "components/ui/Box";
import { Label } from "components/ui/Label";
import { CraftingRequirements } from "components/ui/layouts/CraftingRequirements";
import { SplitScreenView } from "components/ui/SplitScreenView";
import { getCropPlotTime } from "features/game/events/landExpansion/plant";
import { getBuyPrice } from "features/game/events/landExpansion/seedBought";
import { Context } from "features/game/GameProvider";
import { getBumpkinLevel } from "features/game/lib/level";
import { CROP_SEEDS, CropName, CROPS } from "features/game/types/crops";
import { getKeys } from "features/game/types/decorations";
import { ITEM_DETAILS } from "features/game/types/images";
import { SeedName, SEEDS } from "features/game/types/seeds";
import { CROP_LIFECYCLE } from "features/island/plots/lib/plant";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import React, { useContext, useState } from "react";

import lock from "assets/icons/lock.png";

export const GardenSeeds: React.FC = () => {
  const [selectedName, setSelectedName] = useState<SeedName>("Sunflower Seed");
  const { gameService, shortcutItem, selectedItem } = useContext(Context);

  const selected = SEEDS()[selectedName];
  const [
    {
      context: { state },
    },
  ] = useActor(gameService);
  const { t } = useAppTranslation();

  const { inventory } = state;

  const price = getBuyPrice(selectedName, selected, inventory, state);

  const isSeedLocked = (seedName: SeedName) => {
    const seed = SEEDS()[seedName];
    return getBumpkinLevel(state.bumpkin?.experience ?? 0) < seed.bumpkinLevel;
  };

  const yields = SEEDS()[selectedName].yield;

  const getPlantSeconds = () => {
    return getCropPlotTime({
      crop: yields as CropName,
      inventory,
      game: state,
      buds: state.buds ?? {},
    });
  };

  const seeds = getKeys(SEEDS()).filter((seed) => !SEEDS()[seed].disabled);

  const onSeedClick = (seedName: SeedName) => {
    setSelectedName(seedName);
    shortcutItem(seedName);
  };

  return (
    <SplitScreenView
      panel={
        <CraftingRequirements
          gameState={state}
          details={{
            item: SEEDS()[selectedName].yield,
          }}
          hideDescription
          requirements={{
            coins: price,
            showCoinsIfFree: true,
            level: isSeedLocked(selectedName)
              ? selected.bumpkinLevel
              : undefined,
            timeSeconds: getPlantSeconds(),
          }}
        />
      }
      content={
        <div className="pl-1">
          <Label
            icon={CROP_LIFECYCLE.Sunflower.crop}
            type="default"
            className="ml-2 mb-1"
          >
            {t("crops")}
          </Label>
          <div className="flex flex-wrap mb-2">
            {seeds
              .filter((name) => name in CROP_SEEDS())
              .map((name: SeedName) => (
                <Box
                  isSelected={selectedName === name}
                  key={name}
                  onClick={() => onSeedClick(name)}
                  image={ITEM_DETAILS[SEEDS()[name].yield].image}
                  showOverlay={isSeedLocked(name)}
                  secondaryImage={isSeedLocked(name) ? lock : undefined}
                />
              ))}
          </div>
        </div>
      }
    />
  );
};
