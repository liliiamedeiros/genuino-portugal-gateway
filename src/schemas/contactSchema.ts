import { z } from 'zod';

export const contactSchema = z.object({
  firstName: z.string()
    .trim()
    .min(2, 'O primeiro nome deve ter pelo menos 2 caracteres')
    .max(100, 'O primeiro nome é muito longo'),
  lastName: z.string()
    .trim()
    .min(2, 'O último nome deve ter pelo menos 2 caracteres')
    .max(100, 'O último nome é muito longo'),
  email: z.string()
    .trim()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  phone: z.string()
    .trim()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Número de telefone inválido')
    .max(20, 'Número de telefone muito longo')
    .optional()
    .or(z.literal('')),
  message: z.string()
    .trim()
    .min(10, 'A mensagem deve ter pelo menos 10 caracteres')
    .max(2000, 'A mensagem é muito longa (máximo 2000 caracteres)'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
