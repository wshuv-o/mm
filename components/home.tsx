import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Chip, Divider } from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import PostItem from "@/components/home/PostItem";
import PostEditor from "./home/postEditor";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
import { RteScrollView } from "@/components/shared/RTE";
import CustomIcon from "./custom_icon/CustomIcon";
import { getFontSize } from "@/utils/fontSize";


export default function Home({postGap}) {
  const { isSuccess, posts } = useCurrentCommunity();
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  return (
    <View style={styles.container}>
    {/* "Post Something" editor */}
    <View style={styles.postSomethingContainer}>
      <Text style={styles.sectionTitle}>Post Something</Text>
      <PostEditor></PostEditor>
    </View>

    {/* Posts */}
    {isSuccess ? (
      <FlatList
        data={
          showOnlySaved
            ? posts?.filter((v) => v.meta.bookmarked_by_me)
            : posts
        }
        ListHeaderComponent={
          <Chip
          icon={(props)=><CustomIcon {...props}  name='ic_Saved' color="#D22A38" />}
            onPress={() => setShowOnlySaved(!showOnlySaved)}
            style={{
              backgroundColor: showOnlySaved ? "#D22A381F" : "#1C1C1C",
              // marginBottom: 13,
            }}
            textStyle={{ color: showOnlySaved ? "#D22A38" : "white" }}
            {...(showOnlySaved && {
              onClose: () => setShowOnlySaved(false),
              closeIcon: (props) => (
                <CustomIcon
                  {...props}
                  name="close"
                  style={{
                    color: "#D22A38",
                  }}
                ></CustomIcon>
              ),
            })}
          >
            saved posts
          </Chip>
        }
        ListHeaderComponentStyle={{ alignItems: "flex-start" }}
        renderItem={({ item }) => <PostItem item={item} />}
        keyExtractor={(item, idx) => idx.toString()}
        contentContainerStyle={{gap:postGap}}
      />
    ) : (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D22A38" />
      </View>
    )}
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 1300,
  },

  postSomethingContainer: {
    backgroundColor: "#1C1C1C",
    borderWidth: 1,
    borderColor: "#282828",
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(16),
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(12),  
    // Slight shadow for "card" effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#FAFAFB",
    fontFamily: "poppins",
    marginBottom: moderateScale(8),
  },

  dividerStyle: {
    backgroundColor: "#282828",
    height: StyleSheet.hairlineWidth,
    marginBottom: moderateScale(10),
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 100,
  },
});
