-- Clean up extra spaces from existing project IDs
UPDATE projects 
SET id = TRIM(id) 
WHERE id != TRIM(id);

-- Clean up extra spaces from project_images references
UPDATE project_images 
SET project_id = TRIM(project_id) 
WHERE project_id != TRIM(project_id);