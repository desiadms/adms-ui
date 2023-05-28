import { useSignIn } from '@clerk/clerk-react'
import { ChangeEvent, TargetedEvent } from 'preact/compat'
import { useState } from 'preact/hooks'

export function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { isLoaded, signIn, setActive } = useSignIn()

  if (!isLoaded) {
    return null
  }

  async function submit(e: TargetedEvent<HTMLFormElement, Event>) {
    e.preventDefault()
    if (signIn)
      await signIn
        .create({
          identifier: email,
          password
        })
        .then((result) => {
          if (result.status === 'complete') {
            console.log(result)
            setActive({ session: result.createdSessionId })
          } else {
            console.log(result)
          }
        })
        .catch((err) => console.error('error', err.errors[0].longMessage))
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label htmlFor='email'>
          Email
          <input
            type='text'
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail((e.target as HTMLInputElement).value)
            }
          />
        </label>
      </div>
      <div>
        <label htmlFor='password'>
          Password
          <input
            type='password'
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword((e.target as HTMLInputElement).value)
            }
          />
        </label>
      </div>
      <div>
        <button type='submit'>Sign in</button>
      </div>
    </form>
  )
}
