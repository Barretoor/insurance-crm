import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    agencyId?: string;
    role?: "ADMIN" | "AGENT";
  }

  interface Session {
    user: {
      id: string;
      agencyId: string;
      role: "ADMIN" | "AGENT";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    agencyId?: string;
    role?: "ADMIN" | "AGENT";
  }
}
