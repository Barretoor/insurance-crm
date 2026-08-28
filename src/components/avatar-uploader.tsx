"use client";

import { useActionState, useRef } from "react";
import { Camera } from "lucide-react";
import {
  updateAvatar,
  removeAvatar,
  type AvatarActionState,
} from "@/app/(app)/profile/actions";
import { UserAvatar } from "@/components/user-avatar";

const MAX_BYTES = 2 * 1024 * 1024;

export function AvatarUploader({
  name,
  email,
  avatarUrl,
}: {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState<
    AvatarActionState,
    FormData
  >(updateAvatar, {});
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      inputRef.current!.value = "";
      alert("La imagen debe pesar menos de 2 MB.");
      return;
    }
    formRef.current?.requestSubmit();
  }

  return (
    <div className="flex items-center gap-4">
      <form ref={formRef} action={formAction}>
        <input
          ref={inputRef}
          type="file"
          name="avatar"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="group relative flex h-20 w-20 items-center justify-center rounded-full disabled:opacity-60"
          aria-label="Cambiar foto de perfil"
        >
          <UserAvatar
            name={name}
            email={email}
            avatarUrl={avatarUrl}
            className="h-20 w-20 text-xl"
          />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-900/0 text-transparent transition-colors group-hover:bg-gray-900/40 group-hover:text-white">
            <Camera className="h-5 w-5" strokeWidth={1.75} />
          </span>
        </button>
      </form>

      <div className="text-sm">
        <p className="text-gray-500">
          {pending ? "Subiendo..." : "Haz clic en el círculo para cambiarla."}
        </p>
        <p className="text-xs text-gray-400">PNG, JPG, WEBP o GIF · máx. 2 MB</p>
        {avatarUrl && (
          <form action={removeAvatar}>
            <button
              type="submit"
              className="mt-1 text-xs font-medium text-red-600 hover:text-red-800 hover:underline"
            >
              Quitar foto
            </button>
          </form>
        )}
        {state.error && (
          <p className="mt-1 text-xs text-red-700">{state.error}</p>
        )}
      </div>
    </div>
  );
}
