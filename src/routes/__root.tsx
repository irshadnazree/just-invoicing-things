import {
  THEME_STORAGE_KEY,
  themeScript,
  ToastProvider,
  useTheme,
} from "@irshadnazree/just-things-ui";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";

import Footer from "@/components/shared/footer";
import Navbar from "@/components/shared/navbar";

import appCss from "../styles.css?url";

// --jt-base in each theme, for the browser's own chrome
const THEME_COLORS = { light: "#edece7", dark: "#0c0d0f" } as const;

// Before just-things-ui the choice lived in a cookie; carry it over once, before themeScript reads it.
const legacyThemeScript = `(function(){try{if(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}))return;var m=document.cookie.match(/(?:^|; )_preferred-theme=(light|dark)(?:;|$)/);if(m)localStorage.setItem(${JSON.stringify(THEME_STORAGE_KEY)},m[1]);document.cookie="_preferred-theme=; Max-Age=0; path=/"}catch(e){}})()`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      // Follows the system until hydration; ThemeColor then follows the chosen theme
      {
        name: "theme-color",
        content: THEME_COLORS.light,
        media: "(prefers-color-scheme: light)",
      },
      {
        name: "theme-color",
        content: THEME_COLORS.dark,
        media: "(prefers-color-scheme: dark)",
      },
      {
        title: "Just an Invoicing Generator",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Puts the stored theme on <html> before the first paint */}
        {/* oxlint-disable-next-line react/no-danger */}
        <script
          dangerouslySetInnerHTML={{
            __html: `${legacyThemeScript};${themeScript}`,
          }}
        />
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col items-center">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-control focus:bg-accent focus:px-4 focus:py-2 focus:text-(--jt-accent-ink)"
          href="#main-content"
        >
          Skip to main content
        </a>
        <ToastProvider>
          <ThemeColor />
          <Navbar />
          <main
            className="mx-auto my-2 w-full max-w-400 grow px-4 md:my-3 md:px-8 lg:px-16 xl:my-4 xl:px-25"
            id="main-content"
          >
            {children}
          </main>
          <Footer />
        </ToastProvider>
        <Scripts />
      </body>
    </html>
  );
}

/** Points both theme-color tags at the resolved theme, so a forced theme wins over the system. */
function ThemeColor() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    for (const meta of document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]'
    )) {
      meta.content = THEME_COLORS[resolvedTheme];
    }
  }, [resolvedTheme]);
  return null;
}
