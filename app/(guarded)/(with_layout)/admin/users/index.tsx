import { API } from "@/api/api";
import { formatRole } from "@/hooks/useAuthManager";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { Avatar, Chip, TextInput, DataTable, Button } from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import { Link, useLocalSearchParams } from "expo-router";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
import { format } from "date-fns";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { CreateUserDialogueHoc } from "@/components/admin/CreateUserDialogueHoc";

export default function UserList() {
  const { membersOf, studentsOf } = useLocalSearchParams<{
    membersOf?: string;
    studentsOf?: string;
  }>();
  const qk = ["users"];
  const { data: __origData, refetch } = useQuery({
    queryKey: qk,
    queryFn: API.getUsers, //rn paper counts page from 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  //client side filtering
  const data = useMemo(() => {
    if (membersOf) {
      return __origData?.filter(
        (u) => !!u.memberships.find((m) => m.community.publicId === membersOf)
      );
    } else if (studentsOf) {
      return __origData?.filter(
        (u) => !!u.enrollments.find((e) => e.course.publicId === studentsOf)
      );
    } else if (searchQuery) {
      return __origData?.filter((u) =>
        (u.userName + u.email + u.fullName)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }
    return __origData;
  }, [__origData, searchQuery]);
  const status = ["approved", "pending"].reduce((acc, item) => {
    return [...acc, { status: item }];
  }, []);
  const textStyle = { textStyle: { color: "#FAFAFB" } };
  const newBtnHeight = moderateScale(40, 0.25);
  return !data ? (
    <FullPageLoader></FullPageLoader>
  ) : (
    <View style={{ backgroundColor: "#141414", flex: 1 }}>
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
          placeholder="search..."
          placeholderTextColor="#FAFAFB"
          outlineColor="transparent"
          activeOutlineColor="#D22A38"
          textColor="#FAFAFB"
        />

        <CreateUserDialogueHoc onSuccess={refetch}>
          {(open) => (
            <Button
              mode="contained"
              style={{
                backgroundColor: "#D22A38",
                borderRadius: 15,
              }}
              onPress={open}
              contentStyle={{
                minHeight: newBtnHeight,
                flex: 1,
              }}
            >
              + New
            </Button>
          )}
        </CreateUserDialogueHoc>
      </View>
      <ScrollView horizontal contentContainerStyle={{ width: "100%" }}>
        <ScrollView style={{ minWidth: 953 }}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title {...textStyle}>user</DataTable.Title>
              <DataTable.Title {...textStyle}>email</DataTable.Title>
              <DataTable.Title {...textStyle}>roles</DataTable.Title>
              <DataTable.Title {...textStyle}>created</DataTable.Title>
              <DataTable.Title {...textStyle}>details</DataTable.Title>
            </DataTable.Header>
            {data.map((item) => (
              <DataTable.Row
                pointerEvents="none"
                key={item.publicId}
                style={{ padding: 10 }}
              >
                <DataTable.Cell {...textStyle}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <Avatar.Image
                      size={moderateScale(32)}
                      source={{ uri: API.url(item.avatar.url) }}
                    />
                    <Text style={{ color: textStyle.textStyle.color }}>
                      {item.userName}
                    </Text>
                  </View>
                </DataTable.Cell>
                <DataTable.Cell {...textStyle}>{item.email}</DataTable.Cell>
                <DataTable.Cell {...textStyle}>
                  <View style={{ alignItems: "flex-start" }}>
                    {item.rolesPlain.map((r) => (
                      <Chip
                        compact
                        style={{
                          marginTop: 6,
                          backgroundColor: "#252525",
                        }}
                      >
                        <Text style={{ color: "#D5D5DC" }}>
                          {formatRole(r)}
                        </Text>
                      </Chip>
                    ))}
                  </View>
                </DataTable.Cell>
                <DataTable.Cell {...textStyle}>
                  {format(new Date(item.createdAt), "dd MMM yy, hh:mm a")}
                </DataTable.Cell>
                <DataTable.Cell {...textStyle}>
                  <Link href={`/admin/users/${item.publicId}`}>
                    <FontAwesome name="eye" size={24} color="#D22A38" />
                  </Link>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
            {/* <DataTable.Pagination
        theme={{
          colors: {
            onSurface: "#D22A38",
            onSurfaceDisabled: "#931d27",
          },
        }}
        showFastPaginationControls
        page={page}
        numberOfPages={data.meta.lastPage}
        onPageChange={setPage}
        numberOfItemsPerPage={data.meta.perPage}
      /> */}
          </DataTable>
        </ScrollView>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  searchFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    width: "100%", // Ensures full width
    alignSelf: "stretch", // Makes sure it stretches
    padding: 10,
  },
});
