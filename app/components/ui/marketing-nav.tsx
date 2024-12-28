import { Form, Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useOptionalUser } from "#app/utils/user.js";
import { Button } from "./button";
import { Logo } from "./logo";

export const MarketingNav = () => {
  const location = useLocation();
  const user = useOptionalUser();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (navOpen) setNavOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 left-0 px-10 py-4 md:py-6 bg-gradient-to-r bg-black from-blue-800 z-10 w-full">
      {navOpen && (
        <nav className="z-2 fixed left-0 top-0 h-screen w-screen bg-accent-background px-10">
          <header className="flex h-20 justify-between"></header>

          <div className="flex h-[calc(100vh-100px)] flex-col justify-between">
            <div className="text-center">
              <Button variant="outline" size="wide">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            </div>

            <div>
              <Form method="POST" action="/logout" className="text-center">
                <Button variant="default" size="full" type="submit">
                  Logout
                </Button>
              </Form>
            </div>
          </div>
        </nav>
      )}
      <nav className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap md:gap-8">
        <Logo />
        <Actions user={user} />
      </nav>
    </header>
  );
};

const Actions = ({ user }: { user: ReturnType<typeof useOptionalUser> }) => {
  return (
    <div className="flex items-center gap-10">
      {user ? (
        <button className="font-bold text-white">
          <Link to="/dashboard">Go to Dashboard</Link>
        </button>
      ) : (
        <>
          {/* mobile */}
          <span className="inline-block md:hidden">
            <Button asChild variant="default" size="default" className="font-bold">
              <Link to="/login">Sign in</Link>
            </Button>
          </span>
          {/* desktop */}
          <span className="hidden md:inline-block">
            <Button asChild variant="link" size="lg" className="font-bold">
              <Link to="/login">Sign in</Link>
            </Button>

            <Button asChild variant="default" size="lg" className="font-bold">
              <Link to="/signup">Create an Account</Link>
            </Button>
          </span>
        </>
      )}
    </div>
  );
};
