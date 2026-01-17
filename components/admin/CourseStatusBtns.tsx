import { API } from "@/api/api";
import { SingleCourse } from "@/api/types";
import { useAuthManager } from "@/hooks/useAuthManager";
import { useCourseDataMgr } from "@/hooks/useCourseDataMgr";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button, SegmentedButtons } from "react-native-paper";
import { moderateScale } from "react-native-size-matters";

export function CourseStatusBtns() {
  const {
    currentCourseId,
    currentCourse: { data },
    invalidateAllCourseData,
  } = useCourseDataMgr();
  const { userCanAddCourse } = useAuthManager();
  const qc = useQueryClient();
  const { mutate, isPending, variables } = useMutation({
    mutationFn: (arg) => API.createOrUpdateCourse(arg, currentCourseId!),
    onSuccess: async () => {
      await invalidateAllCourseData();
    },
  });
  const statuses: SingleCourse["status"][] = [
    "draft",
    "published",
    "archived",
    "coming_soon",
  ];
  return userCanAddCourse && data ? (
   <View>
     <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      centerContent
      contentContainerStyle={{
        alignItems: "center",
        marginVertical: 20,
      }}
    >
      <SegmentedButtons
        value={data.status}
        style={{
          width: 510,
        }}
        onValueChange={(v) => {
          mutate({ status: v });
        }}
        buttons={statuses.map((s) => ({
          value: s,
          label: s.replace("_", " "),
          showSelectedCheck: true,
          style: {
            backgroundColor: "transparent",
          },
          checkedColor: "#D22A38",
          uncheckedColor: "white",
          icon:
            variables?.status == s && isPending
              ? () => {
                  return (
                    <ActivityIndicator
                      size="small"
                      color={"#D22A38"}
                    ></ActivityIndicator>
                  );
                }
              : undefined,
        }))}
      />
    </ScrollView>
   </View>
  ) : null;
}
