import { useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
export type imgAsset = ImagePicker.ImagePickerAsset;
type fileAsset = DocumentPicker.DocumentPickerAsset;
export function useMediaLib<T extends boolean>(
  isImgOrVid: T,
  libProps?: T extends true
    ? ImagePicker.ImagePickerOptions
    : DocumentPicker.DocumentPickerOptions,
  afterPick?: () => void
) {
  type files = T extends true ? imgAsset : fileAsset;
  const [selectedMedia, setSelectedMedia] = useState<files[]>([]);

  async function pickMedia(dontStore?: boolean): Promise<files[]> {
    // No permissions request is necessary for launching the image library
    
    let response = isImgOrVid
      ? await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 1,
          ...libProps,
        })
      : //@ts-expect-error
        await DocumentPicker.getDocumentAsync(libProps);

    if (response.canceled) return [];
    //@ts-expect-error
    dontStore!==false && setSelectedMedia((m) => [...m, ...response.assets]);
    afterPick?.();
    //@ts-expect-error
    return response.assets;
  }

  const meta = useMemo(() => {
    return {
      hasMedia: !!selectedMedia.length,
      mediaCount: selectedMedia.length,
    };
  }, [selectedMedia]);
  const result = {
    pickMedia,
    clearMedia: (idx?: number) =>
      setSelectedMedia((m) =>
        idx !== undefined ? m.filter((_, i) => i !== idx) : []
      ),
    selectedMedia,
    ...meta,
  };
  return result;
}
