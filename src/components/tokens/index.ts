/**
 * Enterprise Design Tokens (TypeScript)
 * Source of Truth: docs/UI_UX_GUIDELINES.md §2
 */

export const tokens = {
  colors: {
    canvas: 'bg-slate-50 dark:bg-zinc-950',
    surface: 'bg-white dark:bg-gray-900',
    surfaceElevated: 'bg-slate-100 dark:bg-gray-800',
    surfaceHover: 'hover:bg-slate-50 dark:hover:bg-zinc-900',
    border: 'border-slate-200 dark:border-gray-800',
    borderSubtle: 'border-slate-100 dark:border-slate-800',
    textPrimary: 'text-slate-900 dark:text-slate-50',
    textSecondary: 'text-slate-600 dark:text-slate-400',
    textMuted: 'text-slate-400 dark:text-slate-500',
    actionPrimary: 'bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-500 dark:hover:bg-sky-600',
    actionSubtle: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 dark:focus-visible:ring-sky-400',
  },
  typography: {
    titlePage: 'text-xl font-semibold leading-7', // 20px
    titleSection: 'text-base font-semibold leading-6', // 16px
    titleSub: 'text-sm font-semibold leading-5', // 14px
    bodyRegular: 'text-sm font-normal leading-5', // 14px
    bodyMedium: 'text-sm font-medium leading-5', // 14px
    caption: 'text-xs font-normal leading-4', // 12px
    badge: 'text-xs font-medium leading-4', // 12px
    monoCode: 'font-mono text-[13px] font-medium leading-[18px]',
  },
  geometry: {
    controlHeight: 'h-9', // 36px
    controlHeightSm: 'h-7.5', // 30px
    tableRowHeight: 'h-10', // 40px
    radiusSm: 'rounded', // 4px
    radiusMd: 'rounded-md', // 6px
    radiusLg: 'rounded-lg', // 8px
  },
} as const;
