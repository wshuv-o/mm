import React, { useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Image,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from "react-native";
import {
  Text,
  Button,
  Chip,
  Avatar,
  ActivityIndicator,
  TextInput,
} from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { Link, router } from "expo-router";
import { API } from "@/api/api";
import { useAuthManager } from "@/hooks/useAuthManager";
import { useCourseDataMgr } from "@/hooks/useCourseDataMgr";

export default function CourseList() {
  const { width } = useWindowDimensions();

  const minCardWidth = 250;
  const cardMargin = moderateScale(10, 0.25);
  const { userCanAddCourse, access } = useAuthManager();
  const numColumns = Math.floor(width / (minCardWidth + cardMargin)) || 1;
  const cardWidth = (width - cardMargin * (numColumns + 1)) / numColumns;

  const flatListKey = `cols-${numColumns}`;
  const {
    courseList: { isSuccess, data: courses },
  } = useCourseDataMgr();

  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const filteredCourses = useMemo(() => {
    return (
      courses?.courses?.filter((course) => {
        const matchesTab =
          selectedTab === "all" || course.status === selectedTab;
        const matchesTag =
          !tagFilter || course.tags.some((tag) => tag.tag === tagFilter);

        const matchesSearch = course.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return matchesTab && matchesTag && matchesSearch;
      }) || []
    );
  }, [courses, selectedTab, searchQuery, tagFilter]);
  const renderCourseCard = ({
    item,
  }: {
    item: typeof filteredCourses[number];
  }) => (
    <View style={[styles.courseCard, { width: cardWidth }]}>
      <Image
        source={{ uri: API.url(item.coverImage.url) }}
        style={styles.courseImage}
      />
      <View style={[styles.courseInfo, { flex: 1 }]}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <Text style={styles.courseDescription}>{item.description}</Text>

        {/* Tags */}
        <ScrollView
          horizontal
          style={styles.tagsContainer}
          showsHorizontalScrollIndicator={false}
        >
          {item.tags.map(({ tag }, i) => (
            <Chip
              key={i}
              style={styles.tagChip}
              selected={tag == tagFilter}
              {...(tag == tagFilter && {
                closeIcon: (props) => (
                  <CustomIcon
                    {...props}
                    name="close"
                    style={{
                      color: "#D22A38",
                    }}
                  ></CustomIcon>
                ),
                onClose: () => setTagFilter(""),
              })}
              onPress={() => setTagFilter(tag)}
            >
              <Text style={{ color: "#D5D5DC", fontSize: 10 }}>{tag}</Text>
            </Chip>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={40}
              source={{ uri: API.url(item.author.avatar.url) }}
            />
            <Text style={styles.instructorName}>By {item.author.userName}</Text>
          </View>
          <Link href={`/course/${item.publicId}`} asChild>
            <Button mode="contained" style={styles.learnButton}>
              {access.course[item.publicId].status === true
                ? "Start Learning"
                : "Enroll Now"}
            </Button>
          </Link>
        </View>
      </View>
    </View>
  );
  //FIXME -  the search and add new btn pair has been duplicated several times.we should make it as a component
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
          placeholder="Find Course"
          placeholderTextColor="#FAFAFB"
          outlineColor="transparent"
          activeOutlineColor="#D22A38"
          textColor="#FAFAFB"
        />

        {userCanAddCourse && (
          <Button
            mode="contained"
            style={[styles.newButton]}
            onPress={() => router.navigate(`/admin/courses/new`)}
            contentStyle={{
              minHeight: newBtnHeight,
              flex: 1,
            }}
          >
            + New
          </Button>
        )}
      </View>

      <ScrollView
        horizontal
        style={styles.tabs}
        showsHorizontalScrollIndicator={false}
      >
        {/* FIXME REMOVE THIS DUPLICATION.USE CD-UI */}
        <Button
          mode="text"
          textColor={selectedTab === "all" ? "#D22A38" : "#D5D5DC"}
          onPress={() => setSelectedTab("all")}
          style={selectedTab === "all" ? styles.tabSelected : null}
        >
          All
        </Button>

        <Button
          mode="text"
          textColor={selectedTab === "coming_soon" ? "#D22A38" : "#D5D5DC"}
          onPress={() => setSelectedTab("coming_soon")}
          style={selectedTab === "coming soon" ? styles.tabSelected : null}
        >
          Coming Soon
        </Button>
        <Button
          mode="text"
          textColor={selectedTab === "archived" ? "#D22A38" : "#D5D5DC"}
          onPress={() => setSelectedTab("archived")}
          style={selectedTab === "archived" ? styles.tabSelected : null}
        >
          Archived
        </Button>
        {userCanAddCourse && (
          <Button
            mode="text"
            textColor={selectedTab === "draft" ? "#D22A38" : "#D5D5DC"}
            onPress={() => setSelectedTab("draft")}
            style={selectedTab === "draft" ? styles.tabSelected : null}
          >
            Draft
          </Button>
        )}
      </ScrollView>

      {isSuccess ? (
        <FlatList
          key={flatListKey}
          numColumns={numColumns}
          data={filteredCourses}
          renderItem={renderCourseCard}
          keyExtractor={(item, index) => String(index)}
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
      ) : (
        <ActivityIndicator size="large" color="#D22A38" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  courseCard: {
    backgroundColor: "#1C1C1C",
    borderRadius: moderateScale(10, 0.25),
    padding: 10,
    marginRight: moderateScale(10, 0.25),
    marginBottom: 12,
  },
  courseImage: {
    width: "100%",
    height: moderateScale(120, 0.25),
    borderRadius: 10,
  },
  courseInfo: {
    marginTop: 10,
  },
  courseTitle: {
    fontSize: 16,
    color: "#FAFAFB",
    fontWeight: "600",
    marginBottom: 10,
  },
  courseDescription: {
    fontSize: 14,
    color: "#B5B5BE",
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  tagChip: {
    backgroundColor: "#252525",
    marginRight: 5,
  },
  footer: {
    flexDirection: "column",
    width: "100%",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  instructorName: {
    color: "#92929D",
    fontSize: 12,
    marginLeft: 10,
  },
  learnButton: {
    backgroundColor: "#D22A38",
    height: moderateScale(30, 0.25),
    justifyContent: "center",
    alignItems: "center",
    fontSize: 12,
  },
});
