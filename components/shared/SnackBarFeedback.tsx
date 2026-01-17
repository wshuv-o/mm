import { C_MSG_PFX } from "@/constants/const";
import { SnackBarFeedbackCtx } from "@/contexts/ctx";
import { ComponentProps, ReactNode, useEffect, useMemo, useState } from "react";
import { Portal, Snackbar } from "react-native-paper";
import { isString } from "remeda";
type __props = Omit<
  ComponentProps<typeof Snackbar> & {
    txt: string | Record<string, any>;
    onDisMiss?: () => any;
  },
  "visible" | "children" | "onDismiss"
>;
//FIXME - this component needs cleanup.this was previous implementaation. which i hacked to reuse on new global errhandler context
function SnackBarFeedback(props: __props) {
  const [txtToRender, setTxt] = useState(null);
  let visible = useMemo(() => !!txtToRender, [txtToRender]);
  let { txt, onDisMiss, ..._props } = props;
  const maybeObjMsg = txt?.response?.data || txt;
  useEffect(() => {
    if (isString(txt)) {
      setTxt(txt);
    } else if (isString(maybeObjMsg) && maybeObjMsg.startsWith(C_MSG_PFX)) {
      setTxt(maybeObjMsg.replace(C_MSG_PFX, ""));
    } else if (maybeObjMsg?.errors) {
      setTxt(
        maybeObjMsg.errors.reduce((acc, curr) => `${acc} ${curr.message}\n`, "")
      );
    } else if (maybeObjMsg?.message?.startsWith(C_MSG_PFX)) {
      setTxt(maybeObjMsg.message.replace(C_MSG_PFX, ""));
    } else if (__DEV__ && maybeObjMsg?.message) {
      setTxt(maybeObjMsg.message);
    } else {
      setTxt(null);
      txt && console.log("unknown snackbar msg", txt);
    }
  }, [props.txt]);
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setTxt(null);
      onDisMiss?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [visible]);
  return (
    <Snackbar
      {..._props}
      visible={visible}
      onDismiss={() => {
        setTxt(null);
      }}
    >
      {txtToRender}
    </Snackbar>
  );
}

export function SnackBarFeedbackCtxProvider({
  children,
  onMount,
}: {
  onMount?: (trigger: (m: any) => void) => any;
  children: ReactNode;
}) {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    onMount?.(setMsg);
  });
  return (
    <SnackBarFeedbackCtx.Provider value={(m) => setMsg(m)}>
      <Portal>
        <SnackBarFeedback
          txt={msg}
          onDisMiss={() => setMsg(null)}
        ></SnackBarFeedback>
      </Portal>
      {children}
    </SnackBarFeedbackCtx.Provider>
  );
}
