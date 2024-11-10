import classNames from "classnames";
import {
	type ButtonHTMLAttributes,
	type InputHTMLAttributes,
	type SelectHTMLAttributes,
	type TextareaHTMLAttributes,
	forwardRef,
} from "react";

export const labelClasses = "block text-sm font-medium leading-6 text-gray-900";

const inputClasses =
	"block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-gray-700 sm:text-sm sm:leading-6";

export const buttonClasses =
	"flex justify-center gap-2 w-full items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700";

export const selectClasses =
	"block w-full rounded-md border-0 py-1.5 px-2 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-gray-700 sm:text-sm sm:leading-6";

export const Input = forwardRef<
	HTMLInputElement,
	InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
	<input
		className={classNames(inputClasses, props.hidden && "hidden")}
		ref={ref}
		{...props}
	/>
));

export function Label({ label }: { label: string }) {
	return <label className={labelClasses}>{label}</label>;
}

export const TextArea = forwardRef<
	HTMLTextAreaElement,
	React.HTMLAttributes<HTMLTextAreaElement>
>((props, ref) => (
	<textarea className={classNames(inputClasses)} ref={ref} {...props} />
));

export function ErrorMessage({ message }: { message: string | undefined }) {
	return (
		<div>
			{message && <div className="mt-2 text-sm text-red-600">{message}</div>}
		</div>
	);
}

export const LabelledInput = forwardRef<
	HTMLInputElement,
	InputHTMLAttributes<HTMLInputElement> & { label: string }
>(({ label, ...props }, ref) => (
	<label htmlFor={props.name} className={labelClasses}>
		{label}
		<div className="mt-2">
			<Input ref={ref} {...props} />
		</div>
	</label>
));

export const LabelledTextArea = forwardRef<
	HTMLTextAreaElement,
	TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }
>(({ label, ...props }, ref) => (
	<label htmlFor={props.name} className={labelClasses}>
		{label}
		<div className="mt-2">
			<TextArea ref={ref} {...props} />
		</div>
	</label>
));

export function Button({
	children,
	bgColor,
	textColor,
	className,
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
	bgColor?: string;
	textColor?: string;
}) {
	return (
		<button
			type={props.type === "submit" ? "submit" : "button"}
			{...props}
			className={classNames(
				buttonClasses,
				className ?? [
					bgColor || "bg-green-700 hover:bg-green-500",
					textColor || "text-white",
				],
			)}
		>
			{children}
		</button>
	);
}

export function DefaultOption() {
	return (
		<option value="" disabled>
			Select your option
		</option>
	);
}

export type TOption = { value: string; label: string };

export const Select = forwardRef<
	HTMLSelectElement,
	SelectHTMLAttributes<HTMLSelectElement> & { options: TOption[] }
>(({ options, ...props }, ref) => (
	<div>
		<select defaultValue="" className={selectClasses} ref={ref} {...props}>
			<DefaultOption />
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	</div>
));

export const LabelledSelect = forwardRef<
	HTMLSelectElement,
	SelectHTMLAttributes<HTMLSelectElement> & {
		label: string;
		options: TOption[];
	}
>(({ label, ...props }, ref) => (
	<label htmlFor={props.name} className={labelClasses}>
		{label}
		<div className="mt-2">
			<Select ref={ref} {...props} />
		</div>
	</label>
));
