import React, {
  ComponentProps,
  ContextType,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  Pressable,
  StyleProp,
  ScrollView,
  ViewStyle,
  Platform,
} from "react-native";
import { funnel, mapValues, merge, mergeDeep, omit, pick } from "remeda";
import {
  parseValue,
  Part,
  SuggestionsProvidedProps,
  TriggersConfig,
  useMentions,
} from "@/packages/rte/src";
import { values } from "remeda";
import { useQuery } from "@tanstack/react-query";
import { TextInput, Portal } from "react-native-paper";
import { rteCtx } from "@/contexts/ctx";

type sgEntry = { id: string | number; name: string; isNew?: boolean };
type RenderFunction<T = {}> = (props: T) => ReactNode;
type suggestionProps = {
  fetch: (kw: string) => Promise<sgEntry[]>;
  queryKey: string;
};
const Suggestions = ({
  keyword,
  onSelect,
  position,
  ...extra
}: SuggestionsProvidedProps &
  suggestionProps & {
    sgType: sgType;
    position: StyleProp<ViewStyle>;
    showOnTop: boolean;
  }) => {
  if (keyword == null) {
    return null;
  }
  const { isPending, data: suggestions } = useQuery({
    queryKey: ["_suggestions", extra.sgType, extra.queryKey, keyword],
    queryFn: async () => extra.fetch(keyword),
  });
  if (!isPending && !suggestions) {
    return null;
  }
  return suggestions?.length ? (
    <Portal>
      <View
        style={[
          { backgroundColor: "#141414" },
          position,
          extra.showOnTop
            ? { top: position.top - suggestions.length * 42 }
            : null,
        ]}
      >
        {suggestions
          .filter((v) => (!v.isNew || v.name) && !v.name.match(/\s/)) //FIXME - remove this hack
          .map((one) => (
            <Pressable
              key={one.id}
              onPress={() => onSelect(one)}
              style={{ padding: 12 }}
            >
              <Text style={{ color: "white" }}>
                {one?.isNew ? "add" : ""} {one.name}
              </Text>
            </Pressable>
          ))}
      </View>
    </Portal>
  ) : null;
};
// Or memoize it inside FC using `useMemo`
const __triggersConfig: TriggersConfig<"mention" | "hashtag"> = {
  mention: {
    // Symbol that will trigger keyword change
    trigger: "@",
    // Style which mention will be highlighted in the `TextInput`
    // textStyle: { fontWeight: "bold", color: "blue" },
    isInsertSpaceAfterMention: true,
  },
  hashtag: {
    // Symbol that will trigger keyword change
    trigger: "#",
    // Style which mention will be highlighted in the `TextInput`
    // textStyle: { fontWeight: "bold", color: "blue" },
    isInsertSpaceAfterMention: true,
  },
};
type sgType = keyof typeof __triggersConfig;
type inputTopPrps = {
  top: number;
  left: number;
  width: number;
  height: number;
};
type propType = Omit<
  ComponentProps<typeof TextInput>,
  keyof ReturnType<typeof useMentions>["textInputProps"]
> & {
  mentionConf: {
    type: sgType[];
    suggestionProps: Partial<Record<sgType, suggestionProps>>;
    suggesTionPos?: "top" | "bottom";
  };
} & {
  inputTop?: RenderFunction<inputTopPrps>;
  onChangeFn: (content: Part[]) => void;
  onInactive?: () => void;
  onShiftEnter?: () => void;
  wrapperStyle?: StyleProp<ViewStyle>;
  instanceId?: string | number;
};
function debouncedFn(fn: (arg) => any, quietPeriod = 300) {
  return funnel(fn, {
    minQuietPeriodMs: quietPeriod,
    reducer: (_, arg) => arg ?? null,
  }).call;
}
export function RTE({
  mentionConf,
  inputTop,
  onChangeFn,
  onInactive,
  onShiftEnter,
  instanceId,
  wrapperStyle,
  ...props
}: propType) {
  const [textValue, setTextValue] = useState("");
  const tconfRef = useRef(pick(__triggersConfig, mentionConf.type));
  const triggersConfig = tconfRef.current;
  const mentionHk = useMentions({
    value: textValue,
    onChange: setTextValue,
    triggersConfig,
  });
  const scrollviewYPos = useRef(null);
  const [panelPos, setPanelPos] = useState();
  const [measurements, setMeasurements] = useState<inputTopPrps | null>(null);
  const _instanceId = useRef(instanceId ?? Date.now() + Math.random());
  const { activeRte, renderdRtes, setActiveRte, ...sgCtx } = useContext(rteCtx);
  const measureView = debouncedFn(() => {
    if (!scrollviewYPos.current) {
      sgCtx.svRef.current?.measureInWindow((x, y, width, height) => {
        scrollviewYPos.current = y;
      });
    }
    if (viewRef.current) {
      viewRef.current?.measureInWindow((x, y, width, height) => {
        let paneltop = y;
        mentionConf.suggesTionPos === "bottom" || !mentionConf.suggesTionPos
          ? (paneltop += height + 10)
          : (paneltop -= 10);
        setPanelPos({ top: paneltop, left: x, width });
        setMeasurements({ left: x, top: y, width, height });
      });
    }
  }, 10);
  const { textInputProps, triggers, parts } = useMemo(() => {
    let { textInputProps, triggers } = mentionHk;
    // https://github.com/dabakovich/react-native-controlled-mentions/tree/3.0?tab=readme-ov-file#rendering-mentions-value
    const { parts, plainText } = parseValue(textValue, values(triggersConfig));
    textInputProps = merge(omit(textInputProps, ["children"]), {
      value: plainText,
      triggers: mapValues(triggers, (v) => {
        const _origFN = v.onSelect;
        v.onSelect = (s) => {
          _origFN(s);
          setTimeout(() => viewRef.current?.focus(), 0);
        };
        return v;
      }),
    });

    return merge(mentionHk, { textInputProps, parts });
  }, [mentionHk]);
  const [fieldTouched, setTouched] = useState(false);
  useEffect(() => {
    measureView(); //ensure panelpos is always defined
    sgCtx.scrollisteners?.set(_instanceId.current, (ev) => {
      measureView();
    });
    if (fieldTouched) onChangeFn(parts);
  }, [textInputProps.value, fieldTouched]);
  const viewRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    renderdRtes.set(_instanceId.current, {
      fns: {
        focus: () => inputRef.current?.focus(),
        reset: () => {
          setTextValue("");
          inputRef.current?.clear();
        },
        setTxt: (txt) => setTextValue(txt),
      },
    });
    return () => renderdRtes.delete(_instanceId);
  });

  useLayoutEffect(() => {
    if (activeRte != _instanceId.current) {
      inputRef.current?.blur();
      onInactive?.();
    } else {
      inputRef.current?.focus();
    }
  }, [activeRte]);

  return (
    <>
      {mentionConf.type.map((v) => (
        <Suggestions
          {...triggers[v]}
          {...mentionConf.suggestionProps[v]!}
          sgType={v}
          showOnTop={mentionConf.suggesTionPos === "top"}
          position={panelPos}
        />
      ))}
      {inputTop && measurements && <Portal>{inputTop(measurements)}</Portal>}
      <View ref={viewRef} style={[{ flexGrow: 1 }, wrapperStyle]}>
        <TextInput
          ref={inputRef}
          mode="outlined"
          outlineColor="transparent"
          activeOutlineColor="#D22A38"
          textColor="#FAFAFB"
          onKeyPress={({ nativeEvent: e }) => {
            if (
              Platform.OS === "web" &&
              e.type === "keydown" &&
              e.key === "Enter" &&
              e.shiftKey &&
              onShiftEnter
            ) {
              e.preventDefault();
              onShiftEnter();
            }
          }}
          {...mergeDeep(
            {
              outlineStyle: {
                borderRadius: 10,
                borderWidth: 1.5,
                minHeight: 48,
              },
              contentStyle: {
                minWidth: 0,
                textAlignVertical: "center",
                paddingTop: 12,
                paddingBottom: 12,
                height: 48,
              },
            },
            props
          )}
          onFocus={(e) => {
            setTouched(true);
            setActiveRte(_instanceId.current);
            props?.onFocus?.(e);
          }}
          {...textInputProps}
        />
      </View>
    </>
  );
}

export function RteCtxHOC(props: {
  children: (ctx: ContextType<typeof rteCtx>) => ReactNode;
}) {
  const ctx = useContext(rteCtx);

  return props.children(ctx);
}
export function RTECtxProviderHOC(props: {
  children: (ctx: ContextType<typeof rteCtx>) => ReactNode;
}) {
  const renderdRtes = useRef(new Map());
  const [activeRte, setActiveRte] = useState(null);
  const scrollisteners = useRef(new Map());
  const scrollviewRef = useRef();
  const ctxVal = useMemo(
    () => ({
      activeRte,
      renderdRtes: renderdRtes.current,
      setActiveRte,
      svRef: scrollviewRef,
      scrollisteners: scrollisteners.current,
    }),
    [activeRte]
  );
  return (
    <rteCtx.Provider value={ctxVal}>{props.children(ctxVal)}</rteCtx.Provider>
  );
}
export function RteScrollView(props: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <RTECtxProviderHOC>
      {(ctx) => (
        <ScrollView
          style={[
            {
              flex: 1,
              backgroundColor: "#141414",
            },
            props.style,
          ]}
          contentContainerStyle={props.contentContainerStyle}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          ref={ctx.svRef}
          onScroll={(e) => ctx.scrollisteners.forEach((fn) => fn(e))}
          scrollEventThrottle={20}
        >
          {props.children}
        </ScrollView>
      )}
    </RTECtxProviderHOC>
  );
}
