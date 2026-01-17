import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from "react-native";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
} from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/api/api";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
import { reduce } from "remeda";
import { ClassItem } from "@/api/types";
import { useWindowQuery } from "@/hooks/useWindowQuery";
import { router } from "expo-router";

export default function LiveClasses() {
  const { isDesktop } = useWindowQuery();
  const { data: classesByDay } = useQuery({
    queryKey: ["live_classes"],
    queryFn: () =>
      API.getClasses().then((c) => {
        return reduce(
          c,
          (acc, item) => {
            const key = format(item.zoomSession.scheduledAt, "yyyy-MM-dd");
            acc[key] ??= [];
            acc[key].push(item);
            return acc;
          },
          {} as Record<string, typeof c[number][]>
        );
      }),
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthDays = useMemo(() => {
    if (isDesktop == true) {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const startDay = start.getDay();

      const days = eachDayOfInterval({ start, end });

      const blanks = Array(startDay).fill(null);

      return [...blanks, ...days];
    } else {
      //(for mobile, i couldnt find any better solution)
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      return eachDayOfInterval({ start, end });
    }
  }, [currentDate]);

  const selectedDayKey = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : null;
  const classesForSelectedDay = useMemo(() => {
    return (
      classesByDay && selectedDayKey && (classesByDay[selectedDayKey] ?? [])
    );
  }, [classesByDay, selectedDayKey]);

  const handleChangeMonth = (direction: number) => {
    setCurrentDate((prev) => addMonths(prev, direction));
    setSelectedDate(null);
  };

  const getTimeDifference = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff < 0) {
      const daysAgo = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
      const hoursAgo = Math.floor(
        (Math.abs(diff) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      return `${daysAgo} days ${hoursAgo} hrs ago`;
    } else {
      const daysLater = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hoursLater = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      return `${daysLater} days ${hoursLater} hrs left`;
    }
  };
  const { isDesktop: isCoursePageDeskTop } = useWindowQuery(1024);
  const renderClassCard = ({ item }: { item: ClassItem }) => {
    const timeDifference = getTimeDifference(item.zoomSession.scheduledAt);
    const isFutureClass = parseISO(item.zoomSession.scheduledAt) > new Date();

    return (
      <TouchableOpacity
        style={styles.classCard}
        onPress={() =>
          router.navigate(
            // @ts-expect-error
            `/course/${item.chapter.course.publicId}` +
              (isCoursePageDeskTop
                ? `?lessonId=${item.publicId}`
                : `/class/${item.publicId}`)
          )
        }
      >
        <Text style={styles.classDate}>
          {format(item.zoomSession.scheduledAt, "MMMM d yyyy")}
        </Text>
        <Text style={styles.classTitle}>{item.title}</Text>
        <Text style={styles.classInstructor}>
          By {item.instructor.userName}
        </Text>

        {item.zoomSession.isLive ? (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>Live Now</Text>
          </View>
        ) : (
          <View
            style={[
              styles.daysLeftContainer,
              isFutureClass && { backgroundColor: "green" },
            ]}
          >
            <Text
              style={[styles.daysLeftText, isFutureClass && { color: "white" }]}
            >
              {timeDifference}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return !classesByDay ? (
    <FullPageLoader />
  ) : (
    <View style={styles.container}>
      {isDesktop ? (
        <View style={styles.desktopLayout}>
          <View style={styles.calendarContainer}>
            {/* <Text style={styles.calendarTitle}>Calendar Classes</Text> */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={() => handleChangeMonth(-1)}>
                <Text style={styles.navArrow}>{"<"}</Text>
              </TouchableOpacity>
              <Text style={styles.monthText}>
                {format(currentDate, "LLLL yyyy").toUpperCase()}
              </Text>
              <TouchableOpacity onPress={() => handleChangeMonth(1)}>
                <Text style={styles.navArrow}>{">"}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.weekdayRow}>
              {["Su","Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <Text key={d} style={styles.weekday}>
                  {d}
                </Text>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {monthDays.map((day, index) => {
                if (day === null) {
                  return <View key={index} style={styles.calendarDay}></View>;
                }
                const dayLabel = format(day, "d");
                const dayKey = format(day, "yyyy-MM-dd");
                const hasclasses = !!classesByDay[dayKey];
                const isSelected =
                  selectedDate &&
                  format(day, "yyyy-MM-dd") ===
                    format(selectedDate, "yyyy-MM-dd");

                return (
                  <TouchableOpacity
                    key={dayKey}
                    onPress={() => setSelectedDate(day)}
                    style={[
                      styles.calendarDay,
                      isSelected && styles.selectedCalendarDay,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                      ]}
                    >
                      {dayLabel}
                    </Text>
                    {hasclasses && <View style={styles.dot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.classesContainer}>
            <FlatList
              data={classesForSelectedDay}
              renderItem={renderClassCard}
              keyExtractor={(_, index) => index.toString()}
              ListEmptyComponent={
                <Text style={styles.noClassesText}>
                  {selectedDate
                    ? `No classes on ${format(selectedDate, "MMMM d, yyyy")}`
                    : "Select a date to see classes"}
                </Text>
              }
            />
          </View>
        </View>
      ) : (
        <View style={styles.mobileLayout}>
          <View style={styles.calendarContainer}>
            {/* <Text style={styles.calendarTitle}>Calendar Classes</Text> */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={() => handleChangeMonth(-1)}>
                <Text style={styles.navArrow}>{"<"}</Text>
              </TouchableOpacity>
              <Text style={styles.monthText}>
                {format(currentDate, "LLLL yyyy").toUpperCase()}
              </Text>
              <TouchableOpacity onPress={() => handleChangeMonth(1)}>
                <Text style={styles.navArrow}>{">"}</Text>
              </TouchableOpacity>
            </View>
            {/*  */}
            <View style={styles.calendarGridMobile}>
              <FlatList
                data={monthDays}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(day) => format(day, "yyyy-MM-dd")}
                renderItem={({ item: day }) => {
                  const dayLabel = format(day, "d");
                  const dayKey = format(day, "yyyy-MM-dd");
                  const hasClasses = !!classesByDay[dayKey];
                  const isSelected =
                    selectedDate &&
                    format(day, "yyyy-MM-dd") ===
                      format(selectedDate, "yyyy-MM-dd");

                  return (
                    <TouchableOpacity
                      key={dayKey}
                      onPress={() => setSelectedDate(day)}
                      style={[
                        styles.calendarDayMobile,
                        isSelected && styles.selectedCalendarDay,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.selectedDayText,
                        ]}
                      >
                        {dayLabel}
                      </Text>
                      {hasClasses && <View style={styles.dot} />}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>

          <View style={styles.classesContainer}>
            <FlatList
              data={classesForSelectedDay}
              renderItem={renderClassCard}
              keyExtractor={(_, index) => index.toString()}
              ListEmptyComponent={
                <Text style={styles.noClassesText}>
                  {selectedDate
                    ? `No classes on ${format(selectedDate, "MMMM d, yyyy")}`
                    : "Select a date to see classes"}
                </Text>
              }
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
    padding: 16,
  },

  desktopLayout: {
    flex: 1,
    flexDirection: "row",
    gap: 20,
  },

  mobileLayout: {
    flex: 1,
  },

  calendarContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    // flexShrink: 0,
    // height: 'auto',
  },
  calendarTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  navArrow: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 8,
  },
  monthText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    color: "#92929D",
    fontSize: 12,
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  calendarGridMobile: {
    flexDirection: "row",
    marginTop: 4,
    paddingVertical: 8,
  },
  calendarDayMobile: {
    width: 50,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    borderRadius: 50,
  },

  calendarDay: {
    width: `${100 / 7}%`,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2,
    borderRadius: 4,
  },
  selectedCalendarDay: {
    backgroundColor: "#D22A38",
  },
  dayText: {
    color: "#fff",
    fontSize: 14,
  },
  selectedDayText: {
    fontWeight: "bold",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
    marginTop: 2,
  },

  classesContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
  },
  noClassesText: {
    color: "#92929D",
    fontSize: 14,
    marginTop: 20,
  },
  classCard: {
    backgroundColor: "#252525",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    position: "relative",
  },
  classDate: {
    color: "#92929D",
    fontSize: 13,
    marginBottom: 4,
  },
  classTitle: {
    color: "#FAFAFB",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  classInstructor: {
    color: "#B5B5BE",
    fontSize: 13,
    marginBottom: 8,
  },
  liveBadge: {
    backgroundColor: "#D22A38",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  liveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  daysLeftContainer: {
    backgroundColor: "#333",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  daysLeftText: {
    color: "#92929D",
    fontSize: 12,
    fontWeight: "500",
  },
  menuButton: {
    position: "absolute",
    right: 8,
    top: 8,
    padding: 4,
  },
  menuButtonText: {
    color: "#92929D",
    fontSize: 16,
    fontWeight: "600",
  },
});
