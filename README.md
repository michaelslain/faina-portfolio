# Faina Portfolio

Built with Bun, Prisma, PostgreSQL, and LocalStack for S3 storage.

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

### Installing Docker and LocalStack

1. Install Docker Desktop:

```bash
brew install --cask docker
```

2. Install LocalStack:

```bash
brew install localstack
```

3. Start Docker Desktop:

    - Open Docker Desktop from Applications
    - Wait for Docker to fully start (icon in menu bar will stop animating)

4. Start LocalStack:

```bash
localstack start
```

5. Install AWS CLI:

```bash
brew install awscli
```

6. Configure AWS CLI for LocalStack:

```bash
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set region us-east-1
```

7. Create S3 bucket for development:

```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://faina-portfolio
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
git clone https://github.com/michaelslain/faina-portfolio.git
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

# S3 Configuration (LocalStack for development)
STORAGE_MODE="s3"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
AWS_ACCESS_KEY_ID="test"
AWS_SECRET_ACCESS_KEY="test"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="faina-portfolio"
AWS_ENDPOINT="http://localhost:4566"
AWS_FORCE_PATH_STYLE="true"
```

Each variable serves the following purpose:

-   `DATABASE_URL`: Connection string for your PostgreSQL database
-   `JWT_SECRET`: Secret key used for generating and validating JWT tokens
-   `ADMIN_PASSWORD`: Bcrypt-hashed password for admin access
-   `STORAGE_MODE`: Set to "s3" for both development and production
-   `NEXT_PUBLIC_BASE_URL`: Used for generating image URLs
-   `AWS_*`: S3 configuration (using LocalStack values for development)

To generate a bcrypt hashed password for `ADMIN_PASSWORD`, you can use Node.js:

```zsh
node -e "console.log(require('bcrypt').hashSync('your_password_here', 10))"
```

Replace 'your_password_here' with your desired admin password.

5. Generate Prisma client and push the schema:

```bash
bun db:update
```

## Running the Application

1. Ensure LocalStack is running:

```bash
localstack start
```

2. Start the development server:

```bash
bun dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

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
    -   Low (320px) - For thumbnails and initial load
    -   Mid (720px) - For intermediate quality
    -   High (1280px) - For full-quality display
-   Progressive image loading
-   S3 storage with LocalStack for development
-   Automatic image optimization and resizing
-   Image preview during upload

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

### LocalStack Issues

1. If LocalStack fails to start:

```bash
docker ps  # Check if Docker is running
docker system prune  # Clean up Docker system
localstack start  # Try starting LocalStack again
```

2. To verify S3 bucket:

```bash
aws --endpoint-url=http://localhost:4566 s3 ls
```

3. To list bucket contents:

```bash
aws --endpoint-url=http://localhost:4566 s3 ls s3://faina-portfolio/uploads/ --recursive
```

4. To reset LocalStack:

```bash
localstack stop
docker system prune
localstack start
```

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
