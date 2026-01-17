import { useEnrollment } from "@/hooks/useEnrollment";
import { ReactNode } from "react";
import { FullPageLoader } from "../shared/FullPageLoader";
import GuardAction from "./GuardAction";
type guardProps = {
  children: ReactNode;
};
export default function EnrollmentGuard({ children }: guardProps) {
  const { isDepsLoading, canAcces, actionConf } = useEnrollment();
  if (isDepsLoading) return <FullPageLoader />;
  if (canAcces) return children;
  return actionConf && <GuardAction actionConf={actionConf}></GuardAction>;
}
