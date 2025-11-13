// app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import prismadb from "@/lib/prisma"
import bcrypt from "bcrypt"

// 2. ADICIONE O TIPO ": AuthOptions" AQUI
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prismadb),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais inválidas");
        }

        const user = await prismadb.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.hashedPassword) {
          throw new Error("Usuário não encontrado ou não cadastrado com senha");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error("Senha incorreta");
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hashedPassword, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    })
  ],
  callbacks: {
    // Agora o TypeScript sabe que 'token' é um JWT e 'user' é um User
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // E aqui ele sabe o que é 'session' e 'token'
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; // Faça um type cast se necessário
        session.user.role = token.role as any; // Faça um type cast se necessário
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };