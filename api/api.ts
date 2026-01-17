import axios, { AxiosInstance, AxiosResponse } from "axios";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { Part } from "@/packages/rte/src";
import { imgAsset } from "@/hooks/useMedia";
import {
  CommunityPosts,
  SingleCourse,
  PostComents,
  whoAmIResponse,
  CourseList,
  LobbyMessage,
  InboxData,
  CommunityDetailed,
  InboxMsg,
  singleUserDetailed,
  ClassItem,
  OrgDetail,
  Payment,
  CourseStatItem,
  NotificationsWithMeta,
  TagEntity,
  UserShort,
  Package,
  PaymentDetails,
  CountryData,
  CommunityWithMembership,
  AiConfig,
} from "./types";
class _API_ {
  #token?: string;
  #apiOrigin: string = process.env.EXPO_PUBLIC_API_URL!;
  #client!: AxiosInstance;
  //hard coding for now.
  AI_BASE_URL!: string;
  authHeaders!: (tokenOverride?: string) => any;
  constructor() {
    /**
     * Binds all instance methods to retain `this` context,
     * preventing issues when used as callbacks.
     */
    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
      if (typeof this[key] === "function" && !["constructor"].includes(key)) {
        this[key] = this[key].bind(this);
      }
    }
    this.authHeaders = (token) =>
      this.#token
        ? { Authorization: `Bearer ${token || this.#token}` }
        : undefined;
    const interceptor = (config, token?: string) => {
      if (["get"].includes(config.method!))
        config.headers["Content-Type"] = "application/json";
      config.headers = { ...config.headers, ...this.authHeaders(token) };
      return config;
    };
    const baseURL = `${this.#apiOrigin}/api`;
    this.AI_BASE_URL = baseURL;
    this.#client = axios.create({
      baseURL,
    });
    this.#client.interceptors.request.use(interceptor);
  }
  setToken(token?: string) {
    this.#token = token;
  }
  //NOTE - a middleman for post processing
  async #extractor<T>(res: Promise<AxiosResponse<T>>) {
    return (await res).data;
  }

  url(path: string) {
    //FIXME - fix it
    if (!path) {
      // console.log(
      //   "path is not defined",
      //   path,
      //   arguments
      //   // new Error().stack.split("\n").slice(1).join("\n")
      // );
      return path;
    }

    path = path.replace(/^\//, "");
    return `${this.#apiOrigin}/${path}`;
  }
  whoAmI() {
    return this.#extractor(this.#client.get<whoAmIResponse>("/who_am_i"));
  }
  updatePreferences(preferences: any) {
    return this.#extractor(this.#client.patch("/update_user", { preferences }));
  }
  updateProfileField(fieldKey, newValue) {
    const requestBody = {
      info: {
        [fieldKey]: newValue,
      },
    };
    return this.#extractor(this.#client.patch("/update_user", requestBody));
  }
  async loginUser({ email, password }) {
    return this.#extractor(this.#client.post("/login", { email, password }));
  }

  async requestPwdReset(payload) {
    return this.#extractor(this.#client.post("/request_pwd_reset", payload));
  }
  async pwdReset(ep, payload) {
    return this.#extractor(this.#client.post(ep, payload));
  }
  async attendClass(classId: string) {
    return this.#extractor(this.#client.patch("classes/attend/" + classId));
  }

  async getAllLobbyPeople(communityId: string) {
    return this.#extractor(
      this.#client.get<UserShort[]>(`/lobby_peoples/${communityId}`)
    );
  }
  async getAllCommenters(communityId: string) {
    return this.#extractor(
      this.#client.get<UserShort[]>(`/post_commenters/${communityId}`)
    );
  }

  async getAllHashtags(communityId: string) {
    return this.#extractor(
      this.#client.get<TagEntity[]>(`community_posts_tags/${communityId}`)
    );
  }
  async registerUser(payload, endpoint) {
    return this.#extractor(this.#client.post(endpoint, payload));
  }
  getCommunities() {
    return this.#extractor(
      this.#client.get<{
        communities: Array<CommunityWithMembership>;
      }>(`/communities`)
    );
  }
  changeUserRole(id: string, roles: string[]) {
    return this.#client.patch(`change_user_roles/${id}`, { roles });
  }

  updateMembership(id: string, payload: any) {
    return this.#extractor(
      this.#client.patch(`/community_memberships/${id}`, payload)
    );
  }

  updateEnrollment(id: number, payload: any) {
    return this.#extractor(this.#client.patch(`/enrollments/${id}`, payload));
  }
  createOrUpdateCourse(payload: any, id?: string) {
    if (Platform.OS != "web") {
      throw new Error("no file api on this platform");
    }
    payload.coverImage = payload?.coverImage?.file;
    return this.#extractor(
      this.#client.request(
        {
          method: id ? "PATCH" : "POST",
          url: `/courses${id ? `/${id}` : ""}`,
          data: payload,
          headers: { "Content-Type": "multipart/form-data" },
        },
        payload
      )
    );
  }
  addChapter(payload: any, courseId: string) {
    return this.#extractor(
      this.#client.post(`/course/${courseId}/chapters`, payload)
    );
  }
  updateChapter(payload: any, courseId: string, chapterId: string) {
    return this.#extractor(
      this.#client.patch(`/course/${courseId}/chapters/${chapterId}`, payload)
    );
  }
  addClass(payload: any, chapterId: string) {
    if (Platform.OS != "web") {
      throw new Error("no file api on this platform");
    }
    payload.attachments = payload.attachments.map((file) => file.file);
    return this.#extractor(
      this.#client.postForm(`chapter/${chapterId}/classes`, payload)
    );
  }
  updateClass(payload: any, classId: string) {
    if (Platform.OS != "web") {
      throw new Error("no file api on this platform");
    }
    payload.attachments = payload.attachments.map((file) => file.file);
    return this.#extractor(
      this.#client.patchForm(`/classes/${classId}`, payload)
    );
  }
  rmClass(classId: string) {
    return this.#extractor(this.#client.delete(`/classes/${classId}`));
  }
  getClasses() {
    return this.#extractor(this.#client.get<ClassItem[]>(`/classes`));
  }

  getPosts(communityId: string, tags?: string[]) {
    tags = tags?.reduce((a, b) => `${a}tags[]=${b}`, "");
    tags = tags ? `?${tags}` : "";
    return this.#extractor(
      this.#client.get<CommunityPosts>(`/community_posts/${communityId}${tags}`)
    );
  }

  deletePost(postId: string) {
    return this.#client.delete(`community_posts/${postId}`);
  }

  deletePostComment(commentId: string) {
    return this.#client.delete(`post_comments/${commentId}`);
  }

  getPostComments(postId: string) {
    return this.#extractor(
      this.#client.get<PostComents>(`/post_comments_list/${postId}`)
    );
  }

  createOrUpdateCommunity(payload: any, id?: string) {
    if (Platform.OS != "web") {
      throw new Error("no file api on this platform");
    }
    payload.coverImage = payload?.coverImage?.file;
    return this.#extractor(
      this.#client.request(
        {
          method: id ? "PATCH" : "POST",
          url: `/communities${id ? `/${id}` : ""}`,
          data: payload,
          headers: { "Content-Type": "multipart/form-data" },
        },
        payload
      )
    );
  }
  getCommunityDetail(id: string) {
    return this.#extractor(
      this.#client.get<CommunityDetailed>(`/communities/${id}`)
    );
  }

  getCourses() {
    return this.#extractor(
      this.#client.get<{ courses: CourseList }>("/courses")
    );
  }
  getNotifications() {
    return this.#extractor(
      this.#client.get<NotificationsWithMeta>("/notifications")
    );
  }

  markNotificationsAsRead(id: string = "") {
    return this.#extractor(
      this.#client.patch(`/notifications/mark_read/${id}`)
    );
  }
  getCourseStats() {
    return this.#extractor(this.#client.get<CourseStatItem[]>("/course_stats"));
  }
  getSingleCourse(singleId: string) {
    return this.#extractor<SingleCourse>(
      this.#client.get(`/courses/${singleId}`)
    );
  }

  updateProfileImages(file, type) {
    return this.#extractor(
      this.#client.patchForm("/update_user", { [`info[${type}]`]: file.file })
    );
  }

  async downloader(urlPath: string, fileName: string) {
    try {
      const url = urlPath.match(/^https?:/)
        ? urlPath
        : this.#client.defaults.baseURL + urlPath;
      if (Platform.OS === "web") {
        const resp = await this.#client.get(url, {
          responseType: "blob",
        });
        //using require instead of import at the top.this will inline the  code in place and will not create issues on native
        require("file-saver").saveAs(resp.data, fileName);
      } else {
        await FileSystem.downloadAsync(
          url,
          FileSystem.documentDirectory + fileName,
          { headers: { Authorization: `Bearer ${this.#token}` } }
        );
      }
    } catch (error) {
      //FIXME - handle errors
    }
  }
  async listPayments() {
    return this.#extractor(this.#client.get<Payment[]>(`/payments`));
  }
  async createPost(payload: {
    communityId: string;
    attachments: imgAsset[];
    content: Part[];
  }) {
    if (Platform.OS != "web") {
      throw new Error("no file api on this platform");
    }
    payload.attachments = payload.attachments.map((file) => file.file);
    return this.#extractor(this.#client.postForm(`/community_posts`, payload));
  }
  async createComment(payload: {
    postId: string;
    attachments: imgAsset[];
    content: Part[];
    parentId?: string;
  }) {
    if (Platform.OS != "web") {
      throw new Error("no file api on this platform");
    }
    payload.attachments = payload.attachments.map((file) => file.file);
    return this.#extractor(this.#client.postForm(`/post_comments`, payload));
  }
  async updateComment(commentId: string, payload: { liked: boolean }) {
    return this.#extractor(
      this.#client.patch(`/post_comments/${commentId}`, payload)
    );
  }
  async updateInteraction(
    postId: string,
    payload: {
      loved?: boolean;
      shared?: boolean;
      bookmarked?: boolean;
      isPinned?: boolean;
    }
  ) {
    return this.#extractor(
      this.#client.patch(`/community_posts/${postId}`, {
        interactions: payload,
      })
    );
  }
  async getLobbyMessages(communityId) {
    return this.#extractor(
      this.#client.get<LobbyMessage[]>(`/lobby/${communityId}`)
    );
  }
  async postLobbyMessage(payload) {
    if (Platform.OS != "web") {
      throw new Error("no file api on this platform");
    }
    payload.attachments = payload.attachments.map((file) => file.file);
    return this.#extractor(this.#client.postForm(`/lobby`, payload));
  }
  async getInboxes() {
    return this.#extractor(this.#client.get<InboxData>(`/inboxes`));
  }
  async getInboxMsgs(peerId: string) {
    return this.#extractor(this.#client.get<InboxMsg[]>(`/inboxes/${peerId}`));
  }
  async sendInboxOpenedEvent(peerId: string) {
    return this.#client.patch(`/inbox_opened/${peerId}`);
  }
  async postInboxMessage(payload) {
    if (Platform.OS != "web") {
      throw new Error("no file api on this platform");
    }
    payload.attachments = payload.attachments.map((file) => file.file);
    return this.#extractor(this.#client.postForm(`/inboxes`, payload));
  }
  getUsers() {
    return this.#extractor(this.#client.get<singleUserDetailed[]>(`/users`));
  }
  getOrgDetails() {
    return this.#extractor(this.#client.get<OrgDetail>(`/org`));
  }

  updateOrgDetails(payload) {
    return this.#extractor(this.#client.post(`/org`, payload));
  }

  saveFcmToken(token: string) {
    return this.#client.patch(`/save_fcm_token`, { token });
  }
  deleteCurrentSession() {
    return this.#client.delete(`/logout`);
  }
  getPkgs() {
    return this.#extractor(this.#client.get<Package[]>(`/packages`));
  }
  createPkg(payload: any) {
    return this.#client.post(`/packages`, payload);
  }
  deletePkg(id: string) {
    return this.#client.delete(`/packages/${id}`);
  }
  updatePkg(pkgId: string, payload: any) {
    return this.#client.patch(`/packages/${pkgId}`, payload);
  }
  tryPayment(payload: any) {
    return this.#extractor(
      this.#client.post<PaymentDetails>(`/payments/init`, payload)
    );
  }
  getCountryData(country = "", queryString = "") {
    return this.#extractor(
      this.#client.get<CountryData>(`/countries/${country}${queryString}`)
    );
  }
  saveBillingInfo(payload: any) {
    return this.#client.post<PaymentDetails>(
      `payments/save_billing_info`,
      payload
    );
  }
  getAiConfig(courseId: string) {
    return this.#extractor(
      this.#client.get<AiConfig>(
        `content-generators/${courseId}/generators-wizards`
      )
    );
  }
}

export const API = new _API_();
