import { Redirect, router, Slot, usePathname } from "expo-router";
import { useAuthManager } from "@/hooks/useAuthManager";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
import { useRouteConf } from "@/hooks/useRouteConf";
import { IntendedPageCtx } from "@/contexts/ctx";
import { useContext } from "react";
export default function AppLayout() {
  const { isSuccess, isError } = useAuthManager(true);
  const path = usePathname();
  const { canAccessPath } = useRouteConf();
  const { redirectUrl } = useContext(IntendedPageCtx);
  if (isError) return <Redirect href="/sign-in" />;
  if (isSuccess) {
    const rPath = redirectUrl();
    if (!canAccessPath(rPath || path)) {
      router.navigate("/");
    } else if (rPath) {
      router.navigate(rPath);
    }
    return <Slot />;
  }
  return <FullPageLoader></FullPageLoader>;
}
//FIXME - using router.navigate works but using Redirect component (return <Redirect  href="/routttt" />) causes infinite loop.but using direct router.navigate unnecessaryly allows intermediate pages.although not a major headache.but should do another inspection.overall this seems a little hacky & non-standard.also not only .navigate method works any other just causes infinite loop as well
