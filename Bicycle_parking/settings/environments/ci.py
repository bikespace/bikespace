import dj_database_url
import os

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
AWS_ACCESS_KEY_ID = ''
AWS_SECRET_ACCESS_KEY = ''
S3_BUCKET = ''
MAPS_API_KEY = os.environ.get('MAPS_API_KEY')

AWS_STORAGE_BUCKET_NAME = ''

DISABLE_COLLECTSTATIC = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.10/howto/static-files/

STATIC_ROOT = os.path.join(PROJECT_ROOT, 'staticfiles')
STATIC_URL = '/static/'

# Simplified static file serving.
# https://warehouse.python.org/project/whitenoise/
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Database
# https://docs.djangoproject.com/en/1.10/ref/settings/#databases

# please fill out these settings for your own local machine!
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'bike_parking_toronto',
        'USER': os.getenv('BIKE_DB_USER', 'postgres'),
        'PASSWORD': os.getenv('BIKE_DB_PW', 'postgres'),
        'HOST': os.getenv('BIKE_DB_HOST', 'localhost'),
        'PORT': '5432',
    }
}

# note: BIKE_DB_* variables replace $DATABASE_URL to support
# multiple database access
# Update database configuration with $DATABASE_URL.
# db_from_env = dj_database_url.config(conn_max_age=500)
# DATABASES['default'].update(db_from_env)

# define the database routers; these objects route requests passed to the django
# routines to update or access a table defined as a model class in python
# to the appropriate database

DATABASE_ROUTERS = ['bicycleparking.Routers.DefaultRouting']