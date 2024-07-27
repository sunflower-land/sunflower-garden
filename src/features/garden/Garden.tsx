import React, {
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// import bg from "assets/ui/5x5_grass_bg.png";
import bg from "assets/garden/2x2.png";
import dirt from "assets/garden/dirt_3x3.png";
import upgradeBoard from "assets/garden/upgrade_board.webp";

import { PIXEL_SCALE } from "features/game/lib/constants";

import ScrollContainer from "react-indiana-drag-scroll";

import { useParams } from "react-router-dom";
import { GameBoard } from "components/GameBoard";
import { Context, GameProvider } from "features/game/GameProvider";
import { ModalProvider } from "features/game/components/modal/ModalProvider";
import { GardenHud } from "./components/GardenHud";
import { useActor } from "@xstate/react";
import { getKeys } from "features/game/types/decorations";
import { MapPlacement } from "features/game/expansion/components/MapPlacement";
import { Resource } from "features/island/resources/Resource";
import { Section, useScrollIntoView } from "lib/utils/hooks/useScrollIntoView";
import { DirtRenderer } from "features/game/expansion/components/DirtRenderer";
import { getGameGrid } from "features/game/expansion/placeable/lib/makeGrid";
import { GardenUpgrade } from "./components/GardenUpgrade";
import { Modal } from "components/ui/Modal";

export const GardenContainer: React.FC = () => {
  // catching and passing scroll container to keyboard listeners
  const container = useRef(null);
  const { id } = useParams();

  // Load data
  return (
    <GameProvider key={id}>
      <ModalProvider>
        <ScrollContainer
          className="!overflow-scroll relative w-full h-full page-scroll-container overscroll-none"
          innerRef={container}
          ignoreElements={"*[data-prevent-drag-scroll]"}
        >
          <GameBoard>
            <Garden />
          </GameBoard>
        </ScrollContainer>
      </ModalProvider>
    </GameProvider>
  );
};

export const Garden: React.FC = () => {
  const { gameService } = useContext(Context);
  const [gameState] = useActor(gameService);

  const [showUpgrade, setShowUpgrade] = useState(false);

  const crops = gameState.context.state.crops;

  const [scrollIntoView] = useScrollIntoView();

  useLayoutEffect(() => {
    scrollIntoView(Section.Garden, "auto");
  }, []);

  const gameGridValue = getGameGrid({ crops, collectibles: {} });
  const gameGrid = useMemo(() => {
    return gameGridValue;
  }, [JSON.stringify(gameGridValue)]);

  console.log({ grid: gameGrid });

  return (
    <>
      <Modal show={showUpgrade} onHide={() => setShowUpgrade(false)}>
        <GardenUpgrade onClose={() => setShowUpgrade(false)} />
      </Modal>

      <GardenHud isFarming location="farm" />
      <DirtRenderer island={"basic"} grid={gameGrid} />

      <div
        className="h-full w-full p-1 absolute inset-0"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundRepeat: "repeat",
          // backgroundSize: `${PIXEL_SCALE * 5 * 16}px`,
          backgroundSize: `${PIXEL_SCALE * 2 * 16}px`,
          imageRendering: "pixelated",
          zIndex: "-1",
        }}
      />
      <MapPlacement x={0} y={0} height={1} width={1}>
        <div id={Section.Garden} />
      </MapPlacement>

      <MapPlacement x={2} y={2} height={1} width={1}>
        <img
          src={upgradeBoard}
          style={{
            width: `${PIXEL_SCALE * 16}px`,
          }}
          className="cursor-pointer"
          onClick={() => setShowUpgrade(true)}
        />
      </MapPlacement>

      {getKeys(crops)
        .sort((a, b) => crops[b].y - crops[a].y)
        .map((id, index) => {
          const { x, y, width, height } = crops[id];

          return (
            <MapPlacement
              key={`crops-${id}`}
              x={x}
              y={y}
              height={height}
              width={width}
            >
              <Resource
                name="Crop Plot"
                createdAt={0}
                readyAt={0}
                id={id}
                index={index}
                x={x}
                y={y}
              />
            </MapPlacement>
          );
        })}
    </>
  );
};
