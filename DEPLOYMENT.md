# Deployment Guide for KKM Mata Mamplam

This guide explains how to deploy this Next.js project to **Vercel** (Free Tier) and use **GitHub** for version control.

## Prerequisites

1.  **GitHub Account**: [Sign up here](https://github.com/)
2.  **Vercel Account**: [Sign up here](https://vercel.com/signup)
3.  **Database**: A PostgreSQL database (e.g., Vercel Postgres, Supabase, Neon, or Aiven).

---

## Step 1: Push to GitHub

1.  Initialize Git (if not already done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit: Ready for deployment"
    ```

2.  Create a new repository on GitHub (keep it **Private** if you have sensitive code, though `.env` is already ignored).

3.  Link your local project to GitHub:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

---

## Step 2: Deploy to Vercel

1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  **Framework Preset**: Select **Next.js** (usually auto-detected).

### Environment Variables

In the **"Environment Variables"** section before clicking Deploy, add the following (copy from your `.env` but use Production values):

| Generic Name | Description |
| :--- | :--- |
| `DATABASE_URL` | Your production PostgreSQL Connection String. |
| `NEXTAUTH_SECRET` | Generate a random string (run `openssl rand -base64 32` or use a password generator). |
| `NEXTAUTH_URL` | Your Vercel domain (e.g., `https://your-project.vercel.app`). **Important**: On Vercel, this is sometimes optional for NextAuth v4, but good to have. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary Cloud Name. |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Your Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API Secret. |

> **Note**: Do *not* copy `NEXT_PUBLIC_APP_URL` if you are relying on Vercel's auto-generated URLs, or set it to your custom domain.

5.  Click **"Deploy"**.

---

## Step 3: Post-Deployment (Database)

Once the build is successful, you need to push your database schema to the production database.

1.  Since we cannot run `npx prisma db push`  on the Vercel server console easily, it is best to run it **locally** pointing to the **production database**.

2.  **Temporarily** change your local `.env` file:
    ```env
    # .env
    DATABASE_URL="postgresql://user:password@production-db-host:5432/dbname?sslmode=require"
    ```

3.  Run the push command:
    ```bash
    npx prisma db push
    ```

4.  (Optional) Seed default data:
    ```bash
    npm run prisma:seed
    ```

5.  **Revert** your local `.env` back to your local development database URL.

---

## Troubleshooting

-   **Build Failed?**: Check the "Building" logs on Vercel. Common errors include type errors (TypeScript) or missing environment variables.
-   **Images not loading?**: Ensure your Cloudinary credentials are correct in Vercel.
-   **Login failing?**: Check `NEXTAUTH_SECRET` and ensure your database "User" table was created correctly.
