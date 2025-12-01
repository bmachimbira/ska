# Database Seed Data Setup Complete ✅

Your current database has been dumped and is ready to use for remote deployment.

## What Was Done

1. **Database Migrated** - All 13 migrations were successfully applied
2. **Two Seed Files Created**:
   - `backend/seeds/data_only.sql` (582 lines) - Data without schema (recommended)
   - `backend/seeds/full_dump.sql` (3655 lines) - Complete database for reference
3. **Load Script Created** - `backend/scripts/load-data.js` to load data after migrations
4. **Dump Script Updated** - `scripts/dump-seed-data.sh` creates both dumps
5. **Package.json Updated** - Added `npm run load-data` command

## Important: Seed Data Strategy

**Migrations Already Seed Some Data:**
- `001_initial_schema.sql` - Feature flags
- `006_add_events.sql` - Sample event
- `008_church_system.sql` - 3 sample churches
- `009_seed_churches.sql` - 5 real churches + pastors
- `010_link_speakers_to_users.sql` - Creates users from speakers
- `013_seed_ebenezer_content.sql` - Ebenezer church content

**Therefore:**
- Use `data_only.sql` to add **additional** content after migrations
- Do NOT load the old `initial_data.sql` (contains schema that conflicts with migrations)

## Seed Data Contents

The `data_only.sql` file includes ONLY data (no schema):

- ✅ User accounts and authentication
- ✅ Churches and locations (additional beyond migrations)
- ✅ Sermons with speakers and media
- ✅ Devotionals
- ✅ Quarterlies and lessons
- ✅ Events and registrations (additional)
- ✅ Causes and donations
- ✅ All relationships and foreign keys

## How To Use

### For Remote Deployment

When deploying to a new server:

```bash
# 1. Start services
docker compose up -d

# 2. Run migrations (creates schema)
docker compose exec backend npm run migrate

# 3. Load seed data (populates with your content)
docker compose exec backend npm run seed

# 4. Verify
docker compose exec backend npm run seed  # Should show record counts
```

### Updating Seed Data

Whenever you make significant changes to your development database:

```bash
# From project root
./scripts/dump-seed-data.sh
```

This will:
- Dump the current database
- Overwrite `backend/seeds/initial_data.sql`
- Show line count and confirmation

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

## Files Created/Updated

- ✅ `backend/seeds/initial_data.sql` - Your database dump (3655 lines)
- ✅ `backend/seeds/README.md` - Seed data documentation
- ✅ `backend/scripts/seed.js` - Updated to use production seed
- ✅ `scripts/dump-seed-data.sh` - Convenient dump script
- ✅ `docs/DOCKER_DEPLOYMENT.md` - Updated with seed instructions
- ✅ `DOCKER_README.md` - Updated with seed commands

## Important Notes

⚠️ **Security:**
- The seed file contains user passwords (hashed but should be changed)
- Review the seed file before committing to ensure no sensitive data
- Update admin passwords immediately after seeding in production

⚠️ **Deployment Order:**
1. Migrations first (creates schema)
2. Seed data second (populates content)
3. Never seed an already-populated database (will cause conflicts)

⚠️ **Fresh Database Only:**
The seed script will fail if data already exists (by design). It's meant for:
- Initial production deployment
- Setting up new development environments
- Restoring to a clean state

## Verification

To verify seed data was loaded:

```bash
docker compose exec backend npm run seed
```

Output should show:
```
📊 Database contents:
   users: X records
   sermons: X records
   speakers: X records
   ...
```

## Next Steps

When deploying remotely:

1. ✅ Use the production `docker-compose.yml`
2. ✅ Set up environment variables in `.env`
3. ✅ Run `docker compose up -d`
4. ✅ Run migrations: `docker compose exec backend npm run migrate`
5. ✅ Load seed data: `docker compose exec backend npm run seed`
6. ✅ Change admin passwords
7. ✅ Test all services

Your database is now portable and ready for deployment! 🚀
