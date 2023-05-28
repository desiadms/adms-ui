import { useEffect, useState } from 'preact/hooks'

export function useGeoLocation() {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(
    null
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  function getGeoLocation() {
    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = position.coords
        setCoordinates(pos)
        setIsLoading(false)
      },
      (error) => {
        setError(error.message)
        setIsLoading(false)
      }
    )
  }

  useEffect(() => {
    getGeoLocation()
  }, [])

  return { coordinates, isLoading, error, getGeoLocation }
}

export function useCamera(): [
  string[],
  (event: React.ChangeEvent<HTMLInputElement>) => void,
  (index: number) => void
] {
  const [capturedImages, setCapturedImages] = useState<string[]>([])

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const imageSrc = reader.result as string
        setCapturedImages((images) => [...images, imageSrc])
      }
      reader.readAsDataURL(file)
    }
  }

  const deleteImage = (index: number) => {
    setCapturedImages((images) => images.filter((_, i) => i !== index))
  }

  return [capturedImages, handleCapture, deleteImage]
}
