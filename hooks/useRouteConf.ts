import { usePathname, type Href } from "expo-router";
import { IcoMoonNames } from "@/components/custom_icon/IcoMoonNames";
import {
  clone,
  entries,
  filter,
  first,
  flatMap,
  intersection,
  map,
  pickBy,
  pipe,
  values,
} from "remeda";
import { useMemo } from "react";
import { useAuthManager } from "./useAuthManager";
import { UserRole } from "@/api/types";
type RConfVal = Partial<{
  label: string;
  icon: IcoMoonNames;
  matchPath: Href;
  active: boolean;
  meta: Record<string, any>;
}>;
/** will suggest proper route names and allow arbitary segments as well */
export type TrouteConf = Partial<
  Record<Href & string, RConfVal> & Record<string, RConfVal>
>;
export type TrouteCofEntry = ReturnType<typeof entries<TrouteConf>>[number];//FIXME - prettier having trouble formating due to this line
const routeConf: Record<"drawer" | "tab", TrouteConf> = {
  drawer: {
    "/classes": { icon: "shopping-bag", label: "Live class" },
    "/lobby": { icon: "ic_Friends", label: "Lobby" },
    "/course-list": { label: "Courses", icon: "ic_File" },
    //FIXME - wrong icon in quite a feww places
    "/": {
      icon: "home-02",
      label: "Home",
    },
    "/dashboard/profile": { label: "Profile", icon: "user" },
    "/admin/users": {
      label: "Users",
      icon: "ic_File",
    },
    "/admin/packages": {
      label: "Packages",
      icon: "ic_File",
    },
    "/admin/org-settings": {
      label: "Org settings",
      icon: "ic_File",
    },
  },
  tab: {
    index: { icon: "home-02", label: "Feed" },
    classes: { icon: "shopping-bag" },
    "course-list": { icon: "ic_File" },
    lobby: { icon: "ic_Friends" },
  },
};
export type GuardConf = Partial<
  Record<Href & string, UserRole[]> & Record<string, UserRole[]>
>;
/**
 * NOTE - be careful! orders matter.the current implementation follows most specific to lowest specific rule.only the first match will be respected in case of multiple match
 */
export const COURSE_CREATORS: UserRole[] = ["admin", "instructor"];
const guardConf: GuardConf = {
  "/admin/org-settings": ["owner"],
  "/admin/courses/new": COURSE_CREATORS,
  "/admin": ["admin"],
};
export function isActiveRoute(route: TrouteCofEntry | string, path: string) {
  const matchBy =
    typeof route == "string" ? route : route[1]!.matchPath ?? route[0];
  return path == matchBy;
}
export function useRouteConf(
  part?: keyof typeof routeConf,
  defaultLabel?: string
) {
  const path = usePathname();

  const { activeConf, conf } = useMemo(() => {
    const conf = clone(routeConf);
    const activeConf = pipe(
      conf,
      values(),
      flatMap(entries()),
      filter((v) => isActiveRoute(v, path)),
      map((v) => {
        v[1].active = true;
        return v;
      }),
      first()
    );
    return { activeConf, conf };
  }, [path]);
  const { hasRole } = useAuthManager();

  function canAccessPath(path: string) {
    const rule = entries(guardConf).filter(([gk]) =>
      path.includes(gk)
    )?.[0]?.[1];

    return !rule || hasRole(rule);
  }
  function applyGuards(routes: TrouteConf) {
    return pickBy(routes, (_, k) => canAccessPath(k));
  }
  const selectedRoutes = applyGuards(part ? conf[part] : {});
  return {
    routeConf: selectedRoutes,
    activeRouteLabel: activeConf?.[1].label ?? defaultLabel, //FIXME - also add naming for dashboard routes
    applyGuards,
    canAccessPath,
  };
}
