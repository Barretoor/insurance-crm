import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const session = await requireSession();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { name: true, phone: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Mi perfil</h1>
      <ProfileForm
        defaultValues={{ name: user.name ?? "", phone: user.phone ?? "" }}
      />
    </div>
  );
}
