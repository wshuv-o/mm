import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  ContextType,
} from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Href, router, usePathname, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import CustomIcon from "@/components/custom_icon/CustomIcon";

import {
  DrawerContentScrollView,
  DrawerItem,
  type DrawerContentComponentProps,
  type DrawerNavigationOptions,
} from "@react-navigation/drawer";

import { IconButton, List, TextInput } from "react-native-paper";
import { moderateScale, ViewStyle } from "react-native-size-matters";
import { entries, funnel, isEmpty, map, omitBy } from "remeda";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { isActiveRoute, TrouteConf, useRouteConf } from "@/hooks/useRouteConf";
import { useAuthManager } from "@/hooks/useAuthManager";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
import { communityCtx } from "@/contexts/ctx";
import { STORAGE } from "@/lib/storage";
import { useWindowQuery } from "@/hooks/useWindowQuery";
import { useGlobalSearchParams } from "expo-router";
import { useCommunitiesQuery } from "@/hooks/useCommunitiesQuery";
import { HeaderRightButtons } from "@/components/HeaderRightButtons";

const DesktopNavigation = () => {
  const router = useRouter();
  const path = usePathname();

  const navItems = [
    {
      label: "Courses",
      route: "/course-list",
      icon: "ic_File",
    },
    {
      label: "Communities",
      route: "/communities",
      icon: "ic_Friends",
    },
    {
      label: "Live Classes",
      route: "/classes",
      icon: "clock-rectangle",
    },
  ];

  return (
    <View style={styles.desktopNav}>
      {navItems.map((item) => {
        const isActive = isActiveRoute(item.route, path);
        return (
          <TouchableOpacity
            key={item.route}
            onPress={() => {
              router.navigate(item.route as any);
            }}
            style={[
              styles.desktopNavButton,
              isActive && { backgroundColor: "#D22A381F" },
            ]}
          >
            <View style={styles.desktopNavContent}>
              <CustomIcon
                name={item.icon}
                size={20}
                color={isActive ? "#D22A38" : "#B5B5BE"}
                style={styles.desktopNavIcon}
              />
              <Text
                style={[
                  styles.desktopNavText,
                  isActive && { color: "#D22A38" },
                ]}
              >
                {item.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
const debouncedExec = funnel((ops) => ops(), {
  minQuietPeriodMs: 600,
  reducer(_, next) {
    return next;
  },
}).call;
/**
 * the implementation of this component may seem hacky.but this is all done to gain some crucial performance.so think twice before you refactor
 */
const PostSearch = function ({ width }) {
  const { setCtxExtra, publicId } = useContext(communityCtx)!;
  const [txt, setTxt] = useState("");
  useEffect(() => {
    setTxt("");
  }, [publicId]);
  return (
    <TextInput
      style={{
        height: 40,
        width,
      }}
      outlineStyle={{
        backgroundColor: "#252525",
        borderRadius: 10,
        borderWidth: 1.5,
      }}
      value={txt}
      right={
        <TextInput.Icon
          icon={(p) => <CustomIcon {...p} name="search-01" color="#92929D" />}
        />
      }
      onChangeText={(t) => {
        setTxt(t);

        //@ts-expect-error
        debouncedExec(() => {
          setCtxExtra((v) => ({ ...v, postSearch: t }));
        });
      }}
      mode="outlined"
      placeholder="Find posts"
      placeholderTextColor="#92929D"
      textColor="#FAFAFB"
      outlineColor="transparent"
      activeOutlineColor="#D22A38"
    />
  );
};
function drawerOptions({
  navigation,
  route,
}: Parameters<
  Extract<Parameters<typeof Drawer>[0]["screenOptions"], Function>
>[0]): DrawerNavigationOptions {
  const { activeRouteLabel } = useRouteConf(
    "drawer",
    getFocusedRouteNameFromRoute(route)
  );
  const { isDesktop, width } = useWindowQuery(1024);
  const path = usePathname();
  const isPostSerchVisible = useMemo(
    () => activeRouteLabel == "Home" && isDesktop,
    [activeRouteLabel, isDesktop]
  );

  // Hide header for CEO AI only in mobile view
  if (path.startsWith("/ceo_ai") && !isDesktop) {
    return {
      headerShown: false,
      drawerStyle: {
        backgroundColor: "#141414",
      },
      headerStyle: {
        padding: 40,
        backgroundColor: "#1C1C1C",
      },
    };
  }

  return {
    headerTitleAlign: "center",
    headerLeft() {
      return (
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity
            style={styles.IconButtonH}
            onPress={navigation.openDrawer}
          >
            <CustomIcon name="apps" size={24} color="#B5B5BE" />
          </TouchableOpacity>
          {isDesktop && <DesktopNavigation />}
        </View>
      );
    },

    headerRight() {
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: moderateScale(10),
            position: "relative", // Needed so the NotificationModal is positioned relative to this container
            gap: 10,
          }}
        >
          {isPostSerchVisible && isDesktop && (
            <PostSearch width={width * 0.37}></PostSearch>
          )}
          <HeaderRightButtons />
        </View>
      );
    },
    headerShadowVisible: false,
    drawerStyle: {
      backgroundColor: "#141414",
    },
    headerStyle: {
      padding: 40,
      backgroundColor: "#1C1C1C",
    },
    //hide title when not defined
    ...(!activeRouteLabel && {
      headerTitle(props) {
        return <></>;
      },
    }),
  };
}
//https://www.youtube.com/watch?v=3p9LtOUg5fw
function CustomDrawerContent({
  descriptors,
  state,
  communityRoutes,
}: DrawerContentComponentProps & {
  communityRoutes: TrouteConf[];
}) {
  //FIXME - should have a review on this component
  const focusedRoute = state.routes[state.index];

  const focusedDescriptor = descriptors[focusedRoute.key];
  const focusedOptions = focusedDescriptor.options;
  const router = useRouter();
  const { routeConf } = useRouteConf("drawer");
  const drawerItemStylePart = { borderRadius: 12, marginVertical: 5 };

  const drwaerItemStyleProps = {
    activeTintColor: "#D22A38",
    inactiveTintColor: "#fff",
    activeBackgroundColor: "#1c1c1c",
    inactiveBackgroundColor: "#1c1c1c",
  };
  const { canAccessPath } = useRouteConf();
  const { userIsAdmin } = useAuthManager();
  const path = usePathname();
  const itemProps = (
    [route, conf]: TrouteConfEntry,
    idx: number,
    extraStyle?: StyleProp<ViewStyle>
  ) => {
    const comEditPath: Href | false = conf?.meta?.comId
      ? `/admin/communities/${conf.meta.comId}`
      : false;
    
    // Special handling for course-list route to avoid conflict with CEO AI button
    const isCourseListRoute = route === '/course-list';
    const { source } = useGlobalSearchParams<{ source?: string }>();
    const shouldFocusCourseList = isCourseListRoute ? (conf.active && source !== 'ceo_ai') : conf.active;
    
    return {
      key: idx,
      label:
        comEditPath && canAccessPath(comEditPath)
          ? ({ color }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color }}>{conf.label!}</Text>
                <IconButton
                  style={{
                    height: 28,
                    // top: -1,
                    width: 26,
                    margin: 0,
                  }}
                  onPress={() => {
                    conf?.meta?.onPress();
                    router.navigate(comEditPath);
                  }}
                  size={18}
                  iconColor={color}
                  icon={(props) => (
                    <CustomIcon
                      {...props}
                      style={{ marginHorizontal: 10 }}
                      name="edit-rectangle"
                    />
                  )}
                ></IconButton>
              </View>
            )
          : conf.label!,

      onPress: () => {
        conf?.meta?.onPress();
        router.navigate(route as Href);
      },
      focused: shouldFocusCourseList,
      ...drwaerItemStyleProps,
      allowFontScaling: focusedOptions.drawerAllowFontScaling,
      labelStyle: focusedOptions.drawerLabelStyle,
      style: [
        focusedOptions.drawerItemStyle,
        drawerItemStylePart,
        extraStyle ?? {},
      ],
    };
  };

  return (
    <DrawerContentScrollView
      contentContainerStyle={focusedOptions.drawerContentContainerStyle}
      style={focusedOptions.drawerContentStyle}
    >
      {/* Render Home route first */}
      {(() => {
        const homeEntry = Object.entries(routeConf).find(([k]) => k === "/");
        if (!homeEntry) return null;
        const [k, v] = homeEntry;
        return (
          <DrawerItem
            key={k}
            {...itemProps([k, v], 0)}
            icon={(props) => <CustomIcon name={v.icon} {...props} />}
          />
        );
      })()}
      {/* CEO AI Button */}
      <DrawerItem
        label="CEO AI"
        onPress={() => {
          router.replace("/course-list?source=ceo_ai");
        }}
        icon={(props) => <CustomIcon name="ic_File" {...props} />}
        focused={path === "/course-list" && new URLSearchParams(global?.location?.search || '').get('source') === 'ceo_ai'}
        {...drwaerItemStyleProps}
        style={drawerItemStylePart}
      />
      {/* Communities: DrawerItem for students, Accordion for others */}
      {userIsAdmin ? (
        <List.Accordion
          title="Communities"
          left={(props) => (
            <List.Icon
              {...props}
              icon={(props) => (
                <CustomIcon name="apps" {...props} size={24} color="#fff" />
              )}
            />
          )}
          theme={{
            colors: {
              background: "transparent",
            },
          }}
          titleStyle={{
            color: drwaerItemStyleProps.inactiveTintColor,
          }}
          style={[
            drawerItemStylePart,
            { backgroundColor: drwaerItemStyleProps.activeBackgroundColor },
          ]}
        >
          {communityRoutes
            .flatMap((v) => entries(v))
            .map(([k, v], i) => (
              //@ts-expect-error
              <DrawerItem
                {...itemProps([k, v], i, { paddingLeft: 0, marginLeft: 10 })}
                icon={(props) => (
                  <CustomIcon
                    name={v.icon}
                    {...props}
                    color={drwaerItemStyleProps.inactiveTintColor}
                  />
                )}
              />
            ))}
        </List.Accordion>
      ) : (
        <DrawerItem
          key="/communities"
          label="Communities"
          onPress={() => router.navigate("/communities")}
          icon={(props) => <CustomIcon name="ic_Friends" {...props} />}
          {...drwaerItemStyleProps}
          style={[focusedOptions.drawerItemStyle, drawerItemStylePart]}
        />
      )}
      {/* Render all other routes except Home */}
      {Object.entries(routeConf)
        .filter(([k]) => k !== "/")
        .map(([k, v], i) => (
          <DrawerItem
            key={k}
            {...itemProps([k, v], i + 1)}
            icon={(props) => <CustomIcon name={v.icon} {...props} />}
          />
        ))}
    </DrawerContentScrollView>
  );
}
export default function AppLayout() {
  const { access } = useAuthManager();
  const { isPending, data, invaliDateRelatedQuery } = useCommunitiesQuery();
  const [currentCom, setCurrentCom] = useState(null);
  const storageKey = "com_ctx_key";
  //a path for https://github.com/expo/router/discussions/661
  const { comCtx } = omitBy(
    useGlobalSearchParams<{
      comCtx?: string;
    }>(),
    (v) => v == "undefined"
  );
  //FIXME - is this have any negative side effects
  useEffect(() => {
    STORAGE.retrive(storageKey).then((savedOne) => {
      const prioritizedId = comCtx || savedOne;
      if (data && (!currentCom || prioritizedId != currentCom)) {
        const defaultCom = data.communities.find(
          prioritizedId
            ? (c) => c.publicId == prioritizedId
            : (c) => access.community[c.publicId].status === true
        );
        setCurrentCom(defaultCom?.publicId || data.communities[0]?.publicId);
      }
    });
  }, [data, comCtx]);
  useEffect(() => {
    if (currentCom)
      STORAGE.save(storageKey, currentCom).then(() => {
        if (comCtx && currentCom == comCtx) {
          router.setParams({ comCtx: undefined });
        }
      });
  }, [currentCom]);
  const path = usePathname();
  const { applyGuards } = useRouteConf();
  const communityRoutes = () => {
    const n_route = "/admin/communities/new";
    const conf = map(data.communities, (c): TrouteConf => {
      return {
        "/": {
          label: c.name,
          icon: "ic_File",
          active: c.publicId === currentCom && !isActiveRoute(n_route, path),
          meta: {
            onPress: () => setCurrentCom(c.publicId),
            comId: c.publicId,
          },
        },
      };
    });
    conf.unshift({
      [n_route]: {
        label: "Create new",
        icon: "ic_File",
        active: isActiveRoute(n_route, path),
      },
    });
    return conf.map((v) => applyGuards(v)).filter((v) => !isEmpty(v));
  };
  const [ctxExtra, setCtxExtra] = useState({});
  const prevComId = useRef(null);
  useLayoutEffect(() => {
    if (prevComId.current !== currentCom) {
      setCtxExtra({});
      prevComId.current = currentCom;
    }
  }, [currentCom]);
  const ctxData = useMemo<ContextType<typeof communityCtx>>(() => {
    const entry = data?.communities?.find((c) => c.publicId === currentCom);
    return {
      ...entry,
      invaliDateRelatedQuery,
      ctxExtra,
      setCtxExtra,
      setCurrentCom,
    };
  }, [data, currentCom, ctxExtra]);
  return isPending || !currentCom ? (
    <FullPageLoader></FullPageLoader>
  ) : (
    //FIXME - don't use  gesture handler in web
    <communityCtx.Provider value={ctxData}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* https://reactnavigation.org/docs/drawer-navigator?config=dynamic */}

        <Drawer
          // https://stackoverflow.com/a/68328027
          screenOptions={drawerOptions}
          drawerContent={(props) => (
            <CustomDrawerContent
              communityRoutes={communityRoutes()}
              {...props}
            />
          )}
        ></Drawer>
      </GestureHandlerRootView>
    </communityCtx.Provider>
  );
}
const styles = StyleSheet.create({
  modalBackground: {
    padding: 2,
    backgroundColor: "#D22A38",
    // marginRight: 20,
    borderRadius: 50,
  },
  dropdown: {
    position: "absolute",
    top: moderateScale(25),
    right: 20,
    backgroundColor: "#393939",
    borderRadius: 8,
    paddingVertical: moderateScale(5),
    paddingHorizontal: moderateScale(30),
    zIndex: 999,
  },
  dropdownItem: {
    paddingVertical: moderateScale(5),
  },
  dropdownText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },

  ProfileN: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    fontFamily: "poppins",
    color: "#FAFAFB",
    padding: 50,
  },
  IconButtonH: {
    alignItems: "flex-start",
    margin: moderateScale(10),
  },
  headerLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  desktopNav: {
    flexDirection: "row",
    alignItems: "center",
  },
  desktopNavButton: {
    marginHorizontal: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  desktopNavContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  desktopNavIcon: {
    marginRight: 8,
  },
  desktopNavText: {
    color: "#B5B5BE",
    fontSize: 14,
    fontFamily: "poppins",
    fontWeight: "500",
  },
});
