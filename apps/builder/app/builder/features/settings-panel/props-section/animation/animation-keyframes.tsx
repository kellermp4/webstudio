import {
  StyleValue,
  toValue,
  type StyleProperty,
} from "@webstudio-is/css-engine";
import { Box, Grid } from "@webstudio-is/design-system";
import type { AnimationKeyframe } from "@webstudio-is/sdk";
import { colord } from "colord";
import { useState } from "react";
import { ColorPopover } from "~/builder/features/style-panel/shared/color-picker";
import {
  CssValueInput,
  type IntermediateStyleValue,
} from "~/builder/features/style-panel/shared/css-value-input";

const AdvancedPropertyValue = ({
  property,
  onChangeComplete,
  value,
}: {
  autoFocus?: boolean;
  property: StyleProperty;
  value: StyleValue;
  onChangeComplete: (styleValue: StyleValue | undefined) => void;
}) => {
  const isColor = colord(toValue(value)).isValid();
  const [intermediateValue, setIntermediateValue] = useState<
    StyleValue | IntermediateStyleValue
  >();

  return (
    <CssValueInput
      variant="chromeless"
      text="mono"
      fieldSizing="content"
      prefix={
        isColor && (
          <ColorPopover
            value={value}
            onChange={() => {
              /*
            @todo make it changing online
            */
            }}
            onChangeComplete={(styleValue) => {
              onChangeComplete(styleValue);
            }}
          />
        )
      }
      getOptions={() => [
        /*
          @todo: think about some usefull animation properties and values
          like opacity: 0, opacity: 1, scale: 1 1, rotate, translate.
        */
      ]}
      styleSource="default"
      property={property}
      intermediateValue={intermediateValue}
      value={value}
      onChange={(styleValue) => {
        setIntermediateValue(styleValue);
      }}
      onHighlight={(_styleValue) => {
        /* @todo: think about preview */
      }}
      onChangeComplete={(event) => {
        setIntermediateValue(undefined);
        onChangeComplete?.(event.value);
      }}
      onAbort={() => {
        /* @todo: allow to change some ephemeral property to see the result in action */
      }}
      onReset={() => {
        setIntermediateValue(undefined);
        onChangeComplete?.(undefined);
      }}
    />
  );
};

const unitOptions = [
  {
    id: "%" as const,
    label: "%",
    type: "unit" as const,
  },
];

const OffsetInput = ({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) => {
  const [intermediateValue, setIntermediateValue] = useState<
    StyleValue | IntermediateStyleValue
  >();

  return (
    <CssValueInput
      getOptions={() => []}
      unitOptions={unitOptions}
      intermediateValue={
        intermediateValue ?? {
          type: "intermediate",
          value: "",
          unit: "%",
        }
      }
      styleSource="default"
      /* same as offset has 0 - 100% */
      property={"fontStretch"}
      value={
        value
          ? {
              type: "unit",
              value: Math.round(value * 100),
              unit: "%",
            }
          : undefined
      }
      onChange={(styleValue) => {
        setIntermediateValue(styleValue);
      }}
      onHighlight={(_styleValue) => {
        /* @todo: think about preview */
      }}
      onChangeComplete={(event) => {
        setIntermediateValue(undefined);

        if (event.value.type === "unit" && event.value.unit === "%") {
          onChange(event.value.value / 100);
          return;
        }

        setIntermediateValue({
          type: "invalid",
          value: toValue(event.value),
        });
      }}
      onAbort={() => {
        /* @todo: allow to change some ephemeral property to see the result in action */
      }}
      onReset={() => {
        setIntermediateValue(undefined);
        onChange(undefined);
      }}
    />
  );
};

const Keyframe = ({
  value,
}: {
  value: AnimationKeyframe;
  onChange: (value: AnimationKeyframe) => void;
}) => {
  return (
    <Grid>
      <OffsetInput value={value.offset} onChange={() => {}} />
    </Grid>
  );
};

export const Keyframes = ({
  value: keyframes,
  onChange,
}: {
  value: AnimationKeyframe[];
  onChange: (value: AnimationKeyframe[]) => void;
}) => {
  return (
    <Grid gap={1}>
      <Box>KEYFRAMES</Box>
      {keyframes.map((value, index) => (
        <Keyframe
          key={index}
          value={value}
          onChange={(newValue) => {
            const newValues = [...keyframes];
            newValues[index] = newValue;
            onChange(newValues);
          }}
        />
      ))}
    </Grid>
  );
};
