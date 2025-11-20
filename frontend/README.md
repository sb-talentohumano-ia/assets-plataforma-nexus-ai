# Nexus AI - Frontend

## Descripción

Aplicación web frontend de Nexus AI, construida con Google Apps Script Web App y JavaScript vanilla.

## Estructura

```
frontend/
│
├── index.html              # Punto de entrada HTML
├── Moderninterface.html    # Interfaz completa (UI + JS + Styles)
└── README.md               # Este archivo
```

## Características

### Vistas

1. **Dashboard**
   - Cards de estadísticas por cuadrante
   - Matriz de priorización interactiva (Chart.js)
   - Lista de iniciativas recientes

2. **Vista de Lista**
   - Tabla completa de todas las iniciativas
   - Filtrado y ordenamiento
   - Acciones rápidas (Editar/Eliminar)

3. **Vista de Detalle**
   - Información completa de la iniciativa
   - Desglose de scores y criterios
   - Visualización de métricas

### Formulario de Iniciativa

- Validación en tiempo real
- Sliders para criterios de evaluación (1-5)
- Feedback visual del valor seleccionado
- Modo creación y edición

### Componentes UI

- **Notificaciones**: Toast notifications para feedback
- **Loading States**: Indicadores de carga
- **Modals**: Formulario modal responsive
- **Charts**: Matriz de priorización con Chart.js
- **Responsive Design**: Adaptable a móviles y tablets

## Tecnologías

- **HTML5**: Estructura semántica
- **Tailwind CSS**: Framework de estilos (CDN)
- **JavaScript ES6+**: Lógica del cliente
- **Chart.js**: Visualización de datos (CDN)
- **Google Apps Script API**: Comunicación con backend

## Instalación

### 1. Crear proyecto frontend

1. Ir a [Google Apps Script](https://script.google.com)
2. Crear nuevo proyecto: `Nexus-AI-Frontend`
3. Agregar archivos:
   - `App.gs` (del root)
   - `frontend/index.html`
   - `frontend/Moderninterface.html`

### 2. Configurar backend library

1. En el editor: **+** junto a **Libraries**
2. Pegar Script ID del backend
3. Identifier: `NexusBackend`
4. Version: Latest
5. Click **Add**

### 3. Desplegar como Web App

1. **Deploy** → **New deployment**
2. Type: **Web app**
3. Description: "Nexus AI Frontend v1.0"
4. Execute as: **Me**
5. Who has access: **Anyone in your organization**
6. Click **Deploy**
7. **Copiar URL** de la web app

## Arquitectura Frontend

### Flujo de Inicialización

```
1. Usuario accede a URL
   ↓
2. doGet() en App.gs
   ↓
3. Carga index.html
   ↓
4. include('frontend/Moderninterface')
   ↓
5. JavaScript se ejecuta:
   - initializeApp()
   - loadInitiatives()
   - loadUserInfo()
   - showView('dashboard')
```

### Estado de la Aplicación

```javascript
// Variables globales
let currentView = 'dashboard';      // Vista actual
let initiatives = [];               // Todas las iniciativas
let currentInitiative = null;       // Iniciativa en edición
let isAdmin = false;                // Rol del usuario
let userEmail = '';                 // Email del usuario
let priorityChart = null;           // Instancia de Chart.js
```

### Comunicación con Backend

Usando `google.script.run`:

```javascript
// Patrón estándar
async function loadInitiatives() {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((result) => {
        const response = JSON.parse(result);
        if (response.success) {
          initiatives = response.data;
          resolve();
        } else {
          reject(new Error(response.error));
        }
      })
      .withFailureHandler(reject)
      .getInitiativesForWeb();
  });
}
```

## Funciones Principales

### Navegación

- `showView(view)`: Cambia entre vistas (dashboard/list/detail)
- `showInitiativeDetail(id)`: Muestra detalle de iniciativa
- `openForm(id)`: Abre formulario (crear/editar)
- `closeForm()`: Cierra formulario modal

### Dashboard

- `updateDashboard()`: Actualiza todo el dashboard
- `updateStatsCards()`: Actualiza cards de estadísticas
- `updatePriorityMatrix()`: Renderiza matriz con Chart.js
- `updateRecentInitiatives()`: Muestra últimas 5 iniciativas

### Lista

- `updateList()`: Renderiza tabla completa de iniciativas

### Formulario

- `handleFormSubmit(event)`: Maneja envío del formulario
- `saveInitiative(formData)`: Guarda iniciativa (create/update)
- `setupSliders()`: Configura listeners de sliders

### Utilidades

- `showNotification(message, type)`: Muestra toast notification
- `showLoading(show)`: Muestra/oculta estado de carga
- `getQuadrantColor(quadrant)`: Obtiene color por cuadrante
- `formatCurrency(amount)`: Formatea montos en COP

## Personalización

### Colores de Marca

Definidos en `tailwind.config`:

```javascript
colors: {
  'brand-primary': '#009C56',
  'brand-secondary': '#FDEC30',
  'brand-green-light': '#70B649',
  'brand-green-medium': '#61C295',
  'brand-yellow-gold': '#FFC200',
  'quick-win': '#70B649',
  'strategic': '#009C56',
  'incremental': '#FFC200',
  'reconsider': '#696868'
}
```

### Modificar Logo

En `Moderninterface.html` línea 39:

```html
<img src="TU_URL_LOGO_AQUI" alt="Logo" class="h-8 w-auto">
```

## Seguridad

- Todas las operaciones pasan por validación del backend
- Permisos verificados en cada acción
- Solo administradores pueden eliminar
- Sesión de Google Apps Script para autenticación

## Performance

- **Batch Operations**: Carga de datos en batch
- **Lazy Loading**: Vistas cargadas bajo demanda
- **Debouncing**: Prevención de doble envío en formularios
- **Caching**: Chart.js destruido y recreado solo cuando cambian datos

## Debugging

### Console Logs

Activar en el navegador:
```javascript
// En Moderninterface.html
console.log('Initiatives loaded:', initiatives);
console.log('User info:', userEmail, isAdmin);
```

### Errores Comunes

1. **"google is not defined"**
   - Asegurar que está desplegado como Web App
   - Verificar permisos

2. **"Library not found"**
   - Verificar que biblioteca está agregada
   - Verificar identifier: `NexusBackend`

3. **"Error loading initiatives"**
   - Verificar configuración de SHEET_ID en backend
   - Verificar permisos de la Sheet

## Desarrollo Local

No es posible desarrollo local directo. Usar:

1. **Editor de Apps Script**: Desarrollo en línea
2. **clasp**: CLI de Google Apps Script
   ```bash
   npm install -g @google/clasp
   clasp login
   clasp create --type webapp
   clasp push
   ```

## Extensiones Futuras

### Filtros Avanzados
```javascript
// Agregar en vista de lista
function filterByGerencia(gerencia) { ... }
function filterByEstado(estado) { ... }
function filterByQuadrant(quadrant) { ... }
```

### Exportación
```javascript
function exportToCSV() { ... }
function exportToPDF() { ... }
```

### Búsqueda
```javascript
function searchInitiatives(query) { ... }
```

## Testing

### Test Manual

1. **Crear iniciativa**: Verificar campos requeridos
2. **Editar iniciativa**: Verificar que datos se cargan
3. **Eliminar iniciativa**: Verificar permisos de admin
4. **Navegación**: Verificar transiciones entre vistas
5. **Responsive**: Probar en móvil/tablet

### Test de Permisos

1. Acceder como usuario no-admin
2. Verificar que botón "Eliminar" no aparece
3. Intentar eliminar vía consola (debe fallar)

## Versiones

- **v1.0.0** (2025-11-13): Release inicial
  - Dashboard completo
  - CRUD de iniciativas
  - Sistema de permisos
  - Responsive design

## Soporte

**Equipo**: Nexus AI Team
**Organización**: Seguros Bolívar
