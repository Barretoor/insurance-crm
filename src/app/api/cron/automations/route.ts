import { runDueAutomations } from "@/lib/automations";

/**
 * Daily automation run, invoked by Vercel Cron (see vercel.json). Vercel
 * sends `Authorization: Bearer $CRON_SECRET` on scheduled invocations when
 * CRON_SECRET is set on the project - we require it here so the endpoint
 * can't be triggered by anyone else (it sends real, billable SMS).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await runDueAutomations();
  return Response.json(result);
}
