import { useEffect, useState } from "react";
import { Text, Button, Dialog, Portal } from "react-native-paper";
import { isDefined } from "remeda";
import { moderateScale } from "react-native-size-matters";

export function WithConfirmationHOC({
  children,
  isPending,
}: {
  children: (
    reqConfirmation: (
      msg: string,
      onOk: () => void,
      onCancel?: () => void
    ) => void
  ) => React.ReactNode;
  isPending?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [[onOk, onCancel], setActions] = useState(
    [] as unknown as [() => void, () => void]
  );
  useEffect(() => {
    !isPending && setShow(false);
  }, [isPending]);

  useEffect(() => {
    !show && setActions([]);
  }, [show]);
  return (
    <>
      <Portal>
        <Dialog
          visible={show}
          onDismiss={() => {
            setShow(false);
          }}
          style={{ backgroundColor: "#1A1A1A", borderRadius: 12 }}
        >
          <Dialog.Title style={{ color: "#fff", fontSize: moderateScale(18) }}>
            Alert
          </Dialog.Title>
          <Dialog.Content>
            <Text
              variant="bodyMedium"
              style={{ color: "#B5B5BE", fontSize: moderateScale(15) }}
            >
              {message}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              loading={isPending}
              onPress={() => {
                onOk?.();
                setShow(isDefined(isPending));
              }}
              textColor="#fff"
              style={{ marginRight: 10, borderRadius: 12 }}
            >
              proceed
            </Button>
            <Button
              onPress={() => {
                setShow(false);
              }}
              textColor="#fff"
              style={{ marginRight: 10, borderRadius: 12 }}
            >
              cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {children((msg, ...actions) => {
        setMessage(msg);
        setActions(actions);
        setShow(true);
      })}
    </>
  );
}
