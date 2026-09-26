import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Andrea Insurance",
  description:
    "Términos y Condiciones del programa de mensajes de texto (SMS) de Andrea Insurance.",
};

export default function TerminosPage() {
  return (
    <div className="flex-1 px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2 border-b border-gray-200 pb-6">
          <p className="text-sm font-medium text-accent-600">Andrea Insurance</p>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
            Términos y Condiciones
          </h1>
          <p className="text-sm text-gray-500">Programa de mensajes de texto (SMS)</p>
          <p className="text-sm text-gray-500">Vigente desde el 20 de septiembre de 2026.</p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-600">
            <strong className="text-gray-900">STOP</strong> cancela los mensajes de texto en
            cualquier momento
          </span>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-600">
            <strong className="text-gray-900">HELP</strong> responde así para hablar con
            nosotros
          </span>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">1. Nombre del programa</h2>
          <p className="inline-block rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-base font-medium text-gray-900">
            Andrea Insurance — Notificaciones y Recordatorios
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">2. Descripción del programa</h2>
          <p className="text-sm text-gray-600">
            Enviamos mensajes de texto a los números de teléfono que nos proporcionas a través
            de nuestro formulario de cotización/contacto, relacionados con:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
            <li>Recordatorios de citas con tu agente</li>
            <li>Seguimiento de tu cotización de seguro de vida</li>
            <li>Actualizaciones de servicio sobre tu póliza</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">3. Cómo te inscribes</h2>
          <p className="text-sm text-gray-600">
            Te inscribes en este programa al completar nuestro{" "}
            <Link href="/cotizacion" className="font-medium text-gray-900 underline">
              formulario de cotización o contacto
            </Link>{" "}
            y aceptar recibir mensajes de texto, o al aceptarlo directamente con un agente. El
            consentimiento no es una condición para comprar ningún producto o servicio.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">4. Frecuencia de mensajes</h2>
          <p className="text-sm text-gray-600">
            La frecuencia de mensajes <strong>varía</strong> según tu actividad — por ejemplo,
            mientras tu cotización o cita esté en proceso activo. Un estimado típico es de hasta
            4 a 6 mensajes al mes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">5. Costos de mensajes y datos</h2>
          <p className="text-sm text-gray-600">
            Pueden aplicar <strong>tarifas de mensajes y datos</strong> según tu plan con tu
            operador móvil. Andrea Insurance no cobra directamente por estos mensajes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">
            6. Cómo cancelar tu suscripción
          </h2>
          <div className="rounded-md border-l-4 border-accent-500 bg-accent-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-700">
              Opt-out
            </p>
            <p className="mt-2 text-sm text-gray-700">
              Responde <strong>STOP, STOPALL, UNSUBSCRIBE, CANCEL, END</strong> o{" "}
              <strong>QUIT</strong> a cualquiera de nuestros mensajes para dejar de recibirlos de
              inmediato. Te enviaremos un mensaje de confirmación. Puedes volver a inscribirte en
              cualquier momento respondiendo <strong>START, YES</strong> o{" "}
              <strong>UNSTOP</strong>.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">7. Cómo obtener ayuda</h2>
          <div className="rounded-md border-l-4 border-accent-500 bg-accent-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-700">
              Soporte
            </p>
            <p className="mt-2 text-sm text-gray-700">
              Responde <strong>HELP</strong> a cualquiera de nuestros mensajes, o llama o envía
              un mensaje de texto directamente a <strong>+1 (682) 277-4544</strong> para obtener
              ayuda con este programa.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">8. Operadores compatibles</h2>
          <p className="text-sm text-gray-600">
            Este programa es compatible con los principales operadores móviles en Estados
            Unidos. Andrea Insurance y los operadores móviles participantes no son responsables
            por mensajes retrasados o no entregados.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">9. Privacidad</h2>
          <p className="text-sm text-gray-600">
            Tu información personal, incluyendo tu número de teléfono y tu consentimiento para
            recibir mensajes de texto, se maneja conforme a nuestra{" "}
            <Link href="/privacidad" className="font-medium text-gray-900 underline">
              Política de Privacidad
            </Link>
            . Tu consentimiento de opt-in y los datos relacionados nunca se comparten con
            terceros con fines de marketing.
          </p>
        </section>

        <section className="space-y-2 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900">10. Contacto</h2>
          <p className="text-sm text-gray-600">
            Para cualquier pregunta sobre este programa, contáctanos:
          </p>
          <p className="text-base font-medium text-gray-900">+1 (682) 277-4544</p>
        </section>
      </div>
    </div>
  );
}
