import classNames from 'classnames'
import { forwardRef, useState } from 'preact/compat'
import { JSX } from 'preact/jsx-runtime'

const inputClasses =
  'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-700 sm:text-sm sm:leading-6'

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
  <label
    htmlFor={props.name}
    className='block text-sm font-medium leading-6 text-gray-900'
  >
    {label}
    <div className='mt-2'>
      <Input ref={ref} {...props} />
    </div>
  </label>
))

export const buttonClasses =
  'flex justify-center gap-2 w-full items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-700 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700'

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

function onChangeSetFilePreview(event, callback: (url) => void) {
  const fileInput = event?.target
  const file = fileInput?.files?.[0]
  const reader = new FileReader()

  reader.onload = (e: ProgressEvent<FileReader>) => {
    const url = e?.target?.result
    callback(url)
  }

  reader.readAsDataURL(file)
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

  const onChangeSetFilePreviewFn = (e, id) => {
    onChangeSetFilePreview(e, (url) =>
      setFilePreviews({ ...filePreviews, [id]: url })
    )
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
