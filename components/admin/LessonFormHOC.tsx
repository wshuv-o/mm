import { API } from "@/api/api";
import { useCourseDataMgr } from "@/hooks/useCourseDataMgr";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import {
  Button,
  Checkbox,
  IconButton,
  List,
  RadioButton,
  TextInput,
} from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import { IcoMoonNames } from "../custom_icon/IcoMoonNames";
import { TimePickerModal, DatePickerInput } from "react-native-paper-dates";
import { merge, mergeDeep } from "remeda";
import { TabViewComponent } from "./TabViewComponent";
import Entypo from "@expo/vector-icons/Entypo";
import CustomIcon from "../custom_icon/CustomIcon";
import { useMediaLib } from "@/hooks/useMedia";
import { ScrollView } from "react-native-gesture-handler";
import { Attachment, ClassItem } from "@/api/types";
import { useAuthManager } from "@/hooks/useAuthManager";
import { format, formatISO } from "date-fns";
import { useLesson } from "@/hooks/useLesson";
import { WithConfirmationHOC } from "../shared/WithConfirmationHOC";
import { MultiSelectWithViewer } from "../shared/MultiSelectWithViewer";
type childprops = {
  handleClick: () => void;
  icon: IcoMoonNames;
  adminControls?: ReactNode;
};
type __merged = {
  lesson?: ClassItem;
  chapterId: string;
  children: (props: childprops) => ReactNode;
} & childprops;
export function LessonFormHOC({
  lesson,
  children,
  chapterId,
  ...defaults
}: __merged) {
  const { invalidateCurrentCourseData } = useCourseDataMgr();

  const [__showForm, __setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const showForm = useMemo(() => editing || __showForm, [__showForm, editing]);
  const setShowForm = (v) => {
    __setShowForm(v);
    !v && setEditing(false);
  };

  function onSuccess(form?: any) {
    setShowForm(false);
    form?.reset();
    return invalidateCurrentCourseData();
  }
  const { mutate, isPending } = useMutation({
    mutationFn: (arg) =>
      editing
        ? API.updateClass(arg, lesson?.publicId)
        : API.addClass(arg, chapterId),
  });
  const rmMutation = useMutation({
    mutationFn: () => API.rmClass(lesson!.publicId),
    onSuccess: () => onSuccess(),
  });
  const { userCanAddCourse } = useAuthManager();
  const { pickMedia } = useMediaLib(false, {
    multiple: true,
    type: [
      "image/jpeg", // jpg
      "image/png", // png
      "video/mp4", // mp4
      "video/x-matroska", // mkv
      "application/pdf", // pdf
    ],
  });
  const { adaptedAttachment, primaryVid, lessonDuration } = useLesson(lesson);

  const form = useForm({
    defaultValues: {
      classConf: {
        title: lesson?.title || "",
        embedUrl: primaryVid || "",
        embedDuration: lesson?.embedDuration || 0,
        order: lesson?.order || 0,
      },
      zoom: {
        duration: lesson?.zoomSession?.duration || 10,
        date: lesson?.zoomSession?.scheduledAt
          ? new Date(lesson.zoomSession.scheduledAt)
          : new Date(),
        time: lesson?.zoomSession?.scheduledAt
          ? format(lesson.zoomSession.scheduledAt, "HH:mm")
          : "0:0",
        autoRecord:
          lesson?.zoomSession?.details?.settings?.auto_recording || "cloud",
      },
      attachments:
        adaptedAttachment ?? ([] as Awaited<ReturnType<typeof pickMedia>>),
      isZoomClass: !!lesson?.zoomSession,
      deletedAttachments: [] as string[],
      packages: lesson?.packages?.map((p) => p.publicId) ?? [],
    },
    onSubmit: ({ value }) => {
      const [hours, minutes] = value.zoom.time.split(":").map(Number);
      value.zoom.date.setHours(hours, minutes);

      const _val = mergeDeep(value, { zoom: { scheduledAt: value.zoom.date } });
      if (!value.isZoomClass) delete _val.zoom;
      if (
        value.classConf.embedUrl ==
        lesson?.attachments?.find((a) => a.isPrimary)?.src?.url
      )
        _val.classConf.embedUrl = null;
      _val.attachments = _val.attachments.filter((a) => a?.file);
      mutate(_val, { onSuccess: () => onSuccess(form) });
    },
  });
  useEffect(() => {
    if (!showForm) form.reset();
  }, [showForm]);
  //----------------------------time picker state----------------------------------
  const [visible, setVisible] = useState(false);

  //------------------------date/time end-------------------------------------

  const adminControls = userCanAddCourse && lesson && (
    <>
      <CustomIcon
        style={{ marginHorizontal: 10 }}
        name="edit-rectangle"
        size={30}
        color="#fff"
        onPress={() => {
          setEditing((v) => !v);
          //delay trick for dependant updates
        }}
      />
      <WithConfirmationHOC isPending={rmMutation.isPending}>
        {(confirm) => (
          <IconButton
            style={{
              height: 32,
              top: -2.1,
              width: 32,
              margin: 0,
            }}
            onPress={() => confirm("are you sure?", rmMutation.mutate)}
            size={30}
            iconColor="#fff"
            icon={(props) => <CustomIcon {...props} name="trash"></CustomIcon>}
          ></IconButton>
        )}
      </WithConfirmationHOC>
    </>
  );

  //-----------editing feature end----------------------
  if (lesson && !showForm) return children({ ...defaults, adminControls });

  return (
    <View style={{ gap: 14, marginBottom: 14 }}>
      {children({
        handleClick: () => setShowForm(!showForm),
        icon: showForm ? "close" : "plus",
        adminControls,
      })}

      {showForm && (
        <>
          <TabViewComponent
            routes={[
              { key: "z", title: "class" },
              { key: "a", title: "attachments" },
            ]}
            scenRenderer={({ route, position }, setRef, refreshHeight, idx) => {
              const getElement = () => {
                switch (route.key) {
                  case "z":
                    return (
                      <>
                        <form.Field name="classConf.title">
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
                        <form.Field name="classConf.embedUrl">
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
                              placeholder="embed url"
                              placeholderTextColor={"#92929D"}
                              textColor="#B5B5BE"
                            />
                          )}
                        </form.Field>
                        <form.Field name="classConf.embedDuration">
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
                              placeholder="embed duration (in minutes)"
                              placeholderTextColor={"#92929D"}
                              textColor="#B5B5BE"
                              keyboardType="numeric"
                            />
                          )}
                        </form.Field>
                        <form.Field name="classConf.order">
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
                        <form.Field name="packages">
                          {(field) => (
                            <MultiSelectWithViewer
                              queryFn={API.getPkgs}
                              queryKey="pkgs_for_lesson"
                              labelField="label"
                              valueField="publicId"
                              value={field.state.value}
                              placeholder="restrict to packages"
                              onChange={field.handleChange}
                            ></MultiSelectWithViewer>
                          )}
                        </form.Field>
                        <form.Field name="isZoomClass">
                          {(field) => (
                            <>
                              <Checkbox.Item
                                label="is zoom class?"
                                status={
                                  field.state.value ? "checked" : "unchecked"
                                }
                                position="leading"
                                labelStyle={{
                                  color: "#B5B5BE",
                                  textAlign: "left",
                                }}
                                color="#D22A38"
                                // don't mess with existing meetings.you've been warned
                                disabled={lesson && field.state.value}
                                uncheckedColor="#D22A38"
                                onPress={() => {
                                  field.handleChange(!field.state.value);
                                }}
                              />

                              {field.state.value && (
                                <>
                                  <form.Field name="zoom.duration">
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
                                        keyboardType="numeric"
                                        placeholder="duration (in minutes)"
                                        placeholderTextColor={"#92929D"}
                                        textColor="#B5B5BE"
                                      />
                                    )}
                                  </form.Field>
                                  <form.Field name="zoom.date">
                                    {(field) => (
                                      <>
                                        <DatePickerInput
                                          style={{
                                            // width: "100%",
                                            //height: "5%",
                                            paddingHorizontal: moderateScale(
                                              15,
                                              0.25
                                            ),
                                            backgroundColor: "#252525",
                                            borderRadius: moderateScale(
                                              12,
                                              0.25
                                            ),
                                            fontFamily: "Poppins",
                                          }}
                                          mode="flat"
                                          placeholder="date"
                                          placeholderTextColor={"#92929D"}
                                          textColor="#B5B5BE"
                                          inputMode="start"
                                          value={field.state.value}
                                          onChange={(gg) => {
                                            field.handleChange(gg);
                                          }}
                                        ></DatePickerInput>
                                      </>
                                    )}
                                  </form.Field>
                                  <form.Field name="zoom.time">
                                    {(field) => (
                                      <>
                                        <TextInput
                                          value={field.state.value}
                                          onChangeText={field.handleChange}
                                          onFocus={() => {
                                            setVisible(true);
                                          }}
                                          style={{
                                            width: "100%",
                                            height: "5%",
                                            padding: moderateScale(15, 0.25),
                                            backgroundColor: "#252525",
                                            borderRadius: moderateScale(
                                              12,
                                              0.25
                                            ),
                                            fontFamily: "Poppins",
                                          }}
                                          mode="flat"
                                          placeholder="time"
                                          placeholderTextColor={"#92929D"}
                                          textColor="#B5B5BE"
                                        />

                                        <TimePickerModal
                                          visible={visible}
                                          onDismiss={() => setVisible(false)}
                                          onConfirm={({ hours, minutes }) => {
                                            setVisible(false);
                                            field.handleChange(
                                              `${hours}:${minutes}`
                                            );
                                          }}
                                          use24HourClock
                                          hours={
                                            +(
                                              field.state.value.split(
                                                ":"
                                              )?.[0] ?? 12
                                            )
                                          }
                                          minutes={
                                            +(
                                              field.state.value.split(
                                                ":"
                                              )?.[1] ?? 12
                                            )
                                          }
                                        />
                                      </>
                                    )}
                                  </form.Field>
                                  <form.Field name="zoom.autoRecord">
                                    {(field) => (
                                      <RadioButton.Group
                                        onValueChange={field.handleChange}
                                        value={field.state.value}
                                      >
                                        {["local", "cloud", "none"].map((v) => (
                                          <View
                                            style={{
                                              flexDirection: "row",
                                              alignItems: "center",
                                            }}
                                          >
                                            <RadioButton
                                              color="#D22A38"
                                              value={v}
                                            />
                                            <Text style={{ color: "#B5B5BE" }}>
                                              {v}
                                            </Text>
                                          </View>
                                        ))}
                                      </RadioButton.Group>
                                    )}
                                  </form.Field>
                                </>
                              )}
                            </>
                          )}
                        </form.Field>
                      </>
                    );

                    break;
                  case "a":
                    return (
                      <>
                        <form.Field name="attachments">
                          {(field) => (
                            <>
                              {field.state.value.map((v, i) => (
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    backgroundColor: "#252525",
                                    borderRadius: moderateScale(6),
                                    paddingHorizontal: moderateScale(10),
                                    marginBottom: moderateScale(6),
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Text style={{ color: "#FAFAFB" }}>
                                    {v.name}
                                  </Text>
                                  <IconButton
                                    disabled={isPending}
                                    style={{
                                      height: 40,
                                      top: -1,
                                      width: 26,
                                      margin: 0,
                                    }}
                                    onPress={() => {
                                      v?.id &&
                                        form.pushFieldValue(
                                          "deletedAttachments",
                                          v.id
                                        );
                                      field.removeValue(i);
                                    }}
                                    icon={(props) => (
                                      <CustomIcon
                                        {...props}
                                        name="close"
                                        style={{
                                          color: "#D22A38",
                                        }}
                                      ></CustomIcon>
                                    )}
                                  ></IconButton>
                                </View>
                              ))}
                              <Button
                                icon={(p) => (
                                  <Entypo
                                    {...p}
                                    name="attachment"
                                    size={24}
                                    color="#D22A38"
                                  />
                                )}
                                mode="outlined"
                                style={{
                                  borderRadius: moderateScale(8, 0.25),
                                }}
                                labelStyle={{ color: "#D22A38" }}
                                rippleColor="#0000003c"
                                onPress={async () => {
                                  const ff = await pickMedia(true);
                                  ff.forEach((v) => field.pushValue(v));
                                }}
                                theme={{ colors: { outline: "#D22A38" } }}
                              >
                                add
                              </Button>
                            </>
                          )}
                        </form.Field>
                      </>
                    );
                    break;

                  default:
                    break;
                }
              };
              //NOTE - scrollview provides a realtime heigt change notifier.we will leverage that here
              return (
                <ScrollView onContentSizeChange={() => refreshHeight()}>
                  <View
                    style={{ width: "100%", gap: 14, paddingVertical: 10 }}
                    ref={(ref) => setRef(route.key == "z" ? 0 : 1, ref)}
                  >
                    {getElement()}
                  </View>
                </ScrollView>
              );
            }}
          ></TabViewComponent>
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
        </>
      )}
    </View>
  );
}
