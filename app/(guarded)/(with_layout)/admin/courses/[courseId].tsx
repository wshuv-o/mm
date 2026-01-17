import CourseEditor from "@/components/admin/CourseEditor";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
import { useCourseDataMgr } from "@/hooks/useCourseDataMgr";
import { useLocalSearchParams } from "expo-router";
//FIXME - missing
export default function EditCourse() {
  const {
    currentCourse: { data },
  } = useCourseDataMgr();
  return !data ? (
    <FullPageLoader></FullPageLoader>
  ) : (
    <CourseEditor course={data}></CourseEditor>
  );
}
