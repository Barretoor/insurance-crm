import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Andrea Insurance",
  description: "Política de Privacidad de Andrea Insurance.",
};

export default function PrivacidadPage() {
  return (
    <div className="flex-1 px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2 border-b border-gray-200 pb-6">
          <p className="text-sm font-medium text-accent-600">Andrea Insurance</p>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
            Política de Privacidad
          </h1>
          <p className="text-sm text-gray-500">
            Vigente desde el 20 de septiembre de 2026. Aplica al sitio web, al
            formulario de cotización y al programa de mensajes de texto (SMS).
          </p>
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
          <h2 className="text-lg font-medium text-gray-900">1. Quiénes somos</h2>
          <p className="text-sm text-gray-600">
            Andrea Insurance es una agencia de seguros de vida que ayuda a familias a cotizar y
            contratar pólizas de seguro de vida. Recopilamos y usamos tu información únicamente
            para darte servicio como cliente o solicitante de cotización, y para cumplir con
            nuestras obligaciones legales.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">
            2. Qué información recopilamos
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
            <li>Nombre completo</li>
            <li>Número de teléfono</li>
            <li>Correo electrónico</li>
            <li>Dirección postal</li>
            <li>
              Datos relacionados con tu cotización o póliza (edad, tipo de cobertura de
              interés, etc.), solo cuando tú los proporcionas
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">
            3. Cómo obtenemos tu información
          </h2>
          <p className="text-sm text-gray-600">
            Recopilamos tu información principalmente cuando completas nuestro{" "}
            <Link href="/cotizacion" className="font-medium text-gray-900 underline">
              formulario de cotización o contacto
            </Link>
            , en línea o a través de un agente, para solicitar información sobre seguros de
            vida. También la recopilamos si nos contactas directamente por teléfono, mensaje de
            texto o correo electrónico.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">4. Cómo usamos tu información</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
            <li>Preparar y dar seguimiento a tu cotización de seguro de vida</li>
            <li>Agendar y recordarte citas con un agente</li>
            <li>Responder tus preguntas y darte servicio sobre tu póliza</li>
            <li>Enviarte actualizaciones importantes sobre tu cuenta o cobertura</li>
          </ul>
          <p className="text-sm text-gray-600">
            No usamos tu información para fines distintos a brindarte servicio.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">5. Mensajes de texto (SMS)</h2>
          <p className="text-sm text-gray-600">
            Si nos das tu número de teléfono a través del formulario de cotización/contacto y
            marcas la casilla de consentimiento, podrás recibir SMS sobre: recordatorios de
            citas, seguimiento de tu cotización, y actualizaciones de servicio sobre tu póliza.
            La frecuencia de mensajes varía. Pueden aplicar tarifas de mensajes y datos de tu
            operador móvil.
          </p>
          <div className="rounded-md border-l-4 border-accent-500 bg-accent-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-700">
              Cláusula de cumplimiento
            </p>
            <p className="mt-2 text-sm italic text-gray-700">
              &ldquo;No mobile information will be shared with third parties/affiliates for
              marketing or promotional purposes. All the above categories exclude text messaging
              originator opt-in data and consent; this information will not be shared with any
              third parties.&rdquo;
            </p>
            <p className="mt-2 text-sm text-gray-700">
              En español: tu número de teléfono y tu consentimiento para recibir mensajes de
              texto <strong>nunca se comparten con terceros con fines de marketing</strong>, bajo
              ninguna circunstancia.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">
            6. Con quién compartimos tu información
          </h2>
          <p className="text-sm text-gray-600">
            No vendemos tu información ni la compartimos con terceros para que la usen en su
            propio marketing. Podemos compartirla con proveedores que nos ayudan a operar (por
            ejemplo, nuestra plataforma de mensajería de texto) únicamente para prestarte el
            servicio, o cuando la ley lo exija.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">7. Tus derechos y opciones</h2>
          <p className="text-sm text-gray-600">
            Puedes cancelar los mensajes de texto en cualquier momento respondiendo{" "}
            <strong>STOP, STOPALL, UNSUBSCRIBE, CANCEL, END</strong> o <strong>QUIT</strong> a
            cualquiera de nuestros mensajes. Puedes volver a inscribirte respondiendo{" "}
            <strong>START, YES</strong> o <strong>UNSTOP</strong>. Responde{" "}
            <strong>HELP</strong> o llámanos para obtener ayuda. También puedes pedirnos que
            actualicemos o eliminemos tu información personal contactándonos directamente.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">8. Seguridad de los datos</h2>
          <p className="text-sm text-gray-600">
            Tomamos medidas razonables para proteger tu información, incluyendo almacenamiento
            cifrado y acceso restringido a nuestro personal autorizado. Ningún sistema es 100%
            seguro, pero trabajamos activamente para proteger tus datos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">9. Cambios a esta política</h2>
          <p className="text-sm text-gray-600">
            Podemos actualizar esta política ocasionalmente. La fecha al inicio de esta página
            refleja la versión más reciente. El uso continuo de nuestros servicios después de un
            cambio implica que aceptas la política actualizada.
          </p>
        </section>

        <section className="space-y-2 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900">10. Contacto</h2>
          <p className="text-sm text-gray-600">
            Si tienes preguntas sobre esta política o sobre tu información personal,
            contáctanos:
          </p>
          <p className="text-base font-medium text-gray-900">+1 (682) 277-4544</p>
          <p className="text-sm text-gray-500">
            Consulta también los{" "}
            <Link href="/terminos" className="font-medium text-gray-900 underline">
              Términos y Condiciones
            </Link>{" "}
            del programa de SMS.
          </p>
        </section>

        <div id="english" lang="en" className="space-y-6 border-t-2 border-gray-300 pt-8">
          <div className="space-y-1">
            <h2 className="text-xl font-medium text-gray-900">
              Privacy Policy (English)
            </h2>
            <p className="text-sm text-gray-500">
              Andrea Insurance. Effective September 20, 2026.
            </p>
          </div>

          <section className="space-y-2">
            <h3 className="text-base font-medium text-gray-900">Information we collect</h3>
            <p className="text-sm text-gray-600">
              When you request a life insurance quote through our online quote/contact form, or
              contact us directly, we collect your name, phone number, email address, mailing
              address, and details related to your quote or policy that you choose to provide.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-medium text-gray-900">How we use your information</h3>
            <p className="text-sm text-gray-600">
              We use your information only to prepare and follow up on your life insurance
              quote, schedule and remind you of appointments, answer your questions, and send
              service updates about your coverage, including by text message (SMS) if you opted
              in.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-medium text-gray-900">Text messaging (SMS)</h3>
            <p className="text-sm text-gray-600">
              If you check the SMS consent box on our quote form, you agree to receive text
              messages from Andrea Insurance about your quote, appointment reminders, and
              policy updates. Message frequency varies. Message and data rates may apply.
              Consent is not a condition of purchase. Reply <strong>STOP</strong> at any time
              to opt out, or <strong>HELP</strong> for help. See our{" "}
              <Link href="/terminos" className="font-medium text-gray-900 underline">
                Terms and Conditions
              </Link>
              .
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-medium text-gray-900">
              Sharing of information
            </h3>
            <p className="text-sm font-medium text-gray-900">
              No mobile information will be shared with third parties or affiliates for
              marketing or promotional purposes. All the above categories exclude text
              messaging originator opt-in data and consent; this information will not be
              shared with any third parties.
            </p>
            <p className="text-sm text-gray-600">
              We do not sell your personal information. We may share it only with service
              providers that help us operate (such as our messaging platform) solely to deliver
              our services to you, or when required by law.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-medium text-gray-900">Your choices and contact</h3>
            <p className="text-sm text-gray-600">
              You may opt out of text messages at any time by replying STOP, and you may ask us
              to update or delete your personal information. Contact Andrea Insurance at +1
              (682) 277-4544.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
