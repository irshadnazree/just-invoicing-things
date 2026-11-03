import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import Footer from "@/components/shared/footer";
import Navbar from "@/components/shared/navbar";
import { ThemeProvider } from "@/lib/provider/theme-provider";
import { AppToastProvider } from "@/lib/provider/toast-provider";
import { getThemeServerFn } from "@/lib/theme";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: ({ loaderData }) => {
    const theme = loaderData as "light" | "dark" | undefined;
    return {
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          name: "theme-color",
          content: theme === "dark" ? "#0a0a0a" : "#ffffff",
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
    };
  },
  loader: () => getThemeServerFn(),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const theme = Route.useLoaderData();
  return (
    <html data-theme={theme} lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col items-center">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-ink"
          href="#main-content"
        >
          Skip to main content
        </a>
        <AppToastProvider>
          <ThemeProvider theme={theme}>
            <Navbar />
            <main
              className="mx-auto my-2 w-full max-w-400 grow px-4 md:my-3 md:px-8 lg:px-16 xl:my-4 xl:px-25"
              id="main-content"
            >
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </AppToastProvider>
        <Scripts />
      </body>
    </html>
  );
}
