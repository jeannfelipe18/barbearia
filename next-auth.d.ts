import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";
import { Role } from "@prisma/client"; // Importe seu enum Role

/**
 * Estende os módulos do Next-Auth para incluir
 * as propriedades personalizadas (id e role) no token e na sessão.
 */

declare module "next-auth" {
  /**
   * O objeto Session retornado por `useSession`, `getSession` e `auth`.
   */
  interface Session {
    user: {
      /** O ID do usuário no banco de dados. */
      id: string;
      /** O nível de acesso do usuário. */
      role: Role; // Use o enum importado
    } & DefaultSession["user"]; // Mantém as propriedades padrão (name, email, image)
  }

  /**
   * O objeto User retornado pelo `authorize` e usado nos callbacks.
   */
  interface User extends DefaultUser {
    role: Role; // Adiciona o role ao objeto User padrão
  }
}

declare module "next-auth/jwt" {
  /**
   * O token JWT retornado pelo callback `jwt`.
   */
  interface JWT extends DefaultJWT {
    /** O nível de acesso do usuário. */
    role: Role;
    /** O ID do usuário no banco de dados. */
    id: string;
  }
}