import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { googleAuthAPI } from "../../utils/ApiRequest";

const GoogleAuthButton = ({ onSuccess, onError }) => {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const setupGoogle = () => {
      if (!buttonRef.current) return;
      if (!window.google) {
        setLoadError("Google sign in script did not load. Check your network/ad blocker.");
        return;
      }

      buttonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            const { data } = await axios.post(googleAuthAPI, { credential });
            if (data.success) {
              onSuccess(data);
            } else {
              onError(data.message || "Google login failed");
            }
          } catch (err) {
            onError(err.response?.data?.message || "Google login failed");
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 280,
        text: "continue_with",
      });
      setLoadError("");
      setReady(true);
    };

    if (!document.querySelector("script[src='https://accounts.google.com/gsi/client']")) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = setupGoogle;
      script.onerror = () => {
        setLoadError("Google sign in script failed to load. Check your network/ad blocker.");
      };
      document.body.appendChild(script);
    } else {
      setupGoogle();
    }
  }, [clientId, onError, onSuccess]);

  if (!clientId) {
    return (
      <p className="mt-3 text-center" style={{ color: "#cfcfcf", fontSize: 14 }}>
        Google sign in is not configured. Add REACT_APP_GOOGLE_CLIENT_ID in frontend/.env.
      </p>
    );
  }

  return (
    <div className="googleAuthWrap mt-3">
      <div ref={buttonRef} />
      {!ready && !loadError && <span className="text-white">Loading Google sign in...</span>}
      {loadError && (
        <p className="mt-2 text-center" style={{ color: "#cfcfcf", fontSize: 14 }}>
          {loadError}
        </p>
      )}
    </div>
  );
};

export default GoogleAuthButton;
