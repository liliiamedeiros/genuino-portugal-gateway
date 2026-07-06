import { z } from 'zod';
import { isAllowedEmbedUrl, ALLOWED_HOSTS_HINT } from '@/lib/embedUrlAllowlist';

const embedUrl = (kind: 'video' | 'tour' | 'map') =>
  z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (v) => !v || isAllowedEmbedUrl(v, kind),
      { message: `URL não permitido. Apenas: ${ALLOWED_HOSTS_HINT[kind]}` }
    );

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
  
  map_embed_url: embedUrl('map'),
  map_latitude: z.string().optional(),
  map_longitude: z.string().optional(),
  
  video_url: embedUrl('video'),
  virtual_tour_url: embedUrl('tour'),
  
  featured: z.boolean(),
});

export type PropertyFormData = z.infer<typeof propertySchema>;
