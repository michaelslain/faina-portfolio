-- Delete all records from the Painting table
DELETE FROM "Painting";
-- Reset the auto-increment counter
ALTER SEQUENCE "Painting_id_seq" RESTART WITH 1; 