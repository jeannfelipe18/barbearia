// app/api/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prismadb from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new NextResponse('Dados incompletos', { status: 400 });
    }

    // 1. Verificar se o e-mail já existe
    const existingUser = await prismadb.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse('E-mail já cadastrado', { status: 409 }); // 409 Conflict
    }

    // 2. Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Criar o usuário
    const user = await prismadb.user.create({
      data: {
        email,
        name,
        hashedPassword,
        role: Role.USER, // Definido como USER por padrão
      },
    });

    // Remover a senha da resposta
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('[REGISTER_POST_ERROR]', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}