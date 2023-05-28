import { useCamera } from '../customHooks'

export function CameraView() {
  const [capturedImages, handleCapture, deleteImage] = useCamera()

  return (
    <div>
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
              onChange={handleCapture}
            />
          </label>
        </div>
      )}
    </div>
  )
}
