import { lexer } from "css-tree";
import { forwardRef, useRef, useState, type KeyboardEvent } from "react";
import { matchSorter } from "match-sorter";
import {
  Box,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxItemDescription,
  ComboboxListbox,
  ComboboxListboxItem,
  ComboboxRoot,
  ComboboxScrollArea,
  InputField,
  NestedInputButton,
  Text,
  theme,
  useCombobox,
} from "@webstudio-is/design-system";
import {
  properties as propertiesData,
  keywordValues,
  propertyDescriptions,
  parseCssValue,
} from "@webstudio-is/css-data";
import {
  cssWideKeywords,
  hyphenateProperty,
  type StyleProperty,
} from "@webstudio-is/css-engine";
import { deleteProperty, setProperty } from "../../shared/use-style-data";
import { composeEventHandlers } from "~/shared/event-utils";

type SearchItem = { property: string; label: string; value?: string };

const autoCompleteItems: Array<SearchItem> = [];

const getNewPropertyDescription = (item: null | SearchItem) => {
  let description: string | undefined = `Create CSS variable.`;
  if (item && item.property in propertyDescriptions) {
    description = propertyDescriptions[item.property];
  }
  return <Box css={{ width: theme.spacing[28] }}>{description}</Box>;
};

const getAutocompleteItems = () => {
  if (autoCompleteItems.length > 0) {
    return autoCompleteItems;
  }
  for (const property in propertiesData) {
    autoCompleteItems.push({
      property,
      label: hyphenateProperty(property),
    });
  }

  const ignoreValues = new Set([...cssWideKeywords, ...keywordValues.color]);

  for (const property in keywordValues) {
    const values = keywordValues[property as keyof typeof keywordValues];
    for (const value of values) {
      if (ignoreValues.has(value)) {
        continue;
      }
      autoCompleteItems.push({
        property,
        value,
        label: `${hyphenateProperty(property)}: ${value}`,
      });
    }
  }

  autoCompleteItems.sort((a, b) =>
    Intl.Collator().compare(a.property, b.property)
  );

  return autoCompleteItems;
};

const matchOrSuggestToCreate = (
  search: string,
  items: Array<SearchItem>,
  itemToString: (item: SearchItem) => string
) => {
  const matched = matchSorter(items, search, {
    keys: [itemToString],
  });

  // Limit the array to 100 elements
  matched.length = Math.min(matched.length, 100);

  const property = search.trim();
  if (
    property.startsWith("--") &&
    lexer.match("<custom-ident>", property).matched
  ) {
    matched.unshift({
      property,
      label: `Create "${property}"`,
    });
  }
  // When there is no match we suggest to create a custom property.
  if (
    matched.length === 0 &&
    lexer.match("<custom-ident>", `--${property}`).matched
  ) {
    matched.unshift({
      property: `--${property}`,
      label: `--${property}: unset;`,
    });
  }

  return matched;
};

/**
 *
 * Advanced search control supports following interactions
 *
 * find property
 * create custom property
 * submit css declarations
 * paste css declarations
 *
 */
export const AddStylesInput = forwardRef<
  HTMLInputElement,
  {
    onClose: () => void;
    onSubmit: (css: string) => void;
    onFocus: () => void;
    onBlur: () => void;
  }
>(({ onClose, onSubmit, onFocus, onBlur }, forwardedRef) => {
  const [item, setItem] = useState<SearchItem>({
    property: "",
    label: "",
  });
  const highlightedItemRef = useRef<SearchItem>();

  const combobox = useCombobox<SearchItem>({
    getItems: getAutocompleteItems,
    itemToString: (item) => item?.label ?? "",
    value: item,
    defaultHighlightedIndex: 0,
    getItemProps: () => ({ text: "sentence" }),
    match: matchOrSuggestToCreate,
    onChange: (value) => setItem({ property: value ?? "", label: value ?? "" }),
    onItemSelect: (item) => {
      clear();
      onSubmit(`${item.property}: ${item.value ?? "unset"}`);
    },
    onItemHighlight: (item) => {
      const previousHighlightedItem = highlightedItemRef.current;
      if (item?.value === undefined && previousHighlightedItem) {
        deleteProperty(previousHighlightedItem.property as StyleProperty, {
          isEphemeral: true,
        });
        highlightedItemRef.current = undefined;
        return;
      }

      if (item?.value) {
        const value = parseCssValue(item.property as StyleProperty, item.value);
        setProperty(item.property as StyleProperty)(value, {
          isEphemeral: true,
        });
        highlightedItemRef.current = item;
      }
    },
  });

  const descriptionItem = combobox.items[combobox.highlightedIndex];
  const description = getNewPropertyDescription(descriptionItem);
  const descriptions = combobox.items.map(getNewPropertyDescription);
  const inputProps = combobox.getInputProps();

  const clear = () => {
    setItem({ property: "", label: "" });
  };

  const handleEnter = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      clear();
      onSubmit(item.property);
    }
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      clear();
      onClose();
    }
  };

  const handleDelete = (event: KeyboardEvent) => {
    // When user hits backspace and there is nothing in the input - we hide the input
    if (event.key === "Backspace" && combobox.inputValue === "") {
      clear();
      onClose();
    }
  };

  const handleKeyDown = composeEventHandlers([
    inputProps.onKeyDown,
    handleEnter,
    handleEscape,
    handleDelete,
  ]);

  return (
    <ComboboxRoot open={combobox.isOpen}>
      <div {...combobox.getComboboxProps()}>
        <ComboboxAnchor>
          <InputField
            {...inputProps}
            autoFocus
            onFocus={onFocus}
            onBlur={(event) => {
              inputProps.onBlur(event);
              onBlur();
            }}
            inputRef={forwardedRef}
            onKeyDown={handleKeyDown}
            placeholder="Add styles"
            suffix={<NestedInputButton {...combobox.getToggleButtonProps()} />}
          />
        </ComboboxAnchor>
        <ComboboxContent>
          <ComboboxListbox {...combobox.getMenuProps()}>
            <ComboboxScrollArea>
              {combobox.items.map((item, index) => (
                <ComboboxListboxItem
                  {...combobox.getItemProps({ item, index })}
                  key={index}
                  asChild
                >
                  <Text
                    variant="labelsSentenceCase"
                    truncate
                    css={{ maxWidth: "25ch" }}
                  >
                    {item.label}
                  </Text>
                </ComboboxListboxItem>
              ))}
            </ComboboxScrollArea>
            {description && (
              <ComboboxItemDescription descriptions={descriptions}>
                {description}
              </ComboboxItemDescription>
            )}
          </ComboboxListbox>
        </ComboboxContent>
      </div>
    </ComboboxRoot>
  );
});
