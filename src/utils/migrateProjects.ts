import { supabase } from '@/integrations/supabase/client';
import { projects } from '@/data/projects';

export async function migrateProjectsToDatabase() {
  const results = {
    success: [] as string[],
    errors: [] as { id: string; error: string }[],
  };

  for (const project of projects) {
    try {
      // Upload main image to storage
      let mainImageUrl = project.mainImage;
      
      // If the image is from assets (local), we'll keep the URL as is
      // In production, you'd fetch these images and upload them to Supabase Storage
      // For now, we'll use the existing image paths
      
      // Insert project
      const { error: projectError } = await supabase
        .from('projects')
        .insert({
          id: project.id,
          title_fr: project.title.fr,
          title_en: project.title.en,
          title_de: project.title.de,
          title_pt: project.title.pt,
          description_fr: project.description.fr,
          description_en: project.description.en,
          description_de: project.description.de,
          description_pt: project.description.pt,
          location: project.location,
          region: project.region,
          main_image: mainImageUrl,
          featured: true, // Mark first 3 as featured
          status: 'active',
        });

      if (projectError) throw projectError;

      // Insert gallery images
      for (let i = 0; i < project.gallery.length; i++) {
        const { error: imageError } = await supabase
          .from('project_images')
          .insert({
            project_id: project.id,
            image_url: project.gallery[i],
            order_index: i,
          });

        if (imageError) console.error(`Error inserting gallery image for ${project.id}:`, imageError);
      }

      results.success.push(project.id);
    } catch (error: any) {
      results.errors.push({
        id: project.id,
        error: error.message,
      });
    }
  }

  return results;
}
