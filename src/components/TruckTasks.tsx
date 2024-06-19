import { Link, useParams } from "@tanstack/react-router";
import { TaskType } from "./common";
import { v4 } from "uuid";
import { useFieldArray, useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import {
  FileForm,
  genTaskImagesMetadata,
  getGeoLocationHandler,
  humanizeDate,
  useContractors,
  useDebrisTypes,
  useDisposalSites,
  useFilesForm,
  useGeoLocation,
  useTrucks,
} from "../hooks";
import { Button, ErrorMessage, Input, Label, LabelledTextArea } from "./Forms";
import { Spinner } from "./icons";
import classNames from "classnames";
import CameraIcon from "@heroicons/react/20/solid/CameraIcon";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { CollectionTaskDocType } from "src/rxdb/rxdb-schemas";
import { useRxCollection } from "rxdb-hooks";

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
  weighPoints?: { latitude: number; longitude: number }[];
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

  const [autofill, setAutofill] = useState(false);

  const [loadCallTouched, setLoadCallTouched] = useState(false);

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
  // const navigate = useNavigate({
  //   from: "/tasks/truck-tasks/collection/$id",
  // });

  const truckCollectionCol =
    useRxCollection<CollectionTaskDocType>("collection-task");

  async function submitForm(data) {
    if (noFilesUploaded) return;

    if (coordinates) {
      const images = await genTaskImagesMetadata({
        filesData: data.files,
        coordinates,
      });

      const nowUTC = new Date().toISOString();

      const existingCollectionDoc = await truckCollectionCol
        ?.findOne(taskId)
        .exec();

      if (type === "collection") {
        // TODO: weigh points is an array, how to make into string data type
        // TODO: verify the other data we are putting into the db...
        await truckCollectionCol?.upsert({
          capacity: data.capacity,
          contractor: data.contractor,
          created_at: nowUTC,
          debris_type: data.debrisType,
          disposal_site: data.disposalSite,
          id: taskId,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
          truck_id: data.truckNumber,
          weigh_points: data.weighpoints,
          comment: data.comment,
          updated_at: nowUTC,
          images: existingCollectionDoc?.images.concat(images) || images,
        });
      } else {
        // upsert disposal task
      }

      // navigate({ to: "/progress" });

      console.log("data submitted: ", data);
    }
  }

  function handleRemove(index: number, id: string) {
    removePreview(id);
    update(index, { fileInstance: undefined });
  }

  const {
    fields: weighPoints,
    append: appendWeighPoint,
    remove: removeWeighPoint,
  } = useFieldArray({
    control,
    name: "weighPoints",
  });

  async function addWeighPoint() {
    const geolocation = await getGeoLocationHandler();
    appendWeighPoint(geolocation);
  }

  // Data from RxDB to populate the input options
  const rxdbContractorsObject = useContractors();
  const rxdbTrucksObject = useTrucks();
  const rxdbDisposalSitesObject = useDisposalSites();
  const rxdbDebrisTypesObject = useDebrisTypes();

  // TODO: Implement Autofill
  const autofillFields = (
    <div>
      <div className="p-2 w-fit rounded-lg">
        <Label label="Truck Number" />
        <div className="text-sm">Truck Number Here</div>
      </div>

      <div className="p-2 w-fit rounded-lg">
        <Label label="Disposal Site" />
        <div className="text-sm">Disposal Site Here</div>
      </div>

      <div className="p-2 w-fit rounded-lg">
        <Label label="Contractor" />
        <div className="text-sm">Contractor Here</div>
      </div>

      <div className="p-2 w-fit rounded-lg">
        <Label label="Capacity" />
        Capacity Here
      </div>

      <div className="p-2 w-fit rounded-lg">
        <Label label="Debris Type" />
        <div className="text-sm">Debris Type Here</div>
      </div>
    </div>
  );

  const defaultOptionString = "Please Select";
  function validateInputIsNotDefault(value) {
    return value !== defaultOptionString || "Make a selection";
  }

  const manualInputFields = (
    <div>
      <div className="p-2 w-fit rounded-lg">
        <Label label="Truck Number" />
        <div className="text-sm">
          <select
            {...register("truckNumber", {
              required: "Truck Number is required",
              validate: validateInputIsNotDefault,
            })}
          >
            <option>{defaultOptionString}</option>
            {rxdbTrucksObject.trucks.map((truckNumber) => {
              return (
                <option key={truckNumber._data.id} value={truckNumber._data.id}>
                  {truckNumber._data.truck_number}
                </option>
              );
            })}
          </select>
        </div>
        <ErrorMessage message={errors.truckNumber?.message} />
      </div>

      <div className="p-2 w-fit rounded-lg">
        <Label label="Disposal Site" />
        <div className="text-sm">
          <select
            {...register("disposalSite", {
              required: "Disposal site is required",
              validate: validateInputIsNotDefault,
            })}
          >
            <option>{defaultOptionString}</option>
            {rxdbDisposalSitesObject.disposalSites.map((disposalSite) => {
              return (
                <option
                  key={disposalSite._data.id}
                  value={disposalSite._data.id}
                >
                  {disposalSite._data.name}
                </option>
              );
            })}
          </select>
        </div>
        <ErrorMessage message={errors.disposalSite?.message} />
      </div>

      <div className="p-2 w-fit rounded-lg">
        <Label label="Contractor" />
        <div className="text-sm">
          <select
            {...register("contractor", {
              required: "Contractor is required",
              validate: validateInputIsNotDefault,
            })}
          >
            <option>{defaultOptionString}</option>
            {rxdbContractorsObject.contractors.map((contractor) => {
              return (
                <option key={contractor._data.id} value={contractor._data.id}>
                  {contractor._data.name}
                </option>
              );
            })}
          </select>
        </div>
        <ErrorMessage message={errors.contractor?.message} />
      </div>

      <div className="p-2 w-fit rounded-lg">
        <Label label="Capacity" />
        <Input
          type="number"
          min="0"
          max="1000000"
          {...register("capacity")}
          placeholder="in yards&sup3;"
        />
      </div>

      <div className="p-2 w-fit rounded-lg">
        <Label label="Debris Type" />
        <div className="text-sm">
          <select
            {...register("debrisType", {
              required: "Debris Type is required",
              validate: validateInputIsNotDefault,
            })}
          >
            <option>{defaultOptionString}</option>
            {rxdbDebrisTypesObject.debrisTypes.map((debrisType) => {
              return (
                <option key={debrisType._data.id} value={debrisType._data.id}>
                  {debrisType._data.name}
                </option>
              );
            })}
          </select>
        </div>
        <ErrorMessage message={errors.debrisType?.message} />
      </div>
    </div>
  );

  return (
    <div>
      <div className="capitalize font-medium text-xl pb-4">{type}</div>
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

        {type === "disposal" && (
          <div>
            <div className="p-2 w-fit rounded-lg">
              <div className="text-sm">
                <Button
                  onClick={() => {
                    setAutofill(true);
                  }}
                  name="scan-qr"
                  type="button"
                  bgColor="bg-slate-500 hover:bg-slate-300"
                >
                  Autofill with QR Code
                </Button>
              </div>
            </div>
            <div className="p-2 w-fit rounded-lg">
              <div className="text-sm">
                <Button
                  onClick={() => {
                    setAutofill(false);
                  }}
                  name="manual-input"
                  type="button"
                  bgColor="bg-slate-500 hover:bg-slate-300"
                >
                  Input Manually
                </Button>
              </div>
            </div>
          </div>
        )}

        {autofill ? autofillFields : manualInputFields}

        {type === "collection" && (
          <div className="p-2 w-full rounded-lg">
            <Label label="Weigh Points" />
            <div className="text-sm w-fit">
              <Button
                onClick={addWeighPoint}
                name="add-weigh-point"
                type="button"
                bgColor="bg-slate-500"
              >
                Add Weigh Point
              </Button>
            </div>
            <div className="mt-2">
              {weighPoints.map((weighPoint, index) => {
                return (
                  <div className="relative flex w-fit" key={weighPoint.id}>
                    <input
                      type="hidden"
                      {...register(`weighPoints.${index}.latitude`, {
                        valueAsNumber: true,
                      })}
                      value={weighPoint.latitude}
                      readOnly
                    />
                    <input
                      type="hidden"
                      {...register(`weighPoints.${index}.longitude`, {
                        valueAsNumber: true,
                      })}
                      value={weighPoint.longitude}
                      readOnly
                    />
                    <div className="p-4 my-2 w-full bg-white text-center rounded-2xl relative">
                      <span>{`(${weighPoint.latitude}, ${weighPoint.longitude})`}</span>
                    </div>
                    <button
                      className="absolute -top-0 -right-2 rounded-full bg-gray-800"
                      type="button"
                      onClick={() => removeWeighPoint(index)}
                    >
                      <XCircleIcon className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                );
              })}
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
                {...register("loadCall", { required: "Load Call is required" })}
                onInput={(e) => {
                  const value = e.currentTarget.value;
                  setSliderValue(parseInt(value));
                  setLoadCallTouched(true);
                }}
              />
              <output className="mx-4" id="sliderValue">
                {sliderValue} %
              </output>
            </div>
            {!loadCallTouched && submitCount > 0 && (
              <ErrorMessage message="Please set a load call" />
            )}
          </div>
        )}

        <div className="p-2">
          <Label label="Photos" />
          <div className="flex flex-col">
            {fields.map(({ id }, index) => (
              <div className="flex flex-col gap-1 my-2" key={id}>
                <label
                  className={classNames(
                    "flex gap-1 rounded w-fit bg-slate-500 text-white px-2 py-1 text-sm font-medium justify-center items-center",
                  )}
                >
                  <CameraIcon className="w-4 h-4 text-white" />
                  <span className="text-sm">Take Picture</span>
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
