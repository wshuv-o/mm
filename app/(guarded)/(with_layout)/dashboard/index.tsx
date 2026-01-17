import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { useWindowQuery } from "@/hooks/useWindowQuery";
import { API } from "@/api/api";
import { format } from "date-fns";
import { useCourseStats } from "@/hooks/useCourseStats";

export default function ProfileScreen() {
  const { isMobile } = useWindowQuery(768);
  const { courseStats, dataWithLessonStats } = useCourseStats();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.rightContent}>
        <View style={styles.dashboardSection}>
          <View style={styles.header}>
            <Text style={styles.sectionTitle}>Dashboard</Text>
          </View>
          <View
            style={[
              styles.dashboardGrid,

              { gap: 16, flexDirection: isMobile ? "column" : "row" },
            ]}
          >
            {courseStats.map((item, index) => (
              <View
                style={{
                  gap: 8,
                  flex: isMobile ? undefined : 1,
                }}
              >
                <View key={index} style={[styles.dashboardItem]}>
                  <CustomIcon
                    name={item.icon}
                    size={moderateScale(34)}
                    color="#D22A38"
                  />
                  <Text style={styles.itemValue}>{item.value}</Text>
                </View>
                <Text
                  style={[
                    styles.itemLabel,
                    !isMobile && { alignSelf: "center" },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.inProgressSection}>
          <View style={styles.rowEnroll}>
            <Text style={styles.sectionTitle}>In Progress Courses</Text>
          </View>

          {dataWithLessonStats.length ? (
            dataWithLessonStats
              .filter((c) => c.lessionStats.total != c.lessionStats.attended)
              .map((course, index) => (
                <View key={index} style={styles.courseCard}>
                  <Image
                    source={{ uri: API.url(course.coverImage.url) }}
                    style={styles.courseImage}
                  />
                  <View style={styles.courseDetails}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    {isMobile ? (
                      <>
                        <Text style={styles.courseDate}>
                          Start: {format(course.createdAt, "yyyy-MM-dd")}
                        </Text>
                        <View style={styles.progressWrapper}>
                          <View style={styles.progressContainer}>
                            <View
                              style={[
                                styles.progressBar,
                                {
                                  width: `${course.lessionStats.progressPct}%`,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {course.lessionStats.progressStr}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <View style={styles.desktopRow}>
                        <Text style={[styles.courseDate, styles.desktopDate]}>
                          Start: {format(course.createdAt, "yyyy-MM-dd")}
                        </Text>
                        <View
                          style={[
                            styles.progressWrapper,
                            styles.desktopProgressWrapper,
                          ]}
                        >
                          <View style={styles.progressContainer}>
                            <View
                              style={[
                                styles.progressBar,
                                {
                                  width: `${course.lessionStats.progressPct}%`,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {course.lessionStats.progressStr}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              ))
          ) : (
            <Text style={styles.noCoursesText}>
              No in-progress courses available
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#1C1C1C",
  },
  rightContent: {
    flex: 1,
    // backgroundColor: "#141414",
    padding: moderateScale(15),
  },
  dashboardSection: {
    backgroundColor: "#1C1C1C",
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    marginBottom: moderateScale(16),
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScale(10),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#FAFAFB",
  },
  dashboardGrid: {
    flexWrap: "wrap",
    gap: moderateScale(8),
  },
  dashboardItem: {
    backgroundColor: "#252525",
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    alignItems: "center",
  },
  itemValue: {
    fontSize: 32,
    fontWeight: "500",
    color: "#FAFAFB",
    marginTop: moderateScale(6),
  },
  itemLabel: {
    fontSize: 14,
    color: "#B5B5BE",
  },
  inProgressSection: {
    backgroundColor: "#1C1C1C",
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: "#282828",
  },
  rowEnroll: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScale(12),
  },
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(12),
  },
  courseImage: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(6),
    marginRight: moderateScale(10),
  },
  courseDetails: {
    flex: 1,
  },
  courseTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#FAFAFB",
  },
  courseDate: {
    fontSize: moderateScale(12),
    color: "#808080",
    marginVertical: moderateScale(4),
  },
  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressContainer: {
    flex: 1,
    height: 5,
    backgroundColor: "#333",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#D22A38",
  },
  progressText: {
    fontSize: moderateScale(10),
    color: "#FFFFFF",
    marginLeft: moderateScale(6),
  },
  noCoursesText: {
    fontSize: moderateScale(12),
    color: "#FAFAFB",
    textAlign: "center",
    marginTop: moderateScale(16),
  },

  desktopRow: {
    // backgroundColor:'red',
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  desktopDate: {
    flex: 0.3,
  },
  desktopProgressWrapper: {
    flex: 0.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 30,
  },
});
