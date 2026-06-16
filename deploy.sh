#!/bin/bash

# Salir inmediatamente si ocurre un error
set -e

echo "🚀 Iniciando despliegue de Impulsar Page..."

# 1. Actualizar código
echo "📥 Trayendo últimas modificaciones del repositorio..."
git pull

# 2. Instalar dependencias
echo "📦 Instalando dependencias de producción..."
npm ci --legacy-peer-deps

# 3. Aplicar esquema de base de datos
echo "🗄️ Sincronizando esquema de base de datos con Prisma..."
npx prisma db push

# 4. Compilar la aplicación Next.js
echo "🛠️ Compilando la aplicación Next.js..."
npm run build

# 5. Iniciar o reiniciar la aplicación con PM2
echo "🔄 Iniciando/Reiniciando el proceso en PM2..."
if pm2 show impulsar-page > /dev/null 2>&1; then
    echo "PM2: Reiniciando proceso existente..."
    pm2 restart impulsar-page --update-env
else
    echo "PM2: Iniciando nuevo proceso..."
    pm2 start npm --name "impulsar-page" -- run start
fi

# Guardar la lista de procesos de PM2
pm2 save

echo "✨ ¡Despliegue completado con éxito! Tu aplicación está en línea y actualizada."
