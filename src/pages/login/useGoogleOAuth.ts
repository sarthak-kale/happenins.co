import type { Setter } from "./types";
import { api } from "../../lib/api";
import { getErrorMessage } from "../../lib/errors";

interface UseGoogleOAuthArgs {
  refreshUser: () => Promise<unknown> | void;
  onSuccess: () => void;
  setError: Setter<string>;
  setLoading: Setter<boolean>;
}

export function useGoogleOAuth({ refreshUser, onSuccess, setError, setLoading }: UseGoogleOAuthArgs) {
  const handleGoogleOAuth = async () => {
    setError("");
    setLoading(true);
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const { url } = await api.getGoogleUrl(redirectUri);

      const popupWidth = 520;
      const popupHeight = 620;
      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;
      
      localStorage.removeItem("happenins_oauth_done");
      const authWindow = window.open(
        url,
        "google_oauth_popup",
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!authWindow) {
        window.location.href = url;
        return;
      }

      let isDone = false;
      const pollTimer = setInterval(async () => {
        if (isDone) return;
        const token = localStorage.getItem("happenins_oauth_done");
        if (token) {
          isDone = true;
          clearInterval(pollTimer);
          window.removeEventListener("message", checkOAuthSuccess);
          if (authWindow && !authWindow.closed) {
            try { authWindow.close(); } catch (e) {}
          }
          await refreshUser();
          setLoading(false);
          onSuccess();
          return;
        }

        if (authWindow.closed) {
          clearInterval(pollTimer);
          window.removeEventListener("message", checkOAuthSuccess);
          const finalToken = localStorage.getItem("happenins_oauth_done");
          if (finalToken) {
            isDone = true;
            await refreshUser();
            setLoading(false);
            onSuccess();
          } else {
            setLoading(false);
          }
        }
      }, 400);

      const checkOAuthSuccess = async (event: MessageEvent) => {
        if (event.origin === window.location.origin && event.data?.type === "OAUTH_AUTH_SUCCESS" && !isDone) {
          isDone = true;
          clearInterval(pollTimer);
          window.removeEventListener("message", checkOAuthSuccess);
          await refreshUser();
          setLoading(false);
          onSuccess();
        }
      };

      window.addEventListener("message", checkOAuthSuccess);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Google Authentication handshake failed.");
      setLoading(false);
    }
  };

  return handleGoogleOAuth;
}
