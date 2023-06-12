import { forwardRef } from 'preact/compat'
import { JSX } from 'preact/jsx-runtime'

const inputClasses =
  'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-700 sm:text-sm sm:leading-6'

export const Input = forwardRef<
  HTMLInputElement,
  JSX.HTMLAttributes<HTMLInputElement>
>((props, ref) => <input className={inputClasses} ref={ref} {...props} />)

export function Error({ message }: { message: string | undefined }) {
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
