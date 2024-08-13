import { Link, useParams } from "@tanstack/react-router";
import { QRCodeCanvas } from "qrcode.react";
import {
  humanizeDate,
  useDebrisTypes,
  useDisposalSites,
  useProject,
  useTask,
  useTrucks,
} from "../hooks";
import { Button } from "./Forms";

function LabelValue({
  label,
  value,
}: {
  label: string | undefined | null;
  value: string | number | undefined | null;
}) {
  return (
    <div className="flex">
      <div className="text-sm flex-shrink-0 font-medium w-24">
        {label || "no label"}
      </div>
      <div className="text-sm">{value || "no value"}</div>
    </div>
  );
}

export function Print() {
  const { id } = useParams({
    from: "/print/$id",
  });
  const { activeProject } = useProject();
  const { result, type } = useTask(id);

  const beforeStep = result?.images?.find(
    (image) =>
      "taken_at_step" in image &&
      image.taken_at_step === "before" &&
      !image._deleted,
  );

  const date = beforeStep?.created_at
    ? humanizeDate(beforeStep.created_at)
    : result?.get("created_at")
      ? humanizeDate(result.get("created_at"))
      : "no date";

  const { latitude, longitude } =
    beforeStep || {
      latitude: result?.get("latitude"),
      longitude: result?.get("longitude"),
    } ||
    {};

  const parsedType =
    type === "Ticketing" ? result?.task_ticketing_name.name : type;

  const trucks = useTrucks();
  const disposalSites = useDisposalSites();
  const debrisTypes = useDebrisTypes();

  if (!result) return "Loading...";

  const truck =
    "truck_id" in result &&
    trucks.trucks.find((truck) => truck.id === result?.truck_id);

  const disposalSite =
    "disposal_site" in result &&
    disposalSites.disposalSites.find(
      (site) => site.id === result?.disposal_site,
    );

  const debrisType =
    "debris_type" in result &&
    debrisTypes.debrisTypes.find((type) => type.id === result?.debris_type);

  return (
    <div>
      <div className="text-center text-xl font-medium">ADMS</div>
      <div className="text-center text-lg">{parsedType} Ticket</div>
      <div className="pl-4 flex flex-col gap-2 pt-4">
        <LabelValue label="Project" value={activeProject?.name} />
        <LabelValue label="Contractor" value={activeProject?.contractor} />
        <LabelValue label="Date" value={date} />
        <LabelValue label="Ticket ID" value={`${result?.id}`} />
        <LabelValue label="Lat" value={latitude} />
        <LabelValue label="Lon" value={longitude} />
        <LabelValue label="Type" value={parsedType} />

        {truck && <LabelValue label="Truck" value={truck.truck_number} />}
        {disposalSite && <LabelValue label="Truck" value={disposalSite.name} />}
        {debrisType && <LabelValue label="Truck" value={debrisType.name} />}
        {type === "Tree" && <LabelValue label="Size" value={result?.ranges} />}
        <LabelValue label="Comment" value={result?.comment} />
      </div>
      <div className="flex flex-col items-center pt-10">
        <QRCodeCanvas value={result?.id} includeMargin />
      </div>
      <div className="pt-10">
        <Link to="/tasks">
          <Button>Back to Tasks</Button>
        </Link>
      </div>
    </div>
  );
}
