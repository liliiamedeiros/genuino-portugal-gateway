-- Step 1: Fix the duplicate IDs by renaming the second one
-- The project "Apartamento T2 Olhão" with trailing space will get a unique ID
UPDATE projects 
SET id = '1000000010-olhao'
WHERE id = '1000000010 faro ' AND title_pt = 'Apartamento T2 Olhão';

-- Step 2: Update project_images references for the renamed project
UPDATE project_images 
SET project_id = '1000000010-olhao'
WHERE project_id = '1000000010 faro ';

-- Step 3: Now safely clean up all IDs with extra spaces
UPDATE projects 
SET id = TRIM(BOTH ' ' FROM id) 
WHERE id ~ '\s' AND id != TRIM(BOTH ' ' FROM id);

-- Step 4: Clean up project_images project_id with extra spaces
UPDATE project_images 
SET project_id = TRIM(BOTH ' ' FROM project_id) 
WHERE project_id ~ '\s' AND project_id != TRIM(BOTH ' ' FROM project_id);

-- Step 5: Replace multiple spaces with single space in remaining IDs
UPDATE projects 
SET id = REGEXP_REPLACE(id, '\s+', ' ', 'g')
WHERE id ~ '\s\s';

-- Step 6: Replace multiple spaces with single space in project_images
UPDATE project_images 
SET project_id = REGEXP_REPLACE(project_id, '\s+', ' ', 'g')
WHERE project_id ~ '\s\s';