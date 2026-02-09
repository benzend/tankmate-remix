import { useLocation } from "@remix-run/react"
import { Logo } from "./logo"

export const MarketingFooter = () => {
  const location = useLocation();

  return (

    <>
      {!location.pathname.includes('dashboard') ? (
        <div className="px-10 flex items-center justify-between py-5 bg-slate-950 bg-gradient-to-l from-blue-800">
          <Logo />

          <p className="mx-10 text-sm text-gray-400">
            © 2024 - {new Date().getFullYear()} ReefChronicles. All Rights Reserved.
          </p>
        </div>
      ) : null}
    </>
  )
}
