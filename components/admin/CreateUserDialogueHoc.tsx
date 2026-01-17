import { useWindowQuery } from "@/hooks/useWindowQuery";
import { UTIL } from "@/lib/utils";
import { ReactNode, useState } from "react";
import { ScrollView, View } from "react-native";
import { Modal, Portal } from "react-native-paper";
import { SignupComponent } from "../auth/SignupComponent";

export function CreateUserDialogueHoc({
  children,
  onSuccess,
}: {
  children: (open: () => void) => ReactNode;
  onSuccess: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const { width, height } = useWindowQuery();
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
            <SignupComponent
              showRoleField
              endpoint="/create_user"
              onSuccess={() => {
                setVisible(false);
                onSuccess();
              }}
            ></SignupComponent>
          </ScrollView>
        </Modal>
      </Portal>
      {children(() => setVisible(true))}
    </>
  );
}
