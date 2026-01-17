import { API } from "@/api/api";
import { OrgDetail } from "@/api/types";
import { DetailSect, detailSectStyles } from "@/components/admin/DetailSect";
import { TaxRulesList } from "@/components/admin/TaxRulesList";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
import { SnackBarFeedbackCtx } from "@/contexts/ctx";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import { merge, mergeDeep } from "remeda";
export default function OrgSettings() {
  const { data, refetch } = useQuery({
    queryKey: ["currentOrg"],
    queryFn: API.getOrgDetails,
  });
  const { mutate, isPending } = useMutation({
    mutationFn: (arg) => API.updateOrgDetails(arg),
    onSuccess: () => {
      return refetch();
    },
  });
  const collexo = useMemo(() => {
    return data?.paymentProviders.find((v) => v.type == "collexo");
  }, [data]);
  const form = useForm<
    //@ts-expect-error
    Pick<OrgDetail, "zoomConf" | "bunnyConf" | "taxRules"> & {
      collexo: {
        apiKey: string;
        clientCode: string;
      };
    }
  >({
    defaultValues: {
      zoomConf: {
        accountId: "",
        apiKey: "",
        apiSecret: "",
        webhookSecret: "",
        ...data?.zoomConf,
      },
      bunnyConf: {
        libraryId: "",
        apiKey: "",
        tokenAuthKey: "",
        ...data?.bunnyConf,
      },

      //FIXME -  this field should not goout for other client than ceos
      collexo: {
        apiKey: "",
        clientCode: "",
        ...collexo?.config,
      },
      taxRules: data?.taxRules ?? [],
    },
    onSubmit: ({ value }) => {
      mutate(value);
    },
  });
  return !data ? (
    <FullPageLoader />
  ) : (
    <ScrollView style={{ backgroundColor: "#141414", paddingVertical: 14 }}>
      <DetailSect title="Zoom settings">
        <View style={{ gap: 14 }}>
          <form.Field name="zoomConf.accountId">
            {(field) => (
              <TextInput
                value={field.state.value}
                onChangeText={field.handleChange}
                style={{
                  width: "100%",
                  height: "5%",
                  padding: moderateScale(15, 0.25),
                  backgroundColor: "#252525",
                  borderRadius: moderateScale(12, 0.25),
                  fontFamily: "Poppins",
                }}
                mode="flat"
                placeholder="account id"
                placeholderTextColor={"#92929D"}
                textColor="#B5B5BE"
              />
            )}
          </form.Field>
          <form.Field name="zoomConf.apiKey">
            {(field) => (
              <TextInput
                value={field.state.value}
                onChangeText={field.handleChange}
                style={{
                  width: "100%",
                  height: "5%",
                  padding: moderateScale(15, 0.25),
                  backgroundColor: "#252525",
                  borderRadius: moderateScale(12, 0.25),
                  fontFamily: "Poppins",
                }}
                mode="flat"
                keyboardType="numeric"
                placeholder="Client Id"
                placeholderTextColor={"#92929D"}
                textColor="#B5B5BE"
              />
            )}
          </form.Field>
          <form.Field name="zoomConf.apiSecret">
            {(field) => (
              <TextInput
                value={field.state.value}
                onChangeText={field.handleChange}
                style={{
                  width: "100%",
                  height: "5%",
                  padding: moderateScale(15, 0.25),
                  backgroundColor: "#252525",
                  borderRadius: moderateScale(12, 0.25),
                  fontFamily: "Poppins",
                }}
                mode="flat"
                keyboardType="numeric"
                placeholder="Client secret"
                placeholderTextColor={"#92929D"}
                textColor="#B5B5BE"
              />
            )}
          </form.Field>
          <form.Field name="zoomConf.webhookSecret">
            {(field) => (
              <TextInput
                value={field.state.value}
                onChangeText={field.handleChange}
                style={{
                  width: "100%",
                  height: "5%",
                  padding: moderateScale(15, 0.25),
                  backgroundColor: "#252525",
                  borderRadius: moderateScale(12, 0.25),
                  fontFamily: "Poppins",
                }}
                mode="flat"
                keyboardType="numeric"
                placeholder="Webhook secret"
                placeholderTextColor={"#92929D"}
                textColor="#B5B5BE"
              />
            )}
          </form.Field>
          <Text style={{ color: "#B5B5BE" }}>
            webhook url for this org: {data.zoomWebhookUrl}
          </Text>
        </View>
      </DetailSect>
      <DetailSect title="Bunny settings">
        <View style={{ gap: 14 }}>
          <form.Field name="bunnyConf.apiKey">
            {(field) => (
              <TextInput
                value={field.state.value}
                onChangeText={field.handleChange}
                style={{
                  width: "100%",
                  height: "5%",
                  padding: moderateScale(15, 0.25),
                  backgroundColor: "#252525",
                  borderRadius: moderateScale(12, 0.25),
                  fontFamily: "Poppins",
                }}
                mode="flat"
                placeholder="api key"
                placeholderTextColor={"#92929D"}
                textColor="#B5B5BE"
              />
            )}
          </form.Field>
          <form.Field name="bunnyConf.libraryId">
            {(field) => (
              <TextInput
                value={field.state.value}
                onChangeText={field.handleChange}
                style={{
                  width: "100%",
                  height: "5%",
                  padding: moderateScale(15, 0.25),
                  backgroundColor: "#252525",
                  borderRadius: moderateScale(12, 0.25),
                  fontFamily: "Poppins",
                }}
                mode="flat"
                keyboardType="numeric"
                placeholder="library id"
                placeholderTextColor={"#92929D"}
                textColor="#B5B5BE"
              />
            )}
          </form.Field>
          <form.Field name="bunnyConf.tokenAuthKey">
            {(field) => (
              <TextInput
                value={field.state.value}
                onChangeText={field.handleChange}
                style={{
                  width: "100%",
                  height: "5%",
                  padding: moderateScale(15, 0.25),
                  backgroundColor: "#252525",
                  borderRadius: moderateScale(12, 0.25),
                  fontFamily: "Poppins",
                }}
                mode="flat"
                keyboardType="numeric"
                placeholder="token auth key"
                placeholderTextColor={"#92929D"}
                textColor="#B5B5BE"
              />
            )}
          </form.Field>
        </View>
      </DetailSect>
      {collexo && (
        <DetailSect title="Collexo settings">
          <View style={{ gap: 14 }}>
            <form.Field name="collexo.apiKey">
              {(field) => (
                <TextInput
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  style={{
                    width: "100%",
                    height: "5%",
                    padding: moderateScale(15, 0.25),
                    backgroundColor: "#252525",
                    borderRadius: moderateScale(12, 0.25),
                    fontFamily: "Poppins",
                  }}
                  mode="flat"
                  placeholder="api key"
                  placeholderTextColor={"#92929D"}
                  textColor="#B5B5BE"
                />
              )}
            </form.Field>
            <form.Field name="collexo.clientCode">
              {(field) => (
                <TextInput
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  style={{
                    width: "100%",
                    height: "5%",
                    padding: moderateScale(15, 0.25),
                    backgroundColor: "#252525",
                    borderRadius: moderateScale(12, 0.25),
                    fontFamily: "Poppins",
                  }}
                  mode="flat"
                  keyboardType="numeric"
                  placeholder="client code"
                  placeholderTextColor={"#92929D"}
                  textColor="#B5B5BE"
                />
              )}
            </form.Field>
          </View>
        </DetailSect>
      )}
      <DetailSect title="Sales taxes">
        <form.Subscribe
          selector={(state) => state.values.taxRules}
          children={(rules) => (
            <TaxRulesList data={rules} form={form}></TaxRulesList>
          )}
        />
      </DetailSect>
      <View
        style={[
          detailSectStyles.outerSpacing,
          { flexDirection: "row", justifyContent: "flex-end" },
        ]}
      >
        <Button
          loading={isPending}
          disabled={isPending}
          style={{
            backgroundColor: "#D22A38",
            borderRadius: moderateScale(8, 0.25),
          }}
          labelStyle={{
            color: "white",
            paddingHorizontal: 20,
            paddingVertical: 4,
          }}
          onPress={form.handleSubmit}
        >
          save
        </Button>
      </View>
    </ScrollView>
  );
}
