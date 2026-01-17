import { useCourseDataMgr } from "./useCourseDataMgr";
import { useGuardConf } from "./useGuardConf";
import { useAuthManager } from "./useAuthManager";
import { Linking } from "react-native";
export function useEnrollment() {
  const { courseList, currentCourseId } = useCourseDataMgr();
  const { access } = useAuthManager();

  function toSalesPage() {
    const salesPage = courseList.data?.courses.find(
      (c) => c.publicId === currentCourseId
    )?.salesPage;  
    salesPage && Linking.openURL(salesPage);
  }
  const computedRes = useGuardConf(
    access.course[currentCourseId!].status,
    {
      pending: {
        header: "Your enrollment is being reviewed",
      },
      rejected: {
        header: "Your enrollment has been rejected",
      },
      no_access: {
        header: "Enroll in this course",
        action: {
          fn: toSalesPage,
          label: "Enroll",
        },
      },
      expired_access: {
        header: "Access to this course expired",
        action: {
          fn: toSalesPage,
          label: "Regain access",
        },
      },
    },
    access.course[currentCourseId!].pkg
  );
  return {
    ...computedRes,
    isDepsLoading: courseList.isPending,
  };
}
