export function EventIllustration() {
  return (
    <svg viewBox="0 0 760 620" role="img" aria-label="Guests sharing event photos through a QR code" className="h-auto w-full">
      <defs>
        <linearGradient id="poster" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#FFF8EC" />
          <stop offset="100%" stopColor="#DCCCAC" />
        </linearGradient>
        <linearGradient id="phone" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#22281D" />
          <stop offset="100%" stopColor="#546B41" />
        </linearGradient>
      </defs>
      <rect x="32" y="52" width="696" height="512" rx="42" fill="#FFF8EC" opacity=".72" />
      <circle cx="120" cy="130" r="58" fill="#99AD7A" opacity=".32" />
      <circle cx="660" cy="476" r="72" fill="#DCCCAC" opacity=".5" />
      <path d="M117 475c88-70 163-78 242-30 90 55 164 50 267-37" fill="none" stroke="#99AD7A" strokeWidth="16" strokeLinecap="round" opacity=".45" />
      <g transform="translate(86 132)">
        <rect width="228" height="318" rx="28" fill="url(#poster)" stroke="#546B41" strokeWidth="8" />
        <text x="114" y="58" textAnchor="middle" fontSize="25" fontWeight="900" fill="#22281D">SCAN</text>
        <rect x="57" y="91" width="114" height="114" rx="10" fill="#FFF8EC" stroke="#546B41" strokeWidth="6" />
        <path d="M78 113h28v28H78zm45 0h18v18h-18zm-45 47h18v18H78zm75-8h18v28h-18zm-40 7h24v24h-24zm-1-56h57v8h-57zm-34 90h91v8H78z" fill="#546B41" />
        <text x="114" y="249" textAnchor="middle" fontSize="20" fontWeight="800" fill="#546B41">Snap memories</text>
        <text x="114" y="282" textAnchor="middle" fontSize="15" fontWeight="600" fill="#546B41">No app needed</text>
      </g>
      <g transform="translate(360 76)">
        <rect width="230" height="434" rx="42" fill="url(#phone)" />
        <rect x="22" y="36" width="186" height="332" rx="26" fill="#FFF8EC" />
        <rect x="45" y="67" width="140" height="158" rx="22" fill="#DCCCAC" />
        <circle cx="115" cy="146" r="42" fill="#546B41" opacity=".85" />
        <circle cx="115" cy="146" r="20" fill="#FFF8EC" />
        <path d="M62 262h106" stroke="#546B41" strokeWidth="12" strokeLinecap="round" />
        <path d="M62 296h76" stroke="#99AD7A" strokeWidth="12" strokeLinecap="round" />
        <rect x="54" y="326" width="122" height="38" rx="19" fill="#546B41" />
        <circle cx="115" cy="399" r="15" fill="#FFF8EC" opacity=".8" />
      </g>
      <g transform="translate(568 170)">
        <rect x="0" y="52" width="116" height="150" rx="22" fill="#546B41" />
        <path d="M27 52l12-24h40l13 24" fill="none" stroke="#546B41" strokeWidth="16" strokeLinejoin="round" />
        <circle cx="58" cy="128" r="31" fill="#FFF8EC" />
        <circle cx="58" cy="128" r="15" fill="#99AD7A" />
        <path d="M18 89h26" stroke="#FFF8EC" strokeWidth="9" strokeLinecap="round" />
      </g>
      <g fill="#546B41">
        <circle cx="662" cy="126" r="10" />
        <circle cx="692" cy="158" r="7" />
        <circle cx="622" cy="92" r="6" />
      </g>
    </svg>
  );
}
