import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { LOCAL_STORAGE_KEYS } from "./LocalStorageConstant";

/**
 * AxiosWrapper class
 * This class provides a wrapper around the Axios library for making HTTP requests.
 * It includes request and response interceptors for logging and error handling.
 */
class AxiosWrapper {
  private axiosInstance: AxiosInstance;

  /**
   * Constructor for AxiosWrapper
   * @param {string} baseURL - The base URL for the Axios instance.
   * @param {boolean} [isAuthRequest=false] - Whether the request requires authentication.
   */
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

  /**
   * Initialize request interceptor
   * Logs the start of each request.
   */
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

  /**
   * Initialize response interceptor
   * Logs the response status and data, or logs an error if the request fails.
   */
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

  /**
   * Make a GET request
   * @param {string} url - The URL to send the GET request to.
   * @param {AxiosRequestConfig} [config] - Optional Axios request configuration.
   * @returns {Promise<AxiosResponse<T>>} - The Axios response.
   */
  public get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  /**
   * Make a POST request
   * @param {string} url - The URL to send the POST request to.
   * @param {any} [data] - The data to send in the POST request.
   * @param {AxiosRequestConfig} [config] - Optional Axios request configuration.
   * @returns {Promise<AxiosResponse<T>>} - The Axios response.
   */
  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  /**
   * Make a PUT request
   * @param {string} url - The URL to send the PUT request to.
   * @param {any} [data] - The data to send in the PUT request.
   * @param {AxiosRequestConfig} [config] - Optional Axios request configuration.
   * @returns {Promise<AxiosResponse<T>>} - The Axios response.
   */
  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  /**
   * Make a DELETE request
   * @param {string} url - The URL to send the DELETE request to.
   * @param {AxiosRequestConfig} [config] - Optional Axios request configuration.
   * @returns {Promise<AxiosResponse<T>>} - The Axios response.
   */
  public delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }
}

export default AxiosWrapper;
