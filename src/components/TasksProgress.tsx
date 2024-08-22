import {
  CheckCircleIcon,
  CheckIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { Link, LinkOptions, useNavigate } from "@tanstack/react-router";
import classNames from "classnames";
import { QRCodeCanvas } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import toast, { LoaderIcon } from "react-hot-toast";
import {
  extractFilesAndSaveToNhost,
  humanizeDate,
  nhost,
  useDailyTasks,
  useIsTaskIdSynchedToServer,
} from "../hooks";
import {
  CollectionTaskDocType,
  DisposalTaskDocType,
  Images,
  Steps,
  StumpRemovalTaskDocType,
  TicketingTaskDocType,
  TreeRemovalTaskDocType,
} from "../rxdb/rxdb-schemas";
import { Button } from "./Forms";
import { Image } from "./Image";
import { Modal, ModalContentProps, ModalTriggerProps } from "./Modal";
import { Spinner } from "./icons";
import { useAccessToken } from "@nhost/react";
import { manuallySynchTask } from "../rxdb/utils";
import { prepareTaskWriteData } from "../rxdb/replication-handlers";
import { resolveRequestDocument } from "graphql-request";
import { upsertTicketingTasks } from "../rxdb/graphql-operations";

type TGeneralTaskCard =
  | ({ task: CollectionTaskDocType } & { type: "collection" })
  | ({ task: DisposalTaskDocType } & { type: "disposal" })
  | ({ task: TicketingTaskDocType } & { type: "ticketing" });

type TPrintAndCopy =
  | TGeneralTaskCard["task"]
  | TreeRemovalTaskDocType
  | StumpRemovalTaskDocType;

function Synched({ taskId }: { taskId: string }) {
  const { result, isFetching } = useIsTaskIdSynchedToServer(taskId);

  return (
    <div className="text-xs flex gap-1 items-center font-bold">
      {isFetching ? (
        <LoaderIcon className="w-5 h-5" />
      ) : result ? (
        <CheckCircleIcon className="w-6 text-green-800" />
      ) : (
        <XCircleIcon className="w-6 text-red-500" />
      )}
      Synched
    </div>
  );
}

function PrintAndCopy({ task }: { task: TPrintAndCopy }) {
  return (
    <>
      <Button bgColor="bg-gray-700">
        <Link to="/print/$id" params={{ id: task.id }}>
          Print
        </Link>
      </Button>
      <Button
        onClick={() => {
          const content = JSON.stringify(task, null, 4);
          navigator.clipboard.writeText(content);
          toast.success("Copied task to clipboard!");
        }}
        bgColor="bg-gray-700"
      >
        Copy
      </Button>
    </>
  );
}

async function fetchImages<T extends Images>(
  images: T[] | undefined,
): Promise<T[]> {
  return Promise.all(
    images?.map(async (image) => {
      // when not synched with the server, the image will already have
      // a base64Preview string
      if (image.base64Preview) {
        return image;
      }
      const { presignedUrl } = await nhost.storage.getPresignedUrl({
        fileId: image.id,
        width: 500,
      });
      // using the same base64Preview field to store the presignedUrl
      return { ...image, base64Preview: presignedUrl?.url };
    }) || [],
  );
}

function generateSteps(
  taskId: string,
  images: Images[],
  type: "tree" | "stump",
) {
  const steps: Steps[] = ["before", "during", "after"];
  const takenAtSteps = images.map((image) => image.taken_at_step);
  const missingSteps = steps.filter((step) => !takenAtSteps.includes(step));
  // add href link only to first step
  const missingStepsFinal = missingSteps.map((step, index) => {
    if (index === 0) {
      return {
        step,
        href: `/tasks/field-monitor/${
          type === "tree" ? "tree" : "stump"
        }-removal/${taskId}?step=${step}`,
      };
    }
    return {
      step,
      disabled: true,
    };
  });

  const groupedSteps = images.reduce(
    (acc, image) => {
      const { taken_at_step } = image;
      if (taken_at_step && !acc[taken_at_step]) {
        acc[taken_at_step] = [];
      }
      if (taken_at_step) acc[taken_at_step].push(image);
      return acc;
    },
    {} as Record<Steps, Images[]>,
  );

  return { missingSteps: missingStepsFinal, steps: groupedSteps };
}

function TaskCheck({
  taken_at_step,
  icon,
}: {
  taken_at_step: Steps;
  icon: "done" | "add" | "disabled";
}) {
  const iconComponent = () => {
    switch (icon) {
      case "done":
        return <CheckIcon className="text-white" />;
      case "add":
        return <PlusIcon className="text-white" />;
      case "disabled":
        return <div />;
      default:
        return <div />;
    }
  };

  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <p
        className={classNames("text-xs text-center capitalize", {
          "text-gray-500": icon === "disabled",
        })}
      >
        {taken_at_step} <br /> measurement
      </p>
      <div
        className={classNames("rounded-xl border-2 w-14 h-14", {
          "bg-amber-500": icon === "add",
          "bg-green-500": icon === "done",
          "bg-gray-400": icon === "disabled",
        })}
      >
        {iconComponent()}
      </div>
    </div>
  );
}

function useImagePreviews<T extends Images>(images: T[]) {
  const [fetchedImages, setFetchedImages] = useState<T[]>([]);

  useEffect(() => {
    const filteredImages = images.filter((image) => !image._deleted);
    fetchImages(filteredImages).then((v) => setFetchedImages(v));
  }, [images]);

  return fetchedImages;
}

function TaskPreview({
  modalProps,
  images,
  task,
  taken_at_step,
  type,
}: {
  modalProps: ModalContentProps;
  images: Images[];
  task: TreeRemovalTaskDocType;
  taken_at_step: Steps;
  type: "tree" | "stump";
}) {
  const fetchedImages = useImagePreviews(images);

  const navigate = useNavigate({ from: "/tasks" });

  const to = (
    type === "tree"
      ? "/tasks/field-monitor/tree-removal/$id"
      : "/tasks/field-monitor/stump-removal/$id"
  ) satisfies LinkOptions["to"];

  const edit = () =>
    navigate({
      to,
      params: { id: task.id },
      search: { step: taken_at_step, edit: true },
    });

  return (
    <div className="relative flex flex-col gap-4">
      <div className="flex gap-1">
        <div className="font-medium">Date:</div>
        {humanizeDate(task.updated_at)}
      </div>

      {taken_at_step === "during" && task.ranges && (
        <div className="flex gap-1">
          <div className="font-medium">Ranges:</div>
          {task.ranges}
        </div>
      )}

      {fetchedImages.map((image) => (
        <div className="" key={image.id}>
          <Image src={image.base64Preview} alt="" />
        </div>
      ))}
      <div className="flex justify-between">
        <div className="w-fit">
          <Button onClick={modalProps.closeModal}>Back</Button>
        </div>
        <div className="w-fit">
          <Button onClick={edit}>Retake</Button>
        </div>
      </div>
    </div>
  );
}

function _QRCodeID({ taskId }: { taskId: string }) {
  const modalTrigger = useCallback(
    ({ openModal }: ModalTriggerProps) => (
      <Button bgColor="bg-gray-700" onClick={openModal}>
        Show Task ID
      </Button>
    ),
    [],
  );

  const modalBody = useCallback(
    (_modalProps: ModalContentProps, taskId: string) => (
      <div className="w-full">
        <QRCodeCanvas value={taskId} includeMargin />
      </div>
    ),
    [],
  );

  return (
    <div>
      <Modal
        title="Task ID"
        modalTrigger={modalTrigger}
        modalContent={(props) => modalBody(props, taskId)}
      />
    </div>
  );
}

type TreeStumpRemovalProps =
  | {
      type: "tree";
      task: TreeRemovalTaskDocType;
    }
  | {
      type: "stump";
      task: StumpRemovalTaskDocType;
    };

function TreeStumpRemovalSingleTask({ task, type }: TreeStumpRemovalProps) {
  const { missingSteps, steps } = generateSteps(task.id, task.images, type);

  const modalTrigger = useCallback(
    ({ openModal }: ModalTriggerProps, taken_at_step: Steps) => (
      <button type="button" onClick={openModal}>
        <TaskCheck taken_at_step={taken_at_step} icon="done" />
      </button>
    ),
    [],
  );

  const modalBody = useCallback(
    (
      modalProps: ModalContentProps,
      images: Images[],
      task: TreeRemovalTaskDocType,
      taken_at_step: Steps,
    ) => (
      <TaskPreview
        type={type}
        modalProps={modalProps}
        images={images}
        task={task}
        taken_at_step={taken_at_step}
      />
    ),
    [type],
  );
  return (
    <div>
      <div key={task.id} className="bg-stone-300 rounded-lg p-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-4 items-center">
            <Synched taskId={task.id} />
            <div className="text-xs">ID: {task.id}</div>
          </div>

          <div className="flex justify-end items-center gap-1">
            <div className="text-xs">Created At:</div>
            <div className="text-xs">{humanizeDate(task.created_at)}</div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-10 items-end">
            {Object.entries(steps).map(([taken_at_step, images]) => (
              <Modal
                key={taken_at_step}
                title={`${taken_at_step} measurement`}
                modalTrigger={(props) =>
                  modalTrigger(props, taken_at_step as Steps)
                }
                modalContent={(props) =>
                  modalBody(props, images, task, taken_at_step as Steps)
                }
              />
            ))}
            {missingSteps.map(({ disabled, step, href }) => (
              <div key={step}>
                {disabled ? (
                  <TaskCheck taken_at_step={step} icon="disabled" />
                ) : (
                  <Link key={href} to={href}>
                    <TaskCheck taken_at_step={step} icon="add" />
                  </Link>
                )}
              </div>
            ))}
          </div>
          {task.completed && <PrintAndCopy task={task} />}
        </div>
      </div>
    </div>
  );
}

function SynchTicketingButton({ task }: { task: TicketingTaskDocType }) {
  const { result: isSynched } = useIsTaskIdSynchedToServer(task.id);
  const [isSendingData, setIsSendingData] = useState<boolean>();
  const token = useAccessToken();

  async function synchTicketingTask() {
    setIsSendingData(true);
    const { nhostImages, taskIds, variableImages, variableTasks } =
      prepareTaskWriteData([task]);

    await extractFilesAndSaveToNhost(nhostImages);

    const query = resolveRequestDocument(upsertTicketingTasks).query;
    const variables = {
      taskIds,
      images: variableImages,
      tasks: variableTasks,
    };

    toast
      .promise(
        manuallySynchTask({ token, query, variables }),
        {
          loading: "Synching task to server",
          success: "Tasks synched",
          error: (error) => `Failed to synch task: ${error.message}`,
        },
        {
          duration: 5000,
        },
      )
      .then(() => setIsSendingData(false))
      .catch(() => setIsSendingData(false));
  }

  return (
    <>
      {!isSynched && (
        <Button onClick={synchTicketingTask} disabled={isSendingData}>
          Synch
        </Button>
      )}
    </>
  );
}

type ImagesEnhanched = Images & { task_id: string };

function PicturePreviewSyncButton({ image }: { image: ImagesEnhanched }) {
  const imageIsLink = image.base64Preview?.startsWith("http");

  async function synchCallback() {
    toast.promise(
      extractFilesAndSaveToNhost([image]),
      {
        loading: "Synching image to server",
        success: (res) => {
          const parsedRes = JSON.stringify(res);

          return `Result: ${parsedRes}`;
        },
        error: (error) => `Failed to synch image: ${error.message}`,
      },
      {
        duration: 5000,
      },
    );
  }

  return (
    <div className="flex gap-4 p-3 items-center">
      <div className="w-2/3 flex-shrink-0">
        <Image src={image.base64Preview} alt="" />
      </div>
      {!imageIsLink ? (
        <Button onClick={synchCallback}> Synch </Button>
      ) : (
        "Image synched"
      )}
    </div>
  );
}

function PicturesPreviewModalContent({
  images,
}: {
  images: ImagesEnhanched[];
}) {
  const fetchedImages = useImagePreviews(images);

  return (
    <div className="flex flex-wrap gap-4">
      {fetchedImages.map((image) => (
        <PicturePreviewSyncButton key={image.id} image={image} />
      ))}
    </div>
  );
}

function PicturesPreviewModal({ images }: { images: ImagesEnhanched[] }) {
  const modalTrigger = useCallback(
    ({ openModal }: ModalTriggerProps) => (
      <Button bgColor="bg-gray-700" onClick={openModal}>
        Pictures
      </Button>
    ),
    [],
  );

  const modalBody = useCallback(
    (_modalProps: ModalContentProps, images: ImagesEnhanched[]) => (
      <div className="w-full">
        <PicturesPreviewModalContent images={images} />
      </div>
    ),
    [],
  );

  return (
    <div>
      <Modal
        title="Images"
        modalTrigger={modalTrigger}
        modalContent={(props) => modalBody(props, images)}
      />
    </div>
  );
}

function GeneralTaskCard({ data }: { data: TGeneralTaskCard }) {
  const { task, type } = data;
  const imagesEnhanched = task?.images?.map((images) => ({
    ...images,
    task_id: task.id,
  }));

  return (
    <div className="bg-stone-300 rounded-lg p-2 flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div className="flex gap-4 items-center">
          <Synched taskId={task.id} />
        </div>
        <div className="flex justify-end items-center gap-1">
          <div className="text-xs font-bold">Created At:</div>
          <div className="text-xs">{humanizeDate(task.created_at)}</div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <div className="text-sm flex flex-col gap-2">
            {"task_ticketing_name" in task && (
              <div>
                {" "}
                <span className="font-bold">Name:</span>{" "}
                {task.task_ticketing_name?.name}
              </div>
            )}
            <div>
              <span className="font-bold">Comment:</span> {task?.comment || "-"}{" "}
            </div>
          </div>
        </div>

        <div className="flex flex-col  gap-2">
          <div className="grid grid-cols-3 gap-2">
            <PicturesPreviewModal images={imagesEnhanched} />
            <PrintAndCopy task={task} />
          </div>

          {type === "ticketing" && <SynchTicketingButton task={task} />}
        </div>
      </div>
    </div>
  );
}

export function TasksProgress() {
  const { results, isFetching } = useDailyTasks();

  console.log("results", results);

  if (isFetching) return <Spinner />;

  if (Object.values(results).every((result) => result?.length === 0))
    return (
      <div className="flex flex-col gap-2">
        <div className="text-lg font-medium">No tasks </div>
        <div className="text-sm font-light">
          You can start a new task by clicking on the button below
        </div>
        <div className="w-fit">
          <Link to="/tasks">
            <Button>New Task</Button>
          </Link>
        </div>
      </div>
    );

  const treeRemovalTasks = results["tree-removal-tasks"];
  const stumpRemovalTasks = results["stump-removal-tasks"];
  const collectionTasks = results["collection-tasks"];
  const disposalTasks = results["disposal-tasks"];
  const ticketingTasks = results["ticketing-tasks"];

  return (
    <div className="flex flex-col gap-4">
      {treeRemovalTasks && treeRemovalTasks.length > 0 && (
        <div className="flex flex-col gap-4">
          <div>Tree Removal Tasks</div>
          {treeRemovalTasks.map((task) => (
            <TreeStumpRemovalSingleTask key={task.id} task={task} type="tree" />
          ))}
        </div>
      )}
      {stumpRemovalTasks && stumpRemovalTasks.length > 0 && (
        <div className="flex flex-col gap-4">
          <div>Stump Removal Tasks</div>
          {stumpRemovalTasks.map((task) => (
            <TreeStumpRemovalSingleTask
              key={task.id}
              task={task}
              type="stump"
            />
          ))}
        </div>
      )}
      {collectionTasks && collectionTasks.length > 0 && (
        <div className="flex flex-col gap-4">
          <div>Collection Tasks</div>
          {collectionTasks.map((task) => (
            <GeneralTaskCard
              key={task.id}
              data={{ task, type: "collection" }}
            />
          ))}
        </div>
      )}
      {disposalTasks && disposalTasks.length > 0 && (
        <div className="flex flex-col gap-4">
          <div>Disposal Tasks</div>
          {disposalTasks.map((task) => (
            <GeneralTaskCard key={task.id} data={{ task, type: "disposal" }} />
          ))}
        </div>
      )}
      {ticketingTasks && ticketingTasks.length > 0 && (
        <div className="flex flex-col gap-4">
          <div>Ticketing Tasks</div>
          {ticketingTasks.map((task) => (
            <GeneralTaskCard key={task.id} data={{ task, type: "ticketing" }} />
          ))}
        </div>
      )}
    </div>
  );
}
