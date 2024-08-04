import React, { useContext, useRef, useState } from "react";
import { Transition } from "@headlessui/react";

import emptyPot from "assets/greenhouse/greenhouse_pot.webp";
import sprouted from "assets/greenhouse/sprouted.webp";
import grapeSeedling from "assets/greenhouse/grape_seedling.webp";
import grapeGrowing from "assets/greenhouse/grape_growing.webp";
import grapeAlmost from "assets/greenhouse/grape_almost.webp";
import grapeReady from "assets/greenhouse/grape_ready.webp";
import starSprouted from "assets/greenhouse/star_sprouted.webp";

import { PIXEL_SCALE } from "features/game/lib/constants";
import { Context } from "features/game/GameProvider";
import { MachineState } from "features/game/lib/gameMachine";
import { useSelector } from "@xstate/react";
import { LiveProgressBar } from "components/ui/ProgressBar";
import { getReadyAt } from "features/game/events/landExpansion/harvestLabPot";
import { ITEM_DETAILS } from "features/game/types/images";
import { SUNNYSIDE } from "assets/sunnyside";
import classNames from "classnames";
import { Label, LABEL_STYLES } from "components/ui/Label";
import { secondsToString } from "lib/utils/time";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import {
  LAB_PLANTS,
  LabPlantName,
  SproutName,
  SPROUTS,
} from "features/game/types/labPlants";
import { getYieldColour } from "../plots/Plot";
import Decimal from "decimal.js-light";
import { setPrecision } from "lib/utils/formatNumber";

type Stage = "seedling" | "growing" | "almost" | "ready";
const PLANT_STAGES: Record<LabPlantName, Record<Stage, string>> = {
  "Red Starflower": {
    seedling: sprouted,
    almost: sprouted,
    growing: sprouted,
    ready: starSprouted,
  },
  "Yellow Starflower": {
    seedling: sprouted,
    almost: sprouted,
    growing: sprouted,
    ready: starSprouted,
  },
};

interface Props {
  id: string;
}

const selectPots = (state: MachineState) => state.context.state.pots;
const selectInventory = (state: MachineState) => state.context.state.inventory;

export const Sprout: React.FC<Props> = ({ id }) => {
  const { gameService, showTimers, selectedItem } = useContext(Context);

  const { t } = useAppTranslation();
  const [_, setRender] = useState<number>(0);
  const [showTimeRemaining, setShowTimeRemaining] = useState(false);

  const [showYielded, setShowYielded] = useState(false);
  const coins = useRef(0);

  const pots = useSelector(gameService, selectPots);

  const pot = pots[id];

  const onClick = () => {
    const now = Date.now();

    // TODO harvest logic
    if (pot.plant) return;

    const newState = gameService.send("sprout.planted", {
      potId: id,
      name: selectedItem as SproutName,
    });

    const price = SPROUTS[selectedItem as SproutName].price;
    showYield(price * -1);

    return;
  };

  const showYield = async (amount: number) => {
    coins.current = { amount };

    setShowYielded(true);

    await new Promise((res) => setTimeout(res, 2000));

    setShowYielded(false);
  };

  if (!pot?.plant) {
    return (
      <div
        style={{
          width: `${PIXEL_SCALE * 28}px`,
        }}
      >
        <img
          src={emptyPot}
          className={classNames(
            "cursor-pointer hover:img-highlight  absolute bottom-0",
          )}
          style={{
            width: `${PIXEL_SCALE * 28}px`,
          }}
          onClick={onClick}
        />
        <Transition
          appear={true}
          id="oil-reserve-collected-amount"
          show={showYielded}
          enter="transition-opacity transition-transform duration-200"
          enterFrom="opacity-0 translate-y-4"
          enterTo="opacity-100 -translate-y-0"
          leave="transition-opacity duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="flex -top-2 left-[40%] absolute z-40 pointer-events-none"
        >
          <span
            className="text-sm yield-text"
            style={{
              color: getYieldColour(coins.current ?? 0),
            }}
          >{`${coins.current?.amount > 0 ? "+" : ""}${setPrecision(
            new Decimal(coins.current?.amount ?? 0),
            2,
          )}`}</span>
        </Transition>
      </div>
    );
  }

  const plantedAt = pot.plant.plantedAt;
  const readyAt = getReadyAt({
    game: gameService.state.context.state,
    plant: pot.plant.name,
    createdAt: plantedAt,
  });
  const harvestSeconds = (readyAt - plantedAt) / 1000;
  const secondsLeft = (readyAt - Date.now()) / 1000;
  const startAt = plantedAt ?? 0;

  const percentage = ((harvestSeconds - secondsLeft) / harvestSeconds) * 100;

  const harvest = async () => {
    const previousCoins = gameService.state.context.state.coins;

    const newState = gameService.send("sprout.watered", {
      potId: id,
    });

    showYield(newState.context.state.coins - previousCoins);

    return;

    if (Date.now() < readyAt) {
      setShowTimeRemaining(true);
      await new Promise((res) => setTimeout(res, 2000));
      setShowTimeRemaining(false);
      return;
    }

    gameService.send("greenhouse.harvested", {
      id,
    });
  };

  let stage: Stage = "ready";

  if (percentage < 20) {
    stage = "seedling";
  } else if (percentage < 50) {
    stage = "growing";
  } else if (percentage < 100) {
    stage = "almost";
  }

  return (
    <div
      style={{
        width: `${PIXEL_SCALE * 28}px`,
      }}
    >
      {
        // TODO decide when to let them water
        pot.plant.events.length === 0 && (
          <img
            src={SUNNYSIDE.icons.water}
            className="absolute top-0 right-0 z-10"
            style={{
              width: `${PIXEL_SCALE * 8}px`,
              top: `${PIXEL_SCALE * -10}px`,
              right: `${PIXEL_SCALE * 8}px`,
            }}
          />
        )
      }

      <img
        src={PLANT_STAGES[pot.plant.name][stage]}
        className="cursor-pointer hover:img-highlight absolute bottom-0"
        style={{
          width: `${PIXEL_SCALE * 28}px`,
        }}
        onClick={harvest}
      />
      {showTimers && Date.now() < readyAt && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: `${PIXEL_SCALE * 2.5}px`,
            left: `${PIXEL_SCALE * 6.5}px`,
            width: `${PIXEL_SCALE * 15}px`,
          }}
        >
          <LiveProgressBar
            key={`${startAt}-${readyAt}`}
            startAt={startAt}
            endAt={readyAt}
            formatLength="short"
            onComplete={() => setRender((r) => r + 1)}
          />
        </div>
      )}

      {/* Time left */}
      <Transition
        appear={true}
        show={showTimeRemaining}
        enter="transition-opacity transition-transform duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="flex top-0 left-[90%] absolute z-40 shadow-md w-[200px]"
      >
        <Label type="info" icon={SUNNYSIDE.icons.stopwatch}>
          {`${pot.plant.name}: ${secondsToString(secondsLeft, {
            length: "medium",
          })}`}
        </Label>
      </Transition>

      <Transition
        appear={true}
        id="oil-reserve-collected-amount"
        show={showYielded}
        enter="transition-opacity transition-transform duration-200"
        enterFrom="opacity-0 translate-y-4"
        enterTo="opacity-100 -translate-y-0"
        leave="transition-opacity duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="flex -top-2 left-[40%] absolute z-40 pointer-events-none"
      >
        <span
          className="text-sm yield-text"
          style={{
            color: getYieldColour(coins.current ?? 0),
          }}
        >{`${coins.current?.amount > 0 ? "+" : ""}${setPrecision(
          new Decimal(coins.current?.amount ?? 0),
          2,
        )}`}</span>
      </Transition>
    </div>
  );
};
