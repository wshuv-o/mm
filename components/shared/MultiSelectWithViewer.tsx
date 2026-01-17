import React, { ComponentProps, useRef, useState } from "react";
import { View, Text } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";

import { Chip } from "react-native-paper";
import CustomIcon from "../custom_icon/CustomIcon";
import { moderateScale } from "react-native-size-matters";
import { useQuery } from "@tanstack/react-query";
import { isArray } from "remeda";
type _cP = "labelField" | "valueField" | "value" | "onChange";
type MultiSelectWithViewerProps = {
  queryFn: (q: string) => Promise<any>;
  queryKey: string | string[];
  singleSelect?: boolean;
} & Partial<Omit<ComponentProps<typeof MultiSelect>, _cP>> &
  Pick<ComponentProps<typeof MultiSelect>, _cP>;
export function MultiSelectWithViewer({
  queryFn,
  queryKey,
  singleSelect = false,
  ...mProps
}: MultiSelectWithViewerProps) {
  const [query, setQuery] = useState("");
  const { data } = useQuery({
    queryKey: isArray(queryKey) ? queryKey : [queryKey],
    queryFn: () => queryFn(query),
  });
  const eRef = useRef();
  return (
    <View style={{ gap: 10 }}>
      <MultiSelect
        style={{
          borderBottomColor: "gray",
          borderBottomWidth: 0.5,
          backgroundColor: "#252525",
        }}
        placeholderStyle={{
          fontSize: 16,
          color: "#92929D",
          padding: moderateScale(15, 0.25),
        }}
        ref={eRef}
        selectedTextStyle={{ fontSize: 14 }}
        itemTextStyle={{ color: "#FAFAFB" }}
        inputSearchStyle={{
          height: 40,
          fontSize: 16,
          color: "#FAFAFB",
          borderWidth: 0,
          backgroundColor: "#262626",
        }}
        iconStyle={{ width: 20, height: 20 }}
        search
        containerStyle={{
          backgroundColor: "#1A1A1A",
          borderRadius: 8,
          borderWidth: 0,
        }}
        activeColor="#D22A38"
        dropdownPosition="bottom"
        alwaysRenderSelectedItem
        renderSelectedItem={(item, unSelect) => {
          return (
            <Chip
              style={{
                marginRight: 8,
                marginTop: 8,
                backgroundColor: "#252525",
              }}
              closeIcon={(props) => (
                <CustomIcon
                  {...props}
                  name="close"
                  style={{
                    color: "#D22A38",
                  }}
                ></CustomIcon>
              )}
              onClose={() => unSelect(item)}
            >
              <Text style={{ color: "#D5D5DC" }}>
                {item[mProps.labelField!]}
              </Text>
            </Chip>
          );
        }}
        data={isArray(data) ? data : []}
        searchPlaceholder="Search..."
        onChangeText={setQuery}
        selectedStyle={{
          borderRadius: 12,
        }}
        {...mProps}
        onChange={(v) => {
         const val= singleSelect?(v.at(-1) ?? null):v;
         if (singleSelect) eRef.current.close();
         mProps.onChange?.(val);
        }}
      />
    </View>
  );
}
