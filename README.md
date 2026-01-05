# Seguimiento de Colaboraciones - GD

Aplicación web para la gestión y seguimiento de colaboraciones del equipo de Gestión Documental.

## 🚀 Características

- **Dashboard de Resumen**: Vista general de colaboraciones por estado
- **Vista Gantt**: Planificación anual con entregas marcadas
- **Gestión de Colaboraciones**: Crear, editar y visualizar colaboraciones completas
- **Bitácora de Situación**: Actualizaciones mensuales automáticas
- **Gestión de Riesgos**: Indicadores visuales tipo semáforo
- **Modo Presentación**: Vista optimizada para reuniones
- **Control de Acceso**: Roles de admin, analista y seguimiento (solo lectura)

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Firebase
- Proyecto Firebase: `seguimientocolaboracione-1eea6`

## 🔧 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Firebase

Edita el archivo `src/firebase/config.js` con tus credenciales de Firebase:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "seguimientocolaboracione-1eea6.firebaseapp.com",
  projectId: "seguimientocolaboracione-1eea6",
  storageBucket: "seguimientocolaboracione-1eea6.firebasestorage.app",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
```

Para obtener estas credenciales:
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a Configuración del proyecto > General
4. En "Tus apps" > "SDK setup and configuration"
5. Copia la configuración

### 3. Configurar Firestore

En Firebase Console:
1. Ve a Firestore Database
2. Crea la base de datos en modo producción
3. Configura las reglas de seguridad (ver más abajo)

### 4. Configurar Authentication

En Firebase Console:
1. Ve a Authentication
2. Habilita "Email/Password" como proveedor de acceso
3. Crea el usuario admin inicial:
   - Email: `alvaro.roman@cim-ecm.es`
   - Contraseña: (la que prefieras)
4. Añade manualmente el documento del usuario en Firestore:
   - Colección: `users`
   - ID del documento: (el UID del usuario creado)
   - Campos:
     ```json
     {
       "email": "alvaro.roman@cim-ecm.es",
       "name": "Álvaro Román",
       "role": "admin",
       "active": true,
       "createdAt": (timestamp actual)
     }
     ```

## 🏃 Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Construir para Producción

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`

## 🚀 Desplegar en Firebase

### Primera vez

```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Login en Firebase
firebase login

# Desplegar
npm run build
firebase deploy --only hosting
```

### Despliegues posteriores

```bash
npm run build
firebase deploy --only hosting
```

## 🔒 Reglas de Seguridad de Firestore

Configura estas reglas en Firebase Console > Firestore Database > Reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserData().role == 'admin';
    }
    
    function isAnalista() {
      return isAuthenticated() && getUserData().role == 'analista';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Collaborations collection
    match /collaborations/{collabId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && (isAdmin() || isAnalista());
      allow update: if isAuthenticated() && (
        isAdmin() || 
        (isAnalista() && request.auth.uid in resource.data.description.attributes.analistas)
      );
      allow delete: if isAdmin();
    }
  }
}
```

## 👥 Roles de Usuario

- **Admin**: Acceso completo, puede gestionar usuarios y todas las colaboraciones
- **Analista**: Puede crear colaboraciones y editar las asignadas a él
- **Seguimiento**: Solo lectura, puede ver todas las colaboraciones

## 📊 Estructura de Datos

### Colaboración

```javascript
{
  title: string,
  status: 'Nuevo' | 'En curso' | 'Especial' | 'En pausa' | 'Soporte' | 'Finalizado',
  description: {
    short: string (max 300 chars),
    piezas: string[],
    attributes: {
      operacional: string,
      responsable: string,
      areaNegocio: string,
      jefeProyecto: string,
      analistas: string[], // user IDs
      fechaNecesidad: string
    }
  },
  situation: {
    updates: [{
      id: string,
      date: timestamp,
      text: string,
      isCurrent: boolean
    }]
  },
  risks: {
    level: 'green' | 'orange' | 'red',
    description: string (max 500 chars)
  },
  deliveries: [{
    id: string,
    date: timestamp,
    description: string (max 50 chars),
    type: 'estimated' | 'new' | 'actual'
  }],
  ganttLink: string,
  createdBy: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🎨 Tecnologías Utilizadas

- **React 18** - Framework UI
- **Vite** - Build tool
- **Material-UI (MUI)** - Componentes UI
- **Firebase** - Backend (Auth + Firestore + Hosting)
- **React Router** - Navegación
- **date-fns** - Manejo de fechas

## 📝 Datos de Ejemplo

Para cargar datos de ejemplo, edita `src/firebase/seedData.js` con tus credenciales de Firebase y ejecuta:

```bash
node src/firebase/seedData.js
```

## 🎯 Modo Presentación

Activa el modo presentación desde el botón en la barra superior. Este modo:
- Oculta controles de edición
- Aumenta el tamaño de fuentes
- Optimiza la navegación para presentaciones
- Permite navegar: Resumen → Gantt → Detalle de colaboración

## 📞 Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.

---

**Desarrollado para Gestión Documental - MAPFRE**
