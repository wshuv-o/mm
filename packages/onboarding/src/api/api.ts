import axios, { AxiosInstance, AxiosResponse } from "axios";
import { CountryData, IpInfo, PaymentDetails } from "../../../../api/types";
class _API_ {
  #apiOrigin!: string;
  #client!: AxiosInstance;
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
    this.#apiOrigin = import.meta.env.EXPO_PUBLIC_API_URL;
    const interceptor = (
      config,
      token = localStorage.getItem(import.meta.env.EXPO_PUBLIC_AUTH_STORAGE_KEY)
    ) => {
      if (["get"].includes(config.method!))
        config.headers["Content-Type"] = "application/json";
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
      return config;
    };

    this.#client = axios.create({
      baseURL: `${this.#apiOrigin}/api`,
    });
    this.#client.interceptors.request.use(interceptor);
  }
  //NOTE - a middleman for post processing
  async #extractor<T>(res: Promise<AxiosResponse<T>>) {
    return (await res).data;
  }
  isLoggedIn() {
    return (
      localStorage.getItem(import.meta.env.EXPO_PUBLIC_AUTH_STORAGE_KEY) !==
      null
    );
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

  async registerUser(payload) {
    return this.#extractor(this.#client.post("/register", payload));
  }

  async updateUser(payload) {
    return this.#extractor(
      this.#client.patch("/update_user", { info: payload })
    );
  }

  getCountryData(country = "", queryString = "") {
    return this.#extractor(
      this.#client.get<CountryData>(`/countries/${country}${queryString}`)
    );
  }
  getIpInfo() {
    return this.#extractor(
      this.#client.get<IpInfo>("https://free.freeipapi.com/api/json")
    );
  }
  tryPayment(payload: any) {
    return this.#extractor(
      this.#client.post<PaymentDetails>(`/payments/init`, payload)
    );
  }
}

export const API = new _API_();
