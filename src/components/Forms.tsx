import classNames from 'classnames'
import { forwardRef, useState } from 'preact/compat'
import { JSX } from 'preact/jsx-runtime'
import { blobToBase64 } from '../utils'

export const labelClasses = 'block text-sm font-medium leading-6 text-gray-900'

const inputClasses =
  'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-700 sm:text-sm sm:leading-6'

export const buttonClasses =
  'flex justify-center gap-2 w-full items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700'

export const Input = forwardRef<
  HTMLInputElement,
  JSX.HTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    className={classNames(inputClasses, props.hidden && 'hidden')}
    ref={ref}
    {...props}
  />
))

export function Label({ label }: { label: string }) {
  return <label className={labelClasses}>{label}</label>
}

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  JSX.HTMLAttributes<HTMLTextAreaElement>
>((props, ref) => (
  <textarea className={classNames(inputClasses)} ref={ref} {...props} />
))

export function ErrorMessage({ message }: { message: string | undefined }) {
  return (
    <div>
      {message && <div className='mt-2 text-sm text-red-600'>{message}</div>}
    </div>
  )
}

export const LabelledInput = forwardRef<
  HTMLInputElement,
  JSX.HTMLAttributes<HTMLInputElement> & { label: string }
>(({ label, ...props }, ref) => (
  <label htmlFor={props.name} className={labelClasses}>
    {label}
    <div className='mt-2'>
      <Input ref={ref} {...props} />
    </div>
  </label>
))

export const LabelledTextArea = forwardRef<
  HTMLTextAreaElement,
  JSX.HTMLAttributes<HTMLTextAreaElement> & { label: string }
>(({ label, ...props }, ref) => (
  <label htmlFor={props.name} className={labelClasses}>
    {label}
    <div className='mt-2'>
      <TextArea ref={ref} {...props} />
    </div>
  </label>
))

export function Button({
  children,
  ...props
}: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={props.type === 'submit' ? 'submit' : 'button'}
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  )
}

export function convertFileSize(fileSize: number): string {
  return (fileSize / 1000000).toFixed(0)
}

export function validateFileSize(
  file: File | undefined,
  maxSize: number
): string | undefined {
  if (file && file[0]) {
    const { size } = file[0]
    if (size > maxSize) {
      return `File cannot exceed ${convertFileSize(maxSize)}MB`
    }
  }
}

export function useFilesForm() {
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>()

  const onChangeSetFilePreviewFn = async (e, id) => {
    const fileInput = e?.target
    const file = fileInput?.files?.[0]
    const url = await blobToBase64(file)
    setFilePreviews({ ...filePreviews, [id]: url })
  }

  const validateFileSizeFn = (file, maxSize) => validateFileSize(file, maxSize)

  return {
    useFilePreviews: [filePreviews, setFilePreviews],
    onChangeSetFilePreview: onChangeSetFilePreviewFn,
    validateFileSize: validateFileSizeFn,
    removePreview: (id) => {
      setFilePreviews((images) => {
        if (images && images[id]) {
          const { [id]: _file, ...rest } = images
          return rest
        }
        return images
      })
    }
  }
}
