# BikeSpace API: Deployment, Backup, and Restore Instructions

## Deployment

Instructions below are for [Coolify](https://coolify.io/docs/applications/build-packs/docker-compose) but the steps should be similar for a regular docker compose deployment. For a non-Coolify deployment, you will have to generate your own secrets for the `SERVICE_USER_POSTGRES` and `SERVICE_PASSWORD_64_` values.

1. Set up an S3-compatible bucket to store the backups as well as access credentials scoped to just that bucket and write down the key details in a secure place. You should have one value for each `BACKUP_S3_*` environment variable, though `BACKUP_S3_REGION` is optional for some providers. The backups bucket should be encrypted and it should not be public.
2. Follow the [instructions for a Coolify docker compose deployment](https://coolify.io/docs/applications/build-packs/docker-compose), pointing Coolify at this repository with the following settings:

   - Git source: https://github.com/bikespace/bikespace.git
   - Base directory: `bikespace_api/docker/`
   - Docker compose location: `compose-prod.yaml`

3. Add a domain for the service, connecting Coolify's proxy to port `8000` (e.g. `https://bikespace.mydomain.ca:8000`)
4. Fill in the following environment variables:

   - `SEED_USER_EMAIL`: email address for the superuser account you can use for initial setup, e.g. adding additional users. The password for this account will be automatically generated in `SERVICE_PASSWORD_64_SEEDUSERPASSWORD`.
   - `RESTIC_PASSWORD`: generate this for yourself (e.g. with `python3 -c "import secrets; print(secrets.token_hex(64))"`) and **save it outside of Coolify in a password manager!** Without this, you will not be able to use your backups.
   - `BACKUP_S3_*` variables: fill these out using the information from step 1.
   - `BACKUP_CRON_*` and `RESTIC_KEEP_*` variables can optionally be changed if you want a different backup and retention schedule than the default. See notes in the backup section.

5. Deploy the service
6. Check the deployment:

   - Deployment should indicate "success/finished"
   - Container healthchecks should be passing
   - Check the runtime logs to confirm there are no errors in start-up or database migration
   - You should be able to navigate to the api URL and successfully make a request using the docs page (e.g. to `/api/v2/submissions`)
   - You should be able to log in at `/admin` using the seed user account

7. Run a one-off backup and confirm it was successful (see instructions in the backup section).
8. Change the seed user password using the User admin panel at `admin/user/`


## Backup

The `backup` container in `compose-prod.yaml` will automatically back up secrets and the postgres database so that your production instance can be restored or rolled back if needed. The backups are managed and encrypted by [restic](https://restic.net/) and saved to an S3-compatible file storage bucket.


### Schedule and Retention

The backup schedule and retention periods can optionally be customized. Make sure to re-start the containers after updating any of these values:

| Variable              | Default      | Description                             |
| --------------------- | ------------ | --------------------------------------- |
| `BACKUP_CRON_DB`      | `30 2 * * *` | When to back up the databases.          |
| `BACKUP_CRON_CONFIG`  | `45 2 * * *` | When to back up secrets.                |
| `BACKUP_CRON_CHECK`   | `0 4 * * 0`  | When to run the restic integrity check. |
| `RESTIC_KEEP_DAILY`   | `7`          | Daily restic snapshots to retain.       |
| `RESTIC_KEEP_WEEKLY`  | `5`          | Weekly restic snapshots to retain.      |
| `RESTIC_KEEP_MONTHLY` | `12`         | Monthly restic snapshots to retain.     |


### Running a one-off backup

```sh
# ssh into host machine

# find the backup container name, e.g. with
docker ps --format "table {{.ID}}\t{{.CreatedAt}}\t{{.Names}}" | grep backup

# run the backup now script
docker exec <container_name> backup-now.sh

# verify that the backup ran correctly
docker exec <container_name> restic-check.sh
```

You can also use the 'terminal' menu in Coolify and connect to the backup container that way. From there you can just run `backup-now.sh` and then `restic-check.sh`.


### Saving a copy to an external hard drive

To fully implement the [3-2-1 backup strategy](https://www.backblaze.com/blog/the-3-2-1-backup-strategy/), you can copy the backup files to an external hard drive, e.g. once a week.

To do this, you can set up a script like this on the backup disk:

```sh
# `,region='${BACKUP_S3_REGION}'` is optional on some providers
BACKUP=":s3,provider=Other,access_key_id=${BACKUP_S3_ACCESS_KEY},secret_access_key=${BACKUP_S3_SECRET_KEY},endpoint='${BACKUP_S3_ENDPOINT}',region='${BACKUP_S3_REGION}':${BACKUP_S3_BUCKET}"

# Encrypted DB/secrets: copy the restic repo
# Change `/mnt/hdd/bikespace/restic` to your desired path
rclone sync "$BACKUP/restic" /mnt/hdd/bikespace/restic \
  --transfers 16 --checkers 32 --fast-list --progress
```


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