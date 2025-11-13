// app/(auth)/login/schema.ts
import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email({
    message: 'Por favor, insira um e-mail válido.',
  }),
  password: z.string().min(1, {
    message: 'A senha é obrigatória.',
  }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;