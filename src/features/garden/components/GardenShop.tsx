import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { ITEM_DETAILS } from "features/game/types/images";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import React, { useState } from "react";
import { GardenSeeds } from "./GardenSeeds";
import { OuterPanel } from "components/ui/Panel";
import { GardenPurchases } from "./GardenPurchases";

import shopIcon from "assets/icons/shop.png";
import arrowUp from "assets/icons/increase_arrow.png";

interface Props {
  onClose: () => void;
}
export const GardenShop: React.FC<Props> = ({ onClose }) => {
  const { t } = useAppTranslation();
  const [tab, setTab] = useState(0);
  return (
    <CloseButtonPanel
      currentTab={tab}
      setCurrentTab={setTab}
      onClose={onClose}
      container={OuterPanel}
      tabs={[
        {
          icon: ITEM_DETAILS.Sunflower.image,
          name: t("Crops"),
        },
        {
          icon: arrowUp,
          name: t("Upgrade"),
        },
      ]}
    >
      {tab === 0 && <GardenSeeds />}
      {tab === 1 && <GardenPurchases onClose={onClose} />}
    </CloseButtonPanel>
  );
};
