import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import "./index.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Irrigation Controller" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <title>Irrigation Controller</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  // Silently ignore browser extension files and source maps
  if (isRouteErrorResponse(error)) {
    const url = typeof window !== 'undefined' ? window.location.pathname : '';
    if (url.endsWith('.js.map') || url.endsWith('.css.map') ||
        url.includes('installHook') || url.includes('__react_devtools')) {
      return null;
    }

    if (error.status === 404) {
      return (
        <div>
          <h1>404 - Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
        </div>
      );
    }
  }

  return (
    <div>
      <h1>Error</h1>
      <p>Something went wrong.</p>
    </div>
  );
}

export default function Root() {
  return <Outlet />;
}
