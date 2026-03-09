"use client";

import { useState, useEffect } from "react";

export default function VerificationBadge({ user, size = "md", showText = true }) {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationLevel, setVerificationLevel] = useState("none");

  useEffect(() => {
    if (user) {
      setIsVerified(user.verified || false);
      // Determine verification level based on user data
      if (user.verified && user.role === "provider") {
        setVerificationLevel("verified-provider");
      } else if (user.verified) {
        setVerificationLevel("verified-user");
      } else {
        setVerificationLevel("none");
      }
    }
  }, [user]);

  const getBadgeConfig = () => {
    const configs = {
      sm: {
        iconSize: "w-4 h-4",
        textSize: "text-xs",
        padding: "px-2 py-1",
        gap: "gap-1"
      },
      md: {
        iconSize: "w-5 h-5",
        textSize: "text-sm",
        padding: "px-3 py-1.5",
        gap: "gap-2"
      },
      lg: {
        iconSize: "w-6 h-6",
        textSize: "text-base",
        padding: "px-4 py-2",
        gap: "gap-2"
      }
    };
    return configs[size] || configs.md;
  };

  const getVerificationStyle = () => {
    const badgeConfig = getBadgeConfig();
    
    switch (verificationLevel) {
      case "verified-provider":
        return {
          bgColor: "bg-gradient-to-r from-blue-500/20 to-purple-500/20",
          borderColor: "border-blue-400/50",
          textColor: "text-blue-300",
          iconColor: "text-blue-400",
          label: "Verified Provider",
          icon: (
            <svg className={`${badgeConfig.iconSize} text-blue-400`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          )
        };
      case "verified-user":
        return {
          bgColor: "bg-gradient-to-r from-green-500/20 to-emerald-500/20",
          borderColor: "border-green-400/50",
          textColor: "text-green-300",
          iconColor: "text-green-400",
          label: "Verified",
          icon: (
            <svg className={`${badgeConfig.iconSize} text-green-400`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      default:
        return {
          bgColor: "bg-gray-500/20",
          borderColor: "border-gray-500/50",
          textColor: "text-gray-400",
          iconColor: "text-gray-500",
          label: "Unverified",
          icon: (
            <svg className={`${badgeConfig.iconSize} text-gray-500`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          )
        };
    }
  };

  if (!user) {
    return null;
  }

  const badgeConfig = getBadgeConfig();
  const style = getVerificationStyle();

  return (
    <div className={`inline-flex items-center ${badgeConfig.gap} ${badgeConfig.padding} ${style.bgColor} ${style.borderColor} border rounded-full ${badgeConfig.textSize} font-medium transition-all duration-200 hover:scale-105`}>
      {style.icon}
      {showText && (
        <span className={style.textColor}>
          {style.label}
        </span>
      )}
    </div>
  );
}

// Enhanced verification badge with tooltip
export function VerificationBadgeWithTooltip({ user, size = "md", showText = true }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getTooltipContent = () => {
    if (!user) return "User not found";
    
    if (user.verified && user.role === "provider") {
      return "This provider has been verified by our team. Identity and credentials have been confirmed.";
    } else if (user.verified) {
      return "This user has been verified. Identity has been confirmed.";
    } else {
      return "This user has not completed verification yet.";
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <VerificationBadge user={user} size={size} showText={showText} />
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-dark-gray border border-gray-600 rounded-lg p-3 shadow-lg max-w-xs">
            <p className="text-sm text-text">{getTooltipContent()}</p>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="border-4 border-transparent border-t-dark-gray"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Verification status indicator for lists
export function VerificationStatusIndicator({ user, className = "" }) {
  if (!user) return null;

  const isVerified = user.verified;
  const isProvider = user.role === "provider";

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {isVerified ? (
        <>
          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-blue-300">
            {isProvider ? "Verified Provider" : "Verified"}
          </span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <span className="text-xs text-gray-400">Unverified</span>
        </>
      )}
    </div>
  );
}