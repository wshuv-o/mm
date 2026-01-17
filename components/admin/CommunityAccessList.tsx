import { API } from "@/api/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Linking,
} from "react-native";
import { Avatar, DataTable, Button, IconButton } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { moderateScale } from "react-native-size-matters";
import { Community, singleUserDetailed } from "@/api/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { format } from "date-fns";

export function CommunityAccessList({
  data,
  invalidator,
}: {
  data: Array<
    Community & {
      membership?: Omit<singleUserDetailed["memberships"][number], "community">;
    }
  >;
  invalidator: () => void;
}) {
  const selectValues = {
    status: ["pending", "approved", "banned"].reduce((acc, item) => {
      return [...acc, { status: item }];
    }, []),
  };
  const queryClient = useQueryClient();
  const mutation = useMutation({
    //@ts-expect-error
    mutationFn: (arg: []) => API.updateMembership(...arg),
    onSuccess: () => {
      return invalidator();
    },
  });
  const textStyle = {
    textStyle: {
      color: "#fff",
      fontSize: moderateScale(14),
      fontWeight: "500" as const,
    },
  };
  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title {...textStyle}>community</DataTable.Title>
        <DataTable.Title {...textStyle}>type</DataTable.Title>
        <DataTable.Title {...textStyle}>status</DataTable.Title>
        <DataTable.Title {...textStyle}>agreement</DataTable.Title>
        <DataTable.Title {...textStyle}>joined</DataTable.Title>
      </DataTable.Header>
      {data.map((item) => (
        <DataTable.Row
          key={item.publicId + (item.membership?.publicId ?? "")}
          style={{ pointerEvents: "none" }}
        >
          <DataTable.Cell {...textStyle}>{item.name}</DataTable.Cell>
          <DataTable.Cell {...textStyle}>
            {item.membership ? "membership" : "accountability manager"}
          </DataTable.Cell>
          <DataTable.Cell {...textStyle}>
            {["status"].map((key) => {
              const _item = item.membership;
              return _item ? (
                <DataTable.Cell {...textStyle}>
                  {mutation.isPending &&
                  mutation.variables[2] == `${key}_${_item.publicId}` ? (
                    <ActivityIndicator size="small" color="#D22A38" />
                  ) : (
                    <Dropdown
                      data={selectValues[key]}
                      labelField={key}
                      valueField={key}
                      value={_item[key]}
                      containerStyle={{ width: 100 }}
                      selectedTextStyle={{ color: textStyle.textStyle.color }}
                      itemTextStyle={{ color: textStyle.textStyle.color }}
                      activeColor="#D22A38"
                      itemContainerStyle={{ backgroundColor: "#141414" }}
                      onChange={(val) => {
                        //@ts-expect-error
                        mutation.mutate([
                          _item.publicId,
                          val,
                          `${key}_${_item.publicId}`,
                        ]);
                      }}
                    />
                  )}
                </DataTable.Cell>
              ) : (
                <Text>-</Text>
              );
            })}
          </DataTable.Cell>
          <DataTable.Cell {...textStyle}>
            {item.membership ? (
              item.membership.hasSignedAgreement ? (
                <IconButton
              
                  onPress={() =>
                    Linking.openURL(
                      `https://wordpress-1256868-4514271.cloudwaysapps.com/wp-admin/admin.php?page=forminator-entries&form_type=forminator_forms&form_id=1265&entries-action&date_range&min_id&max_id&search=${
                        item.membership!.publicId
                      }&order_by=entries.date_created&order=DESC&entry_status=all&entries-action-bottom`
                    )
                  }
                  icon={(p) => (
                    <FontAwesome {...p} name="eye" color="#D22A38" />
                  )}
                ></IconButton>
              ) : (
                "N/A"
              )
            ) : (
              "-"
            )}
          </DataTable.Cell>
          <DataTable.Cell {...textStyle}>
            {item.membership
              ? format(new Date(item.membership.createdAt), "dd MMM yy, hh:mm a")
              : "-"}
          </DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
