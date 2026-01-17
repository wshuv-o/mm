import React from "react";
import { View, StyleSheet } from "react-native";
import { LobbyScreen } from "./lobby";
import ProfilePreview from "@/components/profilePreview";
import Home from "../../../../components/home";
import MemberShipGuard from "@/components/guards/MembershipGuard";
import { InboxView } from "../inbox";
import { useWindowQuery } from "@/hooks/useWindowQuery";
import { moderateScale } from "react-native-size-matters";
import { RteScrollView } from "@/components/shared/RTE";

export default function Index() {
  const { isMobile, height } = useWindowQuery(1068);
  const gap = moderateScale(16, 0.7);
  const maxHeight = height * 0.8;
  return (
    <MemberShipGuard>
      {isMobile ? (
        <RteScrollView contentContainerStyle={{ padding: gap }}>
          <Home postGap={gap} />
        </RteScrollView>
      ) : (
        <RteScrollView
          contentContainerStyle={{
            flexDirection: "row",
            gap,
            padding: gap,
          }}
        >
          <View
            style={{
              flex: 1,
              maxHeight,
            }}
          >
            <LobbyScreen
              containerStyle={{ borderRadius: 15, borderWidth: 1 }}
              isEmbedded
            />
          </View>

          <View style={styles.column2}>
            <Home postGap={gap} />
          </View>

          <View
            style={{
              flex: 1,
              gap,
            }}
          >
            <ProfilePreview />
            <View>
              <InboxView
                isEmbedded={true}
                containerStyle={{ maxHeight }}
              ></InboxView>
            </View>
          </View>
        </RteScrollView>
      )}
    </MemberShipGuard>
  );
}

const styles = StyleSheet.create({
  column1: {
    flex: 1,
    flexDirection: "column",
  },
  column2: {
    flex: 2,
    backgroundColor: "#141414",
  },
});
