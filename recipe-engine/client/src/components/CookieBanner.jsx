import { useEffect, useState } from "react";
import "./CookieBanner.css";

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookiesAccepted");

    if (!accepted) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-banner">
      <p>
        This site uses cookies to keep you logged in and improve your experience.
      </p>

      <button onClick={acceptCookies}>
        Accept
      </button>
    </div>
  );
};

export default CookieBanner;