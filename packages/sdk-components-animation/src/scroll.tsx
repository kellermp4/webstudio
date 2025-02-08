import type { AnimationAction } from "@webstudio-is/sdk";
import { forwardRef, type ElementRef } from "react";

type ScrollProps = {
  debug?: boolean;
  children?: React.ReactNode;
  action: AnimationAction;
};

export const Scroll = forwardRef<ElementRef<"div">, ScrollProps>(
  ({ debug = false, action, ...props }, ref) => {
    return <div ref={ref} style={{ display: "contents" }} {...props} />;
  }
);
