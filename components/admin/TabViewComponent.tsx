import * as React from "react";
import { ReactNode } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import {
  TabView,
  SceneMap,
  TabBar,
  SceneRendererProps,
} from "react-native-tab-view";
type _Routes<T> = {
  key: T;
  title: string;
};
type refreshHeighUtilParam = Partial<{ height: number; idx: number }>;
export function TabViewComponent<T extends string>({
  routes,
  tabBarProps,
  tabViewProps,
  scenRenderer,
}: {
  routes: _Routes<T>[];
  scenRenderer: (
    props: SceneRendererProps & {
      route: _Routes<T>;
    },
    setRef: (idx: number, refNode: React.ReactNode) => void,
    refreshHeight: (p?: refreshHeighUtilParam) => void,
    currentIdx: number
  ) => ReactNode;
  tabViewProps?: Partial<React.ComponentProps<typeof TabView>>;
  tabBarProps?: Partial<React.ComponentProps<typeof TabBar>>;
}) {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const refs = React.useRef([]);
  const [tabVHeight, setTabVHeight] = React.useState(null);
  function refreshHeight({ height, idx }: refreshHeighUtilParam = {}) {
    if (height) {
      return setTabVHeight(height);
    }
    refs.current?.[idx ?? index]?.measureInWindow((x, y, width, height) => {
      setTabVHeight(height);
    });
  }
  return (
    <TabView
      initialLayout={{ width: layout.width }}
      {...tabViewProps}
      pagerStyle={[
        tabVHeight && { maxHeight: tabVHeight },
        tabViewProps?.pagerStyle,
      ]}
      navigationState={{ index, routes }}
      renderScene={(p) =>
        scenRenderer(
          p,
          (i, ref) => (refs.current[i] = ref),
          refreshHeight,
          index
        )
      }
      renderTabBar={(props) => (
        <TabBar
          {...props}
          style={{ backgroundColor: "transparent" }}
          {...tabBarProps}
          indicatorStyle={{ backgroundColor: "#D22A38", height: 1 }}
          tabStyle={{ minHeight: 0, paddingVertical: 7 }}
       
        />
      )}
      onIndexChange={(i) => {
        tabViewProps?.onIndexChange?.(i);
        refreshHeight({ idx: i });
        setIndex(i);
      }}
    />
  );
}
