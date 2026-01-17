import { useWindowQuery } from "@/hooks/useWindowQuery";
import { UTIL } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { ReactNode, useState } from "react";
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
import { Package, PAYMENT_PROVIDERS, PmtProviderType } from "@/api/types";
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
export function PkgEditorDialogueHOC({
  children,
  onSuccess,
  pkg,
}: {
  children: (open: () => void) => ReactNode;
  onSuccess: () => void;
  pkg?: Package;
}) {
  const [visible, setVisible] = useState(false);
  const { width, height } = useWindowQuery();
  const pkgItemLabels = {
    aiToolsCourses: "Ai access",
    communities: "",
    courses: "",
  } as const;
  const pkgItemKeys = keys(pkgItemLabels);
  const mutation = useMutation({
    mutationFn: (payload: any) => {
      return pkg
        ? API.updatePkg(pkg.publicId, payload)
        : API.createPkg(payload);
    },
  });
  const form = useForm({
    defaultValues: merge(
      {
        collexoFeeId: "",
        price: "",
        label: "",
        aiToolsCourses: pkgItemsDefault(),
        communities: pkgItemsDefault(),
        courses: pkgItemsDefault(),
        pmtProvider: "",
        repurchasable: false,
      },
      pkg
        ? {
            ...pkg,
            pmtProvider: pkg.pmtProvider.type,
            ...fromKeys(
              pkgItemKeys,
              (k): pkgItems => ({
                billingInterval: pkg[k].length
                  ? pkg[k][0].meta.pivot_billing_interval
                  : null,
                ids: pkg[k].map((c) => c.publicId),
              })
            ),
          }
        : {}
    ),
    onSubmit: ({ value }) => {
      mutation.mutate(value, {
        onSuccess: () => {
          setVisible(false);
          onSuccess();
        },
      });
    },
  });
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
            height: height * 0.8,
          }}
        >
          <ScrollView style={{ padding: 20 }}>
            <form.Field name="label">
              {(field) => (
                <TextInput
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="label"
                  {...inputStyle}
                />
              )}
            </form.Field>

            <form.Field name="price">
              {(field) => (
                <TextInput
                  value={field.state.value}
                  onChangeText={(v) => (+v == v ? field.handleChange(v) : null)}
                  keyboardType="numeric"
                  placeholder="price (INR)"
                  {...inputStyle}
                />
              )}
            </form.Field>
            <Text
              style={{ color: "#B5B5BE", fontWeight: "bold", fontSize: 20 }}
            >
              payment provider
            </Text>
            <form.Field name={`pmtProvider`}>
              {(field) => {
                return (
                  <RadioButton.Group
                    onValueChange={field.handleChange}
                    value={field.state.value}
                  >
                    {PAYMENT_PROVIDERS.map((v) => (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <RadioButton color="#D22A38" value={v} />
                        <Text style={{ color: "#B5B5BE" }}>use {v}</Text>
                      </View>
                    ))}
                  </RadioButton.Group>
                );
              }}
            </form.Field>
            {/* https://tanstack.com/form/latest/docs/framework/react/guides/reactivity */}
            <form.Subscribe
              selector={(state) => state.values.pmtProvider}
              //@ts-expect-error
              children={(pType: PmtProviderType) => (
                <>
                  <form.Field name={`collexoFeeId`}>
                    {(field) => {
                      return (
                        pType == "collexo" && (
                          <TextInput
                            value={field.state.value}
                            onChangeText={(v) =>
                              +v == v ? field.handleChange(v) : null
                            }
                            keyboardType="numeric"
                            placeholder="collexo feeId"
                            {...inputStyle}
                          />
                        )
                      );
                    }}
                  </form.Field>
                </>
              )}
            />
            {pkgItemKeys.map((key) => (
              <>
                <Text
                  style={{ color: "#B5B5BE", fontWeight: "bold", fontSize: 20 }}
                >
                  {pkgItemLabels[key] || key}
                </Text>
                <Divider
                  bold
                  style={{ marginVertical: 10 }}
                  theme={{ colors: { outlineVariant: "grey" } }}
                />

                <form.Field name={`${key}.ids`}>
                  {(field) => (
                    <View style={{ marginBottom: 16 }}>
                      <MultiSelectWithViewer
                        queryFn={
                          key == "communities"
                            ? async () =>
                                (await API.getCommunities()).communities
                            : async () => (await API.getCourses()).courses
                        }
                        queryKey={[key, "pkg_editor"]}
                        labelField={key == "communities" ? "name" : "title"}
                        valueField="publicId"
                        placeholder="select items"
                        value={field.state.value}
                        onChange={field.handleChange}
                      ></MultiSelectWithViewer>
                    </View>
                  )}
                </form.Field>
                <form.Field name={`${key}.billingInterval`}>
                  {(field) => {
                    return (
                      <TextInput
                        value={field.state.value}
                        onChangeText={(v) =>
                          +v == v ? field.handleChange(v) : null
                        }
                        keyboardType="numeric"
                        placeholder="billing interval (days)"
                        {...inputStyle}
                      />
                    );
                  }}
                </form.Field>
              </>
            ))}
            <form.Field name="repurchasable">
              {(field) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <RoundCheckbox
                    checked={field.state.value}
                    onPress={() => field.handleChange(!field.state.value)}
                    color="#C72937"
                    style={{
                      width: moderateScale(15),
                      height: moderateScale(15),
                      borderRadius: 4,
                      marginLeft: 0,
                    }}
                  />
                  <Text style={{ color: "#B5B5BE" }}>
                   allow repurchase?
                  </Text>
                </View>
              )}
            </form.Field>
            <Button
              mode="contained"
              onPress={() => form.handleSubmit()}
              loading={mutation.isPending}
              disabled={mutation.isPending}
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
              save
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
      {children(() => setVisible(true))}
    </>
  );
}
