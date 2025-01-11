# Faina Portfolio

Built with Bun, Prisma, and PostgreSQL.

## Prerequisites

### Installing Homebrew (if not installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Installing Bun on macOS

Using Homebrew:

```bash
brew tap oven-sh/bun
brew install bun
```

Verify installation:

```bash
bun --version
```

### PostgreSQL Setup

1. Install PostgreSQL using Homebrew:

```bash
brew install postgresql@14
```

2. Start PostgreSQL service:

```bash
brew services start postgresql@14
```

3. Create a PostgreSQL user (if not exists):

```bash
createuser -s postgres
```

4. Create the database:

```bash
createdb faina_portfolio
```

5. Verify connection:

```bash
psql -d faina_portfolio
```

Type `\q` to exit the PostgreSQL prompt.

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd faina-portfolio
```

2. Install dependencies:

```bash
bun install
```

3. Set up your environment variables by copying the example:

```bash
cp .env.example .env
```

4. Update the `.env` file with your database connection string:

```
DATABASE_URL="postgresql://postgres@localhost:5432/faina_portfolio"
```

5. Generate Prisma client and push the schema:

```bash
bun db:update
```

## Running the Application

1. Start the development server:

```bash
bun dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

-   `bun dev` - Start development server
-   `bun build` - Build for production
-   `bun start` - Start production server
-   `bun db:migrate` - Run database migrations
-   `bun db:push` - Push schema changes to database
-   `bun db:reset` - Reset database (caution: deletes all data)
-   `bun db:generate` - Generate Prisma client
-   `bun db:studio` - Open Prisma Studio
-   `bun db:update` - Generate client, push schema, and run migrations

## Project Structure

-   `/app` - Next.js app router pages and API routes
-   `/components` - Reusable React components
-   `/prisma` - Database schema and migrations
-   `/public` - Static assets
-   `/utils` - Utility functions and helpers

## Features

-   Image gallery with categories
-   Admin dashboard for managing paintings
-   Bulk upload functionality
-   Responsive design
-   Image optimization
-   PostgreSQL database with Prisma ORM

## Troubleshooting

### PostgreSQL Issues

1. If you get a permission error:

```bash
createuser -s $USER  # Create a user with your system username
```

2. If PostgreSQL service won't start:

```bash
brew services restart postgresql@14
```

3. To check PostgreSQL status:

```bash
brew services list
```

4. To access PostgreSQL command line:

```bash
psql faina_portfolio
```

### Database Connection Issues

1. Verify your connection string in `.env`
2. Ensure PostgreSQL is running:

```bash
brew services list | grep postgresql
```

3. Test connection:

```bash
psql -d faina_portfolio -c "\conninfo"
```
