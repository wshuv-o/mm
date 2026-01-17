import { API } from "@/api/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useAuthManager } from "./useAuthManager";

export function useCourseDataMgr(currentCourseId?: string) {
  if (!currentCourseId)
    currentCourseId = useLocalSearchParams()?.courseId as string | undefined;
  const qc = useQueryClient();
 
  const listQKey = ["courses"];
  //FIXME - this query will  need optimization i think .it pulls the entire enrollment plus payments chain
  const courseList = useQuery({
    queryKey: listQKey,
    queryFn: API.getCourses,
  });
  const singleQKey = ["course", currentCourseId];
  const currentCourse = useQuery({
    queryKey: singleQKey,
    queryFn: async () => {
      if (!currentCourseId) {
        throw new Error("no courseId available on current context");
      }
      return await API.getSingleCourse(currentCourseId);
    },
  });
  const invalidateCurrentCourseData = () =>
    qc.invalidateQueries({ queryKey: singleQKey });
  const invalidateCourseListData = () =>
    qc.invalidateQueries({ queryKey: listQKey });
  return {
    currentCourse,
    courseList,
    listQKey,
    singleQKey,
    currentCourseId,
    invalidateCourseListData,
    invalidateCurrentCourseData,
    invalidateAllCourseData: async () => {
      await invalidateCurrentCourseData();
      await invalidateCourseListData();
    },
  };
}
