import { API } from "@/api/api";
import { USER_ROLES, UserRole } from "@/api/types";
import { formatRole } from "@/hooks/useAuthManager";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Text } from "react-native";
import { Button, Checkbox, Dialog, Portal } from "react-native-paper";
import { WithConfirmationHOC } from "../shared/WithConfirmationHOC";
import { sortBy } from "remeda";
export type RolesEditable = {
  role: UserRole;
  enabled: boolean;
}[];
export function UserRolesEditor({
  roles = [],
  uId,
  invaliDator,
  onChange,
}: {
  roles?: string[];
  uId?: string;
  invaliDator?: () => void;
  onChange?: (v: RolesEditable) => void;
}) {
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (arg: []) => API.changeUserRole(uId!, arg),
    onSuccess: () => {
      return invaliDator!();
    },
  });
  const editableRoles = useMemo((): RolesEditable => {
    //@ts-expect-error
    return sortBy(
      roles
        .map((r) => ({
          enabled: true,
          role: r,
        }))
        .concat(
          USER_ROLES.filter((r) => !roles.includes(r)).map((r) => ({
            enabled: false,
            role: r,
          }))
        ),
      (r) => r.role
    )
    .filter((r) => r.role !== "owner");
  }, [roles]);
  const form = useForm({
    defaultValues: {
      roles: editableRoles,
    },
    onSubmit: ({ value }) => {
      mutate(value.roles);
    },
  });

  useEffect(() => {
    form.reset({ roles: editableRoles });
  }, [editableRoles, isError]);
  return (
    <WithConfirmationHOC isPending={isPending}>
      {(reqConfirmation) => (
        <form.Field name="roles" mode="array">
          {(rootField) => (
            <>
              {rootField.state.value.map((r, i) => (
                <form.Field name={`roles[${i}].enabled`}>
                  {(field) => (
                    <>
                      <Checkbox.Item
                        label={formatRole(r.role)}
                        status={field.state.value ? "checked" : "unchecked"}
                        position="leading"
                        labelStyle={{
                          color: "#B5B5BE",
                          textAlign: "left",
                        }}
                        color="#D22A38"
                        uncheckedColor="#D22A38"
                        onPress={() => {
                          const value = !field.state.value;
                          if (!uId) {
                            field.handleChange(value);
                            onChange?.(form.getFieldValue("roles"));
                            return;
                          }
                          const messages: Partial<
                            Record<typeof r.role, string>
                          > = {
                            accountability_manager:
                              "this will remove the user's manager level access from the assigned communities",
                            community_member:
                              "this will mark the user's membership status for all communities as 'banned'",
                            instructor:
                              "this will remove the users instructor level access from the assigned courses",
                            student:
                              "this will mark the user's enrollment status for all courses as 'rejected'",
                          };

                          reqConfirmation(
                            value || !messages?.[r.role]
                              ? "confirm?"
                              : messages[r.role]!,
                            () => {
                              field.handleChange(value);
                              form.handleSubmit();
                            }
                          );
                        }}
                      />
                    </>
                  )}
                </form.Field>
              ))}
            </>
          )}
        </form.Field>
      )}
    </WithConfirmationHOC>
  );
}
