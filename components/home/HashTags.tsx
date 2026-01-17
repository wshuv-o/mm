import { API } from "@/api/api";
import { communityCtx } from "@/contexts/ctx";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useLayoutEffect, useRef } from "react";
import { View, Text } from "react-native";
import { Button } from "react-native-paper";
import { unique } from "remeda";
import CustomIcon from "../custom_icon/CustomIcon";

export function HashTags() {
  const { ctxExtra, setCtxExtra } = useContext(communityCtx)!;
  const { hashTags } = useCurrentCommunity();
  return (
    hashTags &&
    hashTags.length && (
      <View
        style={[
          {
            
            backgroundColor: "#1C1C1C",
            margin: 8,
            padding: 24,
            gap: 19,
            borderRadius: 12,
          },
        ]}
      >
        <Text style={{ color: "white", fontWeight: 500, fontSize: 20 }}>
          trending hashtags
        </Text>
        {hashTags.map((h) => (
          <Button
            mode="text"
            compact
            icon={
              ctxExtra?.tags?.includes(h.tag) &&
              (() => (
                <CustomIcon
                  size={19}
                  name="close"
                  color={"#C72937"}
                ></CustomIcon>
              ))
            }
            contentStyle={{
              justifyContent: "space-between",
              flexDirection: ctxExtra?.tags?.includes(h.tag)
                ? "row-reverse"
                : "row",
              height: 35,
              ...(ctxExtra?.tags?.includes(h.tag) && {
                backgroundColor: "#222222",
              }),
            }}
            onPress={() =>
              setCtxExtra((v) => ({
                ...v,
                tags: v?.tags?.includes(h.tag)
                  ? v.tags.filter((v) => v !== h.tag)
                  : (v?.tags || []).concat(h.tag),
              }))
            }
          >
            <Text
              style={{
                color: "#C72937",
                fontWeight: 400,
                fontSize: 14,
                paddingRight: 5,
              }}
            >
              #
            </Text>
            <Text style={{ color: "white", fontWeight: 400, fontSize: 14 }}>
              {h.tag}
            </Text>
          </Button>
        ))}
      </View>
    )
  );
}
