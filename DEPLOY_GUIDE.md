# Guía de Despliegue en VPS (Ubuntu) - Impulsar Page

Esta guía detalla los pasos para desplegar la aplicación en tu nuevo VPS (Ubuntu) en Hostinger.

---

## 1. Conexión y Preparación del VPS

Conéctate a tu servidor mediante SSH desde tu terminal:
```bash
ssh root@IP_DE_TU_VPS
```

Actualiza los paquetes del sistema:
```bash
sudo apt update && sudo apt upgrade -y
```

---

## 2. Instalación de Dependencias del Sistema

### Instalar Node.js (v20) y Git
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
```

Verifica las versiones instaladas:
```bash
node -v
npm -v
git --version
```

### Instalar PM2 (Gestor de Procesos de Node.js)
```bash
sudo npm install -g pm2
```

---

## 3. Instalación de PostgreSQL (Base de Datos)

Si decides alojar la base de datos dentro del mismo VPS:

1. Instala PostgreSQL:
   ```bash
   sudo apt install -y postgresql postgresql-contrib
   ```
2. Accede a la consola de PostgreSQL:
   ```bash
   sudo -i -u postgres psql
   ```
3. Crea la base de datos y el usuario administrador:
   ```sql
   CREATE DATABASE impulsar_db;
   CREATE USER impulsar_user WITH PASSWORD 'tu_clave_segura';
   GRANT ALL PRIVILEGES ON DATABASE impulsar_db TO impulsar_user;
   ALTER DATABASE impulsar_db OWNER TO impulsar_user;
   \q
   ```

La URL de conexión para tu archivo `.env` será:
`postgresql://impulsar_user:tu_clave_segura@localhost:5432/impulsar_db?schema=public`

---

## 4. Clonar Proyecto y Configurar Entorno

1. Navega a la carpeta `/var/www/`:
   ```bash
   mkdir -p /var/www
   cd /var/www
   ```
2. Clona tu repositorio de Git:
   ```bash
   git clone <URL_DE_TU_REPOSITORIO> impulsar-page
   cd impulsar-page
   ```
3. Crea el archivo `.env` de producción:
   ```bash
   nano .env
   ```
   Añade las siguientes variables de entorno:
   ```env
   # Base de datos
   DATABASE_URL="postgresql://impulsar_user:tu_clave_segura@localhost:5432/impulsar_db?schema=public"

   # Configuración de NextAuth (Cambia 'tusecreto' por uno aleatorio)
   NEXTAUTH_URL="https://tu-dominio.com"
   NEXTAUTH_SECRET="un_secreto_muy_largo_y_seguro"

   # WhatsApp y API Meta (Si procede)
   WHATSAPP_API_TOKEN="tu_token_de_meta"
   WHATSAPP_PHONE_NUMBER_ID="tu_phone_number_id"
   WHATSAPP_VERIFY_TOKEN="tu_verify_token_webhook"
   GEMINI_API_KEY="tu_gemini_api_key"
   ```
   Guarda y sal (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## 5. Primer Despliegue con `deploy.sh`

Otorga permisos de ejecución al script de despliegue que hemos creado y ejecútalo:
```bash
chmod +x deploy.sh
./deploy.sh
```

### Hacer que PM2 inicie automáticamente tras reiniciar el VPS
```bash
pm2 startup systemd
```
*(Copia y ejecuta el comando que imprima la pantalla en tu terminal).*

---

## 6. Configurar Nginx (Proxy Inverso) y Certbot (SSL HTTPS)

El webhook de WhatsApp requiere obligatoriamente HTTPS. Configuraremos Nginx como puerta de entrada.

1. Instala Nginx:
   ```bash
   sudo apt install -y nginx
   ```
2. Crea el archivo de configuración para tu dominio:
   ```bash
   sudo nano /etc/nginx/sites-available/impulsar-page
   ```
3. Pega la siguiente configuración (reemplazando `tu-dominio.com` por tu dominio real):
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com www.tu-dominio.com;

       # Configuración para subidas de archivos grandes (ej. PDFs de 20MB)
       client_max_body_size 25M;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
4. Habilita la configuración y reinicia Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/impulsar-page /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Obtener Certificado SSL HTTPS Gratuito
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```
Sigue los pasos interactivos. Certbot configurará automáticamente el SSL en tu archivo Nginx y renovará el certificado automáticamente.

---

## 7. Mantenimiento y Actualizaciones Futuras

Cada vez que subas cambios a tu repositorio Git, solo debes conectarte al VPS, entrar en `/var/www/impulsar-page` y ejecutar:
```bash
./deploy.sh
```
El script actualizará el código, instalará librerías nuevas, aplicará cambios en la base de datos, compilará Next.js y reiniciará PM2 al instante sin interrumpir el servicio.
