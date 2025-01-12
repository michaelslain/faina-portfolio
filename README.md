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

4. Configure your environment variables in `.env`:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres@localhost:5432/faina_portfolio"

# Authentication
JWT_SECRET="your_jwt_secret"  # Secret key for JWT token generation
ADMIN_PASSWORD="your_hashed_password"  # Bcrypt hashed admin password

# Image Storage Configuration
STORAGE_MODE="local"  # Options: 'local' or 's3'
NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # Your application's base URL

# S3 Configuration (only required if STORAGE_MODE is 's3')
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_REGION="your_region"
AWS_BUCKET_NAME="your_bucket"
```

Each variable serves the following purpose:

-   `DATABASE_URL`: Connection string for your PostgreSQL database
-   `JWT_SECRET`: Secret key used for generating and validating JWT tokens
-   `ADMIN_PASSWORD`: Bcrypt-hashed password for admin access
-   `STORAGE_MODE`: Determines where uploaded images are stored
-   `NEXT_PUBLIC_BASE_URL`: Used for generating image URLs
-   `AWS_*`: Required only when using S3 storage for images

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

### Development

-   `bun dev` - Start development server
-   `bun build` - Build for production
-   `bun start` - Start production server
-   `bun lint` - Run linter

### Database Management

-   `bun db:migrate` - Run database migrations
-   `bun db:push` - Push schema changes to database
-   `bun db:reset` - Reset database (caution: deletes all data)
-   `bun db:generate` - Generate Prisma client
-   `bun db:studio` - Open Prisma Studio
-   `bun db:deploy` - Deploy migrations to production
-   `bun db:update` - Generate client, push schema, and run migrations

### Database Clearing

-   `bun db:clear` - Clear all data from the database
-   `bun db:clear-paintings` - Clear only paintings data
-   `bun db:clear-categories` - Clear only categories data

## Project Structure

-   `/app` - Next.js app router pages and API routes
-   `/components` - Reusable React components
-   `/prisma` - Database schema and migrations
-   `/public` - Static assets
-   `/utils` - Utility functions and helpers
-   `/types` - TypeScript type definitions
-   `/prisma/scripts` - Database management scripts

## Features

### Image Management

-   Multiple resolution support:
    -   Low (320px) - For thumbnails and previews
    -   Mid (720px) - For standard viewing
    -   High (1280px) - For full-quality display
-   Automatic image optimization
-   Progressive loading with loading states
-   Image preview during upload
-   Support for local storage or S3-compatible storage

### Content Management

-   Image gallery with categories
-   Admin dashboard for managing paintings
-   Bulk upload functionality
-   Painting details with size, medium, and framing info
-   Category management

### Technical Features

-   Responsive design
-   PostgreSQL database with Prisma ORM
-   TypeScript support
-   Modern React with Next.js
-   SCSS modules for styling

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

### Image Upload Issues

1. Check storage configuration in `.env`:

```
STORAGE_MODE=local # or 's3'
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

2. For S3 storage, ensure these variables are set:

```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket
```
