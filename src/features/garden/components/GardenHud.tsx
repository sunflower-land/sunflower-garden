import React, { useContext, useState } from "react";
import { Balances } from "components/Balances";
import { useActor, useSelector } from "@xstate/react";
import { Context } from "features/game/GameProvider";
import { CollectibleLocation } from "features/game/types/collectibles";
import { HudContainer } from "components/ui/HudContainer";
import { MachineState } from "features/game/lib/gameMachine";

import shopIcon from "assets/icons/shop_disc.png";
import gem from "assets/garden/gem.webp";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { Modal } from "components/ui/Modal";
import { GardenShop } from "./GardenShop";
import { Box } from "components/ui/Box";
import { ITEM_DETAILS } from "features/game/types/images";
import { SeedName, SEEDS } from "features/game/types/seeds";
import { getShortcuts } from "features/farming/hud/lib/shortcuts";
import { ResizableBar } from "components/ui/ProgressBar";
import {
  getBumpkinLevel,
  getExperienceToNextLevel,
} from "features/game/lib/level";
import { CROP_SEEDS, CropName } from "features/game/types/crops";
const _xp = (state: MachineState) =>
  state.context.state.bumpkin?.experience ?? 0;

/**
 * Heads up display - a concept used in games for the small overlaid display of information.
 * Balances, Inventory, actions etc.
 */
const HudComponent: React.FC<{
  isFarming: boolean;
  moveButtonsUp?: boolean;
  location: CollectibleLocation;
}> = ({ isFarming, location }) => {
  const { gameService, shortcutItem, selectedItem } = useContext(Context);
  const [gameState] = useActor(gameService);

  const [showShop, setShowShop] = useState(false);

  const xp = useSelector(gameService, _xp);

  const shortcuts = getShortcuts();

  const experience = gameState.context.state.bumpkin?.experience ?? 0;
  const { currentExperienceProgress, experienceToNextLevel } =
    getExperienceToNextLevel(experience);

  let percent = currentExperienceProgress / experienceToNextLevel;

  const level = getBumpkinLevel(
    gameState.context.state.bumpkin?.experience ?? 0,
  );

  return (
    <>
      <HudContainer>
        <Balances coins={gameState.context.state.coins} />

        <div
          className="absolute flex items-center justify-center"
          style={{
            width: `${PIXEL_SCALE * 18}px`,
            left: `${PIXEL_SCALE * 3}px`,
            top: `${PIXEL_SCALE * 2}px`,
          }}
        >
          <span
            className="balance-text mt-0.5 z-20"
            style={{
              top: "8px",
              left: "4px",
            }}
          >
            {level}
          </span>
          <img src={gem} className="absolute w-full inset-0 z-10" />

          <div
            className="absolute"
            style={{
              left: `${PIXEL_SCALE * 14}px`,
              top: `${PIXEL_SCALE * 2}px`,
            }}
          >
            <ResizableBar
              percentage={percent * 100}
              type="health"
              outerDimensions={{
                width: 30,
                height: 8,
              }}
            />
          </div>
        </div>

        <Modal show={showShop} onHide={() => setShowShop(false)}>
          <GardenShop onClose={() => setShowShop(false)} />
        </Modal>
        <img
          src={shopIcon}
          className="absolute cursor-pointer"
          onClick={() => setShowShop(true)}
          style={{
            width: `${PIXEL_SCALE * 22}px`,
            right: `${PIXEL_SCALE * 3}px`,
            bottom: `${PIXEL_SCALE * 2}px`,
          }}
        />
        <div
          className="flex flex-row-reverse items-center absolute"
          style={{
            marginRight: `${PIXEL_SCALE * -3}px`,
            right: `${PIXEL_SCALE * 28}px`,
            bottom: `${PIXEL_SCALE * 2}px`,
          }}
        >
          {shortcuts.map((item, index) => {
            let name = item;

            // Show the crop image instead
            if (item in CROP_SEEDS()) {
              name = SEEDS()[item as SeedName].yield as CropName;
            }

            return (
              <Box
                key={index}
                isSelected={index === 0}
                image={ITEM_DETAILS[name]?.image}
                onClick={() => shortcutItem(item)}
              />
            );
          })}
        </div>
      </HudContainer>
    </>
  );
};

export const GardenHud = React.memo(HudComponent);
