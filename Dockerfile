# Stage 1: Build React frontend
FROM node:20-alpine AS frontend

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Build Composer dependencies
# Note the "AS" is now capitalized to fix the build warning.
FROM composer:2.7 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
# Install dependencies but skip running scripts like "artisan package:discover" for now.
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-scripts

# Stage 3: Final Image with PHP + Laravel + Nginx
# Note the "AS" is now capitalized to fix the build warning.
FROM php:8.2-fpm-alpine AS backend

# Install system and PHP dependencies
RUN apk add --no-cache nginx curl bash \
    libpng-dev libjpeg-turbo-dev libwebp-dev freetype-dev \
    oniguruma-dev libzip-dev icu-dev libxml2-dev unzip shadow \
    && docker-php-ext-install pdo pdo_mysql mbstring zip exif pcntl intl xml opcache \
    && rm -rf /var/cache/apk/*

# Create Nginx temp directories and set correct ownership
# This fixes the "permission denied" error for POST requests.
RUN mkdir -p /var/lib/nginx/tmp && \
    chown -R www-data:www-data /var/lib/nginx /var/log/nginx
# Copy the composer binary from the vendor stage to use it here.
COPY --from=vendor /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy backend app files
COPY . .

# Copy Vite build from frontend
COPY --from=frontend /app/public/build ./public/build

# Copy Composer dependencies
COPY --from=vendor /app/vendor ./vendor

# Link storage
RUN php artisan storage:link || true

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 storage bootstrap/cache

# Now that all files are present, run composer's post-install scripts and optimize Laravel.
# This will correctly run `php artisan package:discover` and then cache configuration.
RUN composer install --no-dev --optimize-autoloader && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache || true

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose HTTP port
EXPOSE 8000

# Entrypoint
CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;'"]