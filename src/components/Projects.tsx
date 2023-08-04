import { GlobeAmericasIcon } from '@heroicons/react/24/solid'

export function ProjectsView() {
  const activeProject = {}

  return (
    <div>
      {(activeProject && (
        <div>
          <h2 className='font-medium pb-2'> Active Projects </h2>
          <div className='flex flex-col gap-6 from-stone-600 to-emerald-700 text-white rounded-xl p-4 bg-gradient-to-t from-80%'>
            <div className='flex gap-4 items-center'>
              <div className='p-1 rounded-xl w-fit bg-stone-800'>
                <GlobeAmericasIcon className='h-10 w-10 text-stone-100' />
              </div>
              <div className=''>
                <p className='text-stone-200 text-sm font-bold'>
                  {activeProject.location}
                </p>
                <p className='capitalize font-light'>{activeProject.name}</p>
              </div>
            </div>

            <p className='text-sm font-light text-stone-200'>
              {activeProject.comment}
            </p>

            <div className='flex text-sm flex-wrap gap-2 justify-between'>
              <div>
                <p className='text-stone-200 font-extralight'>Contractor</p>
                <p className='text-sm font-bold'>{activeProject.contractor}</p>
              </div>
              <div>
                <p className='text-stone-200 font-extralight'>Sub Contractor</p>
                <p className='text-sm font-bold'>
                  {activeProject.sub_contractor}
                </p>
              </div>
              <div>
                <p className='text-stone-200 font-extralight'>
                  Point of Contact
                </p>
                <p className='text-sm font-bold'>{activeProject.poc}</p>
              </div>
            </div>
          </div>
        </div>
      )) || <h2 className='font-medium'>No active project</h2>}
    </div>
  )
}
