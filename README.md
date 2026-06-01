# Barberapp

Barberapp es una aplicación de administración de reservas para un salón de barbería desarrollada con Angular 21.2 y componentes standalone. Es una aplicación SPA que ofrece gestión de usuarios, citas, reportes PDF, historial de clientes y auditoría de acciones.

---

## 🚀 Visión general del proyecto

- **Nombre**: Barberapp
- **Framework**: Angular 21.2.0
- **Tipo**: Aplicación web de una sola página (SPA)
- **Arquitectura**: `bootstrapApplication` + `provideRouter` + `provideZoneChangeDetection`
- **Persistencia**: `localStorage` para usuarios, citas, barberos y logs
- **Estilos**: Tailwind CSS combinado con SCSS

---

## ⚙️ Tecnologías principales

- `@angular/core`, `@angular/router`, `@angular/forms`
- `@angular/build`, `@angular/cli`
- `rxjs`
- `chart.js`
- `jspdf` + `jspdf-autotable`
- `tailwindcss`, `postcss`, `autoprefixer`
- `vitest` para pruebas

---

## 📦 Instalación y ejecución

1. Instalar dependencias:

```bash
npm install
```

2. Ejecutar el servidor de desarrollo:

```bash
npm start
```

3. Generar build de producción:

```bash
npm run build
```

4. Ejecutar pruebas unitarias:

```bash
npm test
```

---

## 🧭 Estructura del proyecto

### Archivos clave

- `angular.json` — configuración de compilación, servidor y pruebas
- `package.json` — dependencias y scripts del proyecto
- `src/main.ts` — arranque de la aplicación
- `src/app/app.config.ts` — configuración global de Angular
- `src/app/app.routes.ts` — definición de rutas y guardias
- `src/app/app.component.ts` — componente raíz con layout y elementos globales

### Carpetas principales

- `src/app/core/` — servicios, modelos, guards y lógica central
- `src/app/features/` — funcionalidades principales y vistas por dominio
- `src/app/shared/` — componentes UI reutilizables (layout, toast, loader, modal)

---

## 🧩 Arquitectura y patrones

- La aplicación usa **standalone components** en lugar de módulos tradicionales.
- La navegación se configura con `provideRouter(routes)`.
- Se utiliza `provideZoneChangeDetection({ eventCoalescing: true })` para optimizar la detección de cambios.
- Se emplea `BehaviorSubject` y observables (`appointments$`, `barbers$`, `logs$`) para sincronizar datos en tiempo real.
- El estado persistente se almacena en `localStorage`.
- Servicios especializados se encargan de la lógica de negocio: autenticación, citas, barberos, citas, reportes y UI.

---

## 🔐 Autenticación y roles

### Roles soportados

- `admin`
- `barbero`
- `cliente`

### Cuentas demo disponibles

- `admin@barber.com`
- `barbero@barber.com`
- `cliente@barber.com`

### Flujo de autenticación

- `AuthService.login(email, password)` identifica mock users por correo.
- El usuario se guarda en `localStorage` como `currentUser`.
- Se registra la acción en `LogService`.
- Se redirige según el rol:
  - `admin` → `/admin/dashboard`
  - `barbero` → `/appointments/calendar`
  - `cliente` → `/client/history`
- `AuthService.logout()` borra la sesión local y redirige a `/auth/login`.

---

## 🧭 Rutas principales

- `/auth/login` — login público.
- `/admin/dashboard` — dashboard administrativo (`admin` solamente).
- `/admin/barbers` — gestión de barberos (`admin` solamente).
- `/admin/logs` — bitácora de actividad (`admin` solamente).
- `/appointments/calendar` — agenda de citas (`admin` y `barbero`).
- `/appointments/create` — formulario de creación de cita (usuarios autenticados).
- `/client/history` — historial de cliente y cancelación de citas.
- `**` — redirige a `auth/login`.

---

## 🧠 Servicios principales

### `AuthService`

- Controla login y logout.
- Mantiene usuario autenticado en un `BehaviorSubject`.
- Redirige según rol.
- Registra acciones de sesión en `LogService`.

### `AppointmentService`

- Almacena citas en `localStorage`.
- Expone `appointments$` como observable.
- Crea citas y actualiza estados de cita y pago.
- Filtra citas por fecha, barbero y cliente.

### `BarberService`

- Gestiona barberos en `localStorage`.
- Inicializa barbero demo si no existe ninguno.
- Soporta agregar, editar y eliminar barberos.
- Registra logs de auditoría.

### `ScheduleService`

- Calcula horarios disponibles en intervalos de 30 minutos.
- Determina colisiones entre citas y servicios.
- Define catálogo de servicios con duración y precio.
- Convierte minutos a formato `HH:mm`.

### `PdfService`

- Genera reportes PDF de citas.
- Producto con tabla de citas y total de ingresos.
- Usa `jspdf` y `jspdf-autotable`.

### `LogService`

- Registra actividad de la aplicación (`creación`, `edición`, `cancelación`).
- Guarda logs en `localStorage`.
- Provee `logs$` como observable.

### `UiService`

- Controla loader global.
- Controla modal de confirmación y retorno de promesas.

### `NotificationService`

- Muestra notificaciones `toast` temporales.
- Tipos: `success`, `error`, `info`, `warning`.

### `ThemeService`

- Alterna entre modo claro y oscuro.
- Persiste la preferencia en `localStorage`.
- Detecta preferencia del sistema al inicio.

---

## 📄 Modelos de datos

### `User`

- `id`
- `name`
- `email`
- `role` (`admin`, `barbero`, `cliente`)
- `phone`
- `specialties?`
- `schedule?`

### `Appointment`

- `id`
- `clientId`
- `clientName`
- `barberId`
- `barberName`
- `date` (`YYYY-MM-DD`)
- `time` (`HH:mm`)
- `service`
- `status` (`pendiente`, `confirmada`, `rechazada`, `cancelada`)
- `payment`
- `createdAt`

### `ActivityLog`

- `id`
- `action` (`creación`, `cancelación`, `edición`)
- `entity`
- `entityId`
- `userId`
- `userName`
- `timestamp`
- `details`

---

## 🖥️ Componentes clave

### `LoginComponent`

- Formulario reactivo de login.
- Validación de email.
- Mensajes de feedback mediante `NotificationService`.

### `LayoutComponent`

- Renderiza la navegación lateral con accesos según rol.
- Contiene `router-outlet`, `app-toast` y `app-confirm-modal`.
- Controla apertura/cierre de sidebar en móvil.

### `DashboardComponent`

- Muestra KPIs: ingresos del día, cortes realizados, servicio más popular.
- Grafico de actividad diaria con `chart.js`.
- Exporta reportes PDF.

### `CreateAppointmentComponent`

- Permite seleccionar servicio, barbero, fecha y horario.
- Consulta horarios disponibles dinámicamente.
- Crea cita con estado inicial `pendiente`.

### `ClientHistoryComponent`

- Lista de citas del cliente logueado.
- Calcula total gastado y citas confirmadas.
- Permite cancelar citas con confirmación.

---

## 🛠️ Notas de implementación

- La aplicación usa componentes standalone, sin `AppModule` tradicional.
- No existe backend real: los datos se guardan localmente.
- La validación de login es mock y depende únicamente del correo.
- Los horarios de servicio se calculan con base en la duración del servicio y las citas reservadas.
- `localStorage` mantiene:
  - `currentUser`
  - `appointments`
  - `barbers`
  - `logs`
  - `theme`

---

## ✅ Comandos disponibles

- `npm install` — instalar dependencias
- `npm start` — iniciar servidor de desarrollo
- `npm run build` — generar build de producción
- `npm test` — ejecutar pruebas unitarias

---

## 💡 Recomendaciones de mejora

- Integrar backend real para autenticación y datos
- Agregar validaciones de contraseña y seguridad real
- Implementar CRUD completo para `BarberService` desde UI
- Añadir tests unitarios e integración más extensos
- Mejorar el manejo de errores y validaciones de formulario

---

## 📌 Licencia

Proyecto privado. Ajusta la licencia según el uso deseado.
