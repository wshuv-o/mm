import CustomIcon from "@/components/custom_icon/CustomIcon";
import { useRouteConf } from "@/hooks/useRouteConf";
import { Tabs } from "expo-router";
import { useWindowDimensions } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { capitalize, entries } from "remeda";
export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { routeConf = {} } = useRouteConf("tab") || {};
  const tabRoutes = entries(routeConf || {});
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#1C1C1C",
          height: 71,
          paddingTop: 4,
          borderTopWidth: 1,
          borderTopColor: "#2A2A2A",
          display: isDesktop ? "none" : "flex",
        },
        tabBarLabelStyle: {
          fontFamily: "poppins",
          fontWeight: "500",
          fontSize: 12.5,
          marginTop:2.5        
        },
        tabBarLabelPosition: "below-icon",
        tabBarActiveTintColor: "#D22A38",
        tabBarInactiveTintColor: "#696974",
        headerShown: false,
      }}
    >
      {tabRoutes.map(([k, v]) => {
        const label = capitalize(v?.label || k);
        return (
          <Tabs.Screen
            key={k}
            name={k}
            options={{
              title: label,
              tabBarLabel: label,
              tabBarIcon: ({ color }) => (
                <CustomIcon name={v?.icon || "home"} size={22} color={color} />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}
