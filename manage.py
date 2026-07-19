#!/usr/bin/env python
import os
import sys

def main():
    # Add root folder to sys.path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.append(current_dir)

    from django.conf import settings

    if not settings.configured:
        settings.configure(
            DEBUG=True,
            SECRET_KEY='salon_spa_secret_key_12345',
            ROOT_URLCONF='Backend.urls',
            ALLOWED_HOSTS=['*'],
            MIDDLEWARE=[
                'corsheaders.middleware.CorsMiddleware',
                'django.middleware.common.CommonMiddleware',
            ],
            INSTALLED_APPS=[
                'django.contrib.contenttypes',
                'django.contrib.auth',
                'corsheaders',
                'rest_framework',
            ],
            CORS_ALLOW_ALL_ORIGINS=True,
            CORS_ALLOW_HEADERS=[
                'accept',
                'accept-encoding',
                'authorization',
                'content-type',
                'dnt',
                'origin',
                'user-agent',
                'x-csrftoken',
                'x-requested-with',
            ],
            # Minimal db settings to satisfy Django's internal checks
            DATABASES={
                'default': {
                    'ENGINE': 'django.db.backends.sqlite3',
                    'NAME': ':memory:',
                }
            }
        )

    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
