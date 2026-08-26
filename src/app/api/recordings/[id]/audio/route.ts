import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Streams recording audio from Twilio using server-side Basic Auth so the
 * Twilio credentials never reach the browser, and so access stays scoped to
 * the requesting user's agency.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.agencyId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const recording = await prisma.recording.findFirst({
    where: { id, call: { contact: { agencyId: session.user.agencyId } } },
  });
  if (!recording) {
    return new Response("Not found", { status: 404 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    return new Response("Twilio no está configurado.", { status: 500 });
  }

  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString(
    "base64"
  );

  const range = request.headers.get("range");

  const twilioResponse = await fetch(`${recording.url}.mp3`, {
    headers: {
      Authorization: `Basic ${basicAuth}`,
      ...(range ? { Range: range } : {}),
    },
  });

  if (!twilioResponse.ok && twilioResponse.status !== 206) {
    return new Response("No se pudo obtener la grabación.", {
      status: 502,
    });
  }

  const headers = new Headers();
  headers.set("Content-Type", "audio/mpeg");
  headers.set("Accept-Ranges", "bytes");
  for (const key of ["content-length", "content-range"]) {
    const value = twilioResponse.headers.get(key);
    if (value) headers.set(key, value);
  }

  return new Response(twilioResponse.body, {
    status: twilioResponse.status,
    headers,
  });
}
