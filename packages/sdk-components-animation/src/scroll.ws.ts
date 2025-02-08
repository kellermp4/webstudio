import { SlotComponentIcon } from "@webstudio-is/icons/svg";
import type { WsComponentMeta, WsComponentPropsMeta } from "@webstudio-is/sdk";

export const meta: WsComponentMeta = {
  category: "general",
  type: "container",
  description: "Scroll Animation",
  icon: SlotComponentIcon,
  order: 5,
  label: "Scroll Animation",
};

export const propsMeta: WsComponentPropsMeta = {
  props: {
    action: {
      required: false,
      control: "animationAction",
      type: "animationAction",
      description: "Animation Action",
    },
  },
  initialProps: ["action"],
};
