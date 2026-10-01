// @ts-nocheck
import { Wrench } from "lucide-react";

export function MaintenancePage({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="max-w-lg text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
          <Wrench size={28} />
        </div>
        <h1 className="mt-6 text-3xl font-black text-foreground">{title}</h1>
        <p className="mt-4 whitespace-pre-line text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
