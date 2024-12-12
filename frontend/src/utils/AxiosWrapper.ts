import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { LOCAL_STORAGE_KEYS } from "./LocalStorageConstant";

class AxiosWrapper {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string, isAuthRequest: boolean = false) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (isAuthRequest) {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
      headers["Authorization"] = `Bearer ${token}`;
    }

    this.axiosInstance = axios.create({
      baseURL,
      headers,
    });

    this.initializeRequestInterceptor();
    this.initializeResponseInterceptor();
  }

  private initializeRequestInterceptor() {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        console.info(
          `Starting Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error: AxiosError) => {
        console.error("Request Error:", error);
        return Promise.reject(error);
      }
    );
  }

  private initializeResponseInterceptor() {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.info(`Response: ${response.status} ${response.statusText}`, {
          data: response.data,
        });
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          console.error("Response Error:", {
            status: error.response.status,
            data: error.response.data,
          });
        } else {
          console.error("Network or other error:", error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }
}

export default AxiosWrapper;
