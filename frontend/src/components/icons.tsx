import type { SVGProps } from 'react'

/** 图标集（线性，fill=currentColor） */
const base = (props: SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 24 24',
  width: '1em',
  height: '1em',
  fill: 'currentColor',
  ...props,
})

export const IconBold = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M15.6 11.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 7.5h3a1.5 1.5 0 0 1 0 3h-3v-3zm3.5 9H10v-3h3.5a1.5 1.5 0 0 1 0 3z" />
  </svg>
)

export const IconItalic = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
  </svg>
)

export const IconUnderline = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zM5 19v2h14v-2H5z" />
  </svg>
)

export const IconStrike = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM7 14h10v-2H7v2z" />
  </svg>
)

export const IconHighlight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M5 18h14v2H5z" opacity=".5" />
    <path d="M3 5l9 9-4 4-5-5z" />
  </svg>
)

export const IconRedMark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
  </svg>
)

export const IconCode = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
  </svg>
)

export const IconH3 = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M5 4v3h5.5v12h3V7H19V4z" />
  </svg>
)

export const IconParagraph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M14 17h-2V7h2a3 3 0 0 1 0 6h-2v2h2a5 5 0 0 0 0-10H6v2h4v12H6v2h10v-2h-2v-2z" />
  </svg>
)

export const IconQuote = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M7.17 7A4.17 4.17 0 0 0 3 11.17V18h6.83v-6.83H6.5A2.5 2.5 0 0 1 9 8.67V7H7.17zm10 0A4.17 4.17 0 0 0 13 11.17V18h6.83v-6.83H16.5A2.5 2.5 0 0 1 19 8.67V7h-1.83z" />
  </svg>
)

export const IconUndo = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
  </svg>
)

export const IconRedo = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
  </svg>
)

export const IconListUl = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 10.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S2.5 12.83 2.5 12s.67-1.5 1.5-1.5zm0-6c.83 0 1.5.67 1.5 1.5S4.83 7.5 4 7.5 2.5 6.83 2.5 6s.67-1.5 1.5-1.5zm0 12c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
  </svg>
)

export const IconListOl = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
  </svg>
)

export const IconDivider = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 11h18v2H3v-2z" />
  </svg>
)

export const IconImage = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
  </svg>
)

export const IconSave = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  </svg>
)

export const IconMic = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.3 6-6.72h-1.7z" />
  </svg>
)

export const IconMenu = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
)

export const IconBook = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14zM20 21H6.5A2.5 2.5 0 0 1 4 18.5V21h16z" />
  </svg>
)

export const IconPlus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
)

export const IconBack = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
)

export const IconChevronDown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </svg>
)

export const IconEdit = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
)

export const IconTrash = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
)

export const IconClose = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)
