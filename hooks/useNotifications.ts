import { useContext, useEffect, useMemo } from "react";
import { API } from "@/api/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { NotificationsWithMeta } from "@/api/types";
import { FirebaseSvc } from "@/lib/firebase";
import { communityCtx } from "@/contexts/ctx";
export function useNotifications(UnreadOnly: boolean = false) {
  const key = ["notifications"];
  const { data: d_ } = useQuery({
    queryKey: key,
    queryFn: API.getNotifications,
    refetchInterval: 12000, //FIXME - implement realtime instead of polling
  });
  const { setCurrentCom } = useContext(communityCtx)!;
  function compileNotification(
    n: NotificationsWithMeta["notifications"][number]
  ) {
    return {
      ...n.compiled,
      action: () => {
        n.compiled.url && router.navigate(n.compiled.url);
      },
    };
  }
  const compiled = useMemo(() => {
    return {
      data: d_?.notifications
        ?.filter((n) => !UnreadOnly || !n.notification.readAt)
        ?.map(compileNotification),
      unreadCount: d_?.unreadCount || 0,
    };
  }, [d_, UnreadOnly]);
  useEffect(() => {
    return FirebaseSvc.addMsgListener("use_n", (payload) => {
      FirebaseSvc.showForegroundNotification(payload);
    });
  });
  const client = useQueryClient();
  return {
    ...compiled,
    compileNotification,
    invalidateNotifData: () => client.invalidateQueries({ queryKey: key }),
    unreadDmCount: d_?.unreadDmCount || 0,
  };
}
