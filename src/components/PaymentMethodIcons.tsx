import React from "react";

export interface PaymentIconProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizeClasses = {
  xs: "h-6 min-w-[40px] px-2",
  sm: "h-7 min-w-[48px] px-2.5",
  md: "h-8 min-w-[56px] px-3",
  lg: "h-9 min-w-[64px] px-3.5",
};

// Common base container for clean, dark-glass metallic squircle badge
const SquircleBadge: React.FC<{
  children: React.ReactNode;
  title: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}> = ({ children, title, className = "", size = "md" }) => {
  return (
    <div
      title={title}
      className={`relative inline-flex items-center justify-center rounded-[7px] border border-white/15 bg-gradient-to-b from-zinc-800/90 via-zinc-900/90 to-zinc-950/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_4px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all duration-200 hover:border-white/35 hover:from-zinc-750 hover:to-zinc-900 hover:shadow-[0_0_12px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:scale-[1.03] select-none ${sizeClasses[size]} ${className}`}
    >
      {children}
    </div>
  );
};

// 1. VISA (Official Italicized Vector Wordmark)
export const VisaIcon: React.FC<PaymentIconProps> = ({ className, size = "md" }) => (
  <SquircleBadge title="Visa" size={size} className={className}>
    <svg viewBox="0 0 48 16" className="h-[12px] sm:h-[13px] w-auto fill-white drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.4 15.5L22.2 0.5H26.8L24 15.5H19.4ZM38.4 0.9C37.5 0.5 36 0.2 34.2 0.2C29.6 0.2 26.3 2.7 26.3 6.1C26.3 8.7 28.6 10.2 30.4 11.1C32.2 12 32.8 12.6 32.8 13.4C32.8 14.6 31.4 15.1 29.9 15.1C28 15.1 26.9 14.7 25.6 14.1L24.9 13.7L24.1 15.8C25.4 16.4 27.7 16.9 30.1 16.9C34.9 16.9 38 14.5 38 10.8C38 7.8 36.2 6.2 33.9 5.1C32.2 4.3 31.4 3.7 31.4 2.7C31.4 1.9 32.4 1 34.2 1C35.6 1 36.7 1.3 37.5 1.7L37.9 1.9L38.4 0.9ZM48 0.5H44.3C43.2 0.5 42.3 0.7 41.8 2.1L34.3 15.5H39.1L40.1 12.8H46L46.6 15.5H50.8L48 0.5ZM41.4 9.4C41.8 8.3 43.5 4.2 43.5 4.2C43.5 4.2 43.9 3.1 44.2 2.2L44.4 4.1L45.5 9.4H41.4ZM15.4 0.5L10.9 11L10.4 8.5C9.6 5.6 6.8 2.4 3.8 0.9L7.9 15.5H12.8L20.2 0.5H15.4ZM6.6 0.5H0L0 0.8C5.8 2.3 9.8 6.2 10.6 8.2L9.2 1.4C9 0.6 8.4 0.5 7.6 0.5H6.6Z" />
    </svg>
  </SquircleBadge>
);

// 2. MASTERCARD (Official Interlocking Red & Yellow Circles)
export const MastercardIcon: React.FC<PaymentIconProps> = ({ className, size = "md" }) => (
  <SquircleBadge title="Mastercard" size={size} className={className}>
    <svg viewBox="0 0 34 22" className="h-[15px] sm:h-[16px] w-auto drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="9" fill="#EB001B" />
      <circle cx="23" cy="11" r="9" fill="#F79E1B" fillOpacity="0.95" />
      <path
        d="M17 4.2C19.2 6.0 20.6 8.8 20.6 11C20.6 13.2 19.2 16.0 17 17.8C14.8 16.0 13.4 13.2 13.4 11C13.4 8.8 14.8 6.0 17 4.2Z"
        fill="#FF5F00"
      />
    </svg>
  </SquircleBadge>
);

// 3. AMERICAN EXPRESS / AMEX
export const AmexIcon: React.FC<PaymentIconProps> = ({ className, size = "md" }) => (
  <SquircleBadge title="American Express" size={size} className={className}>
    <svg viewBox="0 0 40 18" className="h-[12px] sm:h-[13px] w-auto fill-cyan-300 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 2H6.8L8.6 6.5L10.3 2H15.6V16H11.8V7.8L9.7 13.2H7.2L5.1 7.8V16H1.5V2ZM16.8 2H26.5V5.5H20.8V7.2H25.8V10.2H20.8V12.5H26.5V16H16.8V2ZM27.8 2H31.8L34.5 6.8L37.2 2H41.2L36.8 8.8L41.5 16H37.2L34.5 11.2L31.8 16H27.8L32.4 8.8L27.8 2Z" transform="scale(0.9) translate(1, 1)" />
    </svg>
  </SquircleBadge>
);

// 4. PAYPAL (100% Official Vector: Authentic Double-P Monogram + "PayPal" Typography)
export const PaypalIcon: React.FC<PaymentIconProps> = ({ className, size = "md" }) => (
  <SquircleBadge title="PayPal" size={size} className={className}>
    <svg viewBox="0 0 124 33" className="h-[14px] sm:h-[15px] w-auto max-w-[82px] drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      {/* PayPal Official Double P Monogram */}
      <path fill="#2563eb" d="M7.266,29.154l0.523-3.322l-1.165-0.027H1.061L4.927,1.292C4.939,1.218,4.978,1.149,5.035,1.1c0.057-0.049,0.13-0.076,0.206-0.076h9.38c3.114,0,5.263,0.648,6.385,1.927c0.526,0.6,0.861,1.227,1.023,1.917c0.17,0.724,0.173,1.589,0.007,2.644l-0.012,0.077v0.676l0.526,0.298c0.443,0.235,0.795,0.504,1.065,0.812c0.45,0.513,0.741,1.165,0.864,1.938c0.127,0.795,0.085,1.741-0.123,2.812c-0.24,1.232-0.628,2.305-1.152,3.183c-0.482,0.809-1.096,1.48-1.825,2c-0.696,0.494-1.523,0.869-2.458,1.109c-0.906,0.236-1.939,0.355-3.072,0.355h-0.73c-0.522,0-1.029,0.188-1.427,0.525c-0.399,0.344-0.663,0.814-0.744,1.328l-0.055,0.299l-0.924,5.855l-0.042,0.215c-0.011,0.068-0.03,0.102-0.058,0.125c-0.025,0.021-0.061,0.035-0.096,0.035H7.266z" />
      <path fill="#38bdf8" d="M23.048,7.667L23.048,7.667L23.048,7.667c-0.028,0.179-0.06,0.362-0.096,0.55c-1.237,6.351-5.469,8.545-10.874,8.545H9.326c-0.661,0-1.218,0.48-1.321,1.132l0,0l0,0L6.596,26.83l-0.399,2.533c-0.067,0.428,0.263,0.814,0.695,0.814h4.881c0.578,0,1.069-0.42,1.16-0.99l0.048-0.248l0.919-5.832l0.059-0.32c0.09-0.572,0.582-0.992,1.16-0.992h0.73c4.729,0,8.431-1.92,9.513-7.476c0.452-2.321,0.218-4.259-0.978-5.622C24.022,8.286,23.573,7.945,23.048,7.667z" />
      <path fill="#1e3a8a" d="M21.754,7.151c-0.189-0.055-0.384-0.105-0.584-0.15c-0.201-0.044-0.407-0.083-0.619-0.117c-0.742-0.12-1.555-0.177-2.426-0.177h-7.352c-0.181,0-0.353,0.041-0.507,0.115C9.927,6.985,9.675,7.306,9.614,7.699L8.05,17.605l-0.045,0.289c0.103-0.652,0.66-1.132,1.321-1.132h2.752c5.405,0,9.637-2.195,10.874-8.545c0.037-0.188,0.068-0.371,0.096-0.55c-0.313-0.166-0.652-0.308-1.017-0.429C21.941,7.208,21.848,7.179,21.754,7.151z" />
      <path fill="#2563eb" d="M9.614,7.699c0.061-0.393,0.313-0.714,0.652-0.876c0.155-0.074,0.326-0.115,0.507-0.115h7.352c0.871,0,1.684,0.057,2.426,0.177c0.212,0.034,0.418,0.073,0.619,0.117c0.2,0.045,0.395,0.095,0.584,0.15c0.094,0.028,0.187,0.057,0.278,0.086c0.365,0.121,0.704,0.264,1.017,0.429c0.368-2.347-0.003-3.945-1.272-5.392C20.378,0.682,17.853,0,14.622,0h-9.38c-0.66,0-1.223,0.48-1.325,1.133L0.01,25.898c-0.077,0.49,0.301,0.932,0.795,0.932h5.791l1.454-9.225L9.614,7.699z" />
      {/* Official "Pay" in bright white */}
      <path fill="#FFFFFF" d="M46.211,6.749h-6.839c-0.468,0-0.866,0.34-0.939,0.802l-2.766,17.537c-0.055,0.346,0.213,0.658,0.564,0.658h3.265c0.468,0,0.866-0.34,0.939-0.803l0.746-4.73c0.072-0.463,0.471-0.803,0.938-0.803h2.165c4.505,0,7.105-2.18,7.784-6.5c0.306-1.89,0.013-3.375-0.872-4.415C50.224,7.353,48.5,6.749,46.211,6.749z M47,13.154c-0.374,2.454-2.249,2.454-4.062,2.454h-1.032l0.724-4.583c0.043-0.277,0.283-0.481,0.563-0.481h0.473c1.235,0,2.4,0,3.002,0.704C47.027,11.668,47.137,12.292,47,13.154z" />
      <path fill="#FFFFFF" d="M66.654,13.075h-3.275c-0.279,0-0.52,0.204-0.563,0.481l-0.145,0.916l-0.229-0.332c-0.709-1.029-2.29-1.373-3.868-1.373c-3.619,0-6.71,2.741-7.312,6.586c-0.313,1.918,0.132,3.752,1.22,5.031c0.998,1.176,2.426,1.666,4.125,1.666c2.916,0,4.533-1.875,4.533-1.875l-0.146,0.91c-0.055,0.348,0.213,0.66,0.562,0.66h2.95c0.469,0,0.865-0.34,0.939-0.803l1.77-11.209C67.271,13.388,67.004,13.075,66.654,13.075z M62.089,19.449c-0.316,1.871-1.801,3.127-3.695,3.127c-0.951,0-1.711-0.305-2.199-0.883c-0.484-0.574-0.668-1.391-0.514-2.301c0.295-1.855,1.805-3.152,3.67-3.152c0.93,0,1.686,0.309,2.184,0.892C62.034,17.721,62.232,18.543,62.089,19.449z" />
      <path fill="#FFFFFF" d="M84.096,13.075h-3.291c-0.314,0-0.609,0.156-0.787,0.417l-4.539,6.686l-1.924-6.425c-0.121-0.402-0.492-0.678-0.912-0.678h-3.234c-0.393,0-0.666,0.384-0.541,0.754l3.625,10.638l-3.408,4.811c-0.268,0.379,0.002,0.9,0.465,0.9h3.287c0.312,0,0.604-0.152,0.781-0.408L84.564,13.97C84.826,13.592,84.557,13.075,84.096,13.075z" />
      {/* Official "Pal" in PayPal cyan */}
      <path fill="#38bdf8" d="M94.992,6.749h-6.84c-0.467,0-0.865,0.34-0.938,0.802l-2.766,17.537c-0.055,0.346,0.213,0.658,0.562,0.658h3.51c0.326,0,0.605-0.238,0.656-0.562l0.785-4.971c0.072-0.463,0.471-0.803,0.938-0.803h2.164c4.506,0,7.105-2.18,7.785-6.5c0.307-1.89,0.012-3.375-0.873-4.415C99.004,7.353,97.281,6.749,94.992,6.749z M95.781,13.154c-0.373,2.454-2.248,2.454-4.062,2.454h-1.031l0.725-4.583c0.043-0.277,0.281-0.481,0.562-0.481h0.473c1.234,0,2.4,0,3.002,0.704C95.809,11.668,95.918,12.292,95.781,13.154z" />
      <path fill="#38bdf8" d="M115.434,13.075h-3.273c-0.281,0-0.52,0.204-0.562,0.481l-0.145,0.916l-0.23-0.332c-0.709-1.029-2.289-1.373-3.867-1.373c-3.619,0-6.709,2.741-7.311,6.586c-0.312,1.918,0.131,3.752,1.219,5.031c1,1.176,2.426,1.666,4.125,1.666c2.916,0,4.533-1.875,4.533-1.875l-0.146,0.91c-0.055,0.348,0.213,0.66,0.564,0.66h2.949c0.467,0,0.865-0.34,0.938-0.803l1.771-11.209C116.053,13.388,115.785,13.075,115.434,13.075z M110.869,19.449c-0.314,1.871-1.801,3.127-3.695,3.127c-0.949,0-1.711-0.305-2.199-0.883c-0.484-0.574-0.666-1.391-0.514-2.301c0.297-1.855,1.805-3.152,3.67-3.152c0.93,0,1.686,0.309,2.184,0.892C110.816,17.721,111.014,18.543,110.869,19.449z" />
      <path fill="#38bdf8" d="M119.295,7.23l-2.807,17.858c-0.055,0.346,0.213,0.658,0.562,0.658h2.822c0.469,0,0.867-0.34,0.939-0.803l2.768-17.536c0.055-0.346-0.213-0.659-0.562-0.659h-3.16C119.578,6.749,119.338,6.953,119.295,7.23z" />
    </svg>
  </SquircleBadge>
);

// 5. APPLE PAY (Official Apple Logo + "Pay")
export const ApplePayIcon: React.FC<PaymentIconProps> = ({ className, size = "md" }) => (
  <SquircleBadge title="Apple Pay" size={size} className={className}>
    <svg viewBox="0 0 42 18" className="h-[13px] sm:h-[14px] w-auto fill-white drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.2 3.5C5.6 4.3 4.6 4.8 3.7 4.7C3.6 3.8 4 2.8 4.7 2.2C5.3 1.4 6.3 0.9 7.2 1C7.3 1.9 6.8 2.8 6.2 3.5ZM7.3 4.8C5.8 4.7 4.7 5.6 4 5.6C3.2 5.6 2.1 4.8 1 4.8C-0.3 4.8 -0.9 6 -0.9 7.9C-0.9 11.1 2 15.2 3.6 15.2C4.5 15.2 5.1 14.6 6.2 14.6C7.3 14.6 7.8 15.2 8.8 15.2C10.4 15.2 11.6 13.3 12.6 11.9C10.9 10.9 10.8 8.6 12.3 7.6C11.3 6.2 9.7 6.1 9.1 6.1C7.8 5.9 7.4 4.8 7.3 4.8Z" transform="translate(1, 0)" />
      <text x="17.2" y="12.8" fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Roboto, sans-serif" fontSize="11.5" fontWeight="600" letterSpacing="-0.2px">
        Pay
      </text>
    </svg>
  </SquircleBadge>
);

// 6. GOOGLE PAY (Official Google G Colors + "Pay")
export const GooglePayIcon: React.FC<PaymentIconProps> = ({ className, size = "md" }) => (
  <SquircleBadge title="Google Pay" size={size} className={className}>
    <svg viewBox="0 0 44 18" className="h-[13px] sm:h-[14px] w-auto drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(1.5, 2)">
        <path d="M7 6.5C7 6.1 6.9 5.6 6.8 5.2H0V7.8H3.9C3.7 8.7 3.2 9.5 2.4 10.1V11.9H4.9C6.3 10.6 7 8.7 7 6.5Z" fill="#4285F4" />
        <path d="M0 13.5C1.9 13.5 3.5 12.9 4.9 11.9L2.4 10.1C1.7 10.5 0.9 10.8 0 10.8C-1.3 10.8 -2.4 9.9 -2.8 8.7H-5.4V10.6C-4 12.3 -2.1 13.5 0 13.5Z" fill="#34A853" />
        <path d="M-2.8 8.7C-3 8.1 -3.1 7.5 -3.1 6.9C-3.1 6.3 -3 5.7 -2.8 5.1V3.2H-5.4C-6 4.3 -6.3 5.6 -6.3 6.9C-6.3 8.2 -6 9.5 -5.4 10.6L-2.8 8.7Z" fill="#FBBC05" />
        <path d="M0 2.9C1.1 2.9 2 3.3 2.8 4L4.9 1.9C3.5 0.7 1.9 0 0 0C-2.1 0 -4 1.2 -5.4 2.9L-2.8 4.8C-2.4 3.6 -1.3 2.9 0 2.9Z" fill="#EA4335" />
      </g>
      <text x="18" y="12.8" fill="#FFFFFF" fontFamily="Google Sans, Roboto, sans-serif" fontSize="11.5" fontWeight="600" letterSpacing="-0.2px">
        Pay
      </text>
    </svg>
  </SquircleBadge>
);

// 7. KLARNA (100% Official Vector Wordmark from Klarna Brand Asset in Signature Klarna Pink)
export const KlarnaIcon: React.FC<PaymentIconProps> = ({ className, size = "md" }) => (
  <SquircleBadge title="Klarna" size={size} className={className}>
    <svg viewBox="0 0 452.9 101.1" className="h-[12px] sm:h-[13px] w-auto max-w-[65px] drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      {/* K */}
      <path fill="#FFB3C7" d="M79.7,0H57.4c0,18.3-8.4,35-23,46l-8.8,6.6l34.2,46.6h28.1L56.4,56.3C71.3,41.5,79.7,21.5,79.7,0z" />
      <rect fill="#FFB3C7" width="22.8" height="99.2" />
      {/* l */}
      <rect fill="#FFB3C7" x="94.5" width="21.5" height="99.2" />
      {/* a */}
      <path fill="#FFB3C7" d="M181,30.6V35c-5.8-4-12.8-6.3-20.4-6.3c-20,0-36.2,16.2-36.2,36.2s16.2,36.2,36.2,36.2c7.6,0,14.6-2.3,20.4-6.3v4.4h20.5V30.6H181z M162.3,82.5c-10.3,0-18.6-7.9-18.6-17.6s8.3-17.6,18.6-17.6c10.3,0,18.6,7.9,18.6,17.6S172.6,82.5,162.3,82.5z" />
      {/* r */}
      <path fill="#FFB3C7" d="M233.3,39.5v-8.9h-21v68.6h21.1v-32c0-10.8,11.7-16.6,19.8-16.6c0.1,0,0.2,0,0.2,0v-20C245.1,30.6,237.4,34.2,233.3,39.5z" />
      {/* n */}
      <path fill="#FFB3C7" d="M304.6,28.7c-8.2,0-16,2.5-21.2,9.6v-7.7H263v68.6h20.7v-36c0-10.4,7-15.5,15.4-15.5c9,0,14.2,5.4,14.2,15.4v36.2h20.5V55.6C333.8,39.6,321.1,28.7,304.6,28.7z" />
      {/* second a */}
      <path fill="#FFB3C7" d="M397.6,30.6V35c-5.8-4-12.8-6.3-20.4-6.3c-20,0-36.2,16.2-36.2,36.2s16.2,36.2,36.2,36.2c7.6,0,14.6-2.3,20.4-6.3v4.4h20.5V30.6H397.6z M378.9,82.5c-10.3,0-18.6-7.9-18.6-17.6s8.3-17.6,18.6-17.6c10.3,0,18.6,7.9,18.6,17.6C397.6,74.6,389.2,82.5,378.9,82.5z" />
      {/* Iconic Klarna Dot */}
      <path fill="#FFB3C7" d="M440,74.9c-7.1,0-12.9,5.8-12.9,12.9c0,7.1,5.8,12.9,12.9,12.9c7.1,0,12.9-5.8,12.9-12.9C452.9,80.6,447.1,74.9,440,74.9z" />
    </svg>
  </SquircleBadge>
);

// 8. SEPA (Official SEPA Banküberweisung / Lastschrift)
export const SepaIcon: React.FC<PaymentIconProps> = ({ className, size = "md" }) => (
  <SquircleBadge title="SEPA Lastschrift / Banküberweisung" size={size} className={className}>
    <svg viewBox="0 0 38 18" className="h-[12px] sm:h-[13px] w-auto fill-white drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <text
        x="19"
        y="13"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="11"
        fontWeight="800"
        letterSpacing="0.8px"
      >
        SEPA
      </text>
    </svg>
  </SquircleBadge>
);

// 9. BITCOIN / CRYPTO (Official Bitcoin Emblem in Bitcoin Gold)
export const BitcoinIcon: React.FC<PaymentIconProps> = ({ className, size = "md" }) => (
  <SquircleBadge title="Bitcoin & Krypto" size={size} className={className}>
    <svg viewBox="0 0 24 24" className="h-[15px] sm:h-[16px] w-auto drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#F7931A" />
      <path
        d="M13.8 10.8C14.4 10.5 14.8 9.9 14.7 9.1C14.5 7.9 13.3 7.5 12 7.5H9.5V17.1H12.5C14 17.1 15.2 16.5 15.4 15.1C15.6 13.9 15.1 13.1 13.8 12.7V10.8ZM10.9 8.7H12.2C13.1 8.7 13.5 9.1 13.6 9.7C13.7 10.4 13.2 10.9 12.3 10.9H10.9V8.7ZM12.4 15.9H10.9V12.3H12.5C13.5 12.3 14.1 12.8 14.2 13.6C14.3 14.5 13.6 15.9 12.4 15.9Z"
        fill="white"
      />
      <line x1="10.8" y1="5.8" x2="10.8" y2="7.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12.8" y1="5.8" x2="12.8" y2="7.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10.8" y1="17.1" x2="10.8" y2="18.8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12.8" y1="17.1" x2="12.8" y2="18.8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  </SquircleBadge>
);

// 10. STRIPE BADGE (Official Stripe Typography)
export const StripeBadgeIcon: React.FC<PaymentIconProps> = ({ className, size = "md" }) => (
  <SquircleBadge title="Stripe Verified" size={size} className={className}>
    <svg viewBox="0 0 36 18" className="h-[13px] sm:h-[14px] w-auto fill-[#635BFF] drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <text
        x="18"
        y="13"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="12"
        fontWeight="800"
        letterSpacing="-0.5px"
      >
        stripe
      </text>
    </svg>
  </SquircleBadge>
);

// CLEAN, MINIMALIST HORIZONTAL PAYMENT METHODS BAR
interface PaymentMethodsBarProps {
  lang?: "de" | "en";
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "compact" | "full" | "minimal";
  includeCrypto?: boolean;
}

export const PaymentMethodsBar: React.FC<PaymentMethodsBarProps> = ({
  lang = "de",
  className = "",
  size = "sm",
  variant = "full",
  includeCrypto = true,
}) => {
  return (
    <div className={`flex flex-col items-center gap-3.5 ${className}`}>
      {/* Top minimal row matching the reference: "Zahlung:" + squircle tiles */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
        <span className="text-[12px] font-sans font-medium text-zinc-400 mr-1 select-none tracking-tight">
          {lang === "de" ? "Zahlung:" : "Payment:"}
        </span>
        <VisaIcon size={size} />
        <MastercardIcon size={size} />
        <AmexIcon size={size} />
        <PaypalIcon size={size} />
        <ApplePayIcon size={size} />
        <GooglePayIcon size={size} />
        <KlarnaIcon size={size} />
        <SepaIcon size={size} />
        {includeCrypto && <BitcoinIcon size={size} />}
      </div>

      {/* Optional subtle trust guarantees if variant === 'full' */}
      {variant === "full" && (
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-zinc-400/90 pt-1">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-emerald-400">🔒</span>
            <span>256-Bit SSL Verschlüsselung</span>
          </span>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-cyan-400">⚡</span>
            <span>Sofortige Passkey-Aktivierung</span>
          </span>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-amber-400">🛡️</span>
            <span>14 Tage Geld-zurück-Garantie</span>
          </span>
        </div>
      )}
    </div>
  );
};
