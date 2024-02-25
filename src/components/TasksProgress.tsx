import { CheckIcon, PlusIcon } from "@heroicons/react/20/solid";
import { ClockIcon } from "@heroicons/react/24/outline";
import { Link, LinkOptions, useNavigate } from "@tanstack/react-router";
import classNames from "classnames";
import { QRCodeCanvas } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import { RxDocument } from "rxdb";
import {
  Images,
  Steps,
  StumpRemovalTaskDocType,
  TreeRemovalTaskDocType,
} from "../rxdb/rxdb-schemas";
import {
  humanizeDate,
  nhost,
  useStumpRemovalTasks,
  useTreeRemovalTasks,
} from "../utils";
import { Button } from "./Forms";
import { Image } from "./Image";
import { Modal, ModalContentProps, ModalTriggerProps } from "./Modal";
import { Spinner } from "./icons";

async function fetchImages(images: Images[] | undefined) {
  return Promise.all(
    images?.map(async (image) => {
      // when not synched with the server, the image will already have
      // a base64Preview string
      if (image.base64Preview) {
        return image;
      }
      const { presignedUrl } = await nhost.storage.getPresignedUrl({
        fileId: image.id,
      });
      // using the same base64Preview field to store the presignedUrl
      return { ...image, base64Preview: presignedUrl?.url };
    }) || [],
  );
}

function useInProgressTasks() {
  const tree = useTreeRemovalTasks({ completed: false });
  const stump = useStumpRemovalTasks({ completed: false });

  const isFetching = tree.isFetching || stump.isFetching;

  return {
    results: {
      "tree-removal-tasks": tree.result,
      "stump-removal-tasks": stump.result,
    },
    isFetching,
  };
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

  const groupedSteps = images.reduce((acc, image) => {
    const { taken_at_step } = image;
    if (taken_at_step && !acc[taken_at_step]) {
      acc[taken_at_step] = [];
    }
    if (taken_at_step) acc[taken_at_step].push(image);
    return acc;
  }, {} as Record<Steps, Images[]>);

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
        className={classNames("rounded-xl border-2 w-20 h-20", {
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
  const [fetchedImages, setFetchedImages] = useState<Images[]>([]);

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

  useEffect(() => {
    const filteredImages = images.filter((image) => !image._deleted);
    fetchImages(filteredImages).then(setFetchedImages);
  }, [images]);

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

function QRCodeID({ taskId }: { taskId: string }) {
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
      task: RxDocument<TreeRemovalTaskDocType>;
    }
  | {
      type: "stump";
      task: RxDocument<StumpRemovalTaskDocType>;
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
          <div className="w-fit">
            <QRCodeID taskId={task.id} />
          </div>
          <div className="flex justify-end items-center gap-1 pb-4">
            <div className="text-xs">
              <ClockIcon className="w-4 h-4" />
            </div>
            <div className="text-xs">{humanizeDate(task.updated_at)}</div>
          </div>
        </div>
        <div className="flex gap-10 items-end">
          {Object.entries(steps).map(([taken_at_step, images]) => (
            <Modal
              title={`${taken_at_step} measurement`}
              key={taken_at_step}
              modalTrigger={(props) =>
                modalTrigger(props, taken_at_step as Steps)
              }
              modalContent={(props) =>
                modalBody(props, images, task, taken_at_step as Steps)
              }
            />
          ))}
          {missingSteps.map(({ disabled, step, href }) => (
            <div>
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
      </div>
    </div>
  );
}

export function TasksProgress() {
  const { results, isFetching } = useInProgressTasks();

  if (isFetching) return <Spinner />;

  if (Object.values(results).every((result) => result.length === 0))
    return (
      <div className="flex flex-col gap-2">
        <div className="text-lg font-medium">No tasks in progress</div>
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

  return (
    <div className="flex flex-col gap-4">
      {results["tree-removal-tasks"].length > 0 && (
        <div className="flex flex-col gap-4">
          <div>Tree Removal Tasks</div>
          {results["tree-removal-tasks"]?.map((task) => (
            <TreeStumpRemovalSingleTask key={task.id} task={task} type="tree" />
          ))}
        </div>
      )}
      {results["stump-removal-tasks"].length > 0 && (
        <div className="flex flex-col gap-4">
          <div>Stump Removal Tasks</div>
          {results["stump-removal-tasks"]?.map((task) => (
            <TreeStumpRemovalSingleTask
              key={task.id}
              task={task}
              type="stump"
            />
          ))}
        </div>
      )}
    </div>
  );
}
