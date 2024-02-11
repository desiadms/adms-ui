import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import React, { Fragment, createElement } from "preact";
import { useState } from "preact/hooks";

export type ModalTriggerProps = {
  openModal: () => void;
  closeModal: () => void;
  id: string;
  label: string;
  title?: string;
};

export type ModalContentProps = {
  openModal: () => void;
  closeModal: () => void;
};

export type ModalProps = {
  modalTrigger: React.FunctionComponent<ModalTriggerProps>;
  modalContent: React.FunctionComponent<ModalContentProps>;
  modalClassName?: string;
  title: string;
};

export const Modal = ({
  modalTrigger,
  modalContent,
  modalClassName = "max-w-lg",
  title,
}: ModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <div>
      {createElement(modalTrigger, {
        id: "",
        label: "",
        openModal,
        closeModal,
      })}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          // @ts-ignore
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeModal}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-60"
              leave="ease-in duration-200"
              leaveFrom="opacity-60"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-70" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <div
                    className={classNames(
                      "max-h-screen overflow-y-auto",
                      "p-4 text-left min-w-full transition-all transform bg-neutral-200 shadow-xl rounded-2xl",
                      modalClassName,
                    )}
                  >
                    <div className="flex justify-between gap-4 pb-2">
                      <div className="text-xl font-medium capitalize">
                        {title}
                      </div>
                      <button type="button" onClick={closeModal}>
                        <XMarkIcon className="w-6" />
                      </button>
                    </div>
                    {createElement(modalContent, {
                      openModal,
                      closeModal,
                    })}
                  </div>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};
