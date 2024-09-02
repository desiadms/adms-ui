import { XCircleIcon } from "@heroicons/react/20/solid";
import CameraIcon from "@heroicons/react/20/solid/CameraIcon";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import classNames from "classnames";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useRxCollection } from "rxdb-hooks";
import {
  CollectionTaskDocType,
  DisposalTaskDocType,
} from "src/rxdb/rxdb-schemas";
import { v4 } from "uuid";
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
import { TaskType } from "./common";
import {
  Button,
  ErrorMessage,
  Input,
  Label,
  LabelledInput,
  LabelledSelect,
  LabelledTextArea,
} from "./Forms";
import { Spinner } from "./icons";
import toast from "react-hot-toast";
import { maxUploadFileSizeAllowed } from "../rxdb/utils";
import { z } from "zod";

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
};

type SharedProps = {
  truckNumber: string;
  contractor: string;
  capacity?: number | null;
  debrisType: string;
  comment?: string;
  files: FileForm[];
};

type CollectionTaskFormProps = SharedProps & {
  weighPoints?: { latitude: number; longitude: number }[];
};

type DisposalTaskFormProps = SharedProps & {
  loadCall: number;
  disposalSite: string;
  collectionId: string;
};

const schemaCollectionQRCode = z.object({
  id: z.string(),
  truck_id: z.string(),
  contractor: z.string(),
  capacity: z.number(),
  debris_type: z.string(),
});

export function TruckTaskDisposalForm({ taskId }: TruckTaskFormProps) {
  const defaultFileValue: FileForm[] = [
    { fileInstance: undefined },
    { fileInstance: undefined },
  ];

  const {
    register,
    setValue,
    clearErrors,
    handleSubmit,
    control,
    formState: { errors, submitCount },
  } = useForm<DisposalTaskFormProps>({
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
  const navigate = useNavigate({
    from: "/tasks/truck-tasks/collection/$id",
  });

  const truckDisposalCol =
    useRxCollection<DisposalTaskDocType>("disposal-task");

  async function submitForm(data: DisposalTaskFormProps) {
    if (noFilesUploaded) return;

    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      toast.error("Coordinates not found");
      return;
    }

    const images = await genTaskImagesMetadata({
      filesData: data.files,
      coordinates,
    });

    const nowUTC = new Date().toISOString();

    await truckDisposalCol?.upsert({
      capacity: data.capacity,
      contractor: data.contractor,
      created_at: nowUTC,
      debris_type: data.debrisType,
      disposal_site: data.disposalSite,
      id: taskId,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
      load_call: data.loadCall,
      task_collection_id: data.collectionId,
      truck_id: data.truckNumber,
      comment: data.comment,
      updated_at: nowUTC,
      images,
    });

    navigate({ to: "/print/$id", params: { id: taskId } });
  }

  function autoFillFieldsFromQr(result: IDetectedBarcode[]) {
    try {
      const rawValue = result[0]?.rawValue;

      const parsedScannedResult = schemaCollectionQRCode.parse(
        JSON.parse(rawValue || ""),
      );

      console.log("parsedScannedResult", parsedScannedResult);

      const {
        id: collectionId,
        truck_id,
        contractor,
        capacity,
        debris_type,
      } = parsedScannedResult;

      setValue("collectionId", collectionId);
      setValue("truckNumber", truck_id);
      setValue("contractor", contractor);
      setValue("capacity", capacity);
      setValue("debrisType", debris_type);

      clearErrors(["truckNumber", "contractor", "capacity", "debrisType"]);

      setScannerOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Invalid QR Code");
    }
  }

  function handleRemove(index: number, id: string) {
    removePreview(id);
    update(index, { fileInstance: undefined });
  }

  // Data from RxDB to populate the input options
  const rxdbContractorsObject = useContractors();
  const rxdbTrucksObject = useTrucks();
  const rxdbDisposalSitesObject = useDisposalSites();
  const rxdbDebrisTypesObject = useDebrisTypes();

  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <div className="relative">
      {scannerOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 z-50 overflow-hidden">
          <div className="absolute p-4 flex flex-col gap-4 max-w-3xl left-[50%] -translate-x-1/2 w-full">
            <Scanner allowMultiple onScan={autoFillFieldsFromQr} />
            <Button type="button" onClick={() => setScannerOpen(false)}>
              Fill Manually
            </Button>
          </div>
        </div>
      )}
      <div className="capitalize font-medium text-xl pb-4">disposal</div>
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

        <div>
          <div className="p-2 w-fit rounded-lg">
            <div className="text-sm">
              <Button
                onClick={() => {
                  setScannerOpen(true);
                }}
                name="scan-qr"
                type="button"
                bgColor="bg-slate-500 hover:bg-slate-300"
              >
                Autofill with QR Code
              </Button>
            </div>
          </div>
        </div>

        <div className="p-2">
          <LabelledInput
            label="Collection ID"
            {...register("collectionId", {
              required: "Collection ID required",
            })}
          />
          <ErrorMessage message={errors.collectionId?.message} />
        </div>

        <div className="p-2">
          <LabelledSelect
            label="Truck Number"
            {...register("truckNumber", {
              required: "Truck Number is required",
            })}
            options={rxdbTrucksObject.trucks.map((truck) => ({
              label: truck.truck_number,
              value: truck.id,
            }))}
          />
          <ErrorMessage message={errors.truckNumber?.message} />
        </div>
        <div>
          <div className="p-2">
            <LabelledSelect
              label="Contractor"
              {...register("contractor", {
                required: "Contractor is required",
              })}
              options={rxdbContractorsObject.contractors.map((contractor) => ({
                label: contractor.name,
                value: contractor.id,
              }))}
            />
            <ErrorMessage message={errors.contractor?.message} />
          </div>

          <div className="p-2">
            <LabelledSelect
              label="Debris Type"
              {...register("debrisType", {
                required: "Debris Type is required",
              })}
              options={rxdbDebrisTypesObject.debrisTypes.map((debrisType) => ({
                label: debrisType.name,
                value: debrisType.id,
              }))}
            />
            <ErrorMessage message={errors.debrisType?.message} />
          </div>

          <div className="p-2 w-fit rounded-lg">
            <LabelledInput
              label="Capacity"
              type="number"
              min="0"
              max="1000000"
              {...register("capacity", {
                valueAsNumber: true,
                required: "Capacity required",
              })}
              placeholder="in yards&sup3;"
            />
            <ErrorMessage message={errors.capacity?.message} />
          </div>

          <div className="p-2">
            <LabelledSelect
              label="Disposal Site"
              {...register("disposalSite", {
                required: "Disposal site is required",
              })}
              options={rxdbDisposalSitesObject.disposalSites.map(
                (disposalSite) => ({
                  label: disposalSite.name,
                  value: disposalSite.id,
                }),
              )}
            />
            <ErrorMessage message={errors.disposalSite?.message} />
          </div>
        </div>
        <div className="p-2 w-fit rounded-lg">
          <Label label="Load Call" />
          <div className="flex items-center text-sm font-medium">
            <input
              type="range"
              id="load-call-range"
              min="5"
              defaultValue={50}
              max="95"
              step="5"
              {...register("loadCall", {
                required: "Load Call is required",
                valueAsNumber: true,
              })}
              onInput={(e) => {
                const sliderValue = document.getElementById("sliderValue");
                const value = (e.target as HTMLInputElement).value;
                if (sliderValue && value) {
                  sliderValue.innerHTML = `${value} %`;
                }
              }}
            />
            <output className="mx-4" id="sliderValue">
              50 %
            </output>
          </div>
          <ErrorMessage message={errors.loadCall?.message} />
        </div>

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
                          validateFileSize(file, maxUploadFileSizeAllowed),
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
        </div>
      </form>
    </div>
  );
}

export function TruckTaskCollectionForm({ taskId }: TruckTaskFormProps) {
  const defaultFileValue: FileForm[] = [
    { fileInstance: undefined },
    { fileInstance: undefined },
    { fileInstance: undefined },
    { fileInstance: undefined },
  ];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, submitCount },
  } = useForm<CollectionTaskFormProps>({
    defaultValues: {
      comment: "",
      files: defaultFileValue,
    },
  });

  const {
    fields: weighPoints,
    append: appendWeighPoint,
    remove: removeWeighPoint,
  } = useFieldArray({
    control,
    name: "weighPoints",
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
    from: "/tasks/truck-tasks/collection/$id",
  });

  const truckCollectionCol =
    useRxCollection<CollectionTaskDocType>("collection-task");

  async function submitForm(data: CollectionTaskFormProps) {
    if (noFilesUploaded) return;

    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      toast.error("Coordinates not found");
      return;
    }

    const images = await genTaskImagesMetadata({
      filesData: data.files,
      coordinates,
    });

    const nowUTC = new Date().toISOString();

    await truckCollectionCol?.upsert({
      capacity: data.capacity,
      contractor: data.contractor,
      created_at: nowUTC,
      debris_type: data.debrisType,
      id: taskId,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
      truck_id: data.truckNumber,
      weigh_points: data.weighPoints,
      comment: data.comment,
      updated_at: nowUTC,
      images,
    });

    navigate({ to: "/print/$id", params: { id: taskId } });
  }

  function handleRemove(index: number, id: string) {
    removePreview(id);
    update(index, { fileInstance: undefined });
  }

  async function addWeighPoint() {
    const geolocation = await getGeoLocationHandler();
    appendWeighPoint(geolocation);
  }

  // Data from RxDB to populate the input options
  const rxdbContractorsObject = useContractors();
  const rxdbTrucksObject = useTrucks();
  const rxdbDebrisTypesObject = useDebrisTypes();

  return (
    <div className="relative">
      <div className="capitalize font-medium text-xl pb-4">Collection</div>
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

        <div className="p-2">
          <LabelledSelect
            label="Truck Number"
            {...register("truckNumber", {
              required: "Truck Number is required",
            })}
            options={rxdbTrucksObject.trucks.map((truck) => ({
              label: truck.truck_number,
              value: truck.id,
            }))}
          />
          <ErrorMessage message={errors.truckNumber?.message} />
        </div>

        <div className="p-2">
          <LabelledSelect
            label="Contractor"
            {...register("contractor", {
              required: "Contractor is required",
            })}
            options={rxdbContractorsObject.contractors.map((contractor) => ({
              label: contractor.name,
              value: contractor.id,
            }))}
          />
          <ErrorMessage message={errors.contractor?.message} />
        </div>

        <div className="p-2">
          <LabelledSelect
            label="Debris Type"
            {...register("debrisType", {
              required: "Debris Type is required",
            })}
            options={rxdbDebrisTypesObject.debrisTypes.map((debrisType) => ({
              label: debrisType.name,
              value: debrisType.id,
            }))}
          />
          <ErrorMessage message={errors.debrisType?.message} />
        </div>
        <div className="p-2">
          <LabelledInput
            label="Capacity"
            {...register("capacity", { valueAsNumber: true })}
            placeholder="in yards&sup3;"
            type="number"
            min="0"
            max="1000000"
          />
        </div>

        <div className="p-2 flex flex-col gap-2">
          <Label label="Waypoints" />
          <div className="text-sm w-fit">
            <Button
              onClick={addWeighPoint}
              name="add-weigh-point"
              type="button"
              bgColor="bg-slate-500"
            >
              Add Waypoint
            </Button>
          </div>
          <div>
            {weighPoints.map((weighPoint, index) => {
              return (
                <div className="relative flex w-fit" key={weighPoint.id}>
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
                          validateFileSize(file, maxUploadFileSizeAllowed),
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
        </div>
      </form>
    </div>
  );
}

export function CollectionFormWrapper() {
  const { id } = useParams({ from: "/tasks/truck-tasks/collection/$id" });

  return <TruckTaskCollectionForm taskId={id} />;
}

export function DisposalFormWrapper() {
  const { id } = useParams({ from: "/tasks/truck-tasks/disposal/$id" });

  return <TruckTaskDisposalForm taskId={id} />;
}
