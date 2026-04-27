/**
 * @file CookieConsent.jsx
 *  Displays a cookies consent popup and stores the user's choice
 *  This popup appears only if the user has not accepted or rejected cookies before
 */

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

function CookieConsent() {
  // Controls whether the cookie popup is visible
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted or rejected cookies
    const cookieConsent = Cookies.get("cookieConsent");

    // If there is no saved choice, show the popup
    if (!cookieConsent) {
      setShowPopup(true);
    }
  }, []);

  // Save accepted choice and hide popup
  const handleAccept = () => {
    Cookies.set("cookieConsent", "accepted", { expires: 365 });
    setShowPopup(false);
  };

  // Save rejected choice and hide popup
  const handleReject = () => {
    Cookies.set("cookieConsent", "rejected", { expires: 365 });
    setShowPopup(false);
  };

  // If popup should not be shown, render nothing
  if (!showPopup) {
    return null;
  }

  return (
    <div className="cookie-consent">
      <div className="cookie-consent-text">
        <strong>Cookies</strong>
        <p>This website uses cookies to improve your experience.</p>
      </div>

      <div className="cookie-consent-buttons">
        <button
          type="button"
          className="cookie-reject-button"
          onClick={handleReject}
        >
          Reject
        </button>

        <button
          type="button"
          className="cookie-accept-button"
          onClick={handleAccept}
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export default CookieConsent;
