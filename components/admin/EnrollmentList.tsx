import { API } from "@/api/api";
import { singleUserDetailed } from "@/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Avatar, DataTable } from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import { format } from "date-fns";
import { getFontSize } from "@/utils/fontSize";

export function EnrollmentList({
  data,
  invalidator
}: {
  data: singleUserDetailed["enrollments"];
  invalidator: () => void;
}) {
  const mutation = useMutation({
    //@ts-expect-error
    mutationFn: (arg: []) => API.updateEnrollment(...arg),
    onSuccess: () => {
        return invalidator();
    },
  });
  const status = ["approved", "pending", "rejected"].reduce((acc, item) => {
    return [...acc, { status: item }];
  }, []);
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
        <DataTable.Title {...textStyle}>course</DataTable.Title>
        <DataTable.Title {...textStyle}>status</DataTable.Title>
        <DataTable.Title {...textStyle}>enrolled on</DataTable.Title>
      </DataTable.Header>
      {data.map((item) => (
        <DataTable.Row key={item.publicId} style={{ pointerEvents: "none" }}>
          <DataTable.Cell {...textStyle}>{item.course.title}</DataTable.Cell>
          <DataTable.Cell {...textStyle}>
            {mutation.isPending &&
            mutation.variables[2] == `status_${item.publicId}` ? (
              <ActivityIndicator size="small" color="#D22A38" />
            ) : (
              <Dropdown
                data={status}
                labelField="status"
                valueField="status"
                value={item.status}
                containerStyle={{ width: 100 }}
                selectedTextStyle={{ color: textStyle.textStyle.color }}
                itemTextStyle={{ color: textStyle.textStyle.color }}
                activeColor="#D22A38"
                itemContainerStyle={{ backgroundColor: "#141414" }}
                onChange={(val) => {
                  //@ts-expect-error
                  mutation.mutate([item.publicId, val, `status_${item.publicId}`]);
                }}
              />
            )}
          </DataTable.Cell>
          <DataTable.Cell {...textStyle}>
            {format(new Date(item.createdAt), "dd MMM yy, hh:mm a")}
          </DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  );
}
