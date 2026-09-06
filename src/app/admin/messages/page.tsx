import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function AdminMessagesIndexPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-lg text-center">
      <MaterialIcon name="chat" className="text-5xl text-on-surface-variant" />
      <p className="font-body-md text-body-md text-on-surface-variant">
        Select a conversation to start messaging.
      </p>
    </div>
  );
}
