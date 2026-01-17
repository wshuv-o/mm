import { API } from "@/api/api";
import { Attachment } from "@/api/types";
import { TabViewComponent } from "@/components/admin/TabViewComponent";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import EnrollmentGuard from "@/components/guards/EnrollmentGuard";
import { BunnyPlayer } from "@/components/shared/BunnyPlayer";
import { useCourseDataMgr } from "@/hooks/useCourseDataMgr";
import { useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  Linking,
} from "react-native";
import {
  Text,
  Button,
  IconButton,
  Card,
  ActivityIndicator,
} from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import {
  addMinutes,
  differenceInMinutes,
  format,
  formatDistance,
  isAfter,
  isBefore,
  isWithinInterval,
} from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { useAuthManager } from "@/hooks/useAuthManager";
import { useLesson } from "@/hooks/useLesson";
import LessonAttachments from "@/components/course/LessonAttachments";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
import { useWindowQuery } from "@/hooks/useWindowQuery";
type _props = { classId?: string };
const __ZoomClassUI = (props: _props) => {
  const { isMobile } = useWindowQuery(768);
  const localParams = useLocalSearchParams();
  const classId = props.classId || localParams.classId;
  const {
    currentCourse: { isSuccess, data: courseData },
  } = useCourseDataMgr();
  const { activeUser } = useAuthManager();
  const { lesson, hasNonExpiredZoomClass } = useMemo(() => {
    const _cls = (courseData?.chapters ?? [])
      .flatMap((chapter) => chapter.lessons)
      .filter(({ publicId }) => publicId === classId);
    const lesson = _cls.length ? _cls[0] : null;
    const isZoomClass = !!lesson?.zoomSession;
    const hasNonExpiredZoomClass =
      isZoomClass &&
      (isWithinInterval(new Date(), {
        start: lesson.zoomSession.scheduledAt,
        end: addMinutes(lesson.zoomSession.scheduledAt, 60),
      }) ||
        isAfter(lesson.zoomSession.scheduledAt, new Date()));
    return {
      lesson,
      isZoomClass,
      hasNonExpiredZoomClass,
    };
  }, [courseData, classId]);
  const { primaryVid, lessonDuration, filteredAttachments } = useLesson(lesson);

  const [currentVid, setCurrentVid] = useState(null);
  const [embedLoadded, setEmbedLoadded] = useState(false);
  useEffect(() => {
    setEmbedLoadded(false);
    setCurrentVid(primaryVid);
  }, [primaryVid]);
  const attendMtn = useMutation({
    mutationFn: () => API.attendClass(lesson?.publicId),
    onSuccess: async (data) => {
      Linking.openURL(data);
    },
  });
  const [availableWidth, setAvailableWidth] = useState(0);
  if (!isSuccess) {
    return <ActivityIndicator size="large" color="#D22A38" />;
  }

  return (
    <ScrollView
      onContentSizeChange={(w, _) => {
        setAvailableWidth(w);
      }}
      style={{ backgroundColor: "#1C1C1C" }}
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      {((!hasNonExpiredZoomClass && currentVid && !embedLoadded) ||
        !availableWidth) && (
        <FullPageLoader
          styles={{
            backgroundColor: "transparent",
          }}
        ></FullPageLoader>
      )}
      {/* it is crutial to let the width gets set to a non 0 value */}
      {!!availableWidth && (
        <>
          <View style={[styles.mainContent]}>
            <Card.Content style={{ padding: 0 }}>
              {isMobile && (
                <View style={styles.classInfoContent}>
                  <IconButton
                    icon="play-circle"
                    size={moderateScale(24)}
                    iconColor="#D22A38"
                  />
                  <Text
                    style={[
                      styles.classNameText,
                      isMobile && styles.mobileText,
                    ]}
                  >
                    {lesson.title}
                  </Text>
                  <Text
                    style={[styles.timeText, isMobile && styles.mobileText]}
                  >
                    {lessonDuration} min.
                  </Text>
                </View>
              )}
              {hasNonExpiredZoomClass ? (
                <View
                  style={{
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={require("@/assets/images/sammy-office-worker.png")}
                    style={styles.expiredImage}
                    resizeMode="contain"
                  />
                  <View
                    style={[styles.detailsBox, { width: availableWidth * 0.8 }]}
                  >
                    <View style={styles.detailsRow}>
                      {/* FIXME WHY THE FK WE USED BUTTONS HERE */}
                      <Button
                        style={styles.detailText}
                        icon="calendar"
                        mode="contained"
                      >
                        {!isMobile && "Meeting Date: "}
                        <Text style={{ color: "#D22A38" }}>
                          {format(
                            lesson.zoomSession.scheduledAt,
                            "dd MMM yyyy, hh:mm a"
                          )}
                        </Text>
                      </Button>
                    </View>
                    <View style={styles.detailsRow}>
                      <Button
                        style={styles.detailText}
                        icon="school"
                        mode="contained"
                      >
                        {!isMobile && "Host Email: "}
                        <Text style={{ color: "#D22A38" }}>
                          {courseData.author.email}
                        </Text>
                      </Button>
                    </View>

                    <Button
                      mode="contained"
                      theme={{
                        colors: {
                          onSurfaceDisabled: "white",
                        },
                      }}
                      loading={attendMtn.isPending}
                      disabled={attendMtn.isPending}
                      onPress={attendMtn.mutate}
                      style={styles.contactButton}
                    >
                      {activeUser!.publicId == lesson.instructor.publicId
                        ? "start"
                        : "join"}
                    </Button>
                  </View>
                </View>
              ) : (
                <BunnyPlayer
                  {...{ availableWidth }}
                  loaded={embedLoadded}
                  isStandalonePage={!!localParams?.classId}
                  onLoad={() => {
                    setEmbedLoadded(true);
                  }}
                  url={currentVid || primaryVid}
                />
              )}
            </Card.Content>
          </View>

          <LessonAttachments
            files={filteredAttachments}
            currentVid={currentVid}
            setVid={setCurrentVid}
            width={availableWidth * 0.8}
          ></LessonAttachments>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  classInfoContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: moderateScale(4),
  },
  classNameText: {
    flex: 1,
    textAlign: "center",
    color: "#FAFAFB",
    fontSize: moderateScale(8),
    fontFamily: "Poppins",
  },
  timeText: {
    color: "#808080",
    fontSize: moderateScale(8),
    fontFamily: "Poppins",
  },
  mainContent: {
    paddingBottom: moderateScale(8),
    borderRadius: moderateScale(8),
  },
  mainContentDesktop: {
    width: "80%",
    alignSelf: "center",
  },
  expiredImage: {
    width: "100%",
    alignSelf: "center",
    borderRadius: moderateScale(8),
    marginBottom: moderateScale(4),
  },
  expiredText: {
    color: "#FAFAFB",
    fontSize: moderateScale(12),
    fontFamily: "Poppins",
    textAlign: "center",
    marginTop: moderateScale(4),
  },
  subText: {
    color: "#A0A0A0",
    fontSize: moderateScale(8),
    fontFamily: "Poppins",
    textAlign: "center",
    marginTop: moderateScale(2),
  },
  detailsBox: {
    marginTop: moderateScale(4),
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(4),
    justifyContent: "space-between",
  },
  detailText: {
    // color: "red",
    padding: moderateScale(2),
    backgroundColor: "#252525",
    borderRadius: moderateScale(4),
    fontSize: moderateScale(10),
    fontFamily: "Poppins",
    textAlign: "left",
    flex: 1,
  },
  contactButton: {
    marginTop: moderateScale(8),
    alignSelf: "center",
    backgroundColor: "#D22A38",
    paddingVertical: moderateScale(2),
    paddingHorizontal: moderateScale(4),
    borderRadius: moderateScale(4),
  },
  mobileText: {
    fontSize: moderateScale(8),
    // backgroundColor:'red',
  },
});

export default function ZoomClassUI(props?: _props) {
  return (
    <EnrollmentGuard>
      <__ZoomClassUI {...props}></__ZoomClassUI>
    </EnrollmentGuard>
  );
}
