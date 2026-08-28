import { DefaultSession } from "next-auth";

type ThemePreference = "LIGHT" | "DARK" | "SYSTEM";

declare module "next-auth" {
  interface User {
    agencyId?: string;
    role?: "ADMIN" | "AGENT";
    theme?: ThemePreference;
  }

  interface Session {
    user: {
      id: string;
      agencyId: string;
      role: "ADMIN" | "AGENT";
      theme: ThemePreference;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    agencyId?: string;
    role?: "ADMIN" | "AGENT";
    theme?: ThemePreference;
  }
}
