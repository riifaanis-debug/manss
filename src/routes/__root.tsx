import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "إختصار من أنا" },
      { name: "description", content: "صفحة شخصية تفاعلية تعرض نبذة عني ، مع معرض مليء بالصور والفيديو" },
      { name: "author", content: "منصور" },
      { property: "og:title", content: "إختصار من أنا" },
      { property: "og:description", content: "صفحة شخصية تفاعلية تعرض نبذة عني ، مع معرض مليء بالصور والفيديو" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "إختصار من أنا" },
      { name: "twitter:description", content: "صفحة شخصية تفاعلية تعرض نبذة عني ، مع معرض مليء بالصور والفيديو" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/jYTr5ou8o6gflDORAwy76JRAR7n2/social-images/social-1775941799347-WhatsApp_Image_2026-04-12_at_12.09.45_AM.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/jYTr5ou8o6gflDORAwy76JRAR7n2/social-images/social-1775941799347-WhatsApp_Image_2026-04-12_at_12.09.45_AM.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    // Prevent keyboard shortcuts for screenshots/save
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'p') ||
        (e.ctrlKey && e.shiftKey && e.key === 'S') ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))
      ) {
        e.preventDefault();
      }
    };
    // Blur page when visibility changes (screen recording detection)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        document.body.style.filter = 'blur(20px)';
      } else {
        document.body.style.filter = 'none';
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <Outlet />;
}
