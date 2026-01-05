# Walkthrough - Seguimiento de Colaboraciones

## 📋 Índice
1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Funcionalidades Principales](#funcionalidades-principales)
5. [Flujo de Usuario](#flujo-de-usuario)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Mantenimiento](#mantenimiento)

---

## 🎯 Visión General

**Seguimiento de Colaboraciones** es una aplicación web interna para la gestión y seguimiento de proyectos y colaboraciones. Permite a los equipos:

- Visualizar el estado de todas las colaboraciones en un dashboard centralizado
- Gestionar información detallada de cada proyecto
- Planificar entregas y visualizar timelines en formato Gantt
- Identificar y monitorear riesgos
- Controlar accesos mediante roles (Admin, Analista, Seguimiento)

### Stack Tecnológico

- **Frontend**: React 19.2 + Vite 7.2
- **UI Framework**: Material-UI (MUI) 7.3
- **Backend**: Firebase (Firestore + Authentication)
- **Routing**: React Router DOM 7.11
- **Testing**: Vitest 4.0 + React Testing Library
- **Deployment**: Firebase Hosting

---

## 🏗️ Arquitectura

### Arquitectura de Componentes

```
┌─────────────────────────────────────────┐
│           Firebase Backend              │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │  Firestore   │  │ Authentication  │ │
│  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│          Context Layer (React)          │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ DataContext  │  │  AuthContext    │ │
│  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         Component Layer                 │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │  Pages   │ │Components│ │ Layout  │ │
│  └──────────┘ └──────────┘ └─────────┘ │
└─────────────────────────────────────────┘
```

### Modelo de Datos (Firestore)

#### Collection: `collaborations`
```javascript
{
  id: string,
  title: string,
  status: 'Nuevo' | 'En curso' | 'Especial' | 'En pausa' | 'Soporte' | 'Finalizado' | 'Cancelados',
  type: 'Vida' | 'No vida',
  description: {
    short: string,
    piezas: string[],
    attributes: {
      operacional: string,
      responsable: string,
      areaNegocio: string,
      jefeProyecto: string,
      analistas: string[],
      fechaNecesidad: string
    }
  },
  situation: {
    updates: [{
      id: string,
      date: Timestamp,
      text: string,
      isCurrent: boolean
    }]
  },
  risks: {
    level: 'green' | 'orange' | 'red',
    summary: string
  },
  deliveries: [{
    id: string,
    date: Timestamp,
    description: string,
    type: 'estimated' | 'new' | 'actual'
  }],
  timeline: {
    [year]: {
      startDate: ISO string,
      endDate: ISO string
    }
  },
  years: number[],
  ganttLink: string,
  createdBy: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Collection: `users`
```javascript
{
  uid: string,
  email: string,
  name: string,
  role: 'admin' | 'analista' | 'seguimiento',
  createdAt: Timestamp
}
```

---

## 📁 Estructura del Proyecto

```
seguimiento-colaboraciones/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ConfirmDialog.jsx       # Diálogo de confirmación reutilizable
│   │   ├── Layout.jsx              # Layout principal con navegación
│   │   ├── LoadSampleDataButton.jsx # Botón para cargar datos de ejemplo
│   │   ├── RiskIndicator.jsx       # Indicador visual de riesgo
│   │   └── StatusBadge.jsx         # Badge de estado de colaboración
│   ├── context/
│   │   ├── AuthContext.jsx         # Contexto de autenticación
│   │   └── DataContext.jsx         # Contexto de datos (Firestore)
│   ├── firebase/
│   │   └── config.js               # Configuración de Firebase
│   ├── pages/
│   │   ├── CollaborationEdit.jsx   # Formulario de edición/creación
│   │   ├── CollaborationList.jsx   # Lista de colaboraciones
│   │   ├── CollaborationView.jsx   # Vista detallada de colaboración
│   │   ├── GanttView.jsx           # Vista Gantt de planificación
│   │   ├── Home.jsx                # Dashboard principal
│   │   ├── Login.jsx               # Página de login
│   │   └── UserManagement.jsx      # Gestión de usuarios (admin)
│   ├── styles/
│   │   └── main.css                # Estilos globales
│   ├── test/                       # ✨ Suite de testing
│   │   ├── components/
│   │   │   ├── ConfirmDialog.test.jsx
│   │   │   ├── RiskIndicator.test.jsx
│   │   │   └── StatusBadge.test.jsx
│   │   ├── integration/
│   │   │   └── Home.test.jsx
│   │   ├── utils/
│   │   │   ├── constants.test.js
│   │   │   └── dateHelpers.test.js
│   │   └── setup.js
│   ├── utils/
│   │   ├── constants.js            # Constantes de la aplicación
│   │   └── dateHelpers.js          # Utilidades de fechas
│   ├── App.css
│   ├── App.jsx                     # Componente raíz
│   ├── index.css
│   ├── main.jsx                    # Entry point
│   └── theme.js                    # Tema de Material-UI
├── scripts/                        # Scripts de desarrollo (gitignored)
│   └── loadSampleData.js
├── .firebaserc
├── .gitignore
├── eslint.config.js
├── firebase.json
├── firestore.rules
├── index.html
├── LICENSE
├── package.json
├── README.md
├── TESTING.md                      # ✨ Guía de testing
└── vitest.config.js                # ✨ Configuración de Vitest
```

---

## ⚙️ Funcionalidades Principales

### 1. Dashboard (Home)
**Archivo**: `src/pages/Home.jsx`

- **Resumen estadístico**: Muestra contadores de colaboraciones por estado
- **Tarjetas de navegación**: Acceso rápido a las diferentes secciones
- **Botón de carga de datos**: Para desarrollo/testing (solo visible para admins)

**Características**:
- Cálculo dinámico de estadísticas desde Firestore
- Diseño responsive con Material-UI Grid
- Navegación mediante React Router

### 2. Lista de Colaboraciones
**Archivo**: `src/pages/CollaborationList.jsx`

- **Tabla interactiva**: Muestra todas las colaboraciones con filtros
- **Filtros**: Por estado, tipo, año, búsqueda de texto
- **Acciones**: Ver, editar, eliminar (según permisos)
- **Indicadores visuales**: Estados con colores, niveles de riesgo

**Características**:
- Paginación automática
- Ordenamiento por columnas
- Búsqueda en tiempo real
- Control de acceso por rol

### 3. Vista Detallada de Colaboración
**Archivo**: `src/pages/CollaborationView.jsx`

Muestra información completa de una colaboración:

**Secciones**:
- **Header**: Título y estado
- **Descripción**: Texto descriptivo y piezas/tags
- **Situación**: Actualizaciones actuales y anteriores (separadas por mes)
- **Riesgos**: Nivel de riesgo e indicador visual
- **Entregas**: Lista de entregas con fechas y tipos
- **Sidebar**: Atributos específicos (operacional, responsable, área, etc.)

**Layout**: 85% contenido principal / 15% sidebar

### 4. Formulario de Edición/Creación
**Archivo**: `src/pages/CollaborationEdit.jsx`

Formulario completo para crear o editar colaboraciones:

**Campos principales**:
- Título del proyecto
- Estado y tipo
- Descripción
- Piezas (selección múltiple con autocomplete)
- Atributos específicos
- Gestión de años activos
- Timeline por año (fechas inicio/fin)
- Actualizaciones de situación
- Riesgos
- Entregas
- Link a Gantt externo

**Características**:
- Validación de campos
- Guardado automático de borradores
- Confirmación antes de eliminar
- Gestión de arrays dinámicos (actualizaciones, entregas)
- Selección de analistas desde lista de usuarios

### 5. Vista Gantt
**Archivo**: `src/pages/GanttView.jsx`

Visualización de planificación temporal:

**Características**:
- Timeline anual con meses
- Barras de progreso por colaboración
- Código de colores por estado
- Indicadores de riesgo
- Filtros por año y estado
- Modo presentación (pantalla completa)
- Responsive horizontal scroll

**Algoritmo de renderizado**:
- Cálculo de posición basado en fechas
- Ancho proporcional a duración
- Detección de solapamientos
- Agrupación por filas

### 6. Gestión de Usuarios
**Archivo**: `src/pages/UserManagement.jsx`

Panel de administración de usuarios (solo admin):

**Funcionalidades**:
- Crear nuevos usuarios
- Asignar roles
- Editar información
- Eliminar usuarios
- Búsqueda y filtrado

---

## 🔄 Flujo de Usuario

### Flujo de Autenticación

```
1. Usuario accede a la app
   ↓
2. AuthContext verifica sesión
   ↓
3. Si no autenticado → Redirige a /login
   ↓
4. Usuario ingresa credenciales
   ↓
5. Firebase Authentication valida
   ↓
6. DataContext carga datos del usuario desde Firestore
   ↓
7. Redirige a /home según rol
```

### Flujo de Creación de Colaboración

```
1. Usuario navega a /colaboraciones/nueva
   ↓
2. Formulario vacío se renderiza
   ↓
3. Usuario completa campos obligatorios
   ↓
4. Usuario añade años activos
   ↓
5. Para cada año, define timeline (fechas)
   ↓
6. Añade actualizaciones, riesgos, entregas
   ↓
7. Click en "Guardar"
   ↓
8. Validación de campos
   ↓
9. DataContext.createCollaboration()
   ↓
10. Firestore crea documento
    ↓
11. Redirige a vista detallada
```

### Flujo de Edición

```
1. Usuario click en "Editar" desde lista o vista
   ↓
2. Navega a /colaboraciones/:id/editar
   ↓
3. DataContext.getCollaborationById(id)
   ↓
4. Formulario se pre-rellena con datos
   ↓
5. Usuario modifica campos
   ↓
6. Click en "Guardar"
   ↓
7. DataContext.updateCollaboration(id, data)
   ↓
8. Firestore actualiza documento
   ↓
9. Redirige a vista detallada
```

---

## 🧪 Testing

### Suite de Testing

**Framework**: Vitest + React Testing Library

**Cobertura actual**: 42 tests pasando

#### Tests de Componentes

**StatusBadge** (6 tests):
- Renderizado correcto de labels
- Aplicación de colores según estado
- Manejo de estados desconocidos

**RiskIndicator** (5 tests):
- Renderizado de indicadores de riesgo
- Verificación de labels
- Manejo de valores inválidos

**ConfirmDialog** (5 tests):
- Apertura/cierre del diálogo
- Callbacks de confirmación/cancelación
- Renderizado de contenido

#### Tests de Utilidades

**dateHelpers** (13 tests):
- Formateo de fechas
- Detección de mes actual
- Conversión de timestamps
- Manejo de errores

**constants** (10 tests):
- Validación de estructura de constantes
- Verificación de valores esperados
- Integridad de datos

#### Tests de Integración

**Home** (3 tests):
- Renderizado de página
- Estadísticas de colaboraciones
- Navegación

### Ejecutar Tests

```bash
# Modo watch (desarrollo)
npm test

# Ejecutar una vez
npm test -- --run

# Con interfaz gráfica
npm run test:ui

# Generar reporte de cobertura
npm run test:coverage
```

Ver [TESTING.md](./TESTING.md) para guía completa.

---

## 🚀 Deployment

### Build de Producción

```bash
npm run build
```

Genera carpeta `dist/` con:
- `index.html`
- `assets/index-[hash].css`
- `assets/index-[hash].js`

### Deploy a Firebase Hosting

```bash
firebase deploy --only hosting
```

**URL de producción**: https://seguimientocolaboracione-1eea6.web.app

### Configuración de Firebase

**firebase.json**:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Reglas de Firestore

**firestore.rules**:
- Lectura: Usuarios autenticados
- Escritura: Según rol (admin puede todo, analista limitado)
- Validación de estructura de documentos

---

## 🛠️ Mantenimiento

### Comandos de Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Linter
npm run lint

# Preview de build
npm run preview
```

### Estructura de Branches

- `main`: Producción (protegida)
- Feature branches: `feature/nombre-feature`
- Bugfix branches: `bugfix/nombre-bug`

### Convenciones de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
chore: tareas de mantenimiento
docs: documentación
test: añadir/modificar tests
refactor: refactorización de código
style: cambios de estilo/formato
```

### Añadir Nueva Funcionalidad

1. **Crear componente** en `src/components/` o `src/pages/`
2. **Añadir ruta** en `src/App.jsx` si es página
3. **Actualizar contexto** si requiere datos de Firestore
4. **Crear tests** en `src/test/`
5. **Actualizar documentación**

### Añadir Nuevo Campo a Colaboración

1. **Actualizar modelo** en este walkthrough
2. **Modificar formulario** en `CollaborationEdit.jsx`
3. **Actualizar vista** en `CollaborationView.jsx`
4. **Ajustar reglas** en `firestore.rules`
5. **Crear tests** para el nuevo campo

### Debugging

**Firebase Emulator** (opcional):
```bash
firebase emulators:start
```

**React DevTools**: Inspeccionar componentes y contextos

**Firestore Console**: Ver/editar datos directamente

---

## 📊 Métricas y Monitoreo

### Firebase Analytics

- Eventos de usuario
- Páginas más visitadas
- Tiempo de sesión

### Performance

- Lighthouse score: Objetivo >90
- First Contentful Paint: <2s
- Time to Interactive: <3s

### Errores

- Firebase Crashlytics (opcional)
- Console.error tracking

---

## 🔐 Seguridad

### Autenticación

- Firebase Authentication
- Sesiones persistentes
- Logout automático por inactividad (opcional)

### Autorización

- Roles: admin, analista, seguimiento
- Control de acceso en componentes
- Validación en Firestore rules

### Datos Sensibles

- API keys en variables de entorno (producción)
- Firestore rules restrictivas
- HTTPS obligatorio

---

## 📚 Recursos Adicionales

- [React Documentation](https://react.dev/)
- [Material-UI](https://mui.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vitest](https://vitest.dev/)
- [React Router](https://reactrouter.com/)

---

## 📝 Changelog Reciente

### v1.2.0 (2026-01-05)

**✨ Nuevas Funcionalidades**:
- Suite completa de testing con Vitest (42 tests)
- Documentación de testing (TESTING.md)
- Scripts de test en package.json

**🧹 Limpieza**:
- Eliminados scripts obsoletos (checkDoc.js, forceTimeline.js, updateCollabYear.js)
- Eliminada vista antigua (CollaborationView_v1.jsx)
- Eliminada carpeta vacía (src/hooks/)
- Movido loadSampleData.js a scripts/ (gitignored)

**📚 Documentación**:
- README.md actualizado con sección de testing
- Creado TESTING.md con guía completa
- Creado WALKTHROUGH.md (este archivo)

**🔧 Mejoras**:
- Configuración de Vitest
- Mocks de Firebase para testing
- Cobertura de componentes, utilidades e integración

---

**Última actualización**: 5 de enero de 2026  
**Versión**: 1.2.0  
**Autor**: Álvaro Román
