-- Delete all records from the Category table
DELETE FROM "Category";
-- Reset the auto-increment counter
ALTER SEQUENCE "Category_id_seq" RESTART WITH 1; 