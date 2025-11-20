# Nexus AI - Backend Library

## Descripción

Biblioteca modular del backend de Nexus AI, diseñada como una Google Apps Script Library para ser consumida por el frontend.

## Instalación

### 1. Crear el proyecto de biblioteca

1. Ir a [Google Apps Script](https://script.google.com)
2. Crear nuevo proyecto con nombre: `Nexus-AI-Backend`
3. Agregar todos los archivos `.gs` y `.html` de esta carpeta

### 2. Configurar Base de Datos de Iniciativas

Editar `Database.gs`:

```javascript
const DATABASE_CONFIG = {
  SHEET_ID: 'TU_GOOGLE_SHEET_ID_DE_INICIATIVAS_AQUI',
  SHEET_NAME: 'db'
};
```

### 3. Configurar Base de Datos de Usuarios Autorizados

Editar `Database.gs`:

```javascript
const USERS_DATABASE_CONFIG = {
  SHEET_ID: 'TU_GOOGLE_SHEET_ID_DE_USUARIOS_AQUI',
  SHEET_NAME: 'users'
};
```

**Estructura requerida de la sheet de usuarios:**

| cc | user_type | nombre | correo | cargo | vertical | id_gerencia |
|----|-----------|--------|--------|-------|----------|-------------|
| 12345678 | admin | Juan Pérez | juan.perez@empresa.com | Líder | VPTH | VPTH |
| 87654321 | user | María García | maria.garcia@empresa.com | Analista | Automatización | GE_1 |

**Columnas:**
- `cc`: Cédula o ID del usuario
- `user_type`: `admin` o `user`
- `nombre`: Nombre completo
- `correo`: Email (debe coincidir con cuenta de Google)
- `cargo`: Cargo del usuario
- `vertical`: Vertical del usuario
- `id_gerencia`: ID de gerencia

⚠️ **IMPORTANTE**: Los administradores se definen ahora con `user_type = 'admin'` en la Google Sheet. Ya no hay lista hardcodeada en `Constants.gs`.

### 4. Desplegar como Biblioteca

1. En el editor de Apps Script: **Deploy** → **New deployment**
2. Type: **Library**
3. Description: "Nexus AI Backend Library v1.0"
4. Access: **Only people in your organization**
5. Click **Deploy**
6. **Copiar el Script ID** generado

## Estructura de Archivos

```
backend/
│
├── Library.gs                  # API pública de la biblioteca
├── AuthService.gs              # Autenticación y autorización
├── UserService.gs              # ✨ NUEVO: Gestión de usuarios autorizados
├── Database.gs                 # Configuración de base de datos
├── DatabaseService.gs          # Operaciones CRUD
├── Initiative.gs               # Lógica de negocio
├── InitiativeController.gs     # Controladores
├── WebController.gs            # Bridge frontend-backend
├── Testing.gs                  # ✨ NUEVO: Funciones de testing
├── Constants.gs              # Configuraciones
└── README.md                   # Este archivo
```

## API Pública

### Funciones Expuestas

#### `getInitiativesForWeb()`
Obtiene todas las iniciativas procesadas con scores y cuadrantes.
- **Filtrado automático**: Los usuarios normales solo ven iniciativas de su gerencia, los admins ven todas.

**Returns**: `string` (JSON)
```json
{
  "success": true,
  "data": [
    {
      "id": "GE_4-PO_1-427017-001",
      "name": "Nombre",
      "impactScore": 4.5,
      "viabilityScore": 3.2,
      "quadrant": "1. Quick Win (Hacer Ahora)",
      "idGerencia": "GE_4",
      "proceso": "PO_1",
      ...
    }
  ]
}
```

---

#### `createInitiativeFromWeb(formData)`
Crea una nueva iniciativa con ID combinado.
- **ID automático**: Formato `{id_gerencia}-{id_proceso}-{cc_creador}-{autoincremental}`
- **Gerencia automática**: Para usuarios normales, se asigna su gerencia automáticamente

**Params**:
- `formData` (Object): Datos del formulario

**Returns**: `string` (JSON)
```json
{
  "success": true,
  "data": { /* iniciativa creada */ },
  "message": "Iniciativa creada exitosamente"
}
```

---

#### `getGerenciasForWeb()`
Obtiene el catálogo de gerencias disponibles.

**Returns**: `string` (JSON)
```json
{
  "success": true,
  "data": [
    { "id": "VPTH", "nombre": "Vicepresidencia de Talento Humano y Administrativa" },
    { "id": "GE_1", "nombre": "Administrativa" },
    { "id": "GE_4", "nombre": "Desarrollo organizacional" }
  ]
}
```

---

#### `getProcesosForWeb()`
Obtiene el catálogo de procesos disponibles.

**Returns**: `string` (JSON)
```json
{
  "success": true,
  "data": [
    { "id": "PO_1", "nombre": "Investigación tendencias y mercado" },
    { "id": "PO_2", "nombre": "Caracterización de nuestra gente" }
  ]
}
```

---

#### `updateInitiativeFromWeb(id, formData)`
Actualiza una iniciativa existente.

**Params**:
- `id` (string): ID de la iniciativa
- `formData` (Object): Datos actualizados

**Returns**: `string` (JSON)

---

#### `deleteInitiativeFromWeb(id)`
Elimina una iniciativa (solo admins).

**Params**:
- `id` (string): ID de la iniciativa

**Returns**: `string` (JSON)

---

#### `getClientConfig()`
Obtiene configuración del cliente (usuario, cuadrantes, criterios).

**Returns**: `string` (JSON)
```json
{
  "success": true,
  "data": {
    "userInfo": {
      "email": "user@empresa.com",
      "isAdmin": false
    },
    "quadrantConfig": { /* config de cuadrantes */ },
    "criteriaLabels": { /* labels de criterios */ }
  }
}
```

---

#### `testLibrary()`
Función de prueba para verificar que la biblioteca funciona.

**Returns**: `Object`
```json
{
  "success": true,
  "message": "Nexus Backend Library está funcionando correctamente",
  "info": { /* info de la biblioteca */ }
}
```

## Uso desde Frontend

### 1. Agregar la biblioteca

En tu proyecto frontend de Apps Script:

1. Click en **+** junto a **Libraries**
2. Pegar el **Script ID** del backend
3. Identifier: `NexusBackend`
4. Version: **Latest**
5. Click **Add**

### 2. Usar las funciones

```javascript
// En tu App.gs del frontend
function getInitiativesForWeb() {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.getInitiativesForWeb();
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error.message
    });
  }
}
```

## Modelo de Datos

### Initiative Object

```javascript
{
  id: string,                     // ID único
  name: string,                   // Nombre
  description: string,            // Descripción
  doer: string,                   // Responsable
  fechaPedido: date,              // Fecha de pedido
  fechaProductiva: date,          // Fecha productiva
  estado: string,                 // Estado (sin iniciar, en desarrollo, etc)
  gerencia: string,               // Gerencia
  proceso: string,                // Proceso
  oportunidad: string,            // Oportunidad
  usuarioFinal: string,           // Usuario final

  // Scores de Impacto (1-5)
  strategicPillarImpact: int,
  painResolutionImpact: int,
  scopeImpact: int,

  // Scores de Viabilidad (1-5)
  complexityViability: int,
  reusabilityViability: int,
  dataViability: int,

  // Scores de Valor (1-5)
  manualReductionValue: int,
  costReductionValue: int,
  exImprovementValue: int,

  // Métricas
  manualHoursSaved: string,
  costSavingAmount: string,

  // Calculados
  impactScore: float,             // Promedio de scores de impacto
  viabilityScore: float,          // Promedio de scores de viabilidad
  valueScore: float,              // Promedio de scores de valor
  quadrant: string,               // Cuadrante asignado

  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Algoritmo de Cuadrantes

```
Impacto = (strategicPillarImpact + painResolutionImpact + scopeImpact) / 3
Viabilidad = (complexityViability + reusabilityViability + dataViability) / 3

Cuadrantes:
- Quick Win:       Impacto > 3.5 && Viabilidad > 3.5
- Estratégico:     Impacto > 3.5 && Viabilidad ≤ 3.5
- Incremental:     Impacto ≤ 3.5 && Viabilidad > 3.5
- Reconsiderar:    Impacto ≤ 3.5 && Viabilidad ≤ 3.5
```

## Seguridad

- **Autenticación**: Por sesión de Google Apps Script
- **Autorización**: Sistema de permisos basado en roles
- **Validación**: Todos los datos son validados antes de procesar
- **Logging**: Registro de operaciones críticas
- **Error Handling**: Manejo centralizado de errores

## Desarrollo

### Convenciones de Código

- **ES6+**: Uso de const/let, arrow functions, template literals
- **Nomenclatura**: camelCase para funciones/variables
- **Constantes**: UPPER_SNAKE_CASE
- **Funciones privadas**: Prefijo `_` (ej: `_calculateImpactScore()`)
- **JSDoc**: Documentar todas las funciones públicas

### Testing

Ejecutar en el editor de Apps Script:

```javascript
function testBackend() {
  Logger.log(testLibrary());
}
```

## Versiones

- **v1.0.0** (2025-11-13): Release inicial
  - Funcionalidad completa CRUD
  - Sistema de cuadrantes
  - Autenticación y autorización
  - Validaciones y logging

## Soporte

**Equipo**: Nexus AI Team
**Organización**: Seguros Bolívar
