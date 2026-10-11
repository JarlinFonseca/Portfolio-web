import { useId } from 'react';

/** Persona programando en su escritorio (SVG isométrico del diseño) con animación flotante CSS. */
export function DevAtDeskIso({ label }: { label: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 560 520"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      className="block h-auto"
    >
      <defs>
        <radialGradient id={`${id}-skin`} cx=".7" cy=".35" r=".8">
          <stop offset="0" stopColor="#e2a985" />
          <stop offset="1" stopColor="#b97a57" />
        </radialGradient>
        <linearGradient id={`${id}-hood`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b68ee" />
          <stop offset="1" stopColor="#2a54d6" />
        </linearGradient>
      </defs>
      <g>
        <polygon points="62,282 305,422 305,406 62,266" fill="#e3e4de" />
        <polygon points="539,287 305,422 305,406 539,271" fill="#cfd1ca" />
        <polygon points="296,131 539,271 305,406 62,266" fill="#fbfbf8" />
      </g>
      <polygon points="263,209 418,298 277,379 123,290" fill="#dfe6fb" />
      <g>
        <polygon points="293,165 301,169 301,61 293,57" fill="#26282d" />
        <polygon points="308,165 301,169 301,61 308,57" fill="#14161a" />
      </g>
      <g>
        <polygon points="457,259 464,264 464,156 457,151" fill="#26282d" />
        <polygon points="472,259 464,264 464,156 472,151" fill="#14161a" />
      </g>
      <g>
        <path
          d="M104,259 A21,12 0 0 0 146,259 L146,229 L104,229 Z"
          fill="#e2582a"
          stroke="#14161a"
          strokeWidth="1"
        />
        <ellipse cx="125" cy="229" rx="21" ry="12" fill="#f38155" stroke="#14161a" strokeWidth="1" />
      </g>
      <ellipse
        cx="113"
        cy="197"
        rx="9"
        ry="26"
        transform="rotate(-28 113 197)"
        fill="#2f7d5b"
        stroke="#14161a"
        strokeWidth="1"
      />
      <ellipse
        cx="133"
        cy="191"
        rx="9"
        ry="28"
        transform="rotate(22 133 191)"
        fill="#2f7d5b"
        stroke="#14161a"
        strokeWidth="1"
      />
      <ellipse cx="123" cy="181" rx="8" ry="30" fill="#2f7d5b" stroke="#14161a" strokeWidth="1" />
      <ellipse
        cx="141"
        cy="205"
        rx="8"
        ry="22"
        transform="rotate(48 141 205)"
        fill="#2f7d5b"
        stroke="#14161a"
        strokeWidth="1"
      />
      <ellipse
        cx="105"
        cy="209"
        rx="8"
        ry="22"
        transform="rotate(-55 105 209)"
        fill="#2f7d5b"
        stroke="#14161a"
        strokeWidth="1"
      />
      <g>
        <polygon
          points="212,93 399,201 399,191 212,83"
          fill="#eceef1"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="488,150 399,201 399,191 488,140"
          fill="#d6d9df"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="301,32 488,140 399,191 212,83"
          fill="#ffffff"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
      <g>
        <polygon points="223,205 230,210 230,102 223,97" fill="#26282d" />
        <polygon points="238,205 230,210 230,102 238,97" fill="#14161a" />
      </g>
      <g>
        <polygon points="387,300 394,304 394,196 387,192" fill="#26282d" />
        <polygon points="402,300 394,304 394,196 402,192" fill="#14161a" />
      </g>
      <g>
        <path
          d="M427,139 A11,6 0 0 0 450,139 L450,119 L427,119 Z"
          fill="#2d5be3"
          stroke="#14161a"
          strokeWidth="1"
        />
        <ellipse cx="439" cy="119" rx="11" ry="6" fill="#4c73e7" stroke="#14161a" strokeWidth="1" />
      </g>
      <g>
        <polygon
          points="275,60 317,85 317,77 275,53"
          fill="#f26b38"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="345,68 317,85 317,77 345,61"
          fill="#bc532b"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="303,37 345,61 317,77 275,53"
          fill="#f4855b"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
      <g>
        <polygon
          points="279,53 316,75 316,68 279,47"
          fill="#eef0f3"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="342,60 316,75 316,68 342,54"
          fill="#d6d9df"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="304,32 342,54 316,68 279,47"
          fill="#ffffff"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
      <g>
        <polygon
          points="277,47 317,70 317,62 277,40"
          fill="#2d5be3"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="344,54 317,70 317,62 344,47"
          fill="#2346b1"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="304,24 344,47 317,62 277,40"
          fill="#5278e8"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
      <g>
        <polygon
          points="308,109 373,147 373,143 308,105"
          fill="#c9ccd3"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="415,122 373,147 373,143 415,119"
          fill="#aeb2ba"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="350,81 415,119 373,143 308,105"
          fill="#e9ebef"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
      <polygon points="350,89 401,119 385,128 333,98" fill="#c3c7cf" />
      <polygon
        points="350,81 415,119 424,61 358,23"
        fill="#14161a"
        stroke="#14161a"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <polygon points="354,78 412,112 420,63 361,29" fill="#1f2a4d" />
      <line x1="365" y1="38" x2="391" y2="54" stroke="#7aa2ff" strokeWidth="3" strokeLinecap="round" />
      <line x1="364" y1="44" x2="405" y2="68" stroke="#e7e9ee" strokeWidth="3" strokeLinecap="round" />
      <line x1="368" y1="53" x2="400" y2="72" stroke="#f2a07b" strokeWidth="3" strokeLinecap="round" />
      <line x1="367" y1="59" x2="406" y2="81" stroke="#e7e9ee" strokeWidth="3" strokeLinecap="round" />
      <line x1="371" y1="68" x2="394" y2="81" stroke="#9ad1b4" strokeWidth="3" strokeLinecap="round" />
      <line x1="365" y1="71" x2="394" y2="88" stroke="#e7e9ee" strokeWidth="3" strokeLinecap="round" />
      <line x1="359" y1="74" x2="371" y2="81" stroke="#7aa2ff" strokeWidth="3" strokeLinecap="round" />
      <rect x="374" y="79" width="6" height="6" fill="#f26b38" className="motion-safe:animate-blink" />
      <g>
        <polygon points="259,301 266,304 266,232 259,228" fill="#26282d" />
        <polygon points="272,301 266,304 266,232 272,228" fill="#14161a" />
      </g>
      <g>
        <polygon
          points="228,210 275,238 275,229 228,202"
          fill="#2a2d35"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="319,212 275,238 275,229 319,203"
          fill="#1b1d22"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="273,176 319,203 275,229 228,202"
          fill="#3a3e48"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
      <path
        d="M267,185 L309,161 L314,243"
        fill="none"
        stroke="#232a3d"
        strokeWidth="19"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="314" cy="242" rx="13" ry="7" fill="#ffffff" stroke="#14161a" strokeWidth="1" />
      <path
        d="M288,197 L330,173 L334,254"
        fill="none"
        stroke="#232a3d"
        strokeWidth="19"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="335" cy="254" rx="13" ry="7" fill="#ffffff" stroke="#14161a" strokeWidth="1" />
      <path d="M281,125 L343,103" stroke="#c98b67" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M262,112 L281,125" stroke="#2d5be3" strokeWidth="17" strokeLinecap="round" fill="none" />
      <path d="M281,125 L297,120" stroke="#2d5be3" strokeWidth="15" strokeLinecap="round" fill="none" />
      <polygon
        points="290,200 311,188 310,121 292,128"
        fill="#2448b8"
        stroke="#2448b8"
        strokeWidth="16"
        strokeLinejoin="round"
      />
      <polygon
        points="255,180 290,200 292,128 258,109"
        fill={`url(#${id}-hood)`}
        stroke="#2d5be3"
        strokeWidth="16"
        strokeLinejoin="round"
      />
      <line
        x1="274"
        y1="170"
        x2="274"
        y2="125"
        stroke="#1f3fa3"
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".6"
      />
      <path d="M320,147 L370,119" stroke="#c98b67" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M296,132 L320,147" stroke="#2d5be3" strokeWidth="17" strokeLinecap="round" fill="none" />
      <path d="M320,147 L333,140" stroke="#2d5be3" strokeWidth="15" strokeLinecap="round" fill="none" />
      <rect x="273" y="96" width="14" height="18" rx="6" fill="#c98b67" />
      <circle cx="281" cy="85" r="21" fill={`url(#${id}-skin)`} />
      <ellipse cx="300" cy="88" rx="5" ry="7" fill="#b97a57" />
      <path
        d="M259,91 C255,63 277,55 291,61 C303,65 303,77 296,81 C289,87 287,99 279,103 C269,105 261,99 259,91 Z"
        fill="#1b1b1f"
      />
      <path
        d="M261,87 C263,55 301,55 301,85"
        fill="none"
        stroke="#f26b38"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <rect x="295" y="79" width="10" height="17" rx="5" fill="#f26b38" stroke="#14161a" strokeWidth="1" />
      <polygon
        points="230,204 272,228 272,183 230,158"
        fill="#2a2d35"
        stroke="#14161a"
        strokeWidth="10"
        strokeLinejoin="round"
      />
      <g transform="translate(-352 0)">
        <g className="motion-safe:animate-float">
          <rect
            x="372"
            y="20"
            width="168"
            height="92"
            rx="12"
            fill="#ffffff"
            stroke="#14161a"
            strokeWidth="1"
          />
          <circle cx="388" cy="36" r="3.5" fill="#f26b38" />
          <circle cx="400" cy="36" r="3.5" fill="#d6d9df" />
          <circle cx="412" cy="36" r="3.5" fill="#d6d9df" />
          <text x="386" y="62" fontSize="11" fill="#2d5be3" fontFamily="Geist Mono, monospace">
            @PostMapping
          </text>
          <text x="386" y="78" fontSize="11" fill="#14161a" fontFamily="Geist Mono, monospace">
            emitir(poliza)
          </text>
          <text x="386" y="96" fontSize="11" fill="#2f7d5b" fontFamily="Geist Mono, monospace">
            → 201 Created
          </text>
        </g>
      </g>
      <g transform="translate(370 330)">
        <g className="motion-safe:animate-float-slow">
          <rect x="24" y="64" width="140" height="34" rx="17" fill="#14161a" />
          <circle cx="44" cy="81" r="4" fill="#5ad19a" />
          <text x="56" y="85.5" fontSize="11.5" fill="#ffffff" fontFamily="Geist Mono, monospace">
            build ✓ prod
          </text>
        </g>
      </g>
    </svg>
  );
}
