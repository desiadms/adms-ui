import { PlusCircleIcon } from "@heroicons/react/24/outline";

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
