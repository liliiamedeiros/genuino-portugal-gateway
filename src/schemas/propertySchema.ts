import { z } from 'zod';

export const propertySchema = z.object({
  title_pt: z.string().min(3, 'Título em português é obrigatório (mín. 3 caracteres)').max(200, 'Título muito longo (máx. 200 caracteres)'),
  title_fr: z.string().max(200, 'Título muito longo').optional().or(z.literal('')),
  title_en: z.string().max(200, 'Título muito longo').optional().or(z.literal('')),
  title_de: z.string().max(200, 'Título muito longo').optional().or(z.literal('')),
  
  description_pt: z.string().min(10, 'Descrição em português é obrigatória (mín. 10 caracteres)').max(5000, 'Descrição muito longa'),
  description_fr: z.string().max(5000, 'Descrição muito longa').optional().or(z.literal('')),
  description_en: z.string().max(5000, 'Descrição muito longa').optional().or(z.literal('')),
  description_de: z.string().max(5000, 'Descrição muito longa').optional().or(z.literal('')),
  
  location: z.string().min(2, 'Localização é obrigatória'),
  region: z.string().min(2, 'Região é obrigatória'),
  city: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  
  property_type: z.enum(['apartment', 'house', 'villa', 'land', 'commercial']),
  operation_type: z.enum(['sale', 'rent']),
  status: z.enum(['active', 'sold', 'rented', 'draft']),
  
  price: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  area_sqm: z.string().optional(),
  parking_spaces: z.string().optional(),
  
  map_embed_url: z.string().url('URL inválida').optional().or(z.literal('')),
  map_latitude: z.string().optional(),
  map_longitude: z.string().optional(),
  
  featured: z.boolean(),
});

export type PropertyFormData = z.infer<typeof propertySchema>;
