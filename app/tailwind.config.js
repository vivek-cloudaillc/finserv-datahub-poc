/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        'tight-1': '-0.01em',
      },
      colors: {
        // Clean blue & white — bright, modern, financial-grade.
        sidebar: {
          DEFAULT: '#0F172A',  // slate-900 — near-black with blue undertone
          elev: '#1E293B',     // slate-800 hover
          text: '#E2E8F0',     // slate-200
          muted: '#94A3B8',    // slate-400
        },
        canvas: {
          light: '#F8FAFC',    // slate-50 — almost white, no warmth
          dark: '#0B1220',     // deep canvas for dark mode
        },
        card: {
          light: '#FFFFFF',
          dark: '#111B2E',     // slate-blue card on dark canvas
        },
        line: {
          light: '#E2E8F0',    // slate-200
          dark: '#1F2A44',
        },
        ink: {
          light: '#0F172A',    // slate-900
          dim: '#64748B',      // slate-500
          dark: '#E2E8F0',     // slate-200 on dark
          dimdark: '#94A3B8',  // slate-400
        },
        // Primary brand chrome — vibrant, recognizable blue.
        accent: {
          DEFAULT: '#1D4ED8',  // blue-700 — crisp, vivid, professional
          hover: '#1E40AF',    // blue-800
          soft: '#EFF6FF',     // blue-50 — very pale wash
          dark: '#60A5FA',     // blue-400 — legible on dark canvas
          darkhover: '#3B82F6',// blue-500
        },
        gold: {
          DEFAULT: '#B58A2A',  // institutional gold (used sparingly for AUM/wealth)
          soft: '#F4EBD2',
          dark: '#D6AB4A',
        },
        ok: '#16A34A',         // green-600
        warn: '#D97706',       // amber-600
        danger: '#DC2626',     // red-600
        info: '#1D4ED8',       // = primary
        mnpi: '#7C3AED',       // violet-600 for MNPI signaling
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        chip: '6px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        pop: '0 10px 30px rgba(15, 23, 42, 0.18)',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
