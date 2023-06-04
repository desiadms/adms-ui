import { useFileUpload } from '@nhost/react'
import { useEffect, useState } from 'preact/hooks'
import { useForm } from 'react-hook-form'
import { useCamera } from '../customHooks'
import { nhost } from '../helpers'

export function CameraView() {
  const [capturedImages, deleteImage] = useCamera()
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
      {capturedImages.map((image, index) => (
        <div className='flex flex-col gap-2'>
          <img
            key={image}
            width={200}
            height={200}
            src={image}
            alt={`Captured ${index}`}
          />
          <button
            type='button'
            className='bg-red-700 text-white p-2 w-fit rounded-lg'
            onClick={() => deleteImage(index)}
          >
            Delete
          </button>
        </div>
      ))}

      {capturedImages.length < 4 && (
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
      )}
      <button type='submit'>Submit</button>
    </form>
  )
}
