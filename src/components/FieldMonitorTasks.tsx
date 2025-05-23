import { CameraIcon, XCircleIcon } from "@heroicons/react/20/solid";
import {
	Link,
	useNavigate,
	useParams,
	useSearch,
} from "@tanstack/react-router";
import classNames from "classnames";
import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRxCollection } from "rxdb-hooks";
import { v4 } from "uuid";
import {
	type FileForm,
	genTaskImagesMetadata,
	humanizeDate,
	useFilesForm,
	useGeoLocation,
	useProject,
} from "../hooks";
import type {
	Steps,
	StumpRemovalTaskDocType,
	TreeRemovalTaskDocType,
} from "../rxdb/rxdb-schemas";
import { maxUploadFileSizeAllowed } from "../rxdb/utils";
import {
	Button,
	ErrorMessage,
	Input,
	Label,
	LabelledInput,
	LabelledTextArea,
} from "./Forms";
import { TaskType } from "./common";
import { Spinner } from "./icons";

export function FieldMonitorTasks() {
	const { activeProject } = useProject();

	return (
		<div className="flex flex-col gap-2">
			<Link
				to="/tasks/field-monitor/tree-removal/$id"
				params={{ id: v4() }}
				search={{ step: "before" }}
			>
				<TaskType name="hazardous tree removal" />
			</Link>
			<Link
				to="/tasks/field-monitor/stump-removal/$id"
				search={{ step: "before" }}
				params={{ id: v4() }}
			>
				<TaskType name="branch/stump tree removal" />
			</Link>

			{activeProject?.ticketing_names?.map(({ id, name }) => (
				<Link
					key={id}
					to="/tasks/field-monitor/ticketing/$ticketingId/$id"
					params={{ ticketingId: id, id: v4() }}
				>
					<TaskType name={name} />
				</Link>
			))}
		</div>
	);
}

type TreeRemovalFormProps = {
	taskId: string;
	step: Steps;
	edit: boolean | undefined;
	type: "tree" | "stump";
};

type FormProps = {
	comment?: string;
	ranges?: string;
	files: FileForm[];
};

function TreeStumpRemovalForm({
	taskId,
	step,
	edit,
	type,
}: TreeRemovalFormProps) {
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
		from: "/tasks/field-monitor/tree-removal/$id",
	});

	const treeRemovalColl =
		useRxCollection<TreeRemovalTaskDocType>("tree-removal-task");
	const stumpRemovalColl =
		useRxCollection<StumpRemovalTaskDocType>("stump-removal-task");

	async function submitForm(data) {
		if (noFilesUploaded) return;

		if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
			toast.error("Coordinates not found");
			return;
		}

		const images = await genTaskImagesMetadata({
			filesData: data.files,
			coordinates,
			taken_at_step: step,
		});

		const nowUTC = new Date().toISOString();

		const existingTreeDoc = await treeRemovalColl?.findOne(taskId).exec();
		const existingStumpDoc = await stumpRemovalColl?.findOne(taskId).exec();
		const existingDoc = type === "tree" ? existingTreeDoc : existingStumpDoc;

		const updatedImages = edit
			? existingDoc?.images.map((image) => {
					if (image.taken_at_step === step) return { ...image, _deleted: true };

					return image;
				})
			: existingDoc?.images;

		if (type === "tree") {
			await treeRemovalColl?.upsert({
				id: taskId,
				images: updatedImages?.concat(images) || images,
				comment: data.comment,
				created_at: nowUTC,
				updated_at: nowUTC,
				ranges: data?.ranges?.length
					? data.ranges
					: (existingDoc as TreeRemovalTaskDocType)?.ranges,
				completed: step === "after",
			});
		} else {
			await stumpRemovalColl?.upsert({
				id: taskId,
				images: updatedImages?.concat(images) || images,
				comment: data.comment,
				created_at: nowUTC,
				updated_at: nowUTC,
				completed: step === "after",
			});
		}

		if (step === "after") {
			navigate({ to: "/print/$id", params: { id: taskId } });
		} else {
			navigate({ to: "/progress" });
		}
	}

	function handleRemove(index: number, id: string) {
		removePreview(id);
		update(index, { fileInstance: undefined });
	}

	return (
		<div>
			<div className="capitalize font-medium pb-4">
				{type} Removal - {`${step} measurement`}
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

				{step === "during" && type !== "stump" && (
					<div className="p-2 w-full rounded-lg">
						<LabelledInput
							label="Ranges"
							{...register("ranges", { required: "Ranges filed is required" })}
						/>
						<ErrorMessage message={errors.ranges?.message} />
					</div>
				)}

				<div className="p-2">
					<Label label="Photos" />
					<div className="flex flex-col">
						{fields.map(({ id }, index) => (
							<div className="flex flex-col gap-1 my-2" key={id}>
								<div
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
													validateFileSize(file, maxUploadFileSizeAllowed),
											},
											onChange: (e) => {
												onChangeSetFilePreview(e, id);
											},
										})}
									/>
								</div>
								{filePreviews?.[id] && (
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
								{errors.files?.[index] && (
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
				{step === "after" && (
					<div className="p-2 w-full rounded-lg">
						<LabelledTextArea
							label="Comment"
							{...register("comment", { required: "Task name is required" })}
						/>
						<ErrorMessage message={errors.comment?.message} />
					</div>
				)}
				<div className="px-2">
					<Button type="submit">Save</Button>
				</div>
			</form>
		</div>
	);
}

export function TreeRemovalFormWrapper() {
	const { id } = useParams({ from: "/tasks/field-monitor/tree-removal/$id" });
	const { step, edit } = useSearch({
		from: "/tasks/field-monitor/tree-removal/$id",
	});

	return (
		<TreeStumpRemovalForm taskId={id} step={step} edit={edit} type="tree" />
	);
}

export function StumpRemovalFormWrapper() {
	const { id } = useParams({ from: "/tasks/field-monitor/stump-removal/$id" });
	const { step, edit } = useSearch({
		from: "/tasks/field-monitor/stump-removal/$id",
	});

	return (
		<TreeStumpRemovalForm taskId={id} step={step} edit={edit} type="stump" />
	);
}
