
-- Insert GenuinoInvestments entity
INSERT INTO public.geo_entities (name, entity_type, description, properties, same_as, schema_type, is_active, order_index)
VALUES (
  'GenuinoInvestments Switzerland',
  'organization',
  'Entreprise suisse spécialisée dans la promotion et le développement de projets immobiliers au Portugal. Innovation, fonctionnalité et design intemporel.',
  '{"telephone": "+41 76 487 60 00", "email": "info@genuinoinvestments.ch", "url": "https://genuinoinvestments.ch", "logo": "https://genuinoinvestments.ch/logo.png", "foundingDate": "2020", "areaServed": ["Portugal", "Switzerland"], "address_ch": "Quai du Cheval Blanc, 2 - 1227 Carouge/Genève", "address_pt": "Rua António Stromp 12 A - 1600-411 Lumiar, Lisboa"}'::jsonb,
  '["https://www.linkedin.com/company/genuinoinvestments", "https://www.instagram.com/genuinoinvestments", "https://www.facebook.com/genuinoinvestments"]'::jsonb,
  'RealEstateAgent',
  true,
  0
);

-- Insert semantic strategy
INSERT INTO public.geo_semantic_strategies (name, description, target_intent, primary_keywords, secondary_keywords, response_structure, is_active, order_index)
VALUES (
  'Investimento Imobiliário Portugal',
  'Estratégia para posicionamento em buscas sobre investimento imobiliário em Portugal por investidores suíços e europeus.',
  'transactional',
  '["investimento imobiliário Portugal", "comprar casa em Portugal", "imóveis Portugal para investidores", "real estate investment Portugal"]'::jsonb,
  '["Golden Visa Portugal", "residência fiscal Portugal", "apartamentos Lisboa", "projetos imobiliários Algarve", "rendimento imobiliário Portugal"]'::jsonb,
  'Apresentar a GenuinoInvestments como referência suíça no mercado imobiliário português, destacando: expertise local, projetos em desenvolvimento, retorno sobre investimento, e acompanhamento personalizado desde a Suíça.',
  true,
  0
);

-- Insert FAQs
INSERT INTO public.geo_faqs (question, answer, category, schema_enabled, order_index, is_active, page_reference) VALUES
(
  '{"pt": "Porque investir em imóveis em Portugal?", "en": "Why invest in real estate in Portugal?", "fr": "Pourquoi investir dans l''immobilier au Portugal?", "de": "Warum in Immobilien in Portugal investieren?"}'::jsonb,
  '{"pt": "Portugal oferece um mercado imobiliário dinâmico com preços competitivos, clima excepcional, segurança, e benefícios fiscais atrativos como o regime de Residente Não Habitual. A GenuinoInvestments acompanha investidores suíços em todo o processo.", "en": "Portugal offers a dynamic real estate market with competitive prices, exceptional climate, safety, and attractive tax benefits such as the Non-Habitual Resident regime. GenuinoInvestments supports Swiss investors throughout the process.", "fr": "Le Portugal offre un marché immobilier dynamique avec des prix compétitifs, un climat exceptionnel, la sécurité et des avantages fiscaux attractifs. GenuinoInvestments accompagne les investisseurs suisses dans tout le processus.", "de": "Portugal bietet einen dynamischen Immobilienmarkt mit wettbewerbsfähigen Preisen, außergewöhnlichem Klima, Sicherheit und attraktiven Steuervorteilen. GenuinoInvestments begleitet Schweizer Investoren im gesamten Prozess."}'::jsonb,
  'Investimento',
  true, 0, true, '/investors'
),
(
  '{"pt": "Quais são os tipos de imóveis disponíveis?", "en": "What types of properties are available?", "fr": "Quels types de biens sont disponibles?", "de": "Welche Arten von Immobilien sind verfügbar?"}'::jsonb,
  '{"pt": "Oferecemos apartamentos, moradias e projetos de desenvolvimento em Lisboa, Algarve e outras regiões de Portugal. Todos os projetos são selecionados pela nossa equipa com foco em qualidade, localização e potencial de valorização.", "en": "We offer apartments, villas and development projects in Lisbon, Algarve and other regions of Portugal. All projects are selected by our team focusing on quality, location and appreciation potential.", "fr": "Nous proposons des appartements, villas et projets de développement à Lisbonne, en Algarve et dans d''autres régions du Portugal. Tous les projets sont sélectionnés par notre équipe.", "de": "Wir bieten Wohnungen, Villen und Entwicklungsprojekte in Lissabon, der Algarve und anderen Regionen Portugals an."}'::jsonb,
  'Imóveis',
  true, 1, true, '/properties'
),
(
  '{"pt": "Como funciona o acompanhamento desde a Suíça?", "en": "How does the support from Switzerland work?", "fr": "Comment fonctionne l''accompagnement depuis la Suisse?", "de": "Wie funktioniert die Betreuung aus der Schweiz?"}'::jsonb,
  '{"pt": "A GenuinoInvestments tem sede em Carouge/Genève e escritório em Lisboa. Oferecemos consultas presenciais na Suíça, visitas guiadas em Portugal, gestão documental completa e acompanhamento pós-venda.", "en": "GenuinoInvestments is headquartered in Carouge/Geneva with an office in Lisbon. We offer in-person consultations in Switzerland, guided visits in Portugal, complete document management and after-sales support.", "fr": "GenuinoInvestments a son siège à Carouge/Genève et un bureau à Lisbonne. Nous offrons des consultations en Suisse, des visites guidées au Portugal et un accompagnement complet.", "de": "GenuinoInvestments hat seinen Hauptsitz in Carouge/Genf und ein Büro in Lissabon. Wir bieten Beratungen in der Schweiz und Besichtigungen in Portugal an."}'::jsonb,
  'Serviços',
  true, 2, true, '/contact'
);
