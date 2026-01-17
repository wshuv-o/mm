import React, {
  useMemo,
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";
import { clone, difference } from "remeda";
import { router, useLocalSearchParams, useGlobalSearchParams } from "expo-router";
import { moderateScale } from "react-native-size-matters";

import AISettingsModal from "@/app/(guarded)/(with_layout)/admin/ai/AISettingsModal";
import { useCourseDataMgr } from "@/hooks/useCourseDataMgr";
import CustomIcon from "@/components/custom_icon/CustomIcon";

import ClassDetails from "./class/[classId]";
import { CourseLesson, SingleCourse } from "@/api/types";
import { ChapterRendererHOC } from "@/components/admin/ChapterRendererHOC";
import { LessonFormHOC } from "@/components/admin/LessonFormHOC";
import { useAuthManager } from "@/hooks/useAuthManager";
import { CourseStatusBtns } from "@/components/admin/CourseStatusBtns";
import EnrollmentGuard from "@/components/guards/EnrollmentGuard";
import { useLesson } from "@/hooks/useLesson";
import { useWindowQuery } from "@/hooks/useWindowQuery";

// Renders individual lesson rows
function RenderLesson({
  lesson,
  chapterId,
}: {
  lesson: CourseLesson;
  chapterId: string;
}) {
  const { isDesktop } = useWindowQuery(1024);
  const { lessonId } = useLocalSearchParams();
  const isSelected = lesson.publicId === lessonId;
  const { lessonDuration } = useLesson(lesson);
  const { currentCourseId } = useCourseDataMgr();

  return (
    <LessonFormHOC
      handleClick={() => {
        if (isDesktop) {
          router.setParams({ lessonId: lesson.publicId });
        } else {
          router.navigate(
            `/course/${currentCourseId}/class/${lesson.publicId}`
          );
        }
      }}
      icon="play-circle"
      chapterId={chapterId}
      lesson={lesson.isDummy ? undefined : lesson}
    >
      {({ handleClick, icon, adminControls }) => (
        <TouchableOpacity
          key={lesson.publicId}
          style={[styles.lessonItem, isSelected && styles.lessonItemSelected]}
          onPress={handleClick}
        >
          <CustomIcon name={icon} size={30} color="#D22A38" />
          {adminControls}
          <Text style={styles.lessonText} numberOfLines={1}>
            {lesson.title}
          </Text>
          <Text style={styles.lessonTime}>{lessonDuration} Min</Text>
        </TouchableOpacity>
      )}
    </LessonFormHOC>
  );
}

function RenderChapter({
  item,
  index,
}: {
  item: SingleCourse["chapters"][number];
  index: number;
}) {
  const { isDesktop } = useWindowQuery(1024);
  return (
    <ChapterRendererHOC chapter={item} labelStyle={styles.chapterTitle}>
      {({ label, chapterForm, showForm }) => (
        <View style={{ gap: 8, marginBottom: isDesktop ? 26 : 13 }}>
          <View style={[styles.chapterHeader, { marginVertical: 18 }]}>
            <View
              style={[
                styles.chapterNumberCircle,
                isDesktop
                  ? {
                      width: 41,
                      height: 41,
                    }
                  : {
                      width: 32,
                      height: 32,
                    },
              ]}
            >
              <Text
                style={[
                  styles.chapterNumber,
                  { fontSize: isDesktop ? 22 : 16 },
                ]}
              >
                {index + 1}
              </Text>
            </View>
            {label}
          </View>
          {showForm
            ? chapterForm
            : item.lessons.map((l) => (
                <RenderLesson chapterId={item.publicId} lesson={l} />
              ))}
        </View>
      )}
    </ChapterRendererHOC>
  );
}

function __ChaptersWithClasse() {
  const { isDesktop } = useWindowQuery(1024);
  const {
    currentCourse: { isSuccess, data: courseData },
    currentCourseId,
    invalidateCourseListData,
    invalidateCurrentCourseData,
  } = useCourseDataMgr();
  const { lessonId } = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const { userCanAddCourse } = useAuthManager();

  // NEW: modal visibility state
  const [aiModalVisible, setAiModalVisible] = useState(false);

  // derive courseName & chapters to pass into modal
  const courseName = courseData?.title || "";
  const chapters = courseData?.chapters || [];

  // Filter chapters by search and inject dummy items for admins
  const filteredChapters = useMemo(() => {
    const updatedChapters = clone(courseData?.chapters ?? []).map(
      (chapter) => {
        chapter.lessons = chapter.lessons.filter(({ title }) =>
          title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return chapter;
      }
    );

    if (userCanAddCourse) {
      const patchedReturn = updatedChapters.map((ch) => {
        ch.lessons.push({
          publicId: "___dummy",
          title: "add a new class",
          createdAt: "",
          updatedAt: "",
          // @ts-expect-error
          isDummy: true,
        });
        return ch;
      });
      patchedReturn.push({
        publicId: "____dummy",
        title: "add a new chapter",
        createdAt: "",
        updatedAt: "",
        lessons: [],
        // @ts-expect-error
        isDummy: true,
      });
      return patchedReturn;
    }
    return updatedChapters;
  }, [courseData, searchQuery, isDesktop]);

  // Auto-select logic omitted for brevity…

  // --- Robust logging ---
  useEffect(() => {
    console.log("[DEBUG] Course page render:", {
      currentCourseId,
      isSuccess,
      courseData,
    });
  });

  // --- Forced refetch if stuck loading ---
  useEffect(() => {
    if (!isSuccess) {
      const timer = setTimeout(() => {
        console.warn("[DEBUG] Forcing course data refetch due to stuck loading");
        invalidateCourseListData();
        invalidateCurrentCourseData();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  if (!isSuccess) {
    return <ActivityIndicator size="large" color="#D22A38" />;
  }

  const EditCourseBtn = userCanAddCourse && (
    <Button
      icon={(p) => (
        <CustomIcon {...p} name="arrow-right" style={{ fontSize: 25 }} />
      )}
      mode="outlined"
      style={{
        borderRadius: moderateScale(8, 0.25),
        alignSelf: "flex-start",
        marginBottom: moderateScale(8),
      }}
      labelStyle={{ color: "#D22A38" }}
      rippleColor="#0000003c"
      theme={{ colors: { outline: "#D22A38" } }}
      onPress={() => router.navigate(`/admin/courses/${currentCourseId}`)}
    >
      edit course
    </Button>
  );

  const AiSettingsBtn = userCanAddCourse && (
    <Button
      icon="cog-outline"
      mode="outlined"
      style={styles.actionBtn}
      labelStyle={{ color: "#D22A38" }}
      onPress={() => setAiModalVisible(true)}   // <-- open modal
    >
      AI settings
    </Button>
  );

  const UseAiBtn = (
    <Button
      icon="robot"
      mode="contained"
      style={[styles.actionBtn, { backgroundColor: "#D22A38" }]} 
      labelStyle={{ color: "#FFF" }}
      onPress={() => {
        console.log("[DEBUG] Use AI button pressed, currentCourseId =", currentCourseId);
        router.navigate(`/ceo_ai?coursePublicId=${currentCourseId}`);
      }}
    >
      Use AI
    </Button>
  );

  // Desktop layout
  if (isDesktop) {
    return (
      <View style={styles.container}>
        <CourseStatusBtns />

        <View style={styles.splitView}>
          <View style={styles.leftPane}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Classes"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* Buttons under search bar */}
            <View style={styles.actionsUnderSearch}>
              {EditCourseBtn}
              {AiSettingsBtn}
              {UseAiBtn}
            </View>

            <FlatList
              data={filteredChapters}
              keyExtractor={(ch) => ch.publicId}
              renderItem={(p) => <RenderChapter {...p} />}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <View style={styles.rightPane}>
            {lessonId ? (
            <ClassDetails classId={lessonId} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>Select a class</Text>
              </View>
            )}
          </View>
        </View>

        {/* AI Settings Modal */}
        <AISettingsModal
          visible={aiModalVisible}
          onClose={() => setAiModalVisible(false)}
          courseId={currentCourseId ?? ""}
          courseName={courseName}
          chapters={chapters}
        />
      </View>
    );
  }

  // Mobile layout (similar wiring)
  return (
    <View style={styles.mobileContainer}>
      <CourseStatusBtns />

      <TextInput
        style={styles.searchInput}
        placeholder="Search Classes"
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.actionsUnderSearch}>
        {AiSettingsBtn}
        {UseAiBtn}
      </View>

      <FlatList
        data={filteredChapters}
        keyExtractor={(ch) => ch.publicId}
        renderItem={(p) => <RenderChapter {...p} />}
        showsVerticalScrollIndicator={false}
      />

      <AISettingsModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
        courseId={currentCourseId ?? ""}
        courseName={courseName}
        chapters={chapters}
      />
    </View>
  );
}

export default function ChaptersWithClasse() {
  return (
    <EnrollmentGuard>
      <__ChaptersWithClasse />
    </EnrollmentGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
  },
  splitView: {
    flex: 1,
    flexDirection: "row",
  },
  actionsUnderSearch: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: moderateScale(8),
    gap: moderateScale(10),
  },
  actionBtn: {
    borderRadius: moderateScale(8, 0.25),
    alignSelf: "flex-start",
    borderWidth: 1, // Ensure consistent border for outlined buttons
    borderColor: "#D22A38", // Match border color with theme
  },
  leftPane: {
    flex: 0.4,
    backgroundColor: "#1C1C1C",
    borderRadius: moderateScale(10),
    marginRight: moderateScale(10),
    padding: moderateScale(10),
  },
  rightPane: {
    flex: 0.6,
    backgroundColor: "#1C1C1C",
    borderRadius: moderateScale(10),
    padding: moderateScale(10),
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: "#141414",
    padding: moderateScale(12),
  },
  searchInput: {
    backgroundColor: "#252525",
    color: "#fff",
    padding: Math.min(moderateScale(10.6), 14),
    borderRadius: moderateScale(8),
    marginBottom: moderateScale(10),
    fontSize: 12,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#fff",
  },
  chapterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(8),
  },
  chapterNumberCircle: {
    backgroundColor: "#3D3D46",
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(8),
    borderRadius: 999,
  },
  chapterNumber: {
    color: "#fff",
    fontWeight: "600",
  },
  chapterTitle: {
    color: "#FAFAFB",
    fontSize: 16,
    fontWeight: "600",
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 16,
  },
  lessonItemSelected: {
    backgroundColor: "#5A1C1C",
  },
  lessonText: {
    color: "#FAFAFB",
    fontSize: 14,
    marginLeft: moderateScale(6),
    marginRight: 3,
    flex: 1,
  },
  lessonTime: {
    color: "#FAFAFB",
    fontSize: 16,
  },
});