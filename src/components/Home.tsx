import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'preact/hooks'

export function Home() {
  const { getToken, isSignedIn, isLoaded, userId, sessionId } = useAuth()

  useEffect(() => {
    if (isSignedIn) {
      getToken({ template: 'hasura' }).then((token) => {
        console.log(token)
      })
    }
  }, [getToken, isSignedIn])

  return (
    <div className='p-2'>
      <h3>Welcome Home! {isLoaded} </h3>
      <h3>userId: {userId} </h3>
      <h3>sessionId: {sessionId} </h3>
    </div>
  )
}
