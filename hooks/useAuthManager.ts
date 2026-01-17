import { API } from "@/api/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  pick,
  merge,
  mapValues,
  isArray,
  intersection,
  difference,
} from "remeda";
import { STORAGE } from "@/lib/storage";
import { router } from "expo-router";
import { CurrentUser, UserRole, whoAmIResponse } from "@/api/types";
import { COURSE_CREATORS } from "./useRouteConf";
import { FirebaseSvc } from "@/lib/firebase";
const AUTH_STORAGE_KEY = process.env.EXPO_PUBLIC_AUTH_STORAGE_KEY;
export function useAuthManager(loadTokenFromStorage: boolean = false) {
  const key = ["activeUser"];
  const q = useQuery({
    queryKey: key,
    queryFn: async () => {
      if (loadTokenFromStorage) {
        let token = await STORAGE.retrive(AUTH_STORAGE_KEY);
        if (!token) {
          throw new Error("No token found");
        }
        API.setToken(token);
        //FIXME - i think we need a better place for this
        //sync/refresh device token
        FirebaseSvc.syncToken();
      }
      return API.whoAmI();
    },
  });
  const filesKeys = ["avatar", "coverImage"] as const;
  const prefsKey = "preference";
  const rolesKey: keyof CurrentUser = "rolesPlain";
  const metaKeys = ["updatedAt", "createdAt"] as const;
  const client = useQueryClient();
  function hasRole(
    role: UserRole | UserRole[],
    strategy: "any" | "all" | "only" = "any"
  ) {
    const roles = isArray(role) ? role : [role];
    const intersectLength = intersection(roles, q.data.me[rolesKey]).length;
    switch (strategy) {
      case "any":
        return !!intersectLength;
      case "all":
        return intersectLength === roles.length;
      case "only":
        return (
          difference(q.data.me[rolesKey].sort(), roles.sort()).length === 0
        );
      default:
        return false;
    }
  }
  function processData() {
    const retrivers = {
      activeUser: () => q.data.me,
      userFiles: () => pick(q.data.me, filesKeys),
      userMeta: () => pick(q.data.me, metaKeys),
      userPrefs: () => q.data.me[prefsKey],
      //deprecate
      userRoles: () => q.data.me[rolesKey],
      userIsAdmin: () => hasRole("admin"),
      userIsStudent: () => hasRole("student"),
      userCanAddCourse: () => hasRole(COURSE_CREATORS),
    };
    return mapValues(retrivers, (fn) => (q.isSuccess ? fn() : null));
  }
  const invalidateUserData = () => client.invalidateQueries({ queryKey: key });
  //FIXME - need to fix the types .not working
  const resp = merge(q, {
    ...processData(),
    invalidateUserData,
    async logout() {
      await API.deleteCurrentSession();
      await STORAGE.remove(AUTH_STORAGE_KEY);
      API.setToken(undefined);
      await invalidateUserData(); //this will trigger theredirect to signin page
    },
    async saveAuthToken(data: any) {
      if (!data.value) {
        throw new Error("Authentication failed - No token received");
      }
      const token = data.value;
      await STORAGE.save(AUTH_STORAGE_KEY, token);
      API.setToken(token);
      await invalidateUserData();
      router.navigate("/");
    },
    hasRole,
    access: q.data?.access as whoAmIResponse["access"], //ignore nullable possiblities to avoid unnecessary ! assertion
  });
  return resp as Omit<typeof resp, "userRoles"> & {
    userRoles: UserRole[];
  };
}

export function formatRole(r: UserRole) {
  return r.replaceAll("_", " ");
}
