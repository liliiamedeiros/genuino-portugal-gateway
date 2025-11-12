interface PropertyData {
  id: string;
  title_pt: string;
  title_en: string;
  title_fr: string;
  title_de: string;
  description_pt: string;
  description_en: string;
  description_fr: string;
  description_de: string;
  price: number;
  property_type: string;
  operation_type: string;
  location: string;
  city?: string;
  region: string;
  address?: string;
  postal_code?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  main_image?: string;
}

export const generatePropertyJsonLd = (property: PropertyData, language: string = 'pt') => {
  const title = property[`title_${language}` as keyof PropertyData] || property.title_pt;
  const description = property[`description_${language}` as keyof PropertyData] || property.description_pt;
  
  const baseUrl = window.location.origin;
  
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": title,
    "description": description,
    "url": `${baseUrl}/project/${property.id}`,
    "image": property.main_image ? [property.main_image] : [],
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString()
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.city || property.location,
      "addressRegion": property.region,
      "addressCountry": "PT",
      "postalCode": property.postal_code || "",
      "streetAddress": property.address || ""
    },
    "numberOfRooms": property.bedrooms || 0,
    "numberOfBathroomsTotal": property.bathrooms || 0,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.area_sqm || 0,
      "unitCode": "MTK"
    },
    "additionalType": property.property_type,
    "category": property.operation_type === 'sale' ? 'For Sale' : 'For Rent'
  };
};

export const validateJsonLd = (jsonLd: any): { valid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if it's valid JSON
  if (typeof jsonLd !== 'object' || jsonLd === null) {
    errors.push('Invalid JSON structure');
    return { valid: false, errors, warnings };
  }
  
  // Check required fields for RealEstateListing
  if (jsonLd['@context'] !== 'https://schema.org') {
    errors.push('@context must be "https://schema.org"');
  }
  
  if (jsonLd['@type'] !== 'RealEstateListing') {
    warnings.push('Expected @type to be "RealEstateListing" for real estate properties');
  }
  
  if (!jsonLd.name || typeof jsonLd.name !== 'string') {
    errors.push('Missing or invalid "name" property');
  }
  
  if (!jsonLd.description || typeof jsonLd.description !== 'string') {
    warnings.push('Missing "description" property (recommended for SEO)');
  }
  
  if (!jsonLd.url || typeof jsonLd.url !== 'string') {
    warnings.push('Missing "url" property (recommended)');
  }
  
  // Check offers
  if (!jsonLd.offers) {
    warnings.push('Missing "offers" object (recommended for price information)');
  } else {
    if (!jsonLd.offers['@type'] || jsonLd.offers['@type'] !== 'Offer') {
      errors.push('offers[@type] must be "Offer"');
    }
    if (jsonLd.offers.price === undefined) {
      warnings.push('Missing price in offers');
    }
    if (!jsonLd.offers.priceCurrency) {
      warnings.push('Missing priceCurrency in offers');
    }
  }
  
  // Check address
  if (!jsonLd.address) {
    warnings.push('Missing "address" object (recommended for location)');
  } else {
    if (!jsonLd.address['@type'] || jsonLd.address['@type'] !== 'PostalAddress') {
      errors.push('address[@type] must be "PostalAddress"');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

export const formatJsonLd = (jsonLd: any): string => {
  return JSON.stringify(jsonLd, null, 2);
};

export const parseJsonLd = (jsonString: string): { success: boolean; data?: any; error?: string } => {
  try {
    const parsed = JSON.parse(jsonString);
    return { success: true, data: parsed };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON' 
    };
  }
};
