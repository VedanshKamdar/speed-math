// Icons.jsx — line-stroked SVG icon set. Replaces the ⚡📝🎯📊🔥 emoji.
// All icons share viewBox 0 0 20 20, stroke=1.6, currentColor.

function Icon({ children, size = 20, sw = 1.6, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconBolt        = (p) => <Icon {...p}><path d="M11 2 4 11h4l-1 7 7-9h-4l1-7Z" /></Icon>
export const IconList        = (p) => <Icon {...p}><path d="M7 5h9M7 10h9M7 15h9" /><circle cx="4" cy="5" r="0.8" fill="currentColor" /><circle cx="4" cy="10" r="0.8" fill="currentColor" /><circle cx="4" cy="15" r="0.8" fill="currentColor" /></Icon>
export const IconTarget      = (p) => <Icon {...p}><circle cx="10" cy="10" r="7" /><circle cx="10" cy="10" r="3.5" /><circle cx="10" cy="10" r="0.8" fill="currentColor" /></Icon>
export const IconHome        = (p) => <Icon {...p}><path d="M3 10 10 4l7 6v7a1 1 0 0 1-1 1h-3v-5H7v5H4a1 1 0 0 1-1-1v-7Z" /></Icon>
export const IconChart       = (p) => <Icon {...p}><path d="M3 17h14M6 13v-3M10 13V7M14 13v-5" /></Icon>
export const IconBook        = (p) => <Icon {...p}><path d="M4 4h8a3 3 0 0 1 3 3v10H7a3 3 0 0 1-3-3V4Z" /><path d="M4 14a3 3 0 0 1 3-3h8" /></Icon>
export const IconClock       = (p) => <Icon {...p}><circle cx="10" cy="10" r="7" /><path d="M10 6v4l3 2" /></Icon>
export const IconFlame       = (p) => <Icon {...p}><path d="M10 17c3 0 5-2 5-5 0-3-2-4-2-7 0 0-2 1-3 4-1-1-2-2-2-3 0 0-3 2-3 6s2 5 5 5Z" /></Icon>
export const IconCheck       = (p) => <Icon {...p}><path d="M4 10.5 8 14l8-8" /></Icon>
export const IconX           = (p) => <Icon {...p}><path d="M5 5l10 10M15 5 5 15" /></Icon>
export const IconArrowRight  = (p) => <Icon {...p}><path d="M4 10h12M11 5l5 5-5 5" /></Icon>
export const IconArrowLeft   = (p) => <Icon {...p}><path d="M16 10H4M9 5l-5 5 5 5" /></Icon>
export const IconClose       = (p) => <Icon {...p}><path d="M5 5l10 10M15 5 5 15" /></Icon>
export const IconSettings    = (p) => <Icon {...p}><circle cx="10" cy="10" r="2.2" /><path d="M10 3v2M10 15v2M3 10h2M15 10h2M5 5l1.4 1.4M13.6 13.6 15 15M5 15l1.4-1.4M13.6 6.4 15 5" /></Icon>
export const IconChevron     = (p) => <Icon {...p}><path d="M7 5l5 5-5 5" /></Icon>
export const IconChevronDown = (p) => <Icon {...p}><path d="M5 8l5 5 5-5" /></Icon>
export const IconSun         = (p) => <Icon {...p}><circle cx="10" cy="10" r="3.2" /><path d="M10 3v2M10 15v2M3 10h2M15 10h2M5 5l1.4 1.4M13.6 13.6 15 15M5 15l1.4-1.4M13.6 6.4 15 5" /></Icon>
export const IconMoon        = (p) => <Icon {...p}><path d="M15 12a6 6 0 0 1-7-7 6 6 0 1 0 7 7Z" /></Icon>
export const IconSparkle     = (p) => <Icon {...p}><path d="M10 3v6M10 11v6M3 10h6M11 10h6" /></Icon>
