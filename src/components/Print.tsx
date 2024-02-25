import { useParams } from "@tanstack/react-router";
import { QRCodeCanvas } from "qrcode.react";
import { TreeRemovalTaskDocType } from "src/rxdb/rxdb-schemas";
import { humanizeDate, useProject, useTask } from "../utils";
import { Button } from "./Forms";

function LabelValue({
  label,
  value,
}: {
  label: string | undefined | null;
  value: string | undefined | null;
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
    (image) => image.taken_at_step === "before" && !image._deleted,
  );
  const date = beforeStep?.created_at
    ? humanizeDate(beforeStep.created_at)
    : "no date";
  const { latitude, longitude } = beforeStep || {};

  if (!result) return "Loading...";

  return (
    <div>
      <div className="text-center text-xl font-medium">ADMS</div>
      <div className="text-center text-lg">{type} Ticket</div>
      <div className="pl-4 flex flex-col gap-2 pt-4">
        <LabelValue label="Project" value={activeProject?.name} />
        <LabelValue label="Contractor" value={activeProject?.contractor} />
        <LabelValue label="Date" value={date} />
        <LabelValue label="Ticket ID" value={`Tree-${result?.id}`} />
        <LabelValue label="Lat" value={latitude} />
        <LabelValue label="Lon" value={longitude} />
        <LabelValue label="Type" value={type} />
        {type === "tree" && (
          <LabelValue
            label="Size"
            value={(result as TreeRemovalTaskDocType)?.ranges}
          />
        )}
        <LabelValue label="Comment" value={result?.comment} />
      </div>
      <div className="flex flex-col items-center pt-10">
        <QRCodeCanvas value={result?.id} includeMargin />
      </div>
      <div className="pt-10">
        <Button onClick={() => window.print()}>Print</Button>
      </div>
    </div>
  );
}
