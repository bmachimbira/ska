# Database Seed Data

This directory contains seed data for the SKA App database.

## Files

- **`initial_data.sql`** - Production seed data dumped from the development database

## What's Included

The seed data includes:

- **Users & Authentication** - Admin accounts, editors, uploaders
- **Churches** - Church locations and details
- **Sermons** - Sermon content, speakers, and media
- **Devotionals** - Daily devotional content
- **Quarterlies & Lessons** - Sabbath School materials
- **Events** - Church events and registrations
- **Causes** - Fundraising causes and donations
- **Relationships** - All foreign keys and associations

## Usage

### Loading Seed Data

The seed script automatically loads data from `initial_data.sql`:

```bash
# In Docker
docker compose exec backend npm run seed

# Or locally
npm run seed
```

### Creating/Updating Seed Data

To dump your current database as seed data:

```bash
# From project root
./scripts/dump-seed-data.sh
```

This will:
1. Connect to the running PostgreSQL container
2. Dump the entire database to `initial_data.sql`
3. Overwrite the existing seed file

### Manual Dump

```bash
docker compose -f docker-compose.dev.yml exec -T postgres pg_dump \
  -U user \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  sda_app > backend/seeds/initial_data.sql
```

## Important Notes

⚠️ **Security Considerations:**

- The seed data may contain sensitive information (user passwords, API keys, etc.)
- Passwords should be changed after seeding in production
- Consider using environment-specific seed files for production vs development
- Do not commit production credentials or sensitive data to version control

⚠️ **Production Deployment:**

When deploying to production:
1. Run migrations first: `npm run migrate`
2. Then load seed data: `npm run seed`
3. Update admin passwords immediately
4. Review and update any API keys or tokens

## Seed Script Behavior

The seed script (`scripts/seed.js`) will:

1. Check for `seeds/initial_data.sql` first (production data)
2. Fall back to `migrations/002_seed_data.sql` if no production seed exists
3. Show statistics after seeding
4. Display sample login credentials if using development data

## File Format

The seed data is a PostgreSQL SQL dump file containing:

- `DROP` statements (with `IF EXISTS`) to clean existing data
- `CREATE TABLE` statements (if needed)
- `INSERT` statements for all data
- Proper foreign key handling
- No ownership or privilege assignments (portable across environments)

## Maintenance

- Update seed data whenever significant changes are made to the development database
- Keep seed data synchronized with migration files
- Test seed data in a clean environment before production deployment
- Document any manual steps required after seeding
