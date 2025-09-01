import {
  MetaFunction,
} from "@remix-run/node";
import {
  Outlet,
} from "@remix-run/react";

export const meta: MetaFunction = () => [{ title: "TankMate | Tank Details" }];

export default function TankPage() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

