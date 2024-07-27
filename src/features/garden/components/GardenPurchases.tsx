import { useActor } from "@xstate/react";
import { Label } from "components/ui/Label";
import { CraftingRequirements } from "components/ui/layouts/CraftingRequirements";
import { SplitScreenView } from "components/ui/SplitScreenView";
import { Context } from "features/game/GameProvider";
import React, { useContext, useState } from "react";

import lightning from "assets/icons/lightning.png";
import gift from "assets/icons/gift.png";

import {
  HELIOS_BLACKSMITH_ITEMS,
  HeliosBlacksmithItem,
} from "features/game/types/collectibles";
import { getKeys } from "features/game/types/decorations";
import { Box } from "components/ui/Box";
import { ITEM_DETAILS } from "features/game/types/images";
import { Button } from "components/ui/Button";
import { SUNNYSIDE } from "assets/sunnyside";

interface Props {
  onClose: () => void;
}
export const GardenPurchases: React.FC<Props> = ({ onClose }) => {
  const { gameService } = useContext(Context);

  const [selected, setSelected] =
    useState<HeliosBlacksmithItem>("Basic Scarecrow");

  const [
    {
      context: { state },
    },
  ] = useActor(gameService);

  const items = HELIOS_BLACKSMITH_ITEMS();

  const buy = () => {
    gameService.send("collectible.crafted", {
      name: selected,
    });
  };

  return (
    <SplitScreenView
      panel={
        <CraftingRequirements
          gameState={state}
          details={{
            item: selected,
          }}
          requirements={{
            coins: 200,
          }}
          hideDescription
          actionView={
            state.inventory[selected] ? (
              <Label type="success">Crafted</Label>
            ) : (
              <Button
                disabled={
                  (HELIOS_BLACKSMITH_ITEMS()[selected]?.coins ?? 0) >
                  state.coins
                }
                className="w-full"
                onClick={buy}
              >
                Buy
              </Button>
            )
          }
        />
      }
      content={
        <div className="pl-1">
          <Label type="default" className="mb-2 mr-2" icon={lightning}>
            Equipment
          </Label>
          <div className="flex">
            {getKeys(items).map((key) => {
              return (
                <Box
                  isSelected={key === selected}
                  onClick={() => setSelected(key)}
                  image={ITEM_DETAILS[key].image}
                  secondaryImage={
                    state.inventory[key] && SUNNYSIDE.icons.confirm
                  }
                />
              );
            })}
          </div>
          <Label type="default" className="mb-2 mr-2" icon={gift}>
            Bumpkins
          </Label>
        </div>
      }
    />
  );
};
