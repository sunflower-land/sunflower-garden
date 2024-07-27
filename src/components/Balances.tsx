import React, { useState } from "react";
import Decimal from "decimal.js-light";

import sflIcon from "assets/icons/sfl.webp";
import coinsIcon from "assets/icons/coins.webp";
import blockBucksIcon from "assets/icons/block_buck.png";

import { setPrecision } from "lib/utils/formatNumber";
import { SUNNYSIDE } from "assets/sunnyside";
import classNames from "classnames";

interface Props {
  coins: number;
}

export const Balances: React.FC<Props> = ({ coins }) => {
  return (
    <>
      <div className="flex flex-col absolute space-y-1 items-end z-50 right-0 top-2  text-stroke">
        <div className="flex cursor-pointer items-center space-x-3 relative">
          <div className="h-14 w-full bg-black opacity-30 absolute coins-bb-hud-backdrop" />
          {/* Coins */}
          <div className="flex items-center space-x-2">
            <span className="balance-text mt-0.5">
              {coins % 1 !== 0 ? Math.floor(coins * 100) / 100 : coins}
            </span>
            <img
              src={coinsIcon}
              alt="Coins"
              style={{
                width: 25,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
