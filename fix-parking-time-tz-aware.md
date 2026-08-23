# Fix Plan: Make `Submission.parking_time` Timezone-Aware

**Issue:** [#391](https://github.com/bikespace/bikespace/issues/391)  
**Branch:** `fix/parking-time-tz-aware`  
**Scope:** API backend only

---

## Background

The `Submission` model has two datetime fields:

| Field | Timezone-aware? | Current type |
|---|---|---|
| `parking_time` | No (naive) | `sa.DateTime` |
| `submitted_datetime` | Yes (aware) | `sa.DateTime(timezone=True)` |

`parking_time` is stored in UTC in practice, but PostgreSQL and SQLAlchemy don't know that because the column lacks the `timezone=True` flag. This means the API returns a value like:

```
"parking_time": "2024-06-15T10:30:00"
```

instead of:

```
"parking_time": "2024-06-15T10:30:00+00:00"
```

The frontend works around this by manually appending `'+00:00'` in 11 places. Fixing the API eliminates the root cause.

---

## Decision Matrix

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **A: Change `parking_time` to `DateTime(timezone=True)`** (chosen) | Matches `submitted_datetime` pattern already in the codebase. PostgreSQL stores timezone offset. API output is unambiguous ISO 8601. One migration needed. | Requires a DB migration. Marshmallow schema field must also be updated. | **Proceed** |
| **B: Leave model unchanged, fix only at serialization layer** | No migration needed. | Still stores naive data in DB — problem persists for any future consumer reading the DB directly. Root cause is unfixed. | Reject |
| **C: Leave as-is, document UTC assumption** | No code changes. | 11 frontend workarounds remain. Future contributors will repeat the same mistake. Issue stays open. | Reject |

---

## Files to Change

| File | Line(s) | What changes |
|---|---|---|
| `bikespace_api/bikespace_api/submissions/submissions_models.py` | 52–54 | `sa.DateTime` → `sa.DateTime(timezone=True)` |
| `bikespace_api/bikespace_api/submissions/submissions_routes.py` | 42 | `ma.fields.DateTime` → `ma.fields.AwareDateTime` |
| `bikespace_api/migrations/versions/<new>.py` | (auto-generated) | Alembic migration to alter the DB column |

---

## Step-by-Step Instructions

### Step 1 — Update the Model

**File:** `bikespace_api/bikespace_api/submissions/submissions_models.py`

Change line 52–54 from:

```python
parking_time: so.Mapped[datetime] = so.mapped_column(
    sa.DateTime, nullable=False, default=datetime.now
)
```

To:

```python
parking_time: so.Mapped[datetime] = so.mapped_column(
    sa.DateTime(timezone=True), nullable=False, default=datetime.now
)
```

**Reference:** `submitted_datetime` at line 60 does exactly this — it's the proven pattern in this codebase.

---

### Step 2 — Update the Marshmallow Schema

**File:** `bikespace_api/bikespace_api/submissions/submissions_routes.py`

Change line 42 from:

```python
parking_time = ma.fields.DateTime(format="iso", required=True)
```

To:

```python
parking_time = ma.fields.AwareDateTime(format="iso", required=True)
```

**Why `AwareDateTime`?** `AwareDateTime` validates that the incoming value includes timezone info and serializes it with the UTC offset. `DateTime` does not enforce this. Again, `submitted_datetime` at line 44 uses `AwareDateTime` — follow that pattern.

---

### Step 3 — Generate the Migration

From the repo root:

```bash
make migrate-db
```

This runs `flask db migrate` inside the API container and creates a new file in `bikespace_api/migrations/versions/`.

Open the generated file and verify it contains an `alter_column` for `parking_time` similar to what `7392d094ae76_.py` did for `submitted_datetime`:

```python
def upgrade():
    with op.batch_alter_table("bikeparking_submissions", schema=None) as batch_op:
        batch_op.alter_column(
            "parking_time",
            existing_type=postgresql.TIMESTAMP(),
            type_=sa.DateTime(timezone=True),
            existing_nullable=False,
        )

def downgrade():
    with op.batch_alter_table("bikeparking_submissions", schema=None) as batch_op:
        batch_op.alter_column(
            "parking_time",
            existing_type=sa.DateTime(timezone=True),
            type_=postgresql.TIMESTAMP(),
            existing_nullable=False,
        )
```

If Alembic generates additional unrelated changes, remove them and keep only the `parking_time` alteration.

---

### Step 4 — Apply the Migration

```bash
make upgrade-db
```

This runs `flask db upgrade` and alters the column in the dev database.

---

### Step 5 — Run the Tests

```bash
make test-api
```

Watch for test failures caused by naive `datetime` objects being passed as `parking_time`. If any test constructs a `datetime` without timezone info and assigns it to `parking_time`, update it:

```python
# Before (naive)
parking_time=datetime(2024, 6, 15, 10, 30, 0)

# After (aware)
from datetime import timezone
parking_time=datetime(2024, 6, 15, 10, 30, 0, tzinfo=timezone.utc)
```

---

## What to Verify After the Fix

- `GET /api/v2/submissions` response includes `+00:00` suffix on `parking_time` values
- `POST /api/v2/submissions` with a timezone-naive `parking_time` is rejected (Marshmallow `AwareDateTime` enforces this)
- All API tests pass

---

## Out of Scope for This Branch

- Frontend `+00:00` workarounds (tracked in the same issue, separate task)
- `User.confirmed_at` timezone handling (separate investigation per issue #391)
