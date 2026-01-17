import { useMemo, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { TextInput, DataTable, Button, IconButton } from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { usePkgListQuery } from "@/hooks/usePkgListQuery";
import { PkgEditorDialogueHOC } from "@/components/admin/PkgEditorDialogueHOC";
import * as Clipboard from "expo-clipboard";
import { API } from "@/api/api";
import { WithConfirmationHOC } from "@/components/shared/WithConfirmationHOC";
import { useMutation } from "@tanstack/react-query";
export default function PkgList() {
  const { data: __origData, refetch } = usePkgListQuery();
  const [searchQuery, setSearchQuery] = useState("");
  //client side filtering
  const data = useMemo(() => {
    const mapped = __origData?.map((p) => ({
      ...p,
      pkgItems: [
        `Courses (${p.courses?.[0]?.meta.pivot_billing_interval ?? 0}d): ` +
          p.courses.map((c) => c.title).join(","),
        `Communities (${
          p.communities?.[0]?.meta.pivot_billing_interval ?? 0
        }d): ` + p.communities.map((c) => c.name).join(","),
        `AI access (${
          p.aiToolsCourses?.[0]?.meta.pivot_billing_interval ?? 0
        }d): ` + p.aiToolsCourses.map((c) => c.title).join(","),
      ].join("\n"),
    }));
    if (searchQuery) {
      return mapped?.filter((p) =>
        (p.label + p.pkgItems).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return mapped;
  }, [__origData, searchQuery]);
  const textStyle = { textStyle: { color: "#FAFAFB" } };
  const newBtnHeight = moderateScale(40, 0.25);
  const rmMutation = useMutation({
    mutationFn: (arg) => API.deletePkg(...arg),
    onSuccess: () => refetch(),
  });
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

        <PkgEditorDialogueHOC onSuccess={refetch}>
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
        </PkgEditorDialogueHOC>
      </View>
      <ScrollView horizontal contentContainerStyle={{ width: "100%" }}>
        <ScrollView style={{ minWidth: 953 }}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title {...textStyle}>label</DataTable.Title>
              <DataTable.Title {...textStyle}>price</DataTable.Title>
              <DataTable.Title {...textStyle}>pkg. items</DataTable.Title>
              <DataTable.Title {...textStyle}>gateway</DataTable.Title>
              <DataTable.Title {...textStyle}>View</DataTable.Title>
            </DataTable.Header>
            {data.map((item) => (
              <DataTable.Row
                pointerEvents="none"
                key={item.publicId}
                style={{ padding: 10, pointerEvents: "none" }}
              >
                <DataTable.Cell {...textStyle}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <Text style={{ color: textStyle.textStyle.color }}>
                      {item.label}
                    </Text>
                  </View>
                </DataTable.Cell>
                <DataTable.Cell {...textStyle}>{item.price}</DataTable.Cell>
                <DataTable.Cell {...textStyle}>
                  <Text style={{ color: "#D5D5DC" }}>{item.pkgItems}</Text>
                </DataTable.Cell>
                <DataTable.Cell {...textStyle}>
                  {item.pmtProvider.type}
                </DataTable.Cell>
                <DataTable.Cell {...textStyle}>
                  <PkgEditorDialogueHOC onSuccess={refetch} pkg={item}>
                    {(open) => (
                      <IconButton
                        onPress={open}
                        icon={() => (
                          <FontAwesome name="eye" size={24} color="#D22A38" />
                        )}
                      ></IconButton>
                    )}
                  </PkgEditorDialogueHOC>
                  <IconButton
                    onPress={() =>
                      Clipboard.setStringAsync(
                        API.url(`/onboarding/${item.publicId}`)
                      )
                    }
                    icon={() => (
                      <FontAwesome name="clipboard" size={24} color="#D22A38" />
                    )}
                  ></IconButton>
                  <WithConfirmationHOC isPending={rmMutation.isPending}>
                    {(confirm) => (
                      <IconButton
                        onPress={() =>
                          confirm("are you sure?", () =>
                            rmMutation.mutate([item.publicId])
                          )
                        }
                        size={30}
                        iconColor="#D22A38"
                        icon={(props) => (
                          <CustomIcon {...props} name="trash"></CustomIcon>
                        )}
                      ></IconButton>
                    )}
                  </WithConfirmationHOC>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
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
