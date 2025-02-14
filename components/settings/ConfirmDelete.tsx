import { useAuth } from '@/lib/auth'
import { Transition, Dialog } from '@headlessui/react'
import { ExclamationIcon } from '@heroicons/react/outline'
import React, { Fragment, useRef, useState } from 'react'

function ConfirmDelete({
  open,
  setDeleteAccount,
  setCloseModal,
  handleStartDelete,
  handleStopDelete,
  deleteLoading,
}) {
  const auth = useAuth()
  const [openModal, setOpenModal] = useState(open)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  const updatePassword = (e) => {
    setPassword(e.target.value)
  }

  const reauth = () => {
    if (auth.user.provider === 'google.com') {
      // auth.reauthGoogleUser(() => console.log('oohhh yeah'))
      // setDeleteAccount()
    } else {
      handleStartDelete()
      auth.reauthUser(
        password,
        setDeleteAccount,
        (val) => setPasswordError(val),
        () => handleStopDelete()
      )
    }
  }

  const cancelButtonRef = useRef(null)
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-50 inset-0 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={setOpenModal}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationIcon
                    className="h-6 w-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    Delete account
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete your account? All of your
                      data will be permanently removed from our servers forever.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              {auth.user.provider === 'password' && (
                <>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={updatePassword}
                    placeholder="Confirm your password"
                    className="appearance-none block w-full mt-4 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yei-primary-main-main focus:yei-primary-main-main sm:text-sm"
                    required
                  />
                  {passwordError && (
                    <p className="text-red-600 font-bold text-sm mt-2">
                      Invalid password.
                    </p>
                  )}
                </>
              )}
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={reauth}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <div
                      style={{
                        margin: '0 44.8px',
                        borderTopColor: 'transparent',
                      }}
                      className="w-5 h-5 border-2 border-white border-solid rounded-full animate-spin"
                    ></div>
                  ) : (
                    'Delete Account'
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setCloseModal(false)}
                  ref={cancelButtonRef}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default ConfirmDelete
