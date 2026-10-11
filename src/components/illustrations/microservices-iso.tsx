import { useId } from 'react';

/** Red isométrica de microservicios del hero (SVG del diseño). Los mensajes viajan solo si se permite el movimiento. */
export function MicroservicesIso({ label, animated }: { label: string; animated: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 640 540"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      className="block h-auto"
    >
      <defs>
        <linearGradient id={`${id}-cylg`} x1="0" x2="1">
          <stop offset="0" stopColor="#eef0f3" />
          <stop offset="1" stopColor="#d3d6dc" />
        </linearGradient>
      </defs>
      <g>
        <polygon points="51,294 318,448 318,428 51,274" fill="#e3e4de" />
        <polygon points="585,294 318,448 318,428 585,274" fill="#cfd1ca" />
        <polygon points="318,120 585,274 318,428 51,274" fill="#fbfbf8" />
      </g>
      <g stroke="#e3e4de" strokeWidth="1">
        <path d="M356,142 L89,296" />
        <path d="M280,142 L547,296" />
        <path d="M394,164 L128,318" />
        <path d="M242,164 L508,318" />
        <path d="M432,186 L166,340" />
        <path d="M204,186 L470,340" />
        <path d="M470,208 L204,362" />
        <path d="M166,208 L432,362" />
        <path d="M508,230 L242,384" />
        <path d="M128,230 L394,384" />
        <path d="M547,252 L280,406" />
        <path d="M89,252 L356,406" />
      </g>
      <path
        d="M318,274 L232,224 L318,175"
        fill="none"
        stroke="#14161a"
        strokeWidth="2"
        strokeDasharray="2 5"
        strokeLinecap="round"
        opacity=".55"
      />
      <path
        d="M318,274 L390,232 L470,278"
        fill="none"
        stroke="#14161a"
        strokeWidth="2"
        strokeDasharray="2 5"
        strokeLinecap="round"
        opacity=".55"
      />
      <path
        d="M470,278 L322,364"
        fill="none"
        stroke="#14161a"
        strokeWidth="2"
        strokeDasharray="2 5"
        strokeLinecap="round"
        opacity=".55"
      />
      <path
        d="M318,274 L240,319 L162,274"
        fill="none"
        stroke="#14161a"
        strokeWidth="2"
        strokeDasharray="2 5"
        strokeLinecap="round"
        opacity=".55"
      />
      {animated && (
        <g>
          <circle r="4" fill="#2d5be3" stroke="#fff" strokeWidth="2">
            <animateMotion
              dur="3.2s"
              begin="-0.01s"
              repeatCount="indefinite"
              path="M318,274 L232,224 L318,175"
            />
          </circle>
          <circle r="4" fill="#2d5be3" stroke="#fff" strokeWidth="2">
            <animateMotion
              dur="3.2s"
              begin="-1.61s"
              repeatCount="indefinite"
              path="M318,274 L232,224 L318,175"
            />
          </circle>
          <circle r="4" fill="#f26b38" stroke="#fff" strokeWidth="2">
            <animateMotion
              dur="2.6s"
              begin="-0.01s"
              repeatCount="indefinite"
              path="M318,274 L390,232 L470,278"
            />
          </circle>
          <circle r="4" fill="#f26b38" stroke="#fff" strokeWidth="2">
            <animateMotion
              dur="2.6s"
              begin="-1.31s"
              repeatCount="indefinite"
              path="M318,274 L390,232 L470,278"
            />
          </circle>
          <circle r="4" fill="#f26b38" stroke="#fff" strokeWidth="2">
            <animateMotion dur="2.9s" begin="-0.01s" repeatCount="indefinite" path="M470,278 L322,364" />
          </circle>
          <circle r="4" fill="#f26b38" stroke="#fff" strokeWidth="2">
            <animateMotion dur="2.9s" begin="-1.46s" repeatCount="indefinite" path="M470,278 L322,364" />
          </circle>
          <circle r="4" fill="#2d5be3" stroke="#fff" strokeWidth="2">
            <animateMotion
              dur="3.6s"
              begin="-0.01s"
              repeatCount="indefinite"
              path="M318,274 L240,319 L162,274"
            />
          </circle>
          <circle r="4" fill="#2d5be3" stroke="#fff" strokeWidth="2">
            <animateMotion
              dur="3.6s"
              begin="-1.81s"
              repeatCount="indefinite"
              path="M318,274 L240,319 L162,274"
            />
          </circle>
        </g>
      )}
      <g>
        <polygon
          points="276,175 318,199 318,151 276,127"
          fill="#eef0f3"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="360,175 318,199 318,151 360,127"
          fill="#d6d9df"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="318,102 360,127 318,151 276,127"
          fill="#ffffff"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
      <g>
        <polygon
          points="268,274 318,303 318,234 268,206"
          fill="#2d5be3"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="368,274 318,303 318,234 368,206"
          fill="#2346b1"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="318,177 368,206 318,234 268,206"
          fill="#5278e8"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
      <line
        x1="278"
        y1="264"
        x2="308"
        y2="282"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".55"
      />
      <line
        x1="278"
        y1="247"
        x2="308"
        y2="265"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".55"
      />
      <line
        x1="278"
        y1="231"
        x2="308"
        y2="248"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".55"
      />
      <g>
        <polygon
          points="120,274 162,298 162,265 120,241"
          fill="#eef0f3"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="204,274 162,298 162,265 204,241"
          fill="#d6d9df"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="162,217 204,241 162,265 120,241"
          fill="#ffffff"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
      <g>
        <polygon
          points="428,278 470,303 470,265 428,241"
          fill="#f26b38"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="512,278 470,303 470,265 512,241"
          fill="#bc532b"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="470,217 512,241 470,265 428,241"
          fill="#f4855b"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
      <g>
        <path
          d="M288,364 A33,19 0 0 0 355,364 L355,320 L288,320 Z"
          fill={`url(#${id}-cylg)`}
          stroke="#14161a"
          strokeWidth="1"
        />
        <ellipse cx="322" cy="320" rx="33" ry="19" fill="#ffffff" stroke="#14161a" strokeWidth="1" />
      </g>
      <path d="M288,350 A33,19 0 0 0 355,350" fill="none" stroke="#14161a" strokeWidth="1" />
      <path d="M288,335 A33,19 0 0 0 355,335" fill="none" stroke="#14161a" strokeWidth="1" />
      <g>
        <path d="M318,121 L318,95 L422,95" fill="none" stroke="#14161a" strokeWidth="1" />
        <circle cx="318" cy="121" r="2.5" fill="#14161a" />
        <rect x="375" y="73" width="94" height="44" rx="10" fill="#ffffff" stroke="#14161a" strokeWidth="1" />
        <text
          x="422"
          y="91"
          textAnchor="middle"
          fontSize="12.5"
          fontWeight="600"
          fill="#14161a"
          fontFamily="Bricolage Grotesque, sans-serif"
        >
          Portal API
        </text>
        <text
          x="422"
          y="107"
          textAnchor="middle"
          fontSize="10.5"
          fill="#4a4f59"
          fontFamily="Geist Mono, monospace"
        >
          NestJS
        </text>
      </g>
      <g>
        <path d="M470,235 L470,177" fill="none" stroke="#14161a" strokeWidth="1" />
        <circle cx="470" cy="235" r="2.5" fill="#14161a" />
        <rect
          x="431"
          y="155"
          width="80"
          height="44"
          rx="10"
          fill="#ffffff"
          stroke="#14161a"
          strokeWidth="1"
        />
        <text
          x="470"
          y="173"
          textAnchor="middle"
          fontSize="12.5"
          fontWeight="600"
          fill="#14161a"
          fontFamily="Bricolage Grotesque, sans-serif"
        >
          Broker
        </text>
        <text
          x="470"
          y="189"
          textAnchor="middle"
          fontSize="10.5"
          fill="#4a4f59"
          fontFamily="Geist Mono, monospace"
        >
          RabbitMQ
        </text>
      </g>
      <g>
        <path d="M318,200 L318,156 L190,156" fill="none" stroke="#14161a" strokeWidth="1" />
        <circle cx="318" cy="200" r="2.5" fill="#14161a" />
        <rect
          x="139"
          y="134"
          width="101"
          height="44"
          rx="10"
          fill="#ffffff"
          stroke="#14161a"
          strokeWidth="1"
        />
        <text
          x="190"
          y="152"
          textAnchor="middle"
          fontSize="12.5"
          fontWeight="600"
          fill="#14161a"
          fontFamily="Bricolage Grotesque, sans-serif"
        >
          Gateway
        </text>
        <text
          x="190"
          y="168"
          textAnchor="middle"
          fontSize="10.5"
          fill="#4a4f59"
          fontFamily="Geist Mono, monospace"
        >
          Spring Boot
        </text>
      </g>
      <g>
        <path d="M162,235 L162,320 L92,320" fill="none" stroke="#14161a" strokeWidth="1" />
        <circle cx="162" cy="235" r="2.5" fill="#14161a" />
        <rect x="48" y="298" width="87" height="44" rx="10" fill="#ffffff" stroke="#14161a" strokeWidth="1" />
        <text
          x="92"
          y="316"
          textAnchor="middle"
          fontSize="12.5"
          fontWeight="600"
          fill="#14161a"
          fontFamily="Bricolage Grotesque, sans-serif"
        >
          Realtime
        </text>
        <text
          x="92"
          y="332"
          textAnchor="middle"
          fontSize="10.5"
          fill="#4a4f59"
          fontFamily="Geist Mono, monospace"
        >
          Socket.IO
        </text>
      </g>
      <g>
        <path d="M322,314 L322,320 L418,320" fill="none" stroke="#14161a" strokeWidth="1" />
        <circle cx="322" cy="314" r="2.5" fill="#14161a" />
        <rect
          x="371"
          y="298"
          width="94"
          height="44"
          rx="10"
          fill="#ffffff"
          stroke="#14161a"
          strokeWidth="1"
        />
        <text
          x="418"
          y="316"
          textAnchor="middle"
          fontSize="12.5"
          fontWeight="600"
          fill="#14161a"
          fontFamily="Bricolage Grotesque, sans-serif"
        >
          Analytics
        </text>
        <text
          x="418"
          y="332"
          textAnchor="middle"
          fontSize="10.5"
          fill="#4a4f59"
          fontFamily="Geist Mono, monospace"
        >
          PostgreSQL
        </text>
      </g>
      <g className="motion-safe:animate-float">
        <polygon
          points="575,148 592,157 592,138 575,128"
          fill="#2d5be3"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="610,148 592,157 592,138 610,128"
          fill="#2346b1"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="592,118 610,128 592,138 575,128"
          fill="#5278e8"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
      <g className="motion-safe:animate-float-slow">
        <polygon
          points="38,185 51,193 51,177 38,170"
          fill="#14161a"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="65,185 51,193 51,177 65,170"
          fill="#0f1114"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="51,162 65,170 51,177 38,170"
          fill="#3e3f43"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
      <g className="motion-safe:animate-float-fast">
        <polygon
          points="223,285 234,292 234,278 223,272"
          fill="#f26b38"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="246,285 234,292 234,278 246,272"
          fill="#bc532b"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="234,265 246,272 234,278 223,272"
          fill="#f4855b"
          stroke="#14161a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
