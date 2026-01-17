import React, { useState, useEffect, useRef } from "react";
import { SearchableDropdown } from "./SearchableDropdown";
import { getStatesByCountry } from "../data/countries";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API } from "@/api/api";
import { pick } from "../../../../node_modules/remeda";
import { UTIL } from "../../../../lib/utils";
import Spinner from "./Spinner";
import { useParams } from "react-router-dom";
interface FormData {
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  state: string;
  country: string;
}

export const SignupForm: React.FC = () => {
  const { pkgId } = useParams();
  const [telErr, settelErr] = useState(false);
  const pmtMtn = useMutation({
    mutationFn: (args: any) => API.tryPayment({ ...args, pkgId }),
    onSuccess: (data) => {
      if (data.status === "pmt_checkout_redirect") {
        window.location.replace(data.url);
      } else {
        window.location.replace(
          `/payment/${pkgId}?response=${UTIL.encodeB64urlSafe(data)}`
        );
      }
    },
    onError(error) {
      const msg = (error as any).response?.data?.message || "";
      //fallback handler  for res condition
      if (msg.match(/insert.*?enrollments.*?Duplicate/)) {
        window.location.reload();
      }
      settelErr(Boolean(msg.includes("mobile number is required")));
    },
  });
  const signupMtn = useMutation({
    mutationFn: (payload: any) =>
      telErr ? API.updateUser(payload) : API.registerUser(payload),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Form submitted successfully! Proceeding to payment...",
      });
      if (!telErr)
        localStorage.setItem(
          import.meta.env.EXPO_PUBLIC_AUTH_STORAGE_KEY,
          data.value
        );
      window.location.reload();
    },
    onError(error) {
      toast({
        title: "Error",
        description: (error as any).response.data.errors.reduce(
          (acc, curr) => `${acc} ${curr.message}\n`,
          ""
        ),
        variant: "destructive",
      });
    },
  });
  const init = useRef(false);
  if (signupMtn.isIdle && !init.current && API.isLoggedIn()) {
    pmtMtn.mutate({ proceed: true });
    init.current = true;
  }
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    countryCode: "",
    phoneNumber: "",
    email: "",
    state: "",
    country: "",
  });

  const [availableStates, setAvailableStates] = useState<any[]>([]);
  const cqk = ["billingInfo", "countries"];
  const { data: countryData } = useQuery({
    queryKey: [...cqk],
    queryFn: async () => API.getCountryData("", "?everything=1"),
  });
  const { data: ipInfo } = useQuery({
    queryKey: ["ipInfo"],
    queryFn: API.getIpInfo,
  });
  useEffect(() => {
    if (ipInfo && countryData && !formData.country) {
      handleInputChange("country", ipInfo.countryCode);
    }
  }, [ipInfo, countryData]);
  const findCountry = (iso2: string) =>
    countryData.countries.find((c) => c.iso2 == iso2)!;
  useEffect(() => {
    if (formData.country) {
      const country = findCountry(formData.country);
      const newStates = country?.states ?? [];
      setAvailableStates(newStates);
      // Reset state if current state is not available for the new country
      if (
        formData.state &&
        !newStates.find((state: any) => state.iso2 === formData.state)
      ) {
        setFormData((prev) => ({ ...prev, state: "" }));
      }
    } else {
      setAvailableStates([]);
      setFormData((prev) => ({ ...prev, state: "" }));
    }
  }, [formData.country, formData.state]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    let extras = {};
    if (field === "country") {
      extras = {
        countryCode: findCountry(value).phonecode,
      };
    }
    if (field === "state") {
    }
    setFormData((prev) => {
      const newState = { ...prev, [field]: value, ...extras };
      return newState;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signupMtn.mutate({
      ...formData,
      phoneNumber: `+${formData.countryCode}${formData.phoneNumber}`,
      billingInfo: pick(formData, ["country", "state"]),
    });
  };
  const PhoneField = (
    <div>
      <label
        htmlFor="phoneNumber"
        className="block text-sm font-medium text-white mb-2 font-roboto"
      >
        Phone
      </label>
      <div className="flex gap-2">
        <SearchableDropdown
          options={countryData?.countries ?? []}
          titleFieldFn={(o, v) => `+${o.phonecode}` + (v ? "" : ` ${o.name}}`)}
          valueField="phonecode"
          value={formData.countryCode}
          onChange={(value) => handleInputChange("countryCode", value)}
          placeholder="Code"
          className="min-w-[90px]"
        />

        <input
          type="tel"
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
          placeholder="Enter your phone number"
          className="w-full px-3 py-2 bg-[#252525] border border-[#252525] rounded-md text-white placeholder-[#92929D] focus:outline-none focus:border-[#D22A38] focus:ring-1 focus:ring-[#D22A38] transition-colors duration-200 font-roboto"
        />
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {API.isLoggedIn() && !telErr ? (
        <Spinner />
      ) : (
        <div className="w-full max-w-md bg-[#1A1A1A] rounded-lg p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white font-roboto mb-2">
              Join CEO Society
            </h1>
            <p className="text-[#92929D] font-roboto">
              Enter your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {telErr ? (
              PhoneField
            ) : (
              <>
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-white mb-2 font-roboto"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 bg-[#252525] border border-[#252525] rounded-md text-white placeholder-[#92929D] focus:outline-none focus:border-[#D22A38] focus:ring-1 focus:ring-[#D22A38] transition-colors duration-200 font-roboto"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white mb-2 font-roboto"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 bg-[#252525] border border-[#252525] rounded-md text-white placeholder-[#92929D] focus:outline-none focus:border-[#D22A38] focus:ring-1 focus:ring-[#D22A38] transition-colors duration-200 font-roboto"
                  />
                </div>

                {PhoneField}

                {countryData && (
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-white mb-2 font-roboto"
                    >
                      Country
                    </label>
                    <SearchableDropdown
                      options={countryData.countries}
                      titleFieldFn={(o) => o.name}
                      valueField="iso2"
                      value={formData.country}
                      onChange={(value) => {
                        handleInputChange("country", value);
                      }}
                      placeholder="Select your country"
                    />
                  </div>
                )}
                {availableStates.length > 0 && (
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-white mb-2 font-roboto"
                    >
                      State
                    </label>
                    <SearchableDropdown
                      options={availableStates}
                      value={formData.state}
                      titleFieldFn={(o) => o.name}
                      valueField="iso2"
                      onChange={(value) => {
                        handleInputChange("state", value);
                      }}
                      placeholder="Select your state"
                      disabled={!formData.country}
                    />
                  </div>
                )}
              </>
            )}
            <button
              type="submit"
              className="w-full bg-[#D22A38] hover:bg-[#B8242F] text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200 font-roboto focus:outline-none focus:ring-2 focus:ring-[#D22A38] focus:ring-offset-2 focus:ring-offset-[#1A1A1A]"
            >
              Continue to Payment
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
