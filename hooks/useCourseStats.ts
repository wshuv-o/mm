import { API } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { flatMap, merge, mergeAll } from "remeda";

export function useCourseStats() {
  const { data, ...q } = useQuery({
    queryKey: ["course_stats"],
    queryFn: API.getCourseStats,
  });
  const stats = useMemo(() => {
    const dataWithLessonStats =
      data?.map((c) => {
        const l = flatMap(c.chapters, (ch) =>
          ch.lessons.filter((l) => l.zoomSession)
        );
        const attended = l.filter((l) => l.attended).length;
        return merge(c, {
          lessionStats: {
            total: l.length,
            attended,
            liveLessions: l,
            progressPct: (attended / l.length) * 100,
            progressStr: `${attended}/${l.length}`,
          },
        });
      }) ?? [];
    return {
      courseStats: [
        {
          icon: "brightness",
          label: "Enrolled Courses",
          value: dataWithLessonStats.length,
        },
        {
          icon: "open-book",
          label: "Active Courses",
          value: dataWithLessonStats.length,
        },
        {
          icon: "tick-double",
          label: "Complete Courses",
          value: dataWithLessonStats.filter(
            (c) => c.lessionStats.attended == c.lessionStats.total
          ).length,
        },
      ],
      dataWithLessonStats,
    };
  }, [data]);
  return { ...q, ...stats, courses: data ?? [] };
}
