import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { Panel } from "components/ui/Panel";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import React, { useContext } from "react";

import arrowUp from "assets/icons/increase_arrow.png";
import coins from "assets/icons/coins.webp";
import { Context } from "features/game/GameProvider";
import { useActor } from "@xstate/react";
import { getNextUpgrade } from "features/game/events/landExpansion/upgradeGarden";

interface Props {
  onClose: () => void;
}
export const GardenUpgrade: React.FC<Props> = ({ onClose }) => {
  const { gameService } = useContext(Context);
  const [gameState] = useActor(gameService);

  const game = gameState.context.state;
  const nextUpgrade = getNextUpgrade({ game });

  if (!nextUpgrade) {
    return (
      <CloseButtonPanel onClose={onClose}>
        <div className="p-1">
          <div className="flex items-center">
            <Label type="default" className="mb-2 mr-2" icon={arrowUp}>
              Upgrade Farm
            </Label>
          </div>
          <p className="text-sm mb-1">More upgrades coming soon...</p>
        </div>
      </CloseButtonPanel>
    );
  }

  const upgrade = () => {
    gameService.send("garden.upgraded");
    onClose();
  };

  return (
    <CloseButtonPanel onClose={onClose}>
      <div className="p-1">
        <div className="flex items-center">
          <Label type="default" className="mb-2 mr-2" icon={arrowUp}>
            Upgrade Farm
          </Label>
          <Label type="warning" className="mb-2" icon={coins}>
            {nextUpgrade.coins}
          </Label>
        </div>
        <p className="text-sm mb-1">Would you like to upgrade your farm?</p>
        <p className="text-sm">{`Unlock ${nextUpgrade.plots.length} new spots.`}</p>
      </div>
      <Button disabled={game.coins < nextUpgrade.coins} onClick={upgrade}>
        Ok
      </Button>
    </CloseButtonPanel>
  );
};
