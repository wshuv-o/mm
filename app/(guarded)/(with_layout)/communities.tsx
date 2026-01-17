import React, { useState, useMemo, useContext } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  FlatList,
  Image,
} from "react-native";
import {
  Text,
  Button,
  Card,
  TextInput,
  ActivityIndicator,
} from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/api/api";
import { moderateScale } from "react-native-size-matters";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { useAuthManager } from "@/hooks/useAuthManager";
import { Community } from "@/api/types";
import { communityCtx } from "@/contexts/ctx";
import { router } from "expo-router";
import { UTIL } from "@/lib/utils";
import { useCommunitiesQuery } from "@/hooks/useCommunitiesQuery";

export default function CommunityPage() {
  const { width } = useWindowDimensions();
  const { userIsAdmin } = useAuthManager();
  const [searchQuery, setSearchQuery] = useState("");
  const comctx = useContext(communityCtx);
  const minCardWidth = 250;
  const cardMargin = moderateScale(10, 0.25);
  const numColumns = Math.floor(width / (minCardWidth + cardMargin)) || 1;
  const cardWidth = (width - cardMargin * (numColumns + 1)) / numColumns;
  const flatListKey = `cols-${numColumns}`;

  const { isPending, data: communities } = useCommunitiesQuery();
  // Filter communities based on tab and search
  const filteredCommunities = useMemo(() => {
    if (!communities) return [];

    return communities.communities.filter((community) => {
      // Search filter
      const matchesSearch = community.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [communities, searchQuery]);

  const renderCommunityCard = ({ item: community }: { item: Community }) => (
    <View style={[styles.communityCard, { width: cardWidth }]}>
      <Card.Content
        style={[styles.cardContent, { gap: moderateScale(10), padding: 10 }]}
      >
        <Image
          source={{ uri: API.url(community.coverImage.url) }}
          style={{
            width: "100%",
            height: moderateScale(120, 0.25),
            borderRadius: 10,
          }}
        />
        <View style={styles.cardHeader}>
          <CustomIcon name="ic_Friends" size={27} color="#D22A38" />
          <Text style={styles.communityName}>
            {community.name}
          </Text>
        </View>
        <Button
          mode="contained"
          style={styles.joinButton}
          contentStyle={{
            height: moderateScale(30, 0.25),
          }}
          onPress={() => {
            comctx?.setCurrentCom(community.publicId);
            router.navigate("/");
          }}
        >
          Enter
        </Button>
      </Card.Content>
    </View>
  );

  if (isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D22A38" />
      </View>
    );
  }
  const newBtnHeight = moderateScale(40, 0.25);
  return (
    <ScrollView style={styles.container}>
      {/* Search and Filters */}
      <View style={[styles.searchFilterContainer, { gap: 10 }]}>
        <TextInput
          style={{
            flexGrow: 1,
            // height: 40,
            color: "#FAFAFB",
            fontSize: moderateScale(14, 0.25),
            fontWeight: "500",
            backgroundColor: "#252525",
            height: newBtnHeight,
          }}
          outlineStyle={{
            borderRadius: 15,
            borderWidth: 1.5,
          }}
          value={searchQuery}
          onChangeText={setSearchQuery}
          left={
            <TextInput.Icon
              icon={(p) => (
                <CustomIcon {...p} name="search-01" color="#92929D" />
              )}
            />
          }
          mode="outlined"
          placeholder="Find Community"
          placeholderTextColor="#FAFAFB"
          outlineColor="transparent"
          activeOutlineColor="#D22A38"
          textColor="#FAFAFB"
        />

        {userIsAdmin && (
          <Button
            mode="contained"
            style={styles.newButton}
            contentStyle={{
              minHeight: newBtnHeight,
              flex: 1,
            }}
            onPress={() => router.navigate("/admin/communities/new")}
          >
            + New
          </Button>
        )}
      </View>
      <FlatList
        key={flatListKey}
        numColumns={numColumns}
        data={filteredCommunities}
        renderItem={renderCommunityCard}
        keyExtractor={(item) => item.publicId}
        {...(numColumns > 1 && {
          columnWrapperStyle: {
            justifyContent: "flex-start",
            marginBottom: cardMargin,
          },
        })}
        contentContainerStyle={{
          paddingLeft: cardMargin,
          paddingTop: cardMargin,
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#141414",
  },
  searchFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    padding: 10,
    width: "100%",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    paddingHorizontal: 10,
    borderRadius: 15,
    padding: moderateScale(10, 0.25),
    flex: 1,
    marginRight: 10,
  },
  searchText: {
    color: "#FAFAFB",
    fontSize: moderateScale(14, 0.25),
    fontWeight: "500",
    marginLeft: 10,
    flex: 1,
  },
  newButton: {
    backgroundColor: "#D22A38",
    borderRadius: 15,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: moderateScale(5, 0.25),
    backgroundColor: "#1C1C1C",
  },
  tabSelected: {
    borderBottomWidth: 2,
    borderBottomColor: "#D22A38",
  },
  communityCard: {
    backgroundColor: "#1C1C1C",
    borderRadius: moderateScale(10, 0.25),
    marginRight: moderateScale(10, 0.25),
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardMainContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
  },
  communityName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "poppins",
    flex: 1,
  
  },
  joinButton: {
    backgroundColor: "#D22A38",
  },
});
