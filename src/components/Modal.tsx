import { Dialog, Transition } from '@headlessui/react'
import classNames from 'classnames'
import React, { Fragment, createElement } from 'preact'
import { useState } from 'preact/hooks'

export type ModalTriggerProps = {
  openModal: () => void
  closeModal: () => void
  id: string
  label: string
  title?: string
}

export type ModalContentProps = {
  openModal: () => void
  closeModal: () => void
}

export type ModalProps = {
  modalTrigger: React.FunctionComponent<ModalTriggerProps>
  modalContent: React.FunctionComponent<ModalContentProps>
  modalClassName?: string
}

export const Modal = ({
  modalTrigger,
  modalContent,
  modalClassName = 'max-w-lg'
}: ModalProps) => {
  const [isOpen, setIsOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <div>
      {createElement(modalTrigger, {
        id: '',
        label: '',
        openModal,
        closeModal
      })}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as='div'
          data-testid='modal'
          className='fixed inset-0 z-10 overflow-y-auto'
          onClose={closeModal}
        >
          <div className='min-h-screen px-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0'
              enterTo='opacity-60'
              leave='ease-in duration-200'
              leaveFrom='opacity-60'
              leaveTo='opacity-0'
            >
              <div className='fixed inset-0 bg-black bg-opacity-70' />
            </Transition.Child>

            <div className='fixed inset-0 overflow-y-auto'>
              <div className='flex min-h-full items-center justify-center p-4 text-center'>
                <Transition.Child
                  as={Fragment}
                  enter='ease-out duration-300'
                  enterFrom='opacity-0 scale-95'
                  enterTo='opacity-100 scale-100'
                  leave='ease-in duration-200'
                  leaveFrom='opacity-100 scale-100'
                  leaveTo='opacity-0 scale-95'
                >
                  <div
                    className={classNames(
                      'max-h-screen overflow-y-auto',
                      'p-6 text-left w-max transition-all transform bg-white shadow-xl rounded-2xl dark:bg-gray-800',
                      modalClassName
                    )}
                  >
                    {createElement(modalContent, {
                      openModal,
                      closeModal
                    })}
                  </div>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
