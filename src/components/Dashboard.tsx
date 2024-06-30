import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/20/solid";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { SignalIcon, SignalSlashIcon } from "@heroicons/react/24/solid";
import { useSignOut } from "@nhost/react";
import { Link, Navigate, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { useRxData } from "rxdb-hooks";
import { UserDocType } from "../rxdb/rxdb-schemas";
import { emailToId, fullName, useIsOnline } from "../hooks";

const navigation = [
  ["/projects", "Projects"],
  ["/tasks", "New Task"],
  ["/progress", "In Progress"],
] as const;

export function Home() {
  return <Navigate to="/projects" />;
}

export function Dashboard() {
  const matchRoute = useMatchRoute();
  const isOnline = useIsOnline();

  const query = useCallback((collection) => collection.find(), []);
  const { result } = useRxData<UserDocType>("user", query);
  const user = result[0];
  const { first_name, last_name, usersMetadata_user } = user || {};

  const currentRoute = navigation.find(([to]) =>
    matchRoute({
      to,
      search: {},
      params: {},
    }),
  );

  const routeLabel = currentRoute?.[1];

  const { signOut } = useSignOut();

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-50">
        <nav>
          <Disclosure>
            {({ open }: { open: boolean }) => (
              <div className="bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex h-16 items-center justify-between">
                    <Link className="flex-shrink-0" to="/">
                      <img
                        className="h-8 w-8"
                        src="https://tailwindui.com/img/logos/mark.svg?color=gray&shade=300"
                        alt="Your Company"
                      />
                    </Link>
                    <div className="-mr-2 flex">
                      <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        ) : (
                          <Bars3Icon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        )}
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>

                <Disclosure.Panel>
                  {({ close }: { close: () => void }) => (
                    <>
                      <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                        {navigation.map(([to, label]) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={close}
                            activeProps={{
                              className: `bg-gray-900 text-white`,
                            }}
                            inactiveProps={{
                              className: `text-gray-300 hover:bg-gray-700 hover:text-white`,
                            }}
                            className="block rounded-md px-3 py-2 text-base"
                          >
                            {label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-700 pb-3 pt-4">
                        <div className="flex items-center px-5">
                          <div className="flex-shrink-0">
                            <UserCircleIcon className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-3 flex flex-col gap-1">
                            <div className="text-base capitalize font-medium leading-none text-white">
                              {fullName(first_name, last_name)}
                            </div>
                            <div className="text-sm font-light leading-none text-gray-400">
                              {emailToId(usersMetadata_user?.email)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-1 px-2">
                          <Link
                            to="/account"
                            className="block rounded-md px-3 py-2 text-base"
                            activeProps={{
                              className: `bg-gray-900 text-white`,
                            }}
                            onClick={close}
                            inactiveProps={{
                              className: `text-gray-300 hover:bg-gray-700 hover:text-white`,
                            }}
                          >
                            Account
                          </Link>
                          <Link
                            className="block rounded-md px-3 py-2 text-base"
                            activeProps={{
                              className: `bg-gray-900 text-white`,
                            }}
                            inactiveProps={{
                              className: `text-gray-300 hover:bg-gray-700 hover:text-white`,
                            }}
                            onClick={signOut}
                            to="/"
                          >
                            Sign out
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        </nav>

        {routeLabel && (
          <header className="bg-white shadow-sm">
            {/* <button onClick={() => 3}>back button</button> */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
              <h1 className="text-lg font-semibold leading-6 text-gray-900">
                {routeLabel}
              </h1>
              {isOnline ? (
                <SignalIcon
                  className="h-6 w-6 text-green-600"
                  aria-hidden="true"
                />
              ) : (
                <SignalSlashIcon
                  className="h-6 w-6 text-red-600"
                  aria-hidden="true"
                />
              )}
            </div>
          </header>
        )}
      </div>

      <main>
        <div className="mx-auto max-w-7xl py-6 px-2 sm:px-6 lg:px-8">
          <Outlet />
        </div>
        {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
      </main>
    </div>
  );
}
