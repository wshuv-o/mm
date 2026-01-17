import React, { useState, useEffect } from "react"; 
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Text,
} from "react-native";

import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";

import { Button } from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import DashboardTop from "@/components/dashboard/DashboardTop";
import CustomIcon from "@/components/custom_icon/CustomIcon";

import AttendanceReport from "./attendance-report";
import EnrolledCourses from "./enrolled-courses";
import DashboardIndex from "./index";
import Orders from "./orders";
import Preferences from "./preferences";
import Profile from "./profile";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<MaterialTopTabNavigationOptions, typeof Navigator, TabNavigationState<ParamListBase>, MaterialTopTabNavigationEventMap>(Navigator);

const tabsData = [
  { key: "dashboard", icon: "interactive", label: "Dashboard", component: DashboardIndex },
  { key: "attendance", icon: "calendar", label: "Attendance", component: AttendanceReport },
  { key: "courses", icon: "open-book", label: "Enrolled Courses", component: EnrolledCourses },
  { key: "orders", icon: "shopping-basket", label: "Orders", component: Orders },
  { key: "preferences", icon: "setting", label: "Preferences", component: Preferences },
  { key: "profile", icon: "user-circle", label: "Profile", component: Profile },
];

function SideTabs({ tabs, initialTab = 0 }) {
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const ActiveComponent = tabs[selectedTab].component;

  return (
    <View style={styles.sideTabsContainer}>
      <View style={styles.sideTabBar}>
        {tabs.map((tab:any, index:any) => (
         <Button
          key={tab.key}
          mode="text"
          onPress={() => setSelectedTab(index)}
          // onMouseEnter={() => setHoveredIndex(index)}
          // onMouseLeave={() => setHoveredIndex(null)}
          style={[
            styles.tabButton,
            selectedTab === index && styles.activeTabButton,
            hoveredIndex === index && styles.hoverTabButton,
          ]}
          contentStyle={styles.tabButtonContent}
        >
          <CustomIcon
            name={tab.icon}
            size={moderateScale(12)}
            color={selectedTab === index ? "#D22A38" : "#D5D5DC"}
            style={styles.icon}
          />
          <Text
            style={[
              styles.tabLabel,
              selectedTab === index && styles.activeTabLabel,
            ]}
          >
            {tab.label}
          </Text>
        </Button>

        ))}
      </View>
      <View style={styles.tabContent}>
        <ActiveComponent />
      </View>
    </View>
  );
}

export default function Layout() {
  const [isMobile, setIsMobile] = useState(screenWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(Dimensions.get("window").width < 768);
    };

    Dimensions.addEventListener("change", handleResize);
    handleResize();

    return () => Dimensions.removeEventListener("change", handleResize);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles2.container} stickyHeaderIndices={[2]}
    showsVerticalScrollIndicator={false} 
            showsHorizontalScrollIndicator={false} >
      {!isMobile?(
        <View style={styles2.coverContainer}>
        <DashboardTop />

      </View>
      ):
       <DashboardTop/>
      }
      

      <View >
        {!isMobile ? (
          <SideTabs tabs={tabsData} />
        ) : (
          // <View style={styles.mobileContainer}>
            <View style={styles.contentArea}>
            <MaterialTopTabs
            // sceneStyle={{}}
 style={{
  // width: '50%',
  // backgroundColor:'red',
  // overflowY:'scroll',
    // backgroundColor: 'red',
  // transform: [{ translateX: position }],
}} 
             screenOptions={{
                lazy: true,
                // removeClippedSubviews: false, 
                // sceneStyle: { backgroundColor: "#1C1C1C" },
                sceneStyle: {
                  backgroundColor: "#141414",
                
                  // maxHeight:400,
                  overflowY:'scroll',
                  
                },
                tabBarInactiveTintColor: "#D5D5DC",
                tabBarActiveTintColor: "#D22A38",
                tabBarIndicatorContainerStyle: { height: 0 },
                tabBarStyle: { backgroundColor: "#1c1c1c" },
                tabBarScrollEnabled: true,
                // tabBarPressOpacity:0.5,
                
                // sceneContainerStyle: { backgroundColor: "#1C1C1C" },
              }}
              
            >
            </MaterialTopTabs>

            {/* </View> */}
          </View>
        )}
      </View>


      
{/* -----------sajin removed the logout from here--------- */}


      {/* <View style={styles2.inProgressSection}>
        <Button mode="contained" style={styles2.logoutButton} onPress={() => console.log("Logout pressed")}>
          Logout
        </Button>
      </View> */}
    </ScrollView>
  );
}

const styles2 = StyleSheet.create({
  container: {
    backgroundColor: "#141414",
    flexGrow: 1,
    padding: 0,
    margin: 0,
  },
  coverContainer:{
    backgroundColor: "#1C1C1C",
    borderRadius:20,
    margin:20,
    borderWidth:1,
    borderColor: "#2A2A2A", 
  },

  inProgressSection: {
    marginTop: moderateScale(10),
    marginBottom: moderateScale(5),
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderRadius: moderateScale(12),
    borderColor: "#282828",
  },
  logoutButton: {
    marginTop: moderateScale(20),
    backgroundColor: "#D22A38",
  },
});

const styles = StyleSheet.create({
  // layoutContainer: {
  //   flexDirection: "row",
  //   backgroundColor: "red",
  //   // minHeight: screenHeight,

  // },
  sideTabsContainer: {
    flex: 1,
    flexDirection: "row",
    // backgroundColor: "green",
    
  },
  // sideTabBar: {
  //   width: "30%",
  //   // height:'50%',
  //   // backgroundColor: "#1A1A1A",
  //   margin: moderateScale(12),
  //   padding: moderateScale(12),
  //   backgroundColor: "#1c1c1c",
  //   borderRadius: 20,
  //   borderWidth:1,
  //   borderColor: "#2A2A2A",  
  // },
  sideTabBar: {
    width: "30%",
    margin: moderateScale(12),
    padding: moderateScale(12),
    backgroundColor: "#1c1c1c",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginTop: 20,
    // If you see clipping, make sure overflow is visible or remove overflow
  },
  icon: {
    marginRight: moderateScale(8),
    // backgroundColor:'red',
    
  },
  

  // tabButton: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   paddingVertical: moderateScale(4),
  //   // paddingHorizontal: moderateScale(10),
  //   marginBottom: moderateScale(6),
  //   backgroundColor: "#252525",
  // },
  tabButton: {
    width: "100%",                  // Make the button take full width
    marginBottom: moderateScale(6),
    backgroundColor: "#252525",
    borderRadius: 8,               // optional
  },
  
  tabButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: moderateScale(8),  // Adjust vertical padding
  },
  
  activeTabButton: {
    backgroundColor: "#333333",
    
  },
  hoverTabButton: {
    backgroundColor: "#3a3a3a",
    cursor:'pointer',
  },
  
  tabLabel: {
    color: "#D5D5DC",
  },
  activeTabLabel: {
    color: "#D22A38",
  },
  tabContent: {
    flex: 3,
    // backgroundColor: "red",
    // margin: moderateScale(12),
    // borderRadius: 20,
    // borderWidth:1,
    // borderColor: "#2A2A2A", 
  },

  contentArea: {
    maxHeight:600,
    width: "100%", 
    backgroundColor: "#1c1c1c",
    
    // minHeight: screenHeight,
  },
});
