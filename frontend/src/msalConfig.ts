import { Configuration, LogLevel } from "@azure/msal-browser";
// import { AppConst } from "./utils/AppConstant";
export const msalConfig: Configuration = {
  auth: {
    // clientId: AppConst.OUTLOOK_CLIENT_ID,
    clientId: "cc069fcc-f275-46e6-a815-720b9de15eef",
    authority:
      "https://login.microsoftonline.com/prajwalkraopkrgmail.onmicrosoft.com",
    redirectUri: "/",
    postLogoutRedirectUri: "/",
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};
