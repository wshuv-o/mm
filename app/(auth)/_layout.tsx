import { Redirect, Slot } from "expo-router";
import { useAuthManager } from "@/hooks/useAuthManager";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
export default function AuthLayout() {
  const { isPending, isSuccess, isFetchedAfterMount } = useAuthManager(true);
  if (isSuccess) {
    return <Redirect href="/"></Redirect>;
    //NOTE - isFetchedAfterMount fixes infinite loop issue
  } else if (isPending && !isFetchedAfterMount) {
    return <FullPageLoader></FullPageLoader>;
  } else {
    return <Slot />;
  }
}
