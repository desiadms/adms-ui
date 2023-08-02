import {
  BriefcaseIcon,
  CalendarDaysIcon,
  IdentificationIcon
} from '@heroicons/react/20/solid'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { useCallback } from 'preact/hooks'
import { useForm } from 'react-hook-form'
import { useRxCollection, useRxData } from 'rxdb-hooks'
import { UserDocType } from 'src/rxdb/rxdb-schemas'
import { emailToId, fullName, userRoles } from '../utils'
import { Button, ErrorMessage, LabelledInput } from './Forms'

type UserFormData = {
  first_name: string
  last_name: string
}

function AccountForm({
  user: { id, first_name, last_name }
}: {
  user: UserDocType
}) {
  const userCollection = useRxCollection<UserDocType>('user')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UserFormData>({
    defaultValues: {
      first_name,
      last_name
    }
  })

  function submitUser(data: UserFormData) {
    userCollection?.upsert({
      id,
      first_name: data.first_name,
      last_name: data.last_name
    })
  }

  return (
    <div className='p-5 rounded-xl bg-white'>
      <form className='flex flex-col gap-5' onSubmit={handleSubmit(submitUser)}>
        <div className='rounded-lg'>
          <LabelledInput
            label='First Name'
            type='text'
            {...register('first_name', {
              required: 'First Name is required'
            })}
          />
          <ErrorMessage message={errors.first_name?.message} />
        </div>
        <div className='rounded-lg'>
          <LabelledInput
            label='Last Name'
            type='text'
            {...register('last_name', {
              required: 'Last Name is required'
            })}
          />
          <ErrorMessage message={errors.last_name?.message} />
        </div>

        <div className='w-fit'>
          <Button type='submit'>Update</Button>
        </div>
      </form>
    </div>
  )
}

export function AccountView() {
  const query = useCallback((collection) => collection.find(), [])

  const { result, isFetching } = useRxData<UserDocType>('user', query)
  const user = result[0]
  const { first_name, last_name, usersMetadata_user, hire_date } = user || {}

  console.log(isFetching, user)

  return (
    <div>
      {user && (
        <div className='flex flex-col gap-10'>
          <div className='flex flex-col gap-12 rounded-xl bg-white'>
            <div className='relative h-28 rounded-xl from-green-400 to-emerald-200 bg-gradient-to-r'>
              <div className='absolute rounded-full bg-white h-20 w-20 left-10 -bottom-10'>
                <UserCircleIcon className='text-emerald-400' />
              </div>
            </div>

            <div className='flex flex-col gap-4 pl-5'>
              <div className='flex flex-col gap-1'>
                <p className='text-lg font-semibold'>
                  {fullName(first_name, last_name)}
                </p>
                <div className='flex gap-1 items-center'>
                  <IdentificationIcon className='h-4 w-4' />
                  <p className='font-medium'>
                    {emailToId(usersMetadata_user?.email)}
                  </p>
                </div>
              </div>

              <div className='flex flex-col gap-1 pb-5'>
                <div className='flex gap-1 items-center'>
                  <BriefcaseIcon className='h-4 w-4' />
                  <p className='text-sm font-light capitalize'>
                    {userRoles(user)}
                  </p>
                </div>
                <div className='flex gap-1 items-center'>
                  <CalendarDaysIcon className='h-4 w-4' />
                  <p className='text-xs capitalize'>{hire_date}</p>
                </div>
              </div>
            </div>
          </div>
          {!isFetching && <AccountForm user={user} />}
        </div>
      )}
    </div>
  )
}
