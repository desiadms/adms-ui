import { useFileUpload } from '@nhost/react'
import { useEffect, useState } from 'preact/hooks'
import { useForm } from 'react-hook-form'
import { nhost } from '../helpers'

export function CameraView() {
  const { register, handleSubmit } = useForm()

  const { upload } = useFileUpload()

  const handleFormSubmit = async (data) => {
    const file = data.file[0]
    await upload({ file })
  }

  const [url, setUrl] = useState<string>()

  useEffect(() => {
    const foo = async () => {
      const { presignedUrl, error } = await nhost.storage.getPresignedUrl({
        fileId: 'f774136b-bd1b-4f24-b637-caffaf98352e'
      })
      console.log(presignedUrl, error)
      setUrl(presignedUrl?.url)
    }

    foo()
  }, [])

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <img src={url} alt='test' />

      <div className='p-2 bg-slate-500 w-fit text-white rounded-lg'>
        <label htmlFor='camera'>
          Take Picture
          <input
            id='camera'
            type='file'
            accept='image/*'
            capture='camera'
            className='hidden'
            {...register('file')}
          />
        </label>
      </div>
      <button type='submit'>Submit</button>
    </form>
  )
}
