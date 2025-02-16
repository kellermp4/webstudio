import {
  StyleValue,
  toValue,
  type StyleProperty,
} from "@webstudio-is/css-engine";
import {
  Text,
  Grid,
  IconButton,
  Label,
  Separator,
} from "@webstudio-is/design-system";
import { PlusIcon } from "@webstudio-is/icons";
import type { AnimationKeyframe } from "@webstudio-is/sdk";
import { colord } from "colord";
import { Fragment, useState } from "react";
import { ColorPopover } from "~/builder/features/style-panel/shared/color-picker";
import {
  CssValueInput,
  type IntermediateStyleValue,
} from "~/builder/features/style-panel/shared/css-value-input";
import { useIds } from "~/shared/form-utils";

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
  id,
  value,
  onChange,
}: {
  id: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) => {
  const [intermediateValue, setIntermediateValue] = useState<
    StyleValue | IntermediateStyleValue
  >();

  return (
    <CssValueInput
      id={id}
      placeholder="auto"
      getOptions={() => []}
      unitOptions={unitOptions}
      intermediateValue={intermediateValue}
      styleSource="default"
      /* same as offset has 0 - 100% */
      property={"fontStretch"}
      value={
        value !== undefined
          ? {
              type: "unit",
              value: Math.round(value * 1000) / 10,
              unit: "%",
            }
          : undefined
      }
      onChange={(styleValue) => {
        if (styleValue === undefined) {
          setIntermediateValue(styleValue);
          return;
        }

        const clampedStyleValue = { ...styleValue };
        if (
          clampedStyleValue.type === "unit" &&
          clampedStyleValue.unit === "%"
        ) {
          clampedStyleValue.value = Math.min(
            100,
            Math.max(0, clampedStyleValue.value)
          );
        }

        setIntermediateValue(clampedStyleValue);
      }}
      onHighlight={(_styleValue) => {
        /* @todo: think about preview */
      }}
      onChangeComplete={(event) => {
        setIntermediateValue(undefined);

        if (event.value.type === "unit" && event.value.unit === "%") {
          onChange(Math.min(100, Math.max(0, event.value.value)) / 100);
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
  onChange,
}: {
  value: AnimationKeyframe;
  onChange: (value: AnimationKeyframe) => void;
}) => {
  const ids = useIds(["offset"]);
  return (
    <Grid gap={1} align={"center"} css={{ gridTemplateColumns: "1fr 1fr" }}>
      <Label htmlFor={ids.offset}>Offset</Label>
      <OffsetInput
        id={ids.offset}
        value={value.offset}
        onChange={(offset) => {
          onChange({ ...value, offset });
        }}
      />
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
  const ids = useIds(["addKeyframe"]);

  return (
    <Grid gap={2}>
      <Grid gap={1} align={"center"} css={{ gridTemplateColumns: "1fr auto" }}>
        <Label htmlFor={ids.addKeyframe}>
          <Text variant={"titles"}>Keyframes</Text>
        </Label>
        <IconButton id={ids.addKeyframe}>
          <PlusIcon />
        </IconButton>
      </Grid>

      {keyframes.map((value, index) => (
        <Fragment key={index}>
          <Separator />
          <Keyframe
            key={index}
            value={value}
            onChange={(newValue) => {
              const newValues = [...keyframes];
              newValues[index] = newValue;
              onChange(newValues);
            }}
          />
        </Fragment>
      ))}
    </Grid>
  );
};
