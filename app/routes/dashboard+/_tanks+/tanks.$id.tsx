import {
  MetaFunction,
} from "@remix-run/node";
import {
  Outlet,
} from "@remix-run/react";

export const meta: MetaFunction = () => [{ title: "ReefChronicles | Tank Details" }];

export default function TankPage() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

