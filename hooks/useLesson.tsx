import { ClassItem } from "@/api/types";
import { useMemo } from "react";

export function useLesson(lesson?: ClassItem | null) {
  const data = useMemo(() => {
    const adaptedAttachment = lesson?.attachments
      ?.filter((a) => !a.isPrimary)
      ?.map((a) => ({
        name: a.src.originalName,
        id: a.publicId,
      }));

    return {
      adaptedAttachment,
      primaryVid:
        lesson?.embedUrl ||
        lesson?.attachments?.find((a) => a.isPrimary)?.src?.url,
      lessonDuration:
        lesson?.zoomSession?.duration ||
        (lesson?.embedUrl && lesson?.embedDuration) ||
        0,
      filteredAttachments: lesson?.attachments?.filter((a) => !a.isPrimary),
    };
  }, [lesson]);

  return data;
}
