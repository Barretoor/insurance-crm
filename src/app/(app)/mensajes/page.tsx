import { MessageSquare } from "lucide-react";

export default function MensajesPage() {
  return (
    <div className="m-auto flex flex-col items-center gap-2 px-6 text-center">
      <MessageSquare className="h-9 w-9 text-gray-300" strokeWidth={1.5} />
      <p className="text-sm font-medium text-gray-900">Selecciona una conversación</p>
      <p className="max-w-xs text-sm text-gray-500">
        Elige un contacto de la lista para ver sus mensajes y responder. Para escribirle a
        alguien nuevo, abre su contacto y envía el mensaje desde ahí.
      </p>
    </div>
  );
}
