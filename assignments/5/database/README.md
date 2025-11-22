# Database Setup

  ## Prerequisites

  - PostgreSQL 14+ installed
  - Terminal access

  ## Setup Instructions

  ### Step 1: Create the database

  ```bash
  createdb twitter_clone_db

  Step 2: Run the schema script

  From the CSC317 root directory:
  psql twitter_clone_db < assignments/5/database/schema.sql

   Step 3: Verify tables were created

  psql twitter_clone_db
  \dt
  \q

  You should see 5 tables: users, posts, likes, comments, follows

  Reset Database (if needed)

  dropdb twitter_clone_db
  createdb twitter_clone_db
  psql twitter_clone_db < assignments/5/database/schema.sql