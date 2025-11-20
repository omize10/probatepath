# Ops notes

## Migrations: safe deploy

When you add Prisma migrations locally (e.g. `npx prisma migrate dev --name <name>`), a migration folder is created and your development DB is updated.

On first deploy (or any environment where you want to apply migrations), run:

```bash
npm run prisma:deploy
```

This runs `prisma migrate deploy` which safely applies pending migrations without prompting.

You can inspect migration status with:

```bash
npm run prisma:status
```

## Backups: local script

We provide a simple backup script that uses `pg_dump` and writes a gzipped SQL dump into `./backups`.

- Script path: `scripts/db/backup.sh`
- NPM task: `npm run db:backup`

Environment required:

- `BACKUP_DATABASE_URL` — a Postgres connection string. For Neon use the non-pooled connection string (the full `postgres://user:pass@...` URL). If Neon requires SSL, include `?sslmode=require` in the URL.

Example (local test):

```bash
BACKUP_DATABASE_URL="postgres://user:pass@db.neon.tech:5432/dbname?sslmode=require" npm run db:backup
```

The script will create `./backups/db-YYYYMMDD-HHMM.sql.gz`.

## GitHub Actions scheduled backups

A workflow is included at `.github/workflows/neon_backup.yml`. It will run daily at 09:00 UTC and can also be triggered manually.

Important: the workflow will only actually run the backup steps when the repository has the secret `BACKUP_DATABASE_URL` defined in Settings → Secrets. Without that secret, the backup step is skipped (safe-by-default).

To enable scheduled backups:

1. Add a repository secret named `BACKUP_DATABASE_URL` with your Neon Postgres connection string (non-pooled connection URL). Example value:

```
postgres://<user>:<password>@<host>:5432/<db>?sslmode=require
```

2. The workflow will then run daily and upload the `backups/*.gz` artifact with a 7-day retention.

Security note: store secrets in GitHub Secrets and rotate credentials according to your policy.
