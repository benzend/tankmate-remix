import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
} from "@remix-run/react";

import { useEffect, useRef, useState } from "react";
import { Button } from "#app/components/ui/button.js";
import { Input } from "#app/components/ui/input.js";
import { Logo } from "#app/components/ui/logo.js";
import { requireUserId } from "#app/utils/auth.server.js";
import { getHints } from "#app/utils/client-hints.js";
import { getDomainUrl, humanize, toTitleCase } from "#app/utils/misc.js";
import { getTheme } from "#app/utils/theme.server.js";
import { type SearchResult } from "../resources+/search";
import { ThemeSwitch } from "../resources+/theme-switch";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request, { redirectTo: "/" });

  return json({
    requestInfo: {
      hints: getHints(request),
      origin: getDomainUrl(request),
      path: new URL(request.url).pathname,
      userPrefs: {
        theme: getTheme(request),
      },
    },
  });
}

export default function DashboardLayout() {
  return (
    <main className="bg-background text-gray-100">
      <Nav />
      <div className="flex min-h-[calc(100vh-98px)] pt-28 md:pt-0">
        <SideNav />
        <div className="w-full overflow-y-auto px-6 pt-4">
          <div className="pb-24 md:pb-10">
            <Outlet />
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </main>
  );
}

const SideNav = () => {
  const data = useLoaderData<typeof loader>();
  const location = useLocation();
  return (
    <nav className="hidden w-60 flex-col justify-between rounded-tr-xl bg-accent-background p-5 md:flex">
      <TopOfSidenav>
        <Link to="/dashboard">
          <Button
            variant={
              location.pathname === "/dashboard" ? "sidenav-active" : "sidenav"
            }
            size="full"
            className="mb-4"
          >
            Dashboard
          </Button>
        </Link>
        <Link to="/dashboard/coral-analyses">
          <Button
            variant={
              location.pathname === "/dashboard/coral-analyses"
                ? "sidenav-active"
                : "sidenav"
            }
            size="full"
            className="mb-4"
          >
            Coral Analyzer
          </Button>
        </Link>
        <Link to="/dashboard/dosing-calculator">
          <Button
            variant={
              location.pathname === "/dashboard/dosing-calculator"
                ? "sidenav-active"
                : "sidenav"
            }
            size="full"
            className="mb-4"
          >
            Dosing Calculator
          </Button>
        </Link>
        <Link to="/dashboard/galleries">
          <Button
            variant={
              location.pathname === "/dashboard/galleries"
                ? "sidenav-active"
                : "sidenav"
            }
            size="full"
            className="mb-4"
          >
            Galleries
          </Button>
        </Link>
        <Link to="/dashboard/profile">
          <Button
            variant={
              location.pathname === "/dashboard/profile"
                ? "sidenav-active"
                : "sidenav"
            }
            size="full"
            className="mb-4"
          >
            Profile
          </Button>
        </Link>
      </TopOfSidenav>

      <BottomOfSidenav>
        <Form method="POST" action="/logout" className="w-full">
          <Button type="submit" size="full">
            Logout
          </Button>
        </Form>
        <ThemeSwitch
          userPreference={data.requestInfo.userPrefs.theme}
          buttonClasses="w-full text-foreground py-2 mt-2 border rounded"
          after={({ mode }) => (
            <span className="ml-2 capitalize">{mode} Mode</span>
          )}
        />
      </BottomOfSidenav>
    </nav>
  );
};

const Nav = () => {
  const data = useLoaderData<typeof loader>();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="max-w-screen overflow-hidden">
      <nav className="flex fixed top-0 left-0 md:relative justify-between px-10 py-6 z-10 w-full bg-background">
        <div className="flex items-center gap-20">
          <Logo to="/dashboard" mode="follow-theme" />
          <div className="ml-2">
            <Breadcrumbs />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Search />
          <div className="relative md:hidden" ref={menuRef}>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Open menu"
            >
              <svg
                className="h-6 w-6 text-foreground"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v.01M12 12v.01M12 18v.01"
                />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-background p-2 shadow-lg">
                <Link
                  to="/dashboard/profile"
                  onClick={() => setMenuOpen(false)}
                >
                  <Button variant="ghost" size="full" className="justify-start">
                    Profile
                  </Button>
                </Link>
                <Link to="/settings/profile" onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" size="full" className="justify-start">
                    Settings
                  </Button>
                </Link>
                <div className="my-1 border-t" />
                <ThemeSwitch
                  userPreference={data.requestInfo.userPrefs.theme}
                  buttonClasses="w-full text-foreground py-2 px-4 border rounded"
                  after={({ mode }) => (
                    <span className="ml-2 capitalize">{mode} Mode</span>
                  )}
                />
                <div className="my-1 border-t" />
                <Form method="POST" action="/logout" className="w-full">
                  <Button
                    type="submit"
                    size="full"
                    variant="ghost"
                    className="justify-start text-destructive"
                  >
                    Logout
                  </Button>
                </Form>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

const MobileBottomNav = () => {
  const location = useLocation();

  const tabs = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      to: "/dashboard/coral-analyses",
      label: "Analyzer",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      ),
    },
    {
      to: "/dashboard/dosing-calculator",
      label: "Calculator",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A4.5 4.5 0 0111.8 19.5H7.5a2.25 2.25 0 01-2.25-2.25v-1.323a2.25 2.25 0 01.87-1.753L5 14.5m14.25.002v-2.25m0 2.25v3.75m0-3.75h-3.75m3.75 0h1.5" />
        </svg>
      ),
    },
    {
      to: "/dashboard/galleries",
      label: "Gallery",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6v12a2.25 2.25 0 002.25 2.25zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      to: "/dashboard/profile",
      label: "Profile",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              aria-current={isActive ? "page" : undefined}
              aria-label={tab.label}
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

function Breadcrumbs() {
  const location = useLocation();
  const validCrumbs = [
    ["dashboard"],
    ["tanks"],
    ["maintenance"],
    ["parameter-log"],
    ["coral-analyses", "Coral Analyzer"],
    ["dosing-calculator", "Dosing Calculator"],
    ["galleries"],
    ["profile"],
    ["new"],
  ];
  const to = (pathPart: string) => {
    const index = location.pathname.indexOf(pathPart);
    return location.pathname.slice(0, index + pathPart.length);
  };

  const findCrumbFromPathPart = (pathPart: string) => {
    return validCrumbs.filter((v) => v[0] === pathPart).at(0);
  };

  const labelFromPathPart = (pathPart: string) => {
    const crumb = findCrumbFromPathPart(pathPart);
    if (!crumb) return "";
    return crumb.at(1) || "";
  };

  const validPathParts = location.pathname
    .split("/")
    .filter(findCrumbFromPathPart);
  const crumbs = validPathParts.map((pathPart, i) => {
    const label = labelFromPathPart(pathPart);
    return {
      link: to(pathPart),
      label: label || toTitleCase(humanize(pathPart)),
      last: i === validPathParts.length - 1,
    };
  });

  const pathsWithSingles = ["/maintenance/", "/tanks/", "/parameter-log/"];
  const excludedLastPaths = ["/new"];

  const endElement = (() => {
    if (excludedLastPaths.some((_p) => location.pathname.includes(_p))) {
      return;
    }
    if (pathsWithSingles.some((_p) => location.pathname.includes(_p))) {
      const _split = location.pathname.split("/");
      return _split[_split.length - 1];
    }
  })();

  return (
    <div className="hidden gap-2 md:flex">
      {crumbs.map((crumb) => (
        <div key={crumb.label}>
          <Link to={crumb.link}>
            <span className="text-foreground">{crumb.label}</span>
          </Link>
          {!crumb.last && <span className="ml-2 text-foreground">{">"}</span>}
        </div>
      ))}
      {endElement && (
        <div>
          <span className="mr-2 text-foreground">{">"}</span>
          <Link to={to(endElement)}>
            <span className="text-foreground">{endElement}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

function TopOfSidenav({ children }: { children: any }) {
  return <div>{children}</div>;
}

function BottomOfSidenav({ children }: { children: any }) {
  return <div>{children}</div>;
}

interface SearchResponse {
  results: SearchResult[];
}

function isSearchResponse(data: unknown): data is SearchResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    Array.isArray((data as SearchResponse).results) &&
    (data as SearchResponse).results.every(
      (item): item is SearchResult =>
        typeof item === "object" &&
        item !== null &&
        "title" in item &&
        "url" in item &&
        (typeof item.title === "string" || item.title === null) &&
        (typeof item.url === "string" || item.url === null),
    )
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function Search() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAnswer, setExpandedAnswer] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay

  useEffect(() => {
    const abortController = new AbortController();

    const performSearch = async () => {
      if (debouncedSearchQuery.length > 2) {
        setIsSearching(true);
        try {
          const response = await fetch(
            `/resources/search?query=${encodeURIComponent(debouncedSearchQuery)}`,
            {
              signal: abortController.signal,
            },
          );
          const data: unknown = await response.json();

          // Only update if the request wasn't aborted
          if (!abortController.signal.aborted) {
            if (isSearchResponse(data)) {
              setSearchResults(data.results);
            } else {
              console.error("Invalid search response format");
              setSearchResults([]);
            }
          }
        } catch (error) {
          // Only log and update state if the request wasn't aborted
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          if (!abortController.signal.aborted) {
            setIsSearching(false);
          }
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    };

    performSearch().catch((err) => console.error("failed to search", err));

    // Cleanup: abort any pending requests when the query changes or component unmounts
    return () => {
      abortController.abort();
    };
  }, [debouncedSearchQuery]);

  return (
    <>
      {/* Mobile Search */}
      <div className="relative md:hidden">
        {isMobileSearchOpen ? (
          <div className="fixed inset-x-0 top-0 z-50 bg-background p-4">
            <div className="relative flex items-center">
              <Form
                method="GET"
                action="/resources/search"
                className="w-full"
                onChange={(e) => {
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  const query = formData.get("search");
                  setSearchQuery(query?.toString() || "");
                }}
              >
                <div className="relative">
                  <svg
                    className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <Input
                    placeholder="Search or ask a question"
                    id="search-mobile"
                    name="search"
                    className="w-full pl-8 pr-8"
                    autoFocus
                  />
                </div>
                <button hidden type="submit" />
              </Form>
              <button
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Search Results */}
            {(searchResults.length > 0 || isSearching) && (
              <div className="absolute left-0 right-0 mt-2 max-h-[60vh] overflow-y-auto bg-background p-4 shadow-lg">
                {isSearching ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : (
                  searchResults.map((result, index) => (
                    // ... same result rendering as desktop ...
                    <div key={index} className="mb-2 last:mb-0">
                      {result.url ? (
                        <a href={result.url} target="_blank">
                          <div className="w-full rounded-md p-2 text-left hover:bg-accent">
                            <span className="text-lg font-medium">
                              {result.title}
                            </span>
                            <span className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {result.content}
                            </span>
                          </div>
                        </a>
                      ) : (
                        <button
                          className="w-full rounded-md p-2 text-left hover:bg-accent"
                          onClick={() => {
                            if (
                              index === 0 &&
                              result.title === "Expert Answer"
                            ) {
                              setExpandedAnswer(!expandedAnswer);
                            } else {
                              if (result.url) {
                                window.location.assign(result.url);
                                setSearchResults([]);
                                setIsMobileSearchOpen(false);
                              }
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-medium">
                              {result.title}
                            </div>
                            {index === 0 &&
                              result.title === "Expert Answer" && (
                                <div className="text-xs text-muted-foreground">
                                  {expandedAnswer ? "↑ Collapse" : "↓ Expand"}
                                </div>
                              )}
                          </div>
                          {result.content && (
                            <div
                              className={`mt-1 text-sm text-muted-foreground ${
                                index === 0 && result.title === "Expert Answer"
                                  ? expandedAnswer
                                    ? ""
                                    : "line-clamp-2"
                                  : "line-clamp-2"
                              }`}
                            >
                              {result.content}
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full"
          >
            <svg
              className="h-6 w-6 text-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Desktop Search */}
      <div className="relative hidden md:block">
        <Form
          method="GET"
          action="/resources/search"
          onChange={(e) => {
            const form = e.currentTarget;
            const formData = new FormData(form);
            const query = formData.get("search");
            setSearchQuery(query?.toString() || "");
          }}
        >
          <div className="relative">
            <svg
              className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              placeholder="Search or ask a question"
              id="search"
              name="search"
              className="w-[300px] pl-8"
            />
          </div>
          <button hidden type="submit" />
        </Form>

        {/* Search Results Dropdown */}
        {(searchResults.length > 0 || isSearching) && (
          <div
            className={`absolute top-full mt-1 w-[300px] rounded-md border bg-background p-2 shadow-lg ${
              expandedAnswer ? "max-h-[80vh] overflow-y-auto" : ""
            }`}
          >
            {isSearching ? (
              <div className="p-2 text-sm text-muted-foreground">
                Searching...
              </div>
            ) : (
              searchResults.map((result, index) => {
                const isExpertAnswer =
                  index === 0 && result.title === "Expert Answer";

                return (
                  <div key={index} className="mb-2 last:mb-0">
                    {result.url ? (
                      <a href={result.url} target="_blank">
                        <div className="w-full rounded-md p-2 text-left hover:bg-accent">
                          <span className="text-lg font-medium">
                            {result.title}
                          </span>
                          <span className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {result.content}
                          </span>
                        </div>
                      </a>
                    ) : (
                      <button
                        className="w-full rounded-md p-2 text-left hover:bg-accent"
                        onClick={() => {
                          if (isExpertAnswer) {
                            setExpandedAnswer(!expandedAnswer);
                          } else {
                            if (result.url) {
                              window.location.assign(result.url);
                              setSearchResults([]);
                            }
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-medium">
                            {result.title}
                          </div>
                          {isExpertAnswer && (
                            <div className="text-xs text-muted-foreground">
                              {expandedAnswer ? "↑ Collapse" : "↓ Expand"}
                            </div>
                          )}
                        </div>
                        {result.content && (
                          <div
                            className={`mt-1 text-sm text-muted-foreground ${
                              isExpertAnswer
                                ? expandedAnswer
                                  ? ""
                                  : "line-clamp-2"
                                : "line-clamp-2"
                            }`}
                          >
                            {result.content}
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}
