import { useGeoLocation } from '../helpers'

export function GeoLocationView() {
  const { coordinates, isLoading, error } = useGeoLocation()

  return (
    <div className='w-fit'>
      {isLoading && <span>Finding Coordinates...</span>}
      {error && <div>Error: {error}</div>}
      {coordinates && (
        <div>
          <div>Latitude: {coordinates.latitude}</div>
          <div>Longitude: {coordinates.longitude}</div>
        </div>
      )}
    </div>
  )
}
