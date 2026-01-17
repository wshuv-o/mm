import { API } from "@/api/api";
import { communityCtx } from "@/contexts/ctx";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { useGuardConf } from "./useGuardConf";
import { useAuthManager } from "./useAuthManager";
import { Linking } from "react-native";
export function useMemberShip() {
  const comCtx = useContext(communityCtx);
  if (!comCtx) {
    throw new Error("not inside community context");
  }
  const { access } = useAuthManager();
  const computedRes = useGuardConf(
    access.community[comCtx.publicId].status,
    {
      banned: { header: "You are banned from this community" },
      no_access: {
        header: "Join this community",
        action: {
          fn: () => Linking.openURL(comCtx.salesPage),
          label: "Join",
        },
      },
      expired_access: {
        header: "Access to this community expired",
        action: {
          fn: () => Linking.openURL(comCtx.salesPage),
          label: "Regain access",
        },
      },
    },
    access.community[comCtx.publicId].pkg
  );
  return { ...computedRes, comCtx, membership: comCtx.memberships?.[0] };
}
