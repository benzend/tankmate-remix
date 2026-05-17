import { invariantResponse } from "@epic-web/invariant";
import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "#app/components/ui/button.tsx";
import { Icon } from "#app/components/ui/icon.tsx";
import { requireUserId } from "#app/utils/auth.server.ts";
import { prisma } from "#app/utils/db.server.ts";
import { getUserImgSrc, humanize, toTitleCase } from "#app/utils/misc.tsx";

export const meta: MetaFunction = () => [{ title: "ReefChronicles | Profile" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request, { redirectTo: "/" });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      createdAt: true,
      image: { select: { id: true } },
      subscription: {
        select: {
          plan: true,
          status: true,
          currentPeriodEnd: true,
        },
      },
      _count: {
        select: {
          fishTanks: true,
          CoralAnalysis: true,
          sessions: {
            where: {
              expirationDate: { gt: new Date() },
            },
          },
        },
      },
    },
  });

  invariantResponse(user, "No user", { status: 404 });

  const [
    maintenanceCount,
    parameterLogCount,
    latestMaintenance,
    latestParameterLog,
  ] = await Promise.all([
    prisma.fishTankMaintenance.count({
      where: { fishTank: { userId } },
    }),
    prisma.fishTankParameterLog.count({
      where: { fishTank: { userId } },
    }),
    prisma.fishTankMaintenance.findFirst({
      where: { fishTank: { userId } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        maintenanceType: true,
        fishTank: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.fishTankParameterLog.findFirst({
      where: { fishTank: { userId } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        fishTank: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  return json({
    user,
    stats: {
      tanks: user._count.fishTanks,
      coralAnalyses: user._count.CoralAnalysis,
      maintenanceLogs: maintenanceCount,
      parameterLogs: parameterLogCount,
      activeSessions: user._count.sessions,
    },
    latestMaintenance,
    latestParameterLog,
  });
}

export default function DashboardProfilePage() {
  const { user, stats, latestMaintenance, latestParameterLog } =
    useLoaderData<typeof loader>();
  const displayName = user.name ?? user.username;
  const joinedDate = formatDate(user.createdAt);
  const subscription = user.subscription;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 text-foreground">
      <section className="grid gap-6 rounded border bg-accent-background p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="relative h-28 w-28">
          <img
            src={getUserImgSrc(user.image?.id)}
            alt={displayName}
            className="h-full w-full rounded-full border object-cover"
          />
          <Button
            asChild
            variant="outline"
            size="icon"
            className="absolute -right-2 top-2 h-9 w-9 rounded-full"
          >
            <Link
              to="/settings/profile/photo"
              aria-label="Change profile photo"
            >
              <Icon name="camera" />
            </Link>
          </Button>
        </div>

        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Dashboard Profile</p>
          <h1 className="break-words text-3xl font-semibold">{displayName}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span>@{user.username}</span>
            <span>{user.email}</span>
            <span>Joined {joinedDate}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 md:justify-end">
          <Button asChild variant="outline">
            <Link to="/settings/profile">
              <Icon name="pencil-1">Edit profile</Icon>
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/users/${user.username}`}>
              <Icon name="avatar">Public profile</Icon>
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Tanks" value={stats.tanks} to="/dashboard/tanks" />
        <StatCard
          label="Coral analyses"
          value={stats.coralAnalyses}
          to="/dashboard/coral-analyses"
        />
        <StatCard
          label="Maintenance"
          value={stats.maintenanceLogs}
          to="/dashboard/maintenance"
        />
        <StatCard
          label="Parameters"
          value={stats.parameterLogs}
          to="/dashboard/parameter-log"
        />
        <StatCard label="Sessions" value={stats.activeSessions} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded border p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard/tanks/new">
                <Icon name="plus">Add tank</Icon>
              </Link>
            </Button>
          </div>
          <div className="grid gap-3">
            <ActivityItem
              title={
                latestMaintenance
                  ? toTitleCase(humanize(latestMaintenance.maintenanceType))
                  : "No maintenance logged yet"
              }
              description={
                latestMaintenance?.fishTank
                  ? `${latestMaintenance.fishTank.name} on ${formatDate(
                      latestMaintenance.createdAt,
                    )}`
                  : "Track water changes, cleanings, feedings, and other tank care."
              }
              to={
                latestMaintenance
                  ? `/dashboard/maintenance/${latestMaintenance.id}`
                  : "/dashboard/maintenance/new"
              }
            />
            <ActivityItem
              title={
                latestParameterLog
                  ? "Latest parameter log"
                  : "No parameters logged yet"
              }
              description={
                latestParameterLog?.fishTank
                  ? `${latestParameterLog.fishTank.name} on ${formatDate(
                      latestParameterLog.createdAt,
                    )}`
                  : "Start recording calcium, alkalinity, nitrate, salinity, and more."
              }
              to={
                latestParameterLog
                  ? `/dashboard/parameter-log/${latestParameterLog.id}`
                  : "/dashboard/parameter-log/new"
              }
            />
          </div>
        </section>

        <section className="rounded border p-5">
          <h2 className="text-xl font-semibold">Account</h2>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4 border-b pb-4">
              <div>
                <p className="font-medium">Subscription</p>
                <p className="text-muted-foreground">
                  {subscription
                    ? `${toTitleCase(subscription.plan)} - ${toTitleCase(
                        subscription.status,
                      )}`
                    : "Free - Active"}
                </p>
                {subscription?.currentPeriodEnd ? (
                  <p className="text-muted-foreground">
                    Renews {formatDate(subscription.currentPeriodEnd)}
                  </p>
                ) : null}
              </div>
              <Link
                to="/settings/profile/subscription"
                className="text-primary hover:underline"
              >
                Manage
              </Link>
            </div>
            <AccountLink
              to="/settings/profile/change-email"
              label="Change email"
            />
            <AccountLink
              to="/settings/profile/password"
              label="Change password"
            />
            <AccountLink
              to="/settings/profile/connections"
              label="Manage connections"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  to,
}: {
  label: string;
  value: number;
  to?: string;
}) {
  const content = (
    <div className="rounded border p-4 transition-colors hover:bg-accent">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

function ActivityItem({
  title,
  description,
  to,
}: {
  title: string;
  description: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-4 rounded border p-4 transition-colors hover:bg-accent"
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Icon name="arrow-right" className="shrink-0" />
    </Link>
  );
}

function AccountLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0 hover:text-primary"
    >
      <span>{label}</span>
      <Icon name="arrow-right" />
    </Link>
  );
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
