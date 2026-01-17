import React, { useEffect, useState } from "react";
import { moderateScale } from "react-native-size-matters";
import { TextInput, Button } from "react-native-paper";
import { router } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API } from "@/api/api";
import { useForm, useStore } from "@tanstack/react-form";
import { UserRolesEditor } from "@/components/admin/UserRolesEditor";
import { authInputStyles } from "@/components/auth/AuthFormContainer";
import { getFontSize } from "@/utils/fontSize";
import { MultiSelectWithViewer } from "./shared/MultiSelectWithViewer";
import { View } from "react-native";
import { pick } from "remeda";
import { PaymentDetails } from "@/api/types";
export function billingInfoSchema() {
  return {
    country: "",
    state: null,
    // postalCode: null,
    // addressLine1: null,
    // addressLine2: null,
  };
}
export function BillingInfoForm({
  existing,
  onSuccess,
}: {
  existing?: PaymentDetails["billingInfo"];
  onSuccess?: () => void;
}) {
  const mtn = useMutation({
    mutationFn: API.saveBillingInfo,
    onSuccess,
  });

  const form = useForm({
    defaultValues: {
      ...billingInfoSchema(),
      ...existing,
    },
    onSubmit: ({ value }) => {
      mtn.mutate(value);
    },
  });
  return (
    <>
      <BillingInfoFields form={form}></BillingInfoFields>
      <Button
        mode="contained"
        onPress={() => form.handleSubmit()}
        loading={mtn.isPending}
        disabled={mtn.isPending}
        style={{
          borderRadius: moderateScale(12),
          marginTop: moderateScale(4),
          width: "100%",
        }}
        buttonColor="#D22A38"
        labelStyle={{
          fontSize: getFontSize("small"),
          fontFamily: "Poppins",
        }}
      >
        proceed
      </Button>
    </>
  );
}
export function BillingInfoFields({
  form,
  parentFieldName,
}: {
  form: any;
  parentFieldName?: string;
}) {
  const cqk = ["billingInfo", "countries"];
  const country = useStore(form.store, (state) =>
    parentFieldName
      ? state.values[parentFieldName].country
      : state.values.country
  );
  const { data: selectedCountryData } = useQuery({
    queryKey: [...cqk, country],
    queryFn: async () => country && API.getCountryData(country),
  });

  const prefixName = (name: string) =>
    parentFieldName ? `${parentFieldName}.${name}` : name;
  return (
    <>
      {/* <form.Field name={prefixName("addressLine1")}>
        {(field) => (
          <TextInput
            value={field.state.value}
            onChangeText={field.handleChange}
            placeholder="addressLine 1 (optional)"
            {...authInputStyles}
          />
        )}
      </form.Field>
      <form.Field name={prefixName("addressLine2")}>
        {(field) => (
          <TextInput
            value={field.state.value}
            onChangeText={field.handleChange}
            placeholder="addressLine 2 (optional)"
            {...authInputStyles}
          />
        )}
      </form.Field>
      <form.Field name={prefixName("postalCode")}>
        {(field) => (
          <TextInput
            value={field.state.value}
            onChangeText={(v) => (+v == v ? field.handleChange(v) : null)}
            keyboardType="numeric"
            placeholder="postal code (optional)"
            {...authInputStyles}
          />
        )}
      </form.Field> */}
      <form.Field name={prefixName("country")}>
        {(field) => (
          <View style={{ marginBottom: moderateScale(15) }}>
            <MultiSelectWithViewer
              queryFn={async () => (await API.getCountryData()).countries}
              queryKey={cqk}
              labelField="name"
              valueField="iso2"
              placeholder="select country"
              value={[field.state.value]}
              singleSelect
              onChange={(v) => {
                field.handleChange(v);
                form.setFieldValue("state", null);
              }}
            ></MultiSelectWithViewer>
          </View>
        )}
      </form.Field>
      {selectedCountryData && (
        <>
          {!!selectedCountryData.statesOfCurrent!.length && (
            <View style={{ marginBottom: moderateScale(15) }}>
              <form.Field name={prefixName("state")}>
                {(field) => (
                  <MultiSelectWithViewer
                    queryFn={async () => {
                      return selectedCountryData.statesOfCurrent;
                    }}
                    queryKey={[...cqk, country, "states"]}
                    labelField="name"
                    valueField="state_code"
                    placeholder="select state"
                    value={[field.state.value]}
                    singleSelect
                    onChange={field.handleChange}
                  ></MultiSelectWithViewer>
                )}
              </form.Field>
            </View>
          )}
        </>
      )}
    </>
  );
}
