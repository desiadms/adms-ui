import { CameraIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { useNavigate, useParams } from "@tanstack/react-router";
import classNames from "classnames";
import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useRxCollection } from "rxdb-hooks";
import { Images, TicketingTaskDocType } from "../rxdb/rxdb-schemas";
import {
  FileForm,
  genTaskImagesMetadata,
  humanizeDate,
  useFilesForm,
  useGeoLocation,
  useTicketingBlueprint,
} from "../hooks";
import { Button, ErrorMessage, Input, Label, LabelledTextArea } from "./Forms";
import { Spinner } from "./icons";
import toast from "react-hot-toast";

type TFieldMonitorGeneral = {
  taskId: string;
  ticketingId: string;
};

type FormProps = {
  comment?: string;
  files?: FileForm[];
};

function FieldMonitorGeneralForm({
  taskId,
  ticketingId,
}: TFieldMonitorGeneral) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, submitCount },
  } = useForm<FormProps>({
    defaultValues: {
      comment: "",
      files: [{ fileInstance: undefined }, { fileInstance: undefined }],
    },
  });

  const { fields, update } = useFieldArray({
    control,
    name: "files",
  });

  const {
    useFilePreviews: [filePreviews],
    noFilesUploaded,
    onChangeSetFilePreview,
    validateFileSize,
    removePreview,
  } = useFilesForm();

  const currentDateTime = useMemo(() => humanizeDate(), []);

  const { coordinates } = useGeoLocation();
  const navigate = useNavigate({
    from: "/tasks/field-monitor/ticketing/$ticketingId/$id",
  });

  const ticketingTaskColl =
    useRxCollection<TicketingTaskDocType>("ticketing-task");

  const { ticketingBlueprint } = useTicketingBlueprint(ticketingId);

  async function submitForm(data: FormProps) {
    let images: Images[] = [];

    if (ticketingBlueprint?.add_photos) {
      if (noFilesUploaded) return;

      if (coordinates && data.files) {
        images = await genTaskImagesMetadata({
          filesData: data.files,
          coordinates,
        });
      }
    }

    const nowUTC = new Date().toISOString();

    await ticketingTaskColl?.upsert({
      id: taskId,
      images,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
      ticketing_name: ticketingId,
      task_ticketing_name: {
        name: ticketingBlueprint?.name || "",
      },
      comment: data?.comment,
      created_at: nowUTC,
      updated_at: nowUTC,
    });

    if (ticketingBlueprint?.print_ticket)
      navigate({ to: "/print/$id", params: { id: taskId } });
    else {
      toast.success("Task submitted!");
      navigate({ to: "/tasks" });
    }
  }

  function handleRemove(index: number, id: string) {
    removePreview(id);
    update(index, { fileInstance: undefined });
  }

  return (
    <div>
      <div className="capitalize font-medium pb-4">
        Ticketing - {ticketingBlueprint?.name}
      </div>
      <form
        onSubmit={handleSubmit(submitForm)}
        className="flex flex-col gap-2 items-start bg-zinc-200 rounded-md p-4"
      >
        <div className="p-2 w-fit rounded-lg">
          <Label label="Date & Time" />

          <div className="text-sm">{currentDateTime}</div>
        </div>

        <div className="p-2 w-fit rounded-lg">
          <Label label="Geo Location" />

          <div className="text-sm">
            <div>
              <div className="flex gap-2 items-center">
                Latitude:{" "}
                {coordinates?.latitude || <Spinner className="w-3 h-3" />}
              </div>
              <div className="flex gap-2 items-center">
                Longitude:{" "}
                {coordinates?.longitude || <Spinner className="w-3 h-3" />}
              </div>
            </div>
          </div>
        </div>

        {ticketingBlueprint?.add_photos && (
          <>
            <div className="p-2">
              <Label label="Photos" />
              <div className="flex flex-col gap-1">
                {fields.map(({ id }, index) => (
                  <div className="flex flex-col gap-1" key={id}>
                    <label
                      className={classNames(
                        "flex gap-1 rounded w-fit bg-slate-500 text-white px-2 py-1 text-xs",
                      )}
                    >
                      <CameraIcon className="w-4 h-4 text-white" />
                      <span className="text-xs">Take Picture</span>
                      <Input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        hidden
                        {...register(`files.${index}.fileInstance`, {
                          validate: {
                            lessThan5MB: (file) =>
                              validateFileSize(file, 5 * 1024 * 1024),
                          },
                          onChange: (e) => {
                            onChangeSetFilePreview(e, id);
                          },
                        })}
                      />
                    </label>
                    {filePreviews && filePreviews[id] && (
                      <div>
                        <div className="relative w-1/2">
                          <img
                            className="w-full object-cover"
                            src={filePreviews[id]}
                            alt=""
                          />
                          <button
                            className="absolute -top-4 -right-4 rounded-full bg-gray-800"
                            type="button"
                            onClick={() => handleRemove(index, id)}
                          >
                            <XCircleIcon className="w-10 h-10 text-red-400" />
                          </button>
                        </div>
                      </div>
                    )}
                    {errors.files && errors.files[index] && (
                      <ErrorMessage
                        message={errors.files[index]?.fileInstance?.message}
                      />
                    )}
                  </div>
                ))}
                {noFilesUploaded && submitCount > 0 && (
                  <ErrorMessage message="Please upload at least one image" />
                )}
              </div>
            </div>
            {errors.files && (
              <p className="text-red-500">{errors.files.message}</p>
            )}
          </>
        )}
        <div className="p-2 w-full rounded-lg">
          <LabelledTextArea label="Comment" {...register("comment")} />
          <ErrorMessage message={errors.comment?.message} />
        </div>

        <div className="px-2">
          <Button type="submit">
            {ticketingBlueprint?.print_ticket ? "Print Ticket" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function FieldMonitorGeneralWrapper() {
  const { ticketingId, id } = useParams({
    from: "/tasks/field-monitor/ticketing/$ticketingId/$id",
  });

  return <FieldMonitorGeneralForm taskId={id} ticketingId={ticketingId} />;
}
