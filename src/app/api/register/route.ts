import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PIPELINE_STAGES } from "@/lib/pipeline";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, agencyName } = body as {
    name?: string;
    email?: string;
    password?: string;
    agencyName?: string;
  };

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof agencyName !== "string" ||
    agencyName.trim().length === 0
  ) {
    return NextResponse.json(
      { error: "Correo, contraseña y nombre del negocio son obligatorios." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese correo." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const agency = await tx.agency.create({
      data: { name: agencyName.trim() },
    });

    await tx.pipelineStage.createMany({
      data: DEFAULT_PIPELINE_STAGES.map((stage) => ({
        ...stage,
        agencyId: agency.id,
      })),
    });

    await tx.user.create({
      data: {
        name: name ?? null,
        email,
        passwordHash,
        role: "ADMIN",
        agencyId: agency.id,
      },
    });
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
