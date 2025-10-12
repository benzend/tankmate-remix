import { Icon } from "#app/components/ui/icon.js";
import { requireUserId } from "#app/utils/auth.server.js";
import { prisma } from "#app/utils/db.server.js";
import { Line as LineChart } from "react-chartjs-2";
import { cn, DateFrom, formatDateBasedOnRecency, humanize, toTitleCase } from "#app/utils/misc.js";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useActionData, useLoaderData, useLocation, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getMeasurementFromParameter } from "../_parameter-log+/parameter-log.new";
import { UploadButton } from "#app/utils/uploadthing.js";

import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Plugin,
} from "chart.js";
Chart.register(CategoryScale);
Chart.register(LinearScale);
Chart.register(PointElement);
Chart.register(LineElement);


export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request, { redirectTo: "/" });
  const data = await request.formData();

  const tank = await prisma.fishTank.findFirst({
    where: { id: params.id, userId },
    select: {
      id: true,
    },
  });

  if (!tank) {
    return redirect("/dashboard");
  }

  const name = data.get("name");

  if (typeof name !== "string") {
    return json({
      error: `name (${String(name)}) isnt a valid string`,
      success: false,
    });
  }

  if (!name) {
    return json({ error: `name is an empty string`, success: false });
  }

  try {
    await prisma.fishTank.update({
      where: { id: tank.id, userId },
      data: {
        name,
      },
    });
  } catch {
    return json({ error: "failed to update tank name", success: false });
  }

  return json({ error: null, success: true });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request, { redirectTo: "/" });

  const tank = await prisma.fishTank.findFirst({
    where: { id: params.id, userId },
    select: {
      id: true,
      name: true,
      fishTankScores: {
        select: {
          id: true,
          result: true,
          imageUrl: true,
        },
      },
      gallery: {
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          altText: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      fishTankMaintenances: {
        select: {
          id: true,
          createdAt: true,
          maintenanceType: true,
          extraDetails: true,
        },
      },
      parameterLogs: {
        select: {
          id: true,
          temp: true,
          alk: true,
          calcium: true,
          magnesium: true,
          salinity: true,
          pH: true,
          nitrate: true,
          phosphate: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      imageUrl: true,
      volume: true,
      waterType: true,
    },
  });

  if (!tank) {
    return redirect("/dashboard");
  }

  return json({ tank });
}
export default function TankOverviewPage() {
  const actionData = useActionData<typeof action>();

  const { tank } = useLoaderData<typeof loader>();

  const location = useLocation();

  const [editName, setEditName] = useState(tank.name);
  const [editingName, setEditingName] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const submit = useSubmit();

  const handleEditTankNameClick = () => {
    setEditingName(true);
  };

  const handleCancelEditTankNameClick = () => {
    setEditingName(false);
  };

  const handleInputNameChange = (e: React.FormEvent<HTMLInputElement>) => {
    setEditName(e.currentTarget.value);
  };

  const handleSaveTankNameClick = () => {
    const formData = new FormData();
    formData.append("name", editName);
    submit(formData, { method: "POST" });
  };

  const handleImageClick = () => {
    setImageModalOpen(true);
  };

  const handleCloseModal = () => {
    setImageModalOpen(false);
  };

  useEffect(() => {
    if (actionData?.success) {
      setEditingName(false);
    }
  }, [actionData]);

  const tankImageUrls = tank.fishTankScores
    .map((s) => s.imageUrl)
    .filter(Boolean);
  const latestImage = tankImageUrls[tankImageUrls.length - 1] || tank.imageUrl;

  const updateImageUrl = (url: string) => {
    const formData = new FormData();
    formData.append("tankId", tank.id);
    formData.append("imageUrl", url);
    submit(formData, { method: "POST", action: `/dashboard/tanks/${tank.id}/update` });
    tank.imageUrl = url;
  };

  return (
    <>
      <header>
        <Link to="/dashboard/tanks">
          <span className="flex gap-1 text-muted-foreground">
            <Icon name="arrow-left" /> Tanks
          </span>
        </Link>
        <br className="mb-4" />
        {editingName ? (
          <div>
            <input
              type="text"
              value={editName}
              onChange={handleInputNameChange}
              className="mr-4 rounded bg-slate-100 px-2 py-2 text-center text-base font-bold text-foreground outline-white dark:bg-slate-800 md:text-lg lg:text-left lg:text-2xl"
            />
            <button
              className="mr-4 text-foreground"
              onClick={handleSaveTankNameClick}
            >
              Save
            </button>
            <button
              className="text-red-300"
              onClick={handleCancelEditTankNameClick}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex justify-between">
            <div className="flex gap-4 align-baseline">
              <h1 className="cursor-pointer text-center text-2xl font-bold text-foreground lg:text-left lg:text-3xl">
                {tank.name}
              </h1>
              <button
                className="text-accent-foreground"
                onClick={handleEditTankNameClick}
              >
                Edit
              </button>
            </div>

            {/* Gallery Link */}
            <div>
              <Link
                to={`/dashboard/tanks/${tank.id}/gallery`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Icon name="camera" className="h-4 w-4" />
                View Gallery
              </Link>
            </div>

          </div>
        )}

        <span className="capitalize text-muted-foreground">
          {tank.waterType}
        </span>
        {typeof tank.volume !== "undefined" && typeof tank.volume !== null && (
          <span className="ml-1 capitalize text-muted-foreground">
            - {tank.volume} Gal
          </span>
        )}
        {latestImage ? (
          <div className="mb-10">
            <img 
              src={latestImage} 
              className="h-40 w-auto object-cover my-4 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={handleImageClick}
              alt="Tank image"
            />
          </div>
        ) : (
          <div className="my-10">
            <UploadButton
              className="w-full md:w-40 mt-2 mb-5"
              appearance={{
                button: 'w-full text-sm font-medium'
              }}
              endpoint='imageUploader'
              onClientUploadComplete={(data) => {
                updateImageUrl(data[0]?.ufsUrl || '');
              }}
              onUploadError={(error) => {
                console.log("onUploadError", error);
                alert('Upload error!');
              }}
              content={{ button: '+ Add Image' }}
            />
          </div>
        )}

      </header>

      <div className="mt-10">
        <ParameterLogs tank={tank} />
      </div>

      <div className="my-10 flex flex-wrap gap-5">
        <div className="w-full sm:w-80">
          <header className="rounded-t border p-4 text-foreground">
            Maintenance Log
          </header>
          <div className="rounded-b border-b border-l border-r">
            {tank.fishTankMaintenances.length ? (
              tank.fishTankMaintenances.map((log) => (
                <MaintenanceLog
                  key={log.id}
                  logId={log.id}
                  maintenanceType={log.maintenanceType}
                  tankId={tank.id}
                  tankName={tank.name}
                ></MaintenanceLog>
              ))
            ) : (
              <div className="border-b border-l p-2 text-sm text-accent-foreground">
                No Logs
              </div>
            )}
          </div>
          <div>
            <Link
              to={`/dashboard/maintenance/new?redirectTo=${location.pathname}&tankId=${tank.id}`}
            >
              <div className="w-40 rounded-b border border-t-0 p-2 text-xs text-foreground">
                + Add Log
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && latestImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={handleCloseModal}>
          <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleCloseModal}
              className="absolute -top-2 right-0 z-10 rounded-full h-10 w-10 text-white hover:bg-gray-200 transition-colors"
            >
              <Icon name="cross-1" className="h-4 w-4" />
            </button>
            
            <img
              src={latestImage}
              alt="Tank image"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            
            <div className="mt-4 flex justify-center">
              <UploadButton
                className="w-40"
                appearance={{
                  button: 'w-full text-sm font-medium'
                }}
                endpoint='imageUploader'
                onClientUploadComplete={(data) => {
                  updateImageUrl(data[0]?.ufsUrl || '');
                  setImageModalOpen(false);
                }}
                onUploadError={(error) => {
                  console.log("onUploadError", error);
                  alert('Upload error!');
                }}
                content={{ button: '+ Update Image' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )

}
type TankWithLogs = {
  id: string;
  name: string;
  fishTankScores: Array<{
    id: string;
    result: string | null;
    imageUrl: string | null;
  }>;
  fishTankMaintenances: Array<{
    id: string;
    createdAt: string;
    maintenanceType: string;
    extraDetails: string | null;
  }>;
  parameterLogs: Array<{
    id: string;
    temp: number | null;
    alk: number | null;
    calcium: number | null;
    magnesium: number | null;
    salinity: number | null;
    pH: number | null;
    nitrate: number | null;
    phosphate: number | null;
    createdAt: string;
  }>;
  imageUrl: string | null;
  volume: number | null;
  waterType: string;
}

const ParameterLogs = ({ tank }: { tank: TankWithLogs }) => {
  const location = useLocation();
  return (
    <div className="w-full sm:w-120">
      <header className="flex justify-between rounded-t border p-4 text-foreground">
        Parameter Log

        <Link to={`/dashboard/parameter-log/new?redirectTo=${location.pathname}&tankId=${tank.id}`}>
          <span className="text-xs text-muted-foreground">
            + Log Parameters
          </span>
        </Link>
      </header>
      <div className="rounded-b border-b border-l border-r">
        {tank.parameterLogs.length ? (
          <div
            className={cn(
              "grid grid-cols-2 gap-4",
            )}
          >
            <ParameterChart tank={tank} parameter="temp" />
            <ParameterChart tank={tank} parameter="pH" />
            <ParameterChart tank={tank} parameter="alk" />
            <ParameterChart tank={tank} parameter="calcium" />
            <ParameterChart tank={tank} parameter="magnesium" />
            <ParameterChart tank={tank} parameter="nitrate" />
            <ParameterChart tank={tank} parameter="phosphate" />
            <ParameterChart tank={tank} parameter="salinity" />
          </div>
        ) : (
          <div className="border-b border-l p-2 text-sm text-accent-foreground">
            No Logs
          </div>
        )}
      </div>
      <div>
        <Link
          to={`/dashboard/parameter-log/new?redirectTo=${location.pathname}&tankId=${tank.id}`}
        >
          <div className="w-40 rounded-b border border-t-0 p-2 text-xs text-foreground">
            + Log Parameters
          </div>
        </Link>
      </div>
    </div>
  );
};

const MaintenanceLog = ({
  logId,
  maintenanceType,
  tankId,
  tankName,
}: {
  logId: string;
  maintenanceType: string;
  tankId?: string;
  tankName?: string;
}) => {
  return (
    <div>
      <div className="flex justify-between border-b border-l p-2 text-sm text-accent-foreground">
        <Link to={`/dashboard/maintenance/${logId}`}>
          {toTitleCase(humanize(maintenanceType))}
        </Link>
        <Link to={`/dashboard/tanks/${tankId}`}>{tankName}</Link>
      </div>
    </div>
  );
};

export const PARAMETERS = [
  "alk",
  "calcium",
  "magnesium",
  "pH",
  "nitrate",
  "phosphate",
  "temp",
  "salinity",
] as const;

export type Parameter = (typeof PARAMETERS)[number];

export const humanizeParameter = (parameter: Parameter) => {
  switch (parameter) {
    case "alk":
      return "Alkaline";
    case "calcium":
      return "Calcium";
    case "magnesium":
      return "Magnesium";
    case "pH":
      return "pH";
    case "nitrate":
      return "Nitrate";
    case "phosphate":
      return "Phosphate";
    case "temp":
      return "Temperature";
    case "salinity":
      return "Salinity";
  }
};

const getChartColorFromParameter = (parameter: Parameter) => {
  switch (parameter) {
    case "pH":
      return "#60A5FA"; // blue
    case "alk":
      return "#34D399"; // green
    case "calcium":
      return "#A78BFA"; // purple
    case "magnesium":
      return "#FBBF24"; // yellow/amber
    case "nitrate":
      return "#EC4899"; // pink
    case "phosphate":
      return "#6366F1"; // indigo
    case "temp":
      return "#F87171"; // red
    case "salinity":
      return "#F87171"; // red
    default:
      return "#60A5FA"; // default blue
  }
};

const getSuccessRangeFromParameter = (
  parameter: Parameter,
): { lower: number; upper: number } => {
  switch (parameter) {
    case "pH":
      return {
        lower: 8.0,
        upper: 8.4,
      };
    case "alk":
      return {
        lower: 8.0,
        upper: 12.0,
      };
    case "calcium":
      return {
        lower: 350,
        upper: 450,
      };
    case "magnesium":
      return {
        lower: 1180,
        upper: 1460,
      };
    case "nitrate":
      return {
        lower: 5,
        upper: 10,
      };
    case "phosphate":
      return {
        lower: 0.3,
        upper: 0.5,
      };
    case "temp":
      return {
        lower: 76,
        upper: 82,
      };
    case "salinity":
      return {
        lower: 1.024,
        upper: 1.027,
      };
  }
};

const getMinFromParameter = (parameter: Parameter): number => {
  switch (parameter) {
    case "pH":
      return 7.5;
    case "alk":
      return 6.0;
    case "calcium":
      return 300;
    case "magnesium":
      return 1000;
    case "nitrate":
      return 0;
    case "phosphate":
      return 0;
    case "temp":
      return 70;
    case "salinity":
      return 1.015;
  }
};

const getMaxFromParameter = (parameter: Parameter): number => {
  switch (parameter) {
    case "pH":
      return 8.8;
    case "alk":
      return 15.0;
    case "calcium":
      return 500;
    case "magnesium":
      return 1600;
    case "nitrate":
      return 20;
    case "phosphate":
      return 1.0;
    case "temp":
      return 86;
    case "salinity":
      return 1.035;
  }
};

const successRangePlugin: Plugin<"line"> = {
  id: "successRange",

  beforeDraw: function(chart, args, options) {
    const { ctx, chartArea, scales } = chart;
    const { lower, upper } = options.range;
    const { backgroundColor, borderColor, borderWidth, enabled } = options;

    if (
      !enabled ||
      lower === undefined ||
      upper === undefined ||
      scales.y === undefined
    ) {
      return; // Don't draw if not enabled or range is not defined
    }

    ctx.save();

    // Get the pixel values for the upper and lower bounds on the Y-axis
    const yLowerPixel = scales.y.getPixelForValue(lower);
    const yUpperPixel = scales.y.getPixelForValue(upper);

    // Ensure the drawing is confined within the chart area
    ctx.beginPath();
    ctx.rect(
      chartArea.left,
      chartArea.top,
      chartArea.right - chartArea.left,
      chartArea.bottom - chartArea.top,
    );
    ctx.clip();

    // Draw the background rectangle
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(
      chartArea.left,
      Math.min(yLowerPixel, yUpperPixel), // Handle potential inverted scales
      chartArea.right - chartArea.left,
      Math.abs(yLowerPixel - yUpperPixel),
    );

    // Optionally draw a border
    if (borderWidth > 0) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(
        chartArea.left,
        Math.min(yLowerPixel, yUpperPixel),
        chartArea.right - chartArea.left,
        Math.abs(yLowerPixel - yUpperPixel),
      );
    }

    ctx.restore();
  },

  afterDatasetsDraw: function(chart, args, options) {
    const {
      ctx,
      data: { datasets },
      scales,
    } = chart;
    const { lower, upper } = options.range;
    const { enabled } = options;

    if (
      !enabled ||
      lower === undefined ||
      upper === undefined ||
      scales.y === undefined
    ) {
      return;
    }

    datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);

      if (!meta.hidden) {
        // Only process visible datasets
        meta.data.forEach((element, index) => {
          const value = dataset.data[index] || 0;

          if (value >= lower && value <= upper) {
            // Apply custom styling to points within the success range
            ctx.save();

            // Example: Change point background color and border color
            const originalBackgroundColor = element.options.backgroundColor;
            const originalBorderColor = element.options.borderColor;

            element.options.backgroundColor = "green"; // Or a color from plugin options
            element.options.borderColor = "darkgreen";

            // You might need to manually redraw the point here if changing
            // options after drawing in the core chart rendering process.
            // A simpler approach is to modify the point's options *before*
            // the datasets are drawn if possible, but that might require
            // a different hook or approach.

            ctx.restore();
          }
        });
      }
    });
  },
};

Chart.register(successRangePlugin);

const ParameterChart = ({
  tank,
  parameter,
}: {
  tank: TankWithLogs;
  parameter: Parameter;
}) => {
  const location = useLocation();
  const successRange = getSuccessRangeFromParameter(parameter);
  return (
    <div className="rounded border p-4 text-foreground">
      <h3 className="mb-2 text-lg font-bold">
        <span className="mr-2">{humanizeParameter(parameter)}</span>
        <Link
          to={`/dashboard/parameter-log/new?redirectTo=${location.pathname}&tankId=${tank.id}&parameter=${parameter}`}
        >
          <span className="ml-2 text-xs text-muted-foreground">
            + Add Log
          </span>
        </Link>
        <div className="flex gap-2 items-center">
          <div className="text-xs text-muted-foreground">
            Target Range: {successRange.lower} - {successRange.upper}{" "}
            {getMeasurementFromParameter(parameter)}
          </div>
        </div>
      </h3>
      <LineChart
        data={{
          labels: tank.parameterLogs
            .filter((l) => l[parameter])
            .map((l) =>
              formatDateBasedOnRecency(
                DateFrom(l.createdAt).toLocaleDateString(),
              ),
            ),
          datasets: [
            {
              label: humanizeParameter(parameter),
              data: tank.parameterLogs
                .filter((l) => l[parameter])
                .map((l) => l[parameter] || null),
              backgroundColor: getChartColorFromParameter(parameter),
              borderColor: getChartColorFromParameter(parameter),
            },
          ],
        }}
        options={{
          plugins: {
            // @ts-ignore
            successRange: {
              enabled: true,
              range: getSuccessRangeFromParameter(parameter),
              backgroundColor: "rgba(0, 204, 0, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 1,
            },
          },
          scales: {
            y: {
              min: getMinFromParameter(parameter),
              max: getMaxFromParameter(parameter),
            },
          },
        }}
        plugins={[successRangePlugin]}
      />
    </div>
  );
};


