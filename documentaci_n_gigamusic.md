# 🎵 GigaMusic - Audio Console Streaming & Commerce Platform

**GigaMusic** es una plataforma web full-stack de comercio y reproducción musical diseñada con una estética visual inspirada en consolas de audio analógicas/synth rack. Permite la exploración de catálogos, vistas previas de pistas, procesamiento de compras seguras e ingesta de contenido multimedia codificado.

---

## 📋 Descripción del Proyecto

La aplicación ofrece un flujo continuo para dos tipos de usuarios (Clientes y Administradores):
- **Clientes**: Pueden explorar álbumes mediante búsquedas dinámicas, escuchar muestras previas (limitadas a 60 segundos), agregar producciones al carrito y adquirir acceso completo a la biblioteca.
- **Administradores**: Tienen acceso privilegiado para agregar nuevos álbumes codificados de forma persistente y eliminar elementos existentes del catálogo.

---

## 📁 Esqueleto del Proyecto (Estructura de Directorios)

```text
gigamusica_pablo/
├── controllers/
│   ├── albumController.js    # Lógica CRUD para álbumes y pistas
│   ├── authController.js     # Autenticación y gestión de roles (RBAC)
│   └── orderController.js    # Procesamiento de transacciones
├── models/
│   ├── Album.js              # Esquema Mongoose para álbumes
│   ├── User.js               # Esquema de usuarios y biblioteca
│   └── Order.js              # Registro de compras realizadas
├── routes/
│   ├── albumRoutes.js        # Rutas API de álbumes (/api/albums)
│   ├── authRoutes.js         # Rutas API de autenticación (/api/auth)
│   └── orderRoutes.js        # Rutas API de pedidos (/api/orders)
├── html/
│   ├── develop.html          # Vista de Carrito de Compras / Checkout
│   ├── library.html          # Vista de Biblioteca personal (adquiridos)
│   ├── login.html            # Formulario de Acceso y Registro
│   ├── now play.html         # Reproductor en consola de 2 columnas
│   └── pagamee.html          # Confirmación de pago exitoso
├── css/
│   ├── componentes.css       # Modales, inputs y botones personalizados
│   ├── layout.css            # Estructura del grid principal y Sidebar
│   ├── player_style.css      # Estilos del reproductor tipo Audio-Rack
│   └── stylemain.css         # Variables globales (:root) y paleta synth
├── js/
│   ├── authGuard.js          # Guardián de sesión y menú global
│   ├── index.js              # Renderizado del catálogo y buscador
│   └── player.js             # Motor de reproducción y límites
├── .env                      # Variables de entorno secretas
├── server.js                 # Punto de entrada del servidor Express
├── package-lock.json
├── package.json
└── README.md                 # Documentación del proyecto
```

---

## ⚙️ ¿Cómo Funciona el Sistema?

### 1. Codificación Persistente de Archivos Multimedia
Para evitar enlaces temporales caducos (`blob:` URLs), el frontend convierte los archivos subidos de audio/video a cadenas **Base64** utilizando la API `FileReader`. Express está configurado con límites de carga de `50mb` (`express.json({ limit: '50mb' })`) para recibir e ingestar directamente la data en MongoDB.

### 2. Vista Previa vs. Acceso Completo (60 Segundos)
* **Usuarios sin compra / Invitados**: El elemento `<audio>` monitorea el tiempo de reproducción mediante `timeupdate`. Si alcanza los 60 segundos, la pista se pausa automáticamente exigiendo la compra del álbum.
* **Propietarios (Álbum Comprado)**: La verificación cruzada contra `purchasedAlbums` deshabilita la restricción de 60 segundos y desbloquea el reproductor completo.

### 3. Ajuste Automático de Volumen
El reproductor inyecta programáticamente una ganancia máxima (`audioEl.volume = 1.0`) para mantener niveles estandarizados en la salida de audio.

---

## 🗝️ ¿Cómo Activar el Modo Admin?

La plataforma incluye un sistema de Control de Acceso Basado en Roles (RBAC). Para otorgar capacidades administrativas (botón **"+ Nuevo Álbum"** y eliminación de catálogo `🗑️`):

1. Abre el archivo **`.env`** en la raíz de tu proyecto y define la clave secreta de administración:
   ```env
   ADMIN_SECRET_CODE=GIGAMUSIC_ADMIN_2026
   ```

2. Dirígete a la pantalla de **Registro** (`html/login.html`).

3. Al crear una nueva cuenta, completa los campos normales e introduce el código secreto en el campo correspondiente a **Código de Administrador**.

4. Al iniciar sesión con esta cuenta, la aplicación reconocerá el rol `admin`, desplegando el modal de gestión y los botones de eliminación en las tarjetas de discos.

---

## 🚀 Puesta en Marcha

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor backend:**
   ```bash
   node server.js
   ```

3. Abrir `index.html` en tu navegador o mediante un servidor local.