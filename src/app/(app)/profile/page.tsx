import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { ProfileForm } from "@/components/profile-form";
import { AvatarUploader } from "@/components/avatar-uploader";

export default async function ProfilePage() {
  const session = await requireSession();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, theme: true, avatarUrl: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Mi perfil</h1>

      <AvatarUploader
        name={user.name}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />

      <ProfileForm
        defaultValues={{
          name: user.name ?? "",
          phone: user.phone ?? "",
          theme: user.theme,
        }}
      />
    </div>
  );
}
