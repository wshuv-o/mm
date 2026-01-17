import { API } from "@/api/api";
import { SingleCourse } from "@/api/types";
import { useAuthManager } from "@/hooks/useAuthManager";
import { useCourseDataMgr } from "@/hooks/useCourseDataMgr";
import { imgAsset } from "@/hooks/useMedia";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { ReactNode, useMemo, useState } from "react";
import { StyleProp, Text, TextStyle, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
type __merged = {
  labelStyle: StyleProp<TextStyle>;
  chapter: SingleCourse["chapters"][number];
  children: (props: {
    label: ReactNode;
    chapterForm: ReactNode;
    showForm: boolean;
  }) => ReactNode;
};
export function ChapterRendererHOC({
  labelStyle,
  chapter,
  children,
}: __merged) {
  const { invalidateCurrentCourseData, currentCourseId } = useCourseDataMgr();
  const { userCanAddCourse } = useAuthManager();
  const [showForm, setShowForm] = useState(false);
  const editing = useMemo(
    () => showForm && !chapter?.isDummy,
    [showForm, chapter]
  );
  const { mutate, isPending } = useMutation({
    mutationFn: (arg) =>
      editing
        ? API.updateChapter(arg, currentCourseId!, chapter.publicId)
        : API.addChapter(arg, currentCourseId!),
  });
  const form = useForm({
    defaultValues: {
      title: editing ? chapter.title : "",
      order: editing ? chapter.order : 0,
    },
    onSubmit: ({ value }) => {
      mutate(value, {
        onSuccess: () => {
          setShowForm(false);
          form.reset();
          return invalidateCurrentCourseData();
        },
      });
    },
  });
  return children({
    label: (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <Text style={labelStyle}>
          {chapter?.isDummy ? "add a new chapter" : chapter.title}
        </Text>
        {userCanAddCourse && (
          <Button
            icon={showForm ? "close" : "plus"}
            mode="outlined"
            style={{ borderRadius: moderateScale(8, 0.25) }}
            labelStyle={{ color: "#D22A38" }}
            rippleColor="#0000003c"
            onPress={() => setShowForm((v) => !v)}
            theme={{ colors: { outline: "#D22A38" } }}
          >
            {showForm ? "cancel" : chapter?.isDummy ? "add" : "edit"}
          </Button>
        )}
      </View>
    ),
    chapterForm: (
      <View style={{ gap: 14 }}>
        <form.Field name="title">
          {(field) => (
            <TextInput
              value={field.state.value}
              onChangeText={field.handleChange}
              style={{
                width: "100%",
                height: "5%",
                padding: moderateScale(15, 0.25),
                backgroundColor: "#252525",
                borderRadius: moderateScale(12, 0.25),
                fontFamily: "Poppins",
              }}
              mode="flat"
              placeholder="title"
              placeholderTextColor={"#92929D"}
              textColor="#B5B5BE"
            />
          )}
        </form.Field>
        <form.Field name="order">
          {(field) => (
            <TextInput
              value={field.state.value}
              onChangeText={(v) =>
                +v == v ? field.handleChange(v) : null
              }
              style={{
                width: "100%",
                height: "5%",
                padding: moderateScale(15, 0.25),
                backgroundColor: "#252525",
                borderRadius: moderateScale(12, 0.25),
                fontFamily: "Poppins",
              }}
              mode="flat"
              placeholder="order (largest first)"
              placeholderTextColor={"#92929D"}
              textColor="#B5B5BE"
              keyboardType="numeric"
            />
          )}
        </form.Field>
        <Button
          loading={isPending}
          disabled={isPending}
          style={{
            // borderRadius: 13,
            backgroundColor: "#D22A38",
            borderRadius: moderateScale(8, 0.25),
          }}
          labelStyle={{ color: "white" }}
          onPress={form.handleSubmit}
        >
          save
        </Button>
      </View>
    ),
    showForm,
  });
}
