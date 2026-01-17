import { CommunityWithMembership } from "@/api/types";
import { Href } from "expo-router";
import { createContext } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
type ctxExtra = { tags?: string[]; postSearch?: string };
export const communityCtx = createContext<
  | (CommunityWithMembership & {
      invaliDateRelatedQuery: () => Promise<void>;
      ctxExtra: ctxExtra;
      //FIXME - wrong types
      setCtxExtra: React.SetStateAction<ctxExtra>;
      setCurrentCom: React.SetStateAction<string>;
    })
  | null
>(null);

export const rteCtx = createContext<{
  activeRte: any;
  renderdRtes: Map<
    any,
    { fns: Record<"focus" | "reset" | "setTxt", (_?: any) => void> }
  >;
  setActiveRte: (_: any) => void;
  scrollisteners: Map<
    any,
    (ev: NativeSyntheticEvent<NativeScrollEvent>) => void
  >;
  svRef: any;
}>({});
export const SnackBarFeedbackCtx = createContext<(msg: any) => any>(() => null);
export const CommentEditorCtx = createContext<{
  setParentIdSetter: (_: (id: string) => void) => void;
}>({});

export const IntendedPageCtx = createContext<{  
  redirectUrl: (_default?: Href, deleteOnRead?: boolean) => Href | undefined;
  geIntendData: (deleteOnRead?: boolean) => Record<string, any>;
  modifyData: (
    fn: (url: React.MutableRefObject<any>, data: React.MutableRefObject<any>) => void
  ) => void;
}>({});
