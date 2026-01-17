type PageInfo = {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  firstPage: number;
  firstPageUrl: string | null;
  lastPageUrl: string | null;
  nextPageUrl: string | null;
  previousPageUrl: string | null;
};
export type Attachment = {
  // name: string;
  originalName: string;
  // size: number;
  // extname: string;
  mimeType: string;
  url: string;
};
type WrappedAttachment = { src: Attachment };
type Author = {
  publicId: string;
  userName: string;
  avatar: Attachment;
  email?: string;
  fullName: string;
};
export type UserShort = Author;
type BoolAsNumber = 0 | 1;
export type CommunityPosts = {
  publicId: string;
  content: {
    text: string;
    data?: {
      name: string;
      trigger: "#" | "@";
    };
  }[];
  attachments: WrappedAttachment[];
  createdAt: string;
  updatedAt: string;
  author: Author;
  isPinned: BoolAsNumber;
  meta: {
    count_loved: number;
    count_shared: number;
    count_bookmarked: number;
    count_comments: number;
    loved_by_me: BoolAsNumber;
    shared_by_me: BoolAsNumber;
    bookmarked_by_me: BoolAsNumber;
  };
}[];

export type PostComents = {
  publicId: string;
  content: Array<{
    data: {
      id: string;
      name: string;
      trigger: string;
    };
    text: string;
  }>;
  attachments: WrappedAttachment[];
  createdAt: string;
  updatedAt: string;
  author: Author;
  meta: {
    liked_by_me: BoolAsNumber;
    likes_count: number;
  };
}[];

export const USER_ROLES = [
  "admin",
  "student",
  "instructor",
  "owner",
  "community_member",
  "accountability_manager",
] as const;
export type UserRole = typeof USER_ROLES[number];
export type CurrentUser = {
  publicId: string;
  fullName: string;
  coverImage: Attachment;
  avatar: Attachment;
  userName: string;
  email: string;
  phoneNumber: null | string;
  website: null | string;
  skills: null | string;
  bio: null | string;
  createdAt: string;
  updatedAt: string;
  emailVerifiedAt: null | string;
  rolesPlain: UserRole[];
  preference: {
    profileVisibility: "public" | "private";
    showOnlineStatus: BoolAsNumber;
    appNotifEngagedPostComment: BoolAsNumber;
    mailNotifEngagedPostComment: BoolAsNumber;
    appNotifEngagedPostReact: BoolAsNumber;
    mailNotifEngagedPostReact: BoolAsNumber;
    appNotifMyCommentReact: BoolAsNumber;
    mailNotifMyCommentReact: BoolAsNumber;
    appNotifMyCommentReply: BoolAsNumber;
    mailNotifMyCommentReply: BoolAsNumber;
    appNotifProfilePost: BoolAsNumber;
    mailNotifProfilePost: BoolAsNumber;
    appNotifPostMention: BoolAsNumber;
    mailNotifPostMention: BoolAsNumber;
    appNotifCommentMention: BoolAsNumber;
    mailNotifCommentMention: BoolAsNumber;
    appNotifSecurityAlert: BoolAsNumber;
    mailNotifSecurityAlert: BoolAsNumber;
    appNotifNewPost: BoolAsNumber;
    mailNotifNewPost: BoolAsNumber;
  };
};
export type PmtAccessStatus = `pmt_${Payment["status"]}`;
export type AccessHint<T> = Record<
  string,
  {
    status: T | true | "expired_access" | "no_access" | PmtAccessStatus;
    pkg?: string;
  }
>;
export type whoAmIResponse = {
  me: CurrentUser;
  access: {
    course: AccessHint<"pending" | "rejected">;
    community: AccessHint<"under_review" | "banned" | "e_sign_required">;
    ai: {};
  };
};
type ZoomMeetingDetail = {
  id: number;
  type: 2;
  uuid: string;
  topic: string;
  status: string;
  host_id: string;
  duration: number;
  join_url: string;
  password: string;
  settings: {
    audio: string;
    use_pmi: boolean;
    jbh_time: number;
    resources: [];
    watermark: boolean;
    cn_meeting: boolean;
    focus_mode: boolean;
    host_video: boolean;
    in_meeting: boolean;
    waiting_room: boolean;
    approval_type: number;
    breakout_room: {
      enable: boolean;
    };
    enforce_login: boolean;
    auto_recording: string;
    device_testing: boolean;
    show_join_info: boolean;
    encryption_type: string;
    mute_upon_entry: boolean;
    private_meeting: boolean;
    internal_meeting: boolean;
    join_before_host: boolean;
    meeting_invitees: [];
    alternative_hosts: string;
    participant_video: boolean;
    show_share_button: boolean;
    close_registration: boolean;
    email_notification: boolean;
    enforce_login_domains: string;
    host_save_video_order: boolean;
    allow_multiple_devices: boolean;
    meeting_authentication: boolean;
    continuous_meeting_chat: {
      enable: boolean;
      channel_id: string;
      auto_add_meeting_participants: boolean;
      auto_add_invited_external_users: boolean;
    };
    push_change_to_calendar: boolean;
    email_in_attendee_report: boolean;
    participant_focused_meeting: boolean;
    sign_language_interpretation: {
      enable: boolean;
    };
    alternative_host_update_polls: boolean;
    registrants_confirmation_email: boolean;
    registrants_email_notification: boolean;
    alternative_hosts_email_notification: boolean;
    approved_or_denied_countries_or_regions: {
      enable: boolean;
    };
    allow_host_control_participant_mute_state: boolean;
    request_permission_to_unmute_participants: boolean;
  };
};
export type ClassItem = {
  publicId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  instructor: Author;
  embedUrl: string | null;
  embedDuration: number | null;
  order: number;
  zoomSession?: {
    isLive: BoolAsNumber;
    scheduledAt: string;
    endedAt: string | null;
    details?: ZoomMeetingDetail;
    duration: number;
  };
  attachments?: Array<{
    src: Omit<Attachment, "url"> & { url?: string };
    hostId: null | string;
    publicId: string;
    isPrimary: BoolAsNumber;
  }>;
  packages: Array<{
    publicId: string;
    collexoFeeId: number;
    price: string;
    label: string;
    deletedAt: null;
    repurchasable: 0;
    isFree: boolean;
  }>;
  chapter: {
    publicId: string;
    course: {
      publicId: string;
    };
  };
};

type __SingleCourse<T = unknown> = {
  title: string;
  publicId: string;
  coverImage: Attachment;
  description: string;
  createdAt: string;
  updatedAt: string;
  salesPage: string;
  autoApproveEnrollments: BoolAsNumber;
  status: "draft" | "published" | "archived" | "coming_soon";
  chapters: {
    publicId: string;
    title: string;
    order: number;
    createdAt: string;
    updatedAt: string;
    lessons: Array<ClassItem & T>;
  }[];
};
export type TagEntity = { tag: string };
export type SingleCourse = __SingleCourse & { author: Author } & {
  instructors: Array<Author>;
  tags: Array<TagEntity>;
};
type EnrollmentStatus = "pending" | "approved" | "rejected";
type SingleCourseWithoutChapters = Omit<SingleCourse, "chapters">;
export type CourseList = Array<
  SingleCourseWithoutChapters & {
    tags: TagEntity[];
  }
>;

export type LobbyMessage = {
  publicId: string;
  content: Array<{
    text: string;
    data?: {
      id: string;
      name: string;
      trigger: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
  attachments: Array<Attachment>;
  user: Author;
};

export type InboxData = {
  inboxes: Array<{
    recipient: UserShort;
    meta: {
      unread_count: number;
      last_msg_ts: string | null;
    };
    canMessage?: boolean;
  }>;
  allowedPeers: UserShort[];
  activityStatus: {
    peer_last_seen_at: string;
    peer_public_id: string;
  }[];
};

export type InboxMsg = {
  publicId: string;
  content: { text: string }[];
  createdAt: string;
  updatedAt: string;
  readAt: null | string;
  attachments: WrappedAttachment[];
  author: Author;
  meta: {};
};
export type Community = {
  publicId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  salesPage: string;
  autoApproveMembers: BoolAsNumber;
  coverImage: Attachment;
  meta: {};
};

export type CommunityWithMembership = Community & { memberships: Membership[] };

export type CommunityDetailed = Community & {
  accountabilityMgrs: UserShort[];
};
type MembershipStatus = "pending" | "approved" | "banned";
export type singleUserDetailed = Omit<CurrentUser, "preferences"> & {
  enrollments: Array<
    Omit<CourseList[number]["enrollments"][number], "payments"> & {
      course: Omit<SingleCourse, "chapters">;
    }
  >;
  managedCommunities: Array<Community>;
  memberships: Array<{
    status: MembershipStatus;
    publicId: string;
    createdAt: string;
    updatedAt: string;
    community: Community;
    hasSignedAgreement: BoolAsNumber;
  }>;
};
export const PAYMENT_PROVIDERS = ["collexo"] as const;
export type PmtProviderType = typeof PAYMENT_PROVIDERS[number];
type paymentProvider = {
  type: PmtProviderType;
  config: Record<string, any>;
};
export type OrgDetail = {
  publicId: string;
  name: string;
  logo: Attachment;
  domain: string;
  createdAt: string;
  updatedAt: string;
  paymentProviders: Array<paymentProvider>;
  zoomConf: {
    apiKey: string;
    apiSecret: string;
    accountId: string;
  } | null;
  bunnyConf: {
    libraryId: string;
    apiKey: string;
    tokenAuthKey: string;
  } | null;
  zoomWebhookUrl: string;
  taxRules: Array<{
    publicId: string;
    label: string;
    rate: number;
    country: string;
    state: string | null;
  }>;
};
type Membership = singleUserDetailed["memberships"][number];
export type Payment = {
  publicId: string;
  amount: string;
  status:
    | "pending"
    | "successful"
    | "under_review"
    | "failed"
    | "rejected"
    | "processing";
  createdAt: string;
  updatedAt: string;
  expiredAt: string | null;
  deletedAt: string | null;
  package?: {
    label: string;
  };
};
export type CourseStatItem = __SingleCourse<{ attended: BoolAsNumber }> &
  Pick<singleUserDetailed, "enrollments">;

export type Notification = {
  data: Record<string, any>;
  readAt: null | string;
  createdAt: string;
  updatedAt: string;
  type:
    | "CommentMention"
    | "test"
    | "EngagedPostComment"
    | "EngagedPostReact"
    | "MyCommentReact"
    | "MyCommentReply"
    | "PostMention"
    | "NewPost";
  publicId: string;
};
export type NotificationsWithMeta = {
  notifications: Array<{
    entities: Record<string, any>;
    notification: Notification;
    compiled: {
      id: string;
      userName: string;
      fullName: string;
      description: string;
      timestamp: string;
      hasRead: boolean;
      status: string;
      data: Notification;
      url?: string;
    };
  }>;
  unreadCount: number;
  unreadDmCount: number;
};
type PkgItmMeta = {
  meta: {
    pivot_billing_interval: number;
  };
};
export type Package = {
  publicId: string;
  collexoFeeId: string | null;
  price: string;
  label: string;
  deletedAt: string | null;
  aiToolsCourses: Array<SingleCourseWithoutChapters & PkgItmMeta>;
  communities: Array<Community & PkgItmMeta>;
  courses: Array<SingleCourseWithoutChapters & PkgItmMeta>;
  pmtProvider: paymentProvider;
};

export type PaymentDetails = {
  status:
    | "pkg_not_repurchasable"
    | PmtAccessStatus
    | "pmt_checkout_redirect"
    | "trial_started"
    | "pkg_not_repurchasable"
    | "no_billing_info"
    | "can_proceed";
  billingInfo?: any;
  url?: string;
};
type States = {
  name: string;
  state_code: string;
}[];
export type CountryData = {
  countries: { name: string; iso2: string; states?: States, phonecode: string }[];
  statesOfCurrent?: States;
};

export type IpInfo = {
  ipVersion: number;
  ipAddress: string;
  latitude: number;
  longitude: number;
  countryName: string;
  countryCode: string;
  capital: string;
  phoneCodes: number[];
  timeZones: string[];
  cityName: string;
  regionName: string;
  continent: string;
  continentCode: string;
  currencies: string[];
  languages: string[];
  asn: string;
  asnOrganization: string;
};

// types/WizardData.ts

export type AiConfig = {
  contentGenerators: {
    chapter: {
      publicId: string;
      title: string;
      order: number;
    };
    contentGeneratorId: number;
    wizardCode: string;
    coursePublicId: string;
    courseName: string;
    chapterNumber: number;
    moduleName: string;
    promptTemplate: string;
    contextKey: string;
    buttonName: string;
    buttonIconUrl: string;
    createdAt: string; // ISO Date string
    updatedAt: string; // ISO Date string
  }[];
  wizards: {
    wizardId: number;
    wizardCode: string;
    coursePublicId: string;
    courseName: string;
    createdAt: string;
    steps: {
      stepId: number;
      wizardId: number;
      stepNumber: number;
      stepTitle: string;
      promptTemplate: string;
      inputs: any | null;
      saveToContext: number;
      contextKey: string | null;
      marksCompletion: number;
      unlocksModules: any | null;
      createdAt: string;
      updatedAt: string;
    }[];
  }[];
};
