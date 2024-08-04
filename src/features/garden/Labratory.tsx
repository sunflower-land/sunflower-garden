import React, { useContext, useLayoutEffect } from "react";

import bg from "assets/garden/2x2.png";

import { GRID_WIDTH_PX, PIXEL_SCALE } from "features/game/lib/constants";
import { Context } from "features/game/GameProvider";
import { MachineState } from "features/game/lib/gameMachine";
import classNames from "classnames";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { Button } from "components/ui/Button";
import { Section, useScrollIntoView } from "lib/utils/hooks/useScrollIntoView";
import { useNavigate } from "react-router-dom";
import { Hud } from "features/island/hud/Hud";
import { GardenHud } from "./components/GardenHud";
import { MapPlacement } from "features/game/expansion/components/MapPlacement";
import { useActor } from "@xstate/react";
import { getKeys } from "features/game/types/decorations";
import { Resource } from "features/island/resources/Resource";
import { Sprout } from "features/island/sprouts/Sprout";

export const Labratory: React.FC = () => {
  const { gameService } = useContext(Context);
  const [gameState] = useActor(gameService);

  const { t } = useAppTranslation();

  const state = gameState.context.state;
  const pots = state.pots;

  const [scrollIntoView] = useScrollIntoView();

  useLayoutEffect(() => {
    scrollIntoView(Section.Garden, "auto");
  }, []);

  return (
    <>
      <div
        className="h-full w-full p-1 absolute inset-0"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundRepeat: "repeat",
          backgroundSize: `${PIXEL_SCALE * 2 * 16}px`,
          imageRendering: "pixelated",
          zIndex: "-1",
        }}
      />

      <MapPlacement x={0} y={0} height={1} width={1}>
        <div id={Section.Garden} />
      </MapPlacement>

      {getKeys(pots)
        .sort((a, b) => pots[b].y - pots[a].y)
        .map((id, index) => {
          const { x, y } = pots[id];

          return (
            <MapPlacement key={`pots-${id}`} x={x} y={y} height={1} width={2}>
              <Sprout id={id} />
            </MapPlacement>
          );
        })}
    </>
  );
};
