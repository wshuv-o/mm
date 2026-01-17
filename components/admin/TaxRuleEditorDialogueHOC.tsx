import { useWindowQuery } from "@/hooks/useWindowQuery";
import { UTIL } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { ReactNode, useEffect, useState } from "react";
import { ScrollView, View, Text } from "react-native";
import {
  Button,
  Divider,
  Modal,
  Portal,
  RadioButton,
  TextInput,
} from "react-native-paper";
import { authInputStyles } from "../auth/AuthFormContainer";
import { moderateScale } from "react-native-size-matters";
import {
  CountryData,
  Package,
  PAYMENT_PROVIDERS,
  PmtProviderType,
} from "@/api/types";
import { fromKeys, keys, merge } from "remeda";
import { MultiSelectWithViewer } from "../shared/MultiSelectWithViewer";
import { API } from "@/api/api";
import { useMutation } from "@tanstack/react-query";
import RoundCheckbox from "../shared/RoundCheckbox";

const pkgItemsDefault = () => ({
  billingInterval: null,
  ids: [] as string[],
});
type pkgItems = ReturnType<typeof pkgItemsDefault>;
const inputStyle = {
  ...authInputStyles,
  style: [authInputStyles.style, { height: 48, marginBottom: 10 }],
};
export function TaxRuleEditorDialogueHOC({
  children,
  form,
  countryData,
}: {
  children: (open: (itmIdx: number) => void) => ReactNode;
  form: any;
  countryData: CountryData;
}) {
  const [visible, setVisible] = useState(false);
  const [itmIdx, setItmIdx] = useState(null);
  useEffect(() => {
    if (!visible) {
      setItmIdx(null);
    }
  }, [visible]);
  const { width } = useWindowQuery();
  const prefixName = (name: string) => `taxRules[${itmIdx}].${name}`;
  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
          contentContainerStyle={{
            backgroundColor: "#1C1C1C",
            width: UTIL.clamp(width * 0.8, 340, 600),
            // height: height * 0.8,
          }}
        >
          {itmIdx !== null && (
            <ScrollView
              style={{ padding: 20 }}
              contentContainerStyle={{ gap: 20 }}
            >
              <form.Field name={prefixName("label")}>
                {(field) => (
                  <TextInput
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    placeholder="label"
                    {...inputStyle}
                  />
                )}
              </form.Field>
              <form.Field name={prefixName("country")}>
                {(field) => (
                  <MultiSelectWithViewer
                    queryFn={async () => countryData.countries}
                    queryKey={"tx_countries"}
                    labelField="name"
                    valueField="iso2"
                    placeholder="select country"
                    value={[field.state.value]}
                    singleSelect
                    onChange={(v) => {
                      field.handleChange(v);

                      form.replaceFieldValue("taxRules", itmIdx, {
                        ...form.state.values.taxRules[itmIdx],
                        state: null,
                      });
                    }}
                  ></MultiSelectWithViewer>
                )}
              </form.Field>

              <form.Field name={prefixName("state")}>
                {(field) => (
                  <MultiSelectWithViewer
                    queryFn={async () => {
                      return (
                        countryData.countries.find(
                          (c) =>
                            c.iso2 ===
                            form.state.values.taxRules[itmIdx].country
                        )?.states ?? []
                      );
                    }}
                    queryKey={[
                      "tx_country_states",
                      form.state.values.taxRules[itmIdx].country,
                    ]}
                    labelField="name"
                    valueField="state_code"
                    placeholder="select state"
                    value={[field.state.value]}
                    singleSelect
                    onChange={field.handleChange}
                  ></MultiSelectWithViewer>
                )}
              </form.Field>

              <form.Field name={prefixName("rate")}>
                {(field) => (
                  <TextInput
                    value={field.state.value}
                    onChangeText={(v) =>
                      +v == v ? field.handleChange(v) : null
                    }
                    keyboardType="numeric"
                    placeholder="rate (%)"
                    {...inputStyle}
                  />
                )}
              </form.Field>

              <Button
                mode="contained"
                onPress={() => setVisible(false)}
                style={{
                  borderRadius: moderateScale(12),
                  marginTop: moderateScale(4),
                  width: "100%",
                }}
                buttonColor="#D22A38"
                labelStyle={{
                  borderRadius: moderateScale(12),
                  marginTop: moderateScale(4),
                  width: "100%",
                }}
              >
                done
              </Button>
            </ScrollView>
          )}
        </Modal>
      </Portal>
      {children((idx) => {
        setVisible(true);
        setItmIdx(idx);
      })}
    </>
  );
}
