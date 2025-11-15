import { z } from 'zod';

export const propertySchema = z.object({
  title_pt: z.string().min(3, 'Título em português é obrigatório (mín. 3 caracteres)').max(200, 'Título muito longo (máx. 200 caracteres)'),
  title_fr: z.string().min(3, 'Título em francês é obrigatório').max(200, 'Título muito longo'),
  title_en: z.string().min(3, 'Título em inglês é obrigatório').max(200, 'Título muito longo'),
  title_de: z.string().min(3, 'Título em alemão é obrigatório').max(200, 'Título muito longo'),
  
  description_pt: z.string().min(10, 'Descrição em português é obrigatória (mín. 10 caracteres)').max(5000, 'Descrição muito longa'),
  description_fr: z.string().min(10, 'Descrição em francês é obrigatória').max(5000, 'Descrição muito longa'),
  description_en: z.string().min(10, 'Descrição em inglês é obrigatória').max(5000, 'Descrição muito longa'),
  description_de: z.string().min(10, 'Descrição em alemão é obrigatória').max(5000, 'Descrição muito longa'),
  
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
