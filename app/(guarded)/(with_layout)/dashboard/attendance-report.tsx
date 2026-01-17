import { useCourseStats } from "@/hooks/useCourseStats";
import { useWindowQuery } from "@/hooks/useWindowQuery";
import { addDays, format, max, parseISO } from "date-fns";
import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ContributionGraph } from "react-native-chart-kit";
import { ScrollView } from "react-native-gesture-handler";
import { moderateScale } from "react-native-size-matters";
export default function AttendanceReport() {
  const { dataWithLessonStats } = useCourseStats();

  const { classOcuurances, recentDate } = useMemo(() => {
    const dates: Date[] = [];
    const classOcuurances = dataWithLessonStats
      .flatMap((c) => c.lessionStats.liveLessions)
      .map((l) => {
        const d = parseISO(l.zoomSession!.scheduledAt);
        dates.push(d);
        return {
          date: format(d, "yyyy-MM-dd"),
          count: 1 + (l.attended ? 1 : 0),
        };
      });
    return { recentDate: addDays(max(dates)!, 100), classOcuurances };
  }, [dataWithLessonStats]);
  const { width, isMobile } = useWindowQuery();
  const COLOR_SCALE = ["#2E2E2E", "#C0626A", "#C72937"];

  return (
    <View
      style={[
        styles.container,
        { padding: !isMobile ? moderateScale(8) : 0 },
        styles.attendanceCard,
        { marginVertical: 20, width: "100%", maxHeight: 350 },
      ]}
    >
      <Text style={!isMobile ? styles.sectionTitle : styles.sectionTitle1}>
        Attendance
      </Text>

      <ScrollView
        horizontal
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
          ...(width >= 1245 && { flex: 1 }),
        }}
      >
        <ContributionGraph
          values={classOcuurances}
          endDate={recentDate}
          numDays={216}
          width={800}
          height={240}
          gutterSize={4}
          chartConfig={{
            backgroundGradientFrom: "transparent",
            backgroundGradientTo: "transparent",
            color: (opacity: number) => {
              return opacity === 1
                ? COLOR_SCALE.at(-1)
                : opacity > 0.15
                ? COLOR_SCALE.at(-2)
                : COLOR_SCALE.at(-3);
            },
            labelColor: () => "#FAFAFB",
          }}
        />
      </ScrollView>
      <View style={styles.legendContainer}>
        <Text style={styles.legendLabel}>Less</Text>
        {COLOR_SCALE.map((color, idx) => (
          <View
            key={idx}
            style={[styles.legendBox, { backgroundColor: color }]}
          />
        ))}
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
    padding: moderateScale(8),
  },
  attendanceCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: "#2A2A2A",
    padding: moderateScale(12),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScale(10),
  },
  headerRow1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScale(10),
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#FAFAFB",
  },
  sectionTitle1: {
    fontSize: moderateScale(10),
    fontWeight: "600",
    color: "#FAFAFB",
  },
  monthRow: {
    marginBottom: moderateScale(2),
    alignItems: "center",
  },
  monthLabel: {
    fontSize: moderateScale(8),
    fontWeight: "400",
    color: "#B5B5BE",
  },
  dayLabel: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#B5B5BE",
    textAlign: "right",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: moderateScale(12),
  },
  yearText: {
    fontSize: moderateScale(8),
    color: "#B5B5BE",
  },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  legendLabel: {
    fontSize: moderateScale(8),
    // color: "#FAFAFB",
    color: "#B5B5BE",
    marginHorizontal: moderateScale(4),
  },
  legendBox: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(2),
    marginHorizontal: moderateScale(1),
  },
});
