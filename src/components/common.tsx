import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useSignOut } from "@nhost/react";
import { Link } from "@tanstack/react-router";
import { removeDB } from "../rxdb";

export function Dot() {
  return <div className="h-1 w-1 bg-neutral-400 rounded-full" />;
}

export function TaskType({ name }: { name: string }) {
  return (
    <div className="w-full bg-slate-300 px-2 py-3 capitalize font-medium flex items-center rounded-md">
      <div className="flex gap-2 items-center">
        <PlusCircleIcon className="text-gray-700 w-10 flex-shrink-0" />
        {name}
      </div>
    </div>
  );
}

export function DeleteLocalData() {
  const { signOut } = useSignOut();

  return (
    <Link
      className="block rounded-md px-3 py-2 text-base bg-gray-900"
      activeProps={{
        className: `text-white`,
      }}
      inactiveProps={{
        className: `text-red-300 hover:bg-red-700 hover:text-white`,
      }}
      onClick={async () => {
        //add an alert to confirm
        const userConfirmed = window.confirm(
          "Your unsynched data will be lost. Are you sure?",
        );
        if (userConfirmed) {
          await removeDB();
          await signOut();
        }
      }}
      to="/"
    >
      Delete Local Data
    </Link>
  );
}
