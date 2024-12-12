import React, { useEffect } from "react";
import AxiosWrapper from "../utils/AxiosWrapper";
import { useAccount, useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { LOCAL_STORAGE_KEYS } from "../utils/LocalStorageConstant";
import { useNavigate } from "react-router-dom";
import { AppConst } from "../utils/AppConstant";

/**
 * AddAccount component
 * This component handles the process of adding an Outlook account and fetching emails.
 * It uses the MSAL library for authentication and AxiosWrapper for API requests.
 */
const AddAccount: React.FC = () => {
  const axiosWrapper = new AxiosWrapper(AppConst.API_BASEURL);
  const navigate = useNavigate();

  const { instance, accounts, inProgress } = useMsal();
  const account = useAccount(accounts[0] || {});

  useEffect(() => {
    if (account) {
      instance
        .acquireTokenSilent({
          scopes: [AppConst.OUTLOOK_SCOPE],
          account: instance.getAllAccounts()[0],
        })
        .then((response) => {
          console.log(response.accessToken);
          collectOnBehalfOfToken(response.idToken);
        })
        .catch((error) => {
          if (error instanceof InteractionRequiredAuthError) {
            instance.acquireTokenRedirect({
              scopes: [AppConst.OUTLOOK_SCOPE],
              account: instance.getAllAccounts()[0],
            });
          } else {
            console.error("Token acquisition failed", error);
          }
        });
    }
  }, [account, instance]);

  /**
   * Collects the On Behalf Of Token using the provided idToken.
   * @param {string} idToken - The ID token obtained from MSAL.
   */
  const collectOnBehalfOfToken = async (idToken: string) => {
    try {
      const response = await axiosWrapper.post("/auth/login", { idToken });
      console.log(`On Behalf Of Token : ${response.data.token}`);
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, response.data.token);
      navigate("/");
    } catch (error) {
      console.error("Error collecting On Behalf Of Token", error);
    }
  };

  return (
    <div className="container center-screen">
      {inProgress && <h3>Adding Outlook Account & Fetching Emails...</h3>}
    </div>
  );
};

export default AddAccount;
