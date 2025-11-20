# Arquitectura del Proyecto Nexus AI

## Descripción General

Nexus AI es una plataforma de priorización de iniciativas de IA para la vicepresidencia de talento humano y administrativa. El sistema permite almacenar, controlar y hacer seguimiento de iniciativas mediante un dashboard interactivo que facilita la toma de decisiones estratégicas.

---

## Stack Tecnológico

### Frontend
- **Google Apps Script Web App**: Aplicación web principal
- **HTML/CSS/JavaScript nativo**: Interfaz de usuario responsiva
- **Google Apps Script Client API**: Comunicación con backend

### Backend
- **Google Apps Script Library**: Biblioteca modular del backend
- **Google Sheets**: Base de datos relacional
- **Webhook N8N**: Integración futura para automatizaciones

---

## Arquitectura de Base de Datos

### 🔗 URL de la Base de Datos
**Google Sheet ID**: `1AVvssPSJ6yfTF7Zf4-KmYB8XrnCWPnRZUbAezfrH41E`

**Link**: [Base de Datos Nexus AI](https://docs.google.com/spreadsheets/d/1AVvssPSJ6yfTF7Zf4-KmYB8XrnCWPnRZUbAezfrH41E/edit?gid=1580616909#gid=1580616909)

---

### 🗄️ Diseño Relacional

El sistema utiliza un **diseño relacional normalizado** siguiendo las mejores prácticas de bases de datos:

#### Principios Aplicados:
1. **Tablas Maestras**: `gerencia` y `procesos` contienen los catálogos completos (ID + Nombre)
2. **Foreign Keys**: Las tablas `users` e `iniciativas` solo almacenan IDs (no nombres)
3. **Lookup en Frontend**: Los nombres se obtienen mediante consultas a las tablas maestras
4. **Integridad Referencial**: Cada ID debe existir en su tabla maestra correspondiente

#### Ventajas:
- ✅ No hay redundancia de datos (DRY - Don't Repeat Yourself)
- ✅ Actualizar un nombre se hace en un solo lugar
- ✅ Consistencia garantizada
- ✅ Menor uso de almacenamiento
- ✅ Facilita mantenimiento y escalabilidad

#### Ejemplo Práctico:
```
Tabla Maestra (gerencia):
  GE_4 → "Desarrollo organizacional"

Tabla users:
  427017 | user | José Averanga | ... | GE_4  ← Solo almacena el ID

Tabla iniciativas:
  GE_4-PO_1-427017-001 | ... | GE_4 | PO_1 | ...  ← Solo almacena IDs

Frontend (al mostrar):
  "José Averanga - Desarrollo organizacional"  ← Lookup de GE_4 → nombre
```

---

### 📊 Estructura de Hojas

#### 1. **Hoja: `gerencia`** (Tabla Maestra)
Catálogo maestro de gerencias de la organización. Esta es la única fuente de verdad para los nombres de gerencias.

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id_gerencia` | string | Identificador único (PK) | ✅ |
| `Gerencia` | string | Nombre completo de la gerencia | ✅ |

**Ejemplo de datos**:
```
id_gerencia | Gerencia
------------|---------------------------------------------------------
VPTH        | Vicepresidencia de Talento Humano y Administrativa
GE_1        | Administrativa
GE_2        | Abastecimiento
GE_3        | Gestión Humana
GE_4        | Desarrollo organizacional
GE_5        | Centro de liderazgo
GE_6        | COF
GE_7        | Centro de selección
GE_8        | Business partner
GE_9        | CIME
GE_10       | Adebol
```

**📌 Nota**: Las demás hojas solo almacenan `id_gerencia` (FK). Los nombres se obtienen mediante lookup a esta tabla maestra.

---

#### 2. **Hoja: `procesos`** (Tabla Maestra)
Catálogo maestro de procesos organizacionales. Esta es la única fuente de verdad para los nombres de procesos.

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id_proceso` | string | Identificador único (PK) | ✅ |
| `proceso` | string | Nombre del proceso | ✅ |

**Ejemplo de datos**:
```
id_proceso | proceso
-----------|------------------------------------------------------
PO_1       | Investigación tendencias y mercado
PO_2       | Caracterización de nuestra gente
PO_3       | Entendimiento estrategia de la compañía
PO_4       | Análisis y diagnóstico de necesidades de Talento
...
```

**📌 Nota**: Las demás hojas solo almacenan `id_proceso` (FK). Los nombres se obtienen mediante lookup a esta tabla maestra.

---

#### 3. **Hoja: `users`**
Base de datos de usuarios autorizados del sistema.

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `cc` | string | Cédula o ID único del usuario | ✅ |
| `user_type` | string | Tipo de usuario: `admin` o `user` | ✅ |
| `nombre` | string | Nombre completo del usuario | ✅ |
| `correo` | string | Email corporativo (debe coincidir con cuenta Google) | ✅ |
| `cargo` | string | Cargo del usuario en la organización | ✅ |
| `vertical` | string | Vertical de especialización | ✅ |
| `id_gerencia` | string | ID de gerencia asignada (FK → gerencia) | ✅ |

---

#### 4. **Hoja: `verticales`**
Catálogo de verticales tecnológicas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `vertical` | string | Nombre de la vertical |

**Valores**:
- Data Lake
- Apificación
- Automatización
- Analítica
- Todas

---

#### 5. **Hoja: `iniciativas`**
Tabla principal de iniciativas de IA.

**📌 Diseño Relacional**: Esta tabla solo almacena `id_gerencia` (FK) y `proceso` (FK). Los nombres se obtienen mediante lookup a las tablas maestras.

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id_iniciativa` | string | ID único generado automáticamente | ✅ Auto |
| `nombre` | string | Nombre de la iniciativa | ✅ |
| `descripcion` | string | Descripción detallada | ✅ |
| `responsable` | string | Responsable de la iniciativa | ✅ |
| `usuario_creador_cc` | string | CC del usuario que creó la iniciativa | ✅ Auto |
| `usuario_creador_nombre` | string | Nombre del usuario creador | ✅ Auto |
| `fecha_pedido_iniciativa` | date | Fecha en que se solicitó la iniciativa | ✅ |
| `estado` | string | Estado actual (sin iniciar, en desarrollo, etc.) | ✅ |
| `id_gerencia` | string | ID de gerencia (FK → gerencia) | ✅ |
| `proceso` | string | ID de proceso (FK → procesos) | ✅ |
| `oportunidad` | string | Descripción de la oportunidad | ✅ |
| `usuario_final` | string | Usuario final beneficiado | ✅ |
| `impacto_pilar_estrategico` | int (1-5) | Score de impacto en pilar estratégico | ✅ |
| `resolucion_dolor_problema` | int (1-5) | Score de resolución de dolor/problema | ✅ |
| `alcance_impacto` | int (1-5) | Score de alcance e impacto | ✅ |
| `viabilidad_tecnica_complejidad` | int (1-5) | Score de viabilidad técnica | ✅ |
| `reutilizacion_escalabilidad` | int (1-5) | Score de reutilización/escalabilidad | ✅ |
| `disponibilidad_datos` | int (1-5) | Score de disponibilidad de datos | ✅ |
| `reduccion_trabajo_manual` | int (1-5) | Score de reducción de trabajo manual | ✅ |
| `reduccion_costos` | int (1-5) | Score de reducción de costos | ✅ |
| `mejora_experiencia` | int (1-5) | Score de mejora de experiencia | ✅ |
| `horas_manuales_ahorradas_mensual` | float | Horas manuales ahorradas por mes | ❌ |
| `ahorro_millones_cop_mensual` | float | Ahorro en millones COP mensual | ❌ |
| `puntaje_impacto_valor` | float | Puntaje calculado de impacto | ✅ Auto |
| `puntaje_viabilidad` | float | Puntaje calculado de viabilidad | ✅ Auto |
| `puntaje_valor_negocio` | float | Puntaje calculado de valor de negocio | ✅ Auto |
| `puntaje_total` | float | Puntaje total calculado | ✅ Auto |
| `fecha_creacion` | timestamp | Fecha y hora de creación | ✅ Auto |
| `fecha_actualizacion` | timestamp | Fecha y hora de última actualización | ✅ Auto |
| `usuario_ultima_modificacion_cc` | string | CC del último usuario que modificó | ✅ Auto |
| `usuario_ultima_modificacion_nombre` | string | Nombre del último usuario que modificó | ✅ Auto |
| `activo` | boolean | Indica si la iniciativa está activa | ✅ Auto |
| `observaciones` | string | Observaciones adicionales | ❌ |

---

## 🔑 Lógica de Generación de ID de Iniciativas

### Formato del ID
```
{id_gerencia}-{id_proceso}-{cc_creador}-{autoincremental}
```

### Ejemplo
```
GE_4-PO_1-427017-001
```

Donde:
- `GE_4`: ID de la gerencia (Desarrollo organizacional)
- `PO_1`: ID del proceso (Investigación tendencias y mercado)
- `427017`: CC del usuario creador
- `001`: Número autoincremental único

### Algoritmo de Generación

1. **Obtener datos del usuario**:
   - Si es `admin`: solicitar `id_gerencia` en el formulario
   - Si es `user`: usar `id_gerencia` de su perfil en la hoja `users`

2. **Obtener `id_proceso`**: del formulario de creación

3. **Obtener `cc_creador`**: del perfil del usuario autenticado

4. **Calcular autoincremental**:
   - Buscar todas las iniciativas con el mismo prefijo: `{id_gerencia}-{id_proceso}-{cc_creador}-`
   - Encontrar el número más alto
   - Incrementar en 1
   - Formatear con 3 dígitos (001, 002, 003, etc.)

5. **Generar ID único**: concatenar todos los componentes

---

## 👥 Permisos y Flujo de Usuarios

### Tipos de Usuario

#### **Administradores** (`user_type: "admin"`)
- **Permisos**:
  - ✅ Crear iniciativas para cualquier gerencia
  - ✅ Ver todas las iniciativas del sistema
  - ✅ Editar cualquier iniciativa
  - ✅ Eliminar iniciativas
  - ✅ Acceder a estadísticas globales
  - ✅ Gestionar usuarios (futuro)

- **Flujo de Creación**:
  1. Seleccionar gerencia del proyecto (dropdown con todas las gerencias)
  2. Completar formulario de iniciativa
  3. El sistema genera ID con la gerencia seleccionada

#### **Usuarios** (`user_type: "user"`)
- **Permisos**:
  - ✅ Crear iniciativas solo para su gerencia asignada
  - ✅ Ver iniciativas de su gerencia
  - ✅ Editar sus propias iniciativas
  - ❌ No pueden eliminar iniciativas
  - ✅ Ver estadísticas de su gerencia

- **Flujo de Creación**:
  1. El campo gerencia NO se muestra (se usa automáticamente su `id_gerencia`)
  2. Completar formulario de iniciativa
  3. El sistema genera ID con su gerencia asignada

---

## 🔄 Sincronización de Datos

### Principio de Sincronización
Los usuarios de una misma gerencia comparten visibilidad sobre las iniciativas de su área:

```
Usuario A (GE_4) → Crea iniciativa → ID: GE_4-PO_1-A-001
Usuario B (GE_4) → Ve la iniciativa de Usuario A
Usuario C (GE_2) → NO ve la iniciativa (es de otra gerencia)
Admin (VPTH)     → Ve TODAS las iniciativas
```

### Reglas de Acceso
1. **Filtrado por Gerencia**:
   - `users` ven solo iniciativas donde `id_gerencia` = su `id_gerencia`
   - `admins` ven todas las iniciativas

2. **Edición**:
   - `users` editan solo sus propias iniciativas (`usuario_creador_cc` = su `cc`)
   - `admins` editan cualquier iniciativa

3. **Eliminación**:
   - Solo `admins` pueden eliminar (soft delete: `activo = false`)

---

## Algoritmo de Priorización

### Cálculo de Puntajes

```javascript
// Puntaje de Impacto (1-5)
puntaje_impacto_valor = (
  impacto_pilar_estrategico +
  resolucion_dolor_problema +
  alcance_impacto
) / 3

// Puntaje de Viabilidad (1-5)
puntaje_viabilidad = (
  viabilidad_tecnica_complejidad +
  reutilizacion_escalabilidad +
  disponibilidad_datos
) / 3

// Puntaje de Valor de Negocio (1-5)
puntaje_valor_negocio = (
  reduccion_trabajo_manual +
  reduccion_costos +
  mejora_experiencia
) / 3

// Puntaje Total
puntaje_total = (
  puntaje_impacto_valor +
  puntaje_viabilidad +
  puntaje_valor_negocio
) / 3
```

### Matriz de Cuadrantes

```
                    Alta Viabilidad
                         (> 3.5)
                           │
    ┌──────────────────────┼──────────────────────┐
    │   2. PROYECTO        │   1. QUICK WIN       │
    │   ESTRATÉGICO        │   (HACER AHORA)      │
    │   (Planificar)       │                      │
A   │   🟢 Verde           │   🟢 Verde Oscuro    │
l   │                      │                      │
t   ├──────────────────────┼──────────────────────┤
o   │                      │                      │
    │   4. RECONSIDERAR    │   3. MEJORA          │
I   │   (Evitar)           │   INCREMENTAL        │
m   │                      │   (Delegar)          │
p   │   🔴 Rojo            │   🟡 Amarillo        │
a   │                      │                      │
c   └──────────────────────┼──────────────────────┘
t                          │
o                    Baja Viabilidad
                         (≤ 3.5)
```

**Reglas de Asignación**:
1. **Quick Win**: `puntaje_impacto_valor > 3.5` Y `puntaje_viabilidad > 3.5`
2. **Proyecto Estratégico**: `puntaje_impacto_valor > 3.5` Y `puntaje_viabilidad ≤ 3.5`
3. **Mejora Incremental**: `puntaje_impacto_valor ≤ 3.5` Y `puntaje_viabilidad > 3.5`
4. **Reconsiderar**: `puntaje_impacto_valor ≤ 3.5` Y `puntaje_viabilidad ≤ 3.5`

---

## 🚀 Flujo de Trabajo

### 1. Autenticación
```
Usuario ingresa → Google OAuth → Validación en hoja users → Cargar perfil
```

### 2. Dashboard
```
Cargar iniciativas filtradas por gerencia → Calcular puntajes → Mostrar en matriz
```

### 3. Creación de Iniciativa
```
Admin:
  ├─ Seleccionar gerencia
  ├─ Completar formulario
  ├─ Generar ID: {gerencia_seleccionada}-{proceso}-{cc}-{auto}
  └─ Guardar en sheet

User:
  ├─ Usar gerencia del perfil (automático)
  ├─ Completar formulario
  ├─ Generar ID: {gerencia_usuario}-{proceso}-{cc}-{auto}
  └─ Guardar en sheet
```

### 4. Edición de Iniciativa
```
Validar permisos → Cargar datos → Editar campos → Actualizar timestamps → Guardar
```

### 5. Visualización
```
Filtrar por gerencia → Aplicar algoritmo de cuadrantes → Renderizar matriz interactiva
```

---

## 🔐 Seguridad y Cumplimiento

### Políticas de Seguridad
- ✅ Autenticación mediante Google OAuth
- ✅ Autorización basada en roles (admin/user)
- ✅ Validación de inputs en frontend y backend
- ✅ Sin conexiones a APIs externas no autorizadas
- ✅ Datos almacenados en Google Workspace (ambiente seguro)
- ✅ Acceso controlado por dominio corporativo

### Gobernanza
- **Líder responsable**: william martinez
- **Alcance**: Solo usuarios del equipo liquido de IA de talento humano.

---

## 📁 Estructura del Proyecto

```
Nexus-AI/
│
├── frontend/
│   ├── Code.gs           # Bridge hacia backend library
│   ├── index.html        # HTML principal
│   ├── Scripts.html      # JavaScript del cliente
│   ├── Styles.html       # CSS de la aplicación
│   └── README.md         # Documentación frontend
│
├── backend/
│   ├── Library.gs              # API pública de la biblioteca
│   ├── AuthService.gs          # Autenticación y autorización
│   ├── UserService.gs          # Gestión de usuarios
│   ├── Database.gs             # Configuración de base de datos
│   ├── DatabaseService.gs      # Operaciones CRUD
│   ├── Initiative.gs           # Lógica de negocio
│   ├── InitiativeController.gs # Controladores
│   ├── WebController.gs        # Bridge frontend-backend
│   ├── Testing.gs              # Funciones de testing
│   ├── Constants.gs            # Configuraciones
│   └── README.md               # Documentación backend
│
└── README.md                   # Este archivo
```

---

## 🛠️ Configuración e Instalación

Ver documentación detallada en:
- **Frontend**: `/frontend/README.md`
- **Backend**: `/backend/README.md`

---

## 📊 Roadmap

### ✅ Fase 1: Core MVP (Actual)
- [x] Sistema de autenticación
- [x] CRUD de iniciativas
- [x] Algoritmo de priorización
- [x] Dashboard interactivo
- [x] Sistema de permisos

### 🔄 Fase 2: Mejoras (En desarrollo)
- [ ] Generación de ID combinado
- [ ] Filtrado por gerencia
- [ ] Sincronización entre usuarios
- [ ] Métricas avanzadas

### 📋 Fase 3: Integraciones (Futuro)
- [ ] Webhook N8N para notificaciones
- [ ] Exportación a PDF/Excel
- [ ] Historial de cambios
- [ ] Comentarios y colaboración

---

## 📄 Licencia

Uso interno exclusivo de Seguros Bolívar.  
Todos los derechos reservados © 2025.
