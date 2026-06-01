# Despliegue de BarberApp en Google Cloud con Docker

Esta version esta preparada para desplegar Angular, Express y MariaDB en una VM Ubuntu usando Docker Compose.

## 1. Puertos de Google Cloud

En la VM marca `Permitir trafico HTTP` y `Permitir trafico HTTPS`. La aplicacion publica usa el puerto `80`.

No necesitas abrir el puerto `3000`: Nginx recibe `/api` y lo manda internamente al backend.

## 2. Variables de entorno

En el servidor, copia el ejemplo:

```bash
cp .env.deploy.example .env
nano .env
```

Cambia como minimo:

```env
CLIENT_URL=http://TU_IP_PUBLICA_DE_GOOGLE
JWT_SECRET=un_secreto_largo_y_dificil
DB_ROOT_PASSWORD=otra_contrasena
DB_PASSWORD=otra_contrasena
```

Si no configuras SMTP, el backend no enviara correos reales.

## 3. Subir y ejecutar

```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose-v2 git -y
sudo usermod -aG docker $USER
```

Cierra la terminal SSH y vuelve a entrar. Luego:

```bash
git clone https://github.com/usuario/barberapp.git
cd barberapp
cp .env.deploy.example .env
nano .env
sudo docker compose up -d --build
```

Abre `http://TU_IP_PUBLICA_DE_GOOGLE`.

## 4. Usuarios demo

Todos usan la contrasena `123456`:

- `admin@barber.com`
- `barbero@barber.com`
- `cliente@barber.com`

## 5. Comandos utiles

```bash
sudo docker compose ps
sudo docker compose logs -f backend
sudo docker compose logs -f frontend
sudo docker compose down
```

Para reiniciar la base de datos desde cero:

```bash
sudo docker compose down -v
sudo docker compose up -d --build
```
