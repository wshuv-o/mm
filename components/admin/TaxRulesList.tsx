import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "react-native";
import { Button, DataTable, IconButton } from "react-native-paper";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { PkgEditorDialogueHOC } from "@/components/admin/PkgEditorDialogueHOC";
import * as Clipboard from "expo-clipboard";
import { API } from "@/api/api";
import { WithConfirmationHOC } from "@/components/shared/WithConfirmationHOC";
import { OrgDetail } from "@/api/types";
import { useQuery } from "@tanstack/react-query";
import { TaxRuleEditorDialogueHOC } from "./TaxRuleEditorDialogueHOC";
import { moderateScale } from "react-native-size-matters";

export function TaxRulesList({
  data,
  form,
}: {
  data: OrgDetail["taxRules"];
  form: any;
}) {
  const textStyle = { textStyle: { color: "#FAFAFB" } };
  const { data: countryData } = useQuery({
    queryKey: ["tax", "country"],
    queryFn: async () => API.getCountryData("", "?everything=1"),
  });
  const getCountryDetail = (iso2: string) => {
    return countryData!.countries.find((c) => c.iso2 === iso2)!;
  };
  return (
    countryData && (
      <View>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <TaxRuleEditorDialogueHOC form={form} {...{ countryData }}>
            {(open) => (
              <Button
                mode="contained"
                style={{
                  backgroundColor: "#D22A38",
                  borderRadius: 15,
                }}
                onPress={() => {
                  const v: Partial<OrgDetail["taxRules"][number]> = {
                    country: "",
                    label: "new rate",
                    rate: 0,
                    state: null,
                  };
                  form.pushFieldValue("taxRules", v);
                  setTimeout(
                    () => open(form.getFieldValue("taxRules").length - 1),
                    200
                  );
                }}
                contentStyle={{
                  minHeight: moderateScale(40, 0.25),
                  flex: 1,
                }}
              >
                + New
              </Button>
            )}
          </TaxRuleEditorDialogueHOC>
        </View>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title {...textStyle}>label</DataTable.Title>
            <DataTable.Title {...textStyle}>country</DataTable.Title>
            <DataTable.Title {...textStyle}>state</DataTable.Title>
            <DataTable.Title {...textStyle}>rate</DataTable.Title>
            <DataTable.Title {...textStyle}>actions</DataTable.Title>
          </DataTable.Header>
          {data.map((item, idx) => (
            <DataTable.Row
              pointerEvents="none"
              key={idx}
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
              <DataTable.Cell {...textStyle}>
                {getCountryDetail(item.country)?.name}
              </DataTable.Cell>
              <DataTable.Cell {...textStyle}>
                <Text style={{ color: "#D5D5DC" }}>
                  {
                    getCountryDetail(item.country)?.states?.find(
                      (s) => s.state_code === item.state
                    )?.name
                  }
                </Text>
              </DataTable.Cell>
              <DataTable.Cell {...textStyle}>{item.rate}%</DataTable.Cell>
              <DataTable.Cell {...textStyle}>
                <TaxRuleEditorDialogueHOC form={form} {...{ countryData }}>
                  {(open) => (
                    <IconButton
                      onPress={() => open(idx)}
                      icon={() => (
                        <FontAwesome name="edit" size={24} color="#D22A38" />
                      )}
                    ></IconButton>
                  )}
                </TaxRuleEditorDialogueHOC>
                <IconButton
                  onPress={() => form.removeFieldValue("taxRules", idx)}
                  size={30}
                  iconColor="#D22A38"
                  icon={(props) => (
                    <CustomIcon {...props} name="trash"></CustomIcon>
                  )}
                ></IconButton>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </View>
    )
  );
}
