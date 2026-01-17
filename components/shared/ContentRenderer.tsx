import { LobbyMessage } from "@/api/types";
import { URL_PATTERN_RGX } from "@/lib/urlPattern";
import { parseValue } from "@/packages/rte/src";
import { ComponentProps } from "react";
import { Linking } from "react-native";
import { StyleProp, Text, TextStyle } from "react-native";
import { Button } from "react-native-paper";
import { isString } from "remeda";
import { getFontSize } from "@/utils/fontSize";
import { useWindowQuery } from "@/hooks/useWindowQuery";

function FormatedTxt({ str }: { str: string }) {
  const parts = parseValue(str, [{ pattern: URL_PATTERN_RGX }]).parts;
  const { isMobile } = useWindowQuery();
  const dynamicLineHeight = isMobile ? 18 : 22;

  return parts.map((p) => (
    <Text
      style={{
        color: p.config ? "#4d93f5" : "#B5B5BE",
        //FIXME - this thing will have unforseen sideeffects.needs refactoring
        fontSize: getFontSize("medium"),
        lineHeight: dynamicLineHeight,
      }}
      onPress={
        p.config
          ? () =>
              Linking.openURL(
                p.text.startsWith("http") ? p.text : `https://${p.text}`
              )
          : undefined
      }
    >
      {p.text}
    </Text>
  ));
}

export function ContentRenderer({
  content: _cont,
  rootTxtStyle,
  onHashClick,
}: {
  /**FIXME - this type is misleading ,although content structure is same but it is not being used to render only lobbymsgs*/
  content: LobbyMessage;
  rootTxtStyle?: StyleProp<TextStyle>;
  onHashClick?: (data: any) => void;
}) {
  //FIXME - why the heck server returning string
  const content = isString(_cont) ? JSON.parse(_cont) : _cont;
  return (
    
    <Text style={[{ flex: 1, color: "#fff", fontSize: 15, lineHeight: 1 }, rootTxtStyle]}>
      {content.map((v) =>
        v.data ? (
          <Text
            onPress={
              onHashClick && v.data.trigger == "#"
                ? () => onMentionClick?.(v)
                : undefined
            }
            style={{ color: "#D22A38", fontSize: 15, lineHeight: 24 }}
          >
            {v.text}
          </Text>
        ) : (
          <FormatedTxt str={v.text}></FormatedTxt>
        )
      )}
    </Text>
  );
}
