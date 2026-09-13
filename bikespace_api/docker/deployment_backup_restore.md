# BikeSpace API: Deployment, Backup, and Restore Instructions

## Deployment

**TODO**

## Backup

**TODO**

## Restore

Assumes a fresh Coolify project and access to an S3-compatible storage bucket.

### 0. Recover credentials.

From your password manager/HDD notes, get `RESTIC_PASSWORD` + `BACKUP_S3_ACCESS_KEY`/`BACKUP_S3_SECRET_KEY`. Everything else can be pulled from restic.

### 1. Restore config & secrets.

From any machine with [restic installed](https://restic.readthedocs.io/en/stable/020_installation.html) and network access to the S3 endpoint (e.g. your own computer), run the following to get the secrets that should be copied into the Coolify UI.

`secrets.env` contains **every app secret in plaintext**, so restore it into a private directory rather than world-readable `/tmp`, and delete it once you've transcribed the values:

```bash
# Private working dir (owner-only) — not /tmp, which is world-readable on multi-user hosts.
mkdir -p ~/bikespace-restore && chmod 700 ~/bikespace-restore

RESTIC_REPOSITORY="s3:<BACKUP_S3_ENDPOINT>/<BACKUP_S3_BUCKET>/restic" \
RESTIC_PASSWORD="<YOUR_RESTIC_PASSWORD>" \
AWS_ACCESS_KEY_ID="<BACKUP_S3_ACCESS_KEY>" \
AWS_SECRET_ACCESS_KEY="<BACKUP_S3_SECRET_KEY>" \
AWS_DEFAULT_REGION="<BACKUP_S3_REGION>" \ # optional, many S3-compatible providers ignore it
restic restore latest --tag config --target ~/bikespace-restore

# review the secrets (any text editor works too):
cat ~/bikespace-restore/backups/config/secrets.env
```

### 2. Deploy the full stack, then restore the databases.

Set up the new instance by following the deployment instructions — Coolify application settings, backup S3 bucket, and environment variables — using the secrets you recovered in step 1. If you are restoring onto new storage (e.g. for restore testing or if changing S3-compatible storage providers), you will need to create the new backup bucket from scratch.

> **⚠️ Overwrite the auto-generated secrets *before* the very first deploy.** Five secrets — `BIKESPACE_SECRET_KEY`, `BIKESPACE_SECURITY_PASSWORD_SALT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `SEED_USER_PASSWORD` — are Coolify Magic Environment Variables that Coolify generates *fresh* when you save the compose configuration. Those generated values will not match your backup. As soon as they appear in the Environment Variables UI (after saving the configuration, but **before** you click Deploy), replace each one with the value from your restored `secrets.env`, mapping plain name → Coolify name:
>
> | In `secrets.env`                   | In the Coolify UI                        |
> | ---------------------------------- | ---------------------------------------- |
> | `BIKESPACE_SECRET_KEY`             | `SERVICE_PASSWORD_64_BIKESPACESECRETKEY` |
> | `BIKESPACE_SECURITY_PASSWORD_SALT` | `SERVICE_PASSWORD_64_PASSWORDSALT`       |
> | `POSTGRES_USER`                    | `SERVICE_USER_POSTGRES`                  |
> | `POSTGRES_PASSWORD`                | `SERVICE_PASSWORD_64_POSTGRES`           |
> | `SEED_USER_PASSWORD`               | `SERVICE_PASSWORD_64_SEEDUSERPASSWORD`   |
>
> Then **double-check every pasted value.** `RESTIC_PASSWORD` is *not* a magic variable — enter the one you recovered in step 0 or a new one, depending on whether you want to re-use the existing backup bucket or not.

With everything configured, launch the fresh instance.

Once you've copied every value into the Coolify UI, securely delete the restored file so the plaintext secrets don't linger on disk:

```bash
shred -u ~/bikespace-restore/backups/config/secrets.env
# shred isn't available everywhere (e.g. macOS) — there, just remove the dir:
rm -rf ~/bikespace-restore
```

To restore, you will then overwrite the databases with the backup data. Run the restore itself inside the running **`backup`** container — it already bundles `restic`, `psql`, and `pg_restore` and sits on the same Docker network as `db`, so no extra tooling or file-copying between machines is needed:

```bash
docker exec -it <backup_container_name> sh
```

Inside that shell, run restic restore for the db and then load the restored data. At this point, there are two sets of restic credentials: one used to create the backup being loaded from the old instance, and one for the backup config on the new instance. The container will have the new config, so like before, you'll have to run restic with the env variables specified so it can pull the data from the old instance backup.

```bash
RESTIC_REPOSITORY="s3:<BACKUP_S3_ENDPOINT>/<BACKUP_S3_BUCKET>/restic" \
RESTIC_PASSWORD="<YOUR_RESTIC_PASSWORD>" \
AWS_ACCESS_KEY_ID="<BACKUP_S3_ACCESS_KEY>" \
AWS_SECRET_ACCESS_KEY="<BACKUP_S3_SECRET_KEY>" \
AWS_DEFAULT_REGION="<BACKUP_S3_REGION>" \ # optional, many S3-compatible providers ignore it
restic restore latest --tag db --target /tmp/restore   
# -> /tmp/restore/backups/pg/*.dump, globals.sql
```

For the `psql` and `pg_restore` command below, enter the value for the `PG_PASSWORD` secret if needed.

```bash
# roles (if the postgres user role isn't already created by the image)
psql -h db -U $POSTGRES_USER -d postgres -f /tmp/restore/backups/pg/globals.sql   
```

Expected output will be something like (ignore the "already exists" messages):

```bash
SET
SET
SET
psql:/tmp/restore/backups/pg/globals.sql:16: ERROR:  role "$POSTGRES_USER" already exists
ALTER ROLE
```

Restore the `bikespace` database, which includes the data for the api. You will see a lot of output for this command as it restores the database.

```bash
# bikespace — schema already exists (created by the migrations service), so overwrite it
pg_restore -v -h db -U $POSTGRES_USER -d bikespace --clean --if-exists /tmp/restore/backups/pg/bikespace.dump
```

Once the restore has loaded, remove the dumps from the container's `/tmp` — they contain the Postgres role-password hashes. (Lower risk than step 1 since the `backup` container is single-tenant and ephemeral, but still worth not leaving behind.)

```bash
rm -rf /tmp/restore
```

Once the dump is restored, redeploy the project so that the `api` container picks up the restored data.

### 3. Confirm the stack is healthy. 

- Confirm that the `api` container is up in Coolify
- Confirm that you can access the API online and log in at the `/admin` endpoint
- Run a one-off backup using `backup-now.sh` in the `backup` container
- Spot-check submission counts against expectations
- Try uploading a new submission