import { Link, useParams } from "@tanstack/react-router";
import { TaskType } from "./common";
import { v4 } from "uuid";
import { useFieldArray, useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { FileForm, humanizeDate, useFilesForm, useGeoLocation } from "../hooks";
import { Button, ErrorMessage, Input, Label, LabelledTextArea } from "./Forms";
import { Spinner } from "./icons";
import classNames from "classnames";
import CameraIcon from "@heroicons/react/20/solid/CameraIcon";
import { XCircleIcon } from "@heroicons/react/20/solid";

export function TruckTasks() {
  return (
    <div className="flex flex-col gap-2">
      <Link to="/tasks/truck-tasks/collection/$id" params={{ id: v4() }}>
        <TaskType name="Collection" />
      </Link>
      <Link to="/tasks/truck-tasks/disposal/$id" params={{ id: v4() }}>
        <TaskType name="Disposal" />
      </Link>
    </div>
  );
}

type TruckTaskFormProps = {
  taskId: string;
  type: "collection" | "disposal";
};

type FormProps = {
  truckNumber: string;
  disposalSite: string;
  contractor: string;
  capacity?: number;
  debrisType: string;
  loadCall?: number;
  weighPoints?: GeolocationCoordinates[]; // TODO: implement weigh points
  comment?: string;
  ranges?: string;
  files: FileForm[];
};

export function TruckTaskForm({ taskId, type }: TruckTaskFormProps) {
  // Here we set the default value of the slider to 50
  // it is calculated using the following formula:
  // min + (min + max) / 2
  // see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#value
  const [sliderValue, setSliderValue] = useState(50);

  const defaultFileValue: FileForm[] =
    type === "collection"
      ? [
          { fileInstance: undefined },
          { fileInstance: undefined },
          { fileInstance: undefined },
          { fileInstance: undefined },
        ]
      : [{ fileInstance: undefined }, { fileInstance: undefined }];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, submitCount },
  } = useForm<FormProps>({
    defaultValues: {
      comment: "",
      files: defaultFileValue,
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

  async function submitForm(data) {
    console.log(data);
  }

  function handleRemove(index: number, id: string) {
    removePreview(id);
    update(index, { fileInstance: undefined });
  }

  return (
    <div>
      <div className="capitalize font-medium pb-4">{type}</div>
      <form
        onSubmit={handleSubmit(submitForm)}
        className="flex flex-col gap-2 items-start bg-zinc-200 rounded-md p-4"
      >
        <div className="p-2 w-fit rounded-lg">
          <Label label="Task ID" />

          <div className="text-sm">{taskId}</div>
        </div>
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

        {/* TODO: Implement QR Code autofill (nice to have feature) */}
        <div className="p-2 w-fit rounded-lg">
          <div className="text-sm">
            <Button
              onClick={() => "bring up qr code scanner here"}
              name="scan-qr"
              type="button"
              bgColor="bg-slate-500 hover:bg-slate-300"
            >
              Autofill with QR Code
            </Button>
          </div>
        </div>

        {/* TODO: Populate Truck Number dropdown with values from database */}
        {/* TODO: Truck Number populates the rest of the values in the form */}
        <div className="p-2 w-fit rounded-lg">
          <Label label="Truck Number" />
          <div className="text-sm">
            <select {...register("truckNumber", { required: true })}>
              <option value="Truck 1">Truck 1</option>
              <option value="Truck 2">Truck 2</option>
              <option value="Truck 3">Truck 3</option>
            </select>
          </div>
        </div>

        {/* TODO: Populate Disposal site dropdown with values from database */}
        <div className="p-2 w-fit rounded-lg">
          <Label label="Disposal Site" />
          <div className="text-sm">
            <select {...register("disposalSite", { required: true })}>
              <option value="Site 1">Site 1</option>
              <option value="Site 2">Site 2</option>
              <option value="Site 3">Site 3</option>
            </select>
          </div>
        </div>

        {/* TODO: Populate Contractor dropdown with values from database */}
        <div className="p-2 w-fit rounded-lg">
          <Label label="Contractor" />
          <div className="text-sm">
            <select {...register("contractor", { required: true })}>
              <option value="Contractor 1">Contractor 1</option>
              <option value="Contractor 2">Contractor 2</option>
              <option value="Contractor 3">Contractor 3</option>
            </select>
          </div>
        </div>

        <div className="p-2 w-fit rounded-lg">
          <Label label="Capacity" />
          <Input
            type="text"
            {...register("capacity")}
            placeholder="in cubic yards"
          />
        </div>

        {/* TODO: Populate Debris Type dropdown with values from database */}
        <div className="p-2 w-fit rounded-lg">
          <Label label="Debris Type" />
          <div className="text-sm">
            <select {...register("debrisType", { required: true })}>
              <option value="C&D">C&D</option>
              <option value="Veg">Veg</option>
              <option value="Utility Pole">Utility Pole</option>
              <option value="Wire/Cable">Wire/Cable</option>
              <option value="Transformer">Transformer</option>
              <option value="Misc">Misc</option>
            </select>
          </div>
        </div>

        {/* TODO: Implement Weigh Points*/}
        {type === "collection" && (
          <div className="p-2 w-fit rounded-lg">
            <Label label="Weigh Points" />
            <div className="text-sm">
              <Button
                onClick={() => "weigh point"}
                name="add-weigh-point"
                type="button"
                bgColor="bg-slate-500 hover:bg-slate-300"
              >
                Add Weigh Point
              </Button>
            </div>
          </div>
        )}

        {type === "disposal" && (
          <div className="p-2 w-fit rounded-lg">
            <Label label="Load Call" />
            <div className="flex items-center text-sm font-medium">
              <input
                type="range"
                id="load-call-range"
                min="5"
                max="95"
                step="5"
                {...register("loadCall", { required: true })}
                onInput={(e) => {
                  const value = e.currentTarget.value;
                  setSliderValue(parseInt(value));
                }}
              />
              <output className="mx-4" id="sliderValue">
                {sliderValue} %
              </output>
            </div>
          </div>
        )}

        <div className="p-2">
          <Label label="Photos" />
          <div className="flex flex-col">
            {fields.map(({ id }, index) => (
              <div className="flex flex-col gap-1 my-2" key={id}>
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

        {errors.files && <p className="text-red-500">{errors.files.message}</p>}

        <div className="p-2 w-full rounded-lg">
          <LabelledTextArea label="Comment" {...register("comment")} />
          <ErrorMessage message={errors.comment?.message} />
        </div>
        <div className="flex p-2 gap-2">
          <Button type="submit">Save</Button>
          <Button type="button" bgColor="bg-slate-500 hover:bg-slate-300">
            Print
          </Button>
        </div>
      </form>
    </div>
  );
}

export function CollectionFormWrapper() {
  const { id } = useParams({ from: "/tasks/truck-tasks/collection/$id" });

  return <TruckTaskForm taskId={id} type="collection" />;
}

export function DisposalFormWrapper() {
  const { id } = useParams({ from: "/tasks/truck-tasks/disposal/$id" });

  return <TruckTaskForm taskId={id} type="disposal" />;
}
