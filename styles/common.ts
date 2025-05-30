export const commonStyles = {
  // Interactive states
  interactive: `
    hover:bg-[var(--hover)] hover:text-white
    data-[state=open]:hover:bg-[var(--hover)] data-[state=open]:hover:text-white
    focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent
    active:bg-[var(--hover)] active:text-white
    tap-highlight-transparent
  `,

  // Sidebar specific styles
  sidebar: {
    container: "border-r border-[#2c2d3c] text-[#d2d3e0]",
    header: "border-b border-[#2c2d3c] bg-[var(--background-dark)]",
    content: "bg-[var(--background-dark)]",
    footer: "bg-[var(--background-dark)]",
  },

  // Navigation styles
  nav: {
    button: `
      flex items-center gap-2
      hover:bg-[var(--hover)] hover:text-white
      active:bg-[var(--hover)] active:text-white
      data-[state=open]:hover:bg-[var(--hover)] data-[state=open]:hover:text-white
      focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent
    `,
    subButton: `
      hover:bg-[var(--hover)] hover:text-white
      data-[state=open]:hover:bg-[var(--hover)] data-[state=open]:hover:text-white
      focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent
      active:bg-[var(--hover)] active:text-white
      tap-highlight-transparent
    `,
  },
} as const;
