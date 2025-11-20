/**
 * Configuración de la base de datos
 */

// ID del Google Sheet principal
const SHEET_ID = '1AVvssPSJ6yfTF7Zf4-KmYB8XrnCWPnRZUbAezfrH41E';

// ============================================================================
// CONFIGURACIÓN DE TABLAS NUEVAS - SISTEMA MODULAR
// ============================================================================

// Tabla Master de Iniciativas
const T_MASTER_INICIATIVAS_CONFIG = {
  SHEET_ID: SHEET_ID,
  SHEET_NAME: 't_master_iniciativas',
  HEADERS: [
    'id_iniciativa', 'nombre', 'descripcion', 'estado', 'id_gerencia', 'id_proceso',
    'vertical', 'semaforo_viabilidad', 'usuario_creador_cc', 'usuario_creador_nombre',
    'fecha_pedido_iniciativa', 'fecha_creacion', 'usuario_ult_mod_cc', 
    'usuario_ult_mod_nombre', 'fecha_actualizacion', 'activo', 'observaciones'
  ]
};

// Tabla Fase 1 - Problema y Métricas
const T_F1_CONFIG = {
  SHEET_ID: SHEET_ID,
  SHEET_NAME: 't_f1',
  HEADERS: [
    'id_iniciativa', 'f1_problema_dolor', 'f1_metrica_dolor', 'f1_unidad_metrica',
    'f1_proceso_solucion', 'f1_volumen_mensual', 'f1_usuario_final'
  ]
};

// Tabla Fase 2 - Equipo y Responsables
const T_F2_CONFIG = {
  SHEET_ID: SHEET_ID,
  SHEET_NAME: 't_f2',
  HEADERS: [
    'id_iniciativa', 'f2_responsable_nombre', 'f2_responsable_cargo',
    'f2_po_nombre', 'f2_lider_tecnico_nombre', 'f2_areas_involucradas'
  ]
};

// Tabla Fase 3 - Solución Técnica
const T_F3_CONFIG = {
  SHEET_ID: SHEET_ID,
  SHEET_NAME: 't_f3',
  HEADERS: [
    'id_iniciativa', 'f3_tipo_solucion', 'f3_infraestructura',
    'f3_capex_cop', 'f3_opex_anual_cop', 'f3_observacion_tec'
  ]
};

// Tabla Fase 4 - Evaluación Económica
const T_F4_CONFIG = {
  SHEET_ID: SHEET_ID,
  SHEET_NAME: 't_f4',
  HEADERS: [
    'id_iniciativa', 'f4_e1_ahorro_gastos', 'f4_e2_horas_ahorradas',
    'f4_e2_costo_hora_rol', 'f4_e3_costo_evitado', 'f4_e4_adopcion_pct',
    'f4_beneficio_bruto', 'f4_beneficio_ajustado', 'f4_roi_final'
  ]
};

// ============================================================================
// CONFIGURACIÓN DE TABLAS ANTIGUAS (DEPRECATED - SOLO PARA REFERENCIA)
// ============================================================================

// Configuración de Google Sheets - Iniciativas (DEPRECADA)
const DATABASE_CONFIG = {
  SHEET_ID: SHEET_ID,
  SHEET_NAME: 'iniciativas',
  HEADERS: [
    'id_iniciativa', 'nombre', 'descripcion', 'responsable', 'usuario_creador_cc',
    'usuario_creador_nombre', 'fecha_pedido_iniciativa', 'estado', 'id_gerencia',
    'proceso', 'oportunidad', 'usuario_final', 'impacto_pilar_estrategico',
    'resolucion_dolor_problema', 'alcance_impacto', 'viabilidad_tecnica_complejidad',
    'reutilizacion_escalabilidad', 'disponibilidad_datos', 'reduccion_trabajo_manual',
    'reduccion_costos', 'mejora_experiencia', 'horas_manuales_ahorradas_mensual',
    'ahorro_millones_cop_mensual', 'puntaje_impacto_valor', 'puntaje_viabilidad',
    'puntaje_valor_negocio', 'puntaje_total', 'fecha_creacion', 'fecha_actualizacion',
    'usuario_ultima_modificacion_cc', 'usuario_ultima_modificacion_nombre', 'activo',
    'observaciones'
  ]
};

// Configuración de Google Sheets - Usuarios Autorizados
const USERS_DATABASE_CONFIG = {
  SHEET_ID: SHEET_ID,
  SHEET_NAME: 'users',
  HEADERS: [
    'cc', 'user_type', 'nombre', 'correo', 'cargo', 'vertical', 'id_gerencia'
  ]
};

/**
 * Obtiene referencia a la hoja de cálculo
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} La hoja de cálculo
 */
function getDatabase() {
  try {
    const spreadsheet = SpreadsheetApp.openById(DATABASE_CONFIG.SHEET_ID);
    let sheet = spreadsheet.getSheetByName(DATABASE_CONFIG.SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(DATABASE_CONFIG.SHEET_NAME);
      initializeDatabaseHeaders(sheet);
    }
    
    return sheet;
  } catch (error) {
    console.error('Error accessing database:', error);
    throw new Error(`No se puede acceder a la base de datos: ${error.message}`);
  }
}

/**
 * Inicializa los headers de la base de datos
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - La hoja de cálculo
 */
function initializeDatabaseHeaders(sheet) {
  const headers = DATABASE_CONFIG.HEADERS;
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

/**
 * Obtiene referencia a la hoja de usuarios autorizados
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} La hoja de usuarios
 */
function getUsersDatabase() {
  try {
    const spreadsheet = SpreadsheetApp.openById(USERS_DATABASE_CONFIG.SHEET_ID);
    const sheet = spreadsheet.getSheetByName(USERS_DATABASE_CONFIG.SHEET_NAME);

    if (!sheet) {
      throw new Error(`No se encontró la hoja '${USERS_DATABASE_CONFIG.SHEET_NAME}' en la base de datos de usuarios`);
    }

    return sheet;
  } catch (error) {
    console.error('Error accessing users database:', error);
    throw new Error(`No se puede acceder a la base de datos de usuarios: ${error.message}`);
  }
}

/**
 * Obtiene referencia a la hoja de gerencias
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} La hoja de gerencias
 */
function getGerenciasDatabase() {
  try {
    const spreadsheet = SpreadsheetApp.openById(DATABASE_CONFIG.SHEET_ID);
    const sheet = spreadsheet.getSheetByName('gerencia');

    if (!sheet) {
      throw new Error('No se encontró la hoja "gerencia" en la base de datos');
    }

    return sheet;
  } catch (error) {
    console.error('Error accessing gerencias database:', error);
    throw new Error(`No se puede acceder a la base de datos de gerencias: ${error.message}`);
  }
}

/**
 * Obtiene referencia a la hoja de procesos
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} La hoja de procesos
 */
function getProcesosDatabase() {
  try {
    const spreadsheet = SpreadsheetApp.openById(DATABASE_CONFIG.SHEET_ID);
    const sheet = spreadsheet.getSheetByName('procesos');

    if (!sheet) {
      throw new Error('No se encontró la hoja "procesos" en la base de datos');
    }

    return sheet;
  } catch (error) {
    console.error('Error accessing procesos database:', error);
    throw new Error(`No se puede acceder a la base de datos de procesos: ${error.message}`);
  }
}

/**
 * Obtiene todas las gerencias
 * @returns {Array} Array de objetos {id_gerencia, nombre}
 */
function getAllGerencias() {
  try {
    const sheet = getGerenciasDatabase();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return [];
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    return data.map(row => ({
      id: row[0],
      nombre: row[1]
    })).filter(g => g.id && g.nombre);
  } catch (error) {
    console.error('Error loading gerencias:', error);
    return [];
  }
}

/**
 * Obtiene todos los procesos
 * @returns {Array} Array de objetos {id_proceso, nombre}
 */
function getAllProcesos() {
  try {
    const sheet = getProcesosDatabase();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return [];
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    return data.map(row => ({
      id: row[0],
      nombre: row[1]
    })).filter(p => p.id && p.nombre);
  } catch (error) {
    console.error('Error loading procesos:', error);
    return [];
  }
}

/**
 * Obtiene referencia a la hoja de verticales
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} La hoja de verticales
 */
function getVerticalesDatabase() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName('verticales');

    if (!sheet) {
      throw new Error('No se encontró la hoja "verticales" en la base de datos');
    }

    return sheet;
  } catch (error) {
    console.error('Error accessing verticales database:', error);
    throw new Error(`No se puede acceder a la base de datos de verticales: ${error.message}`);
  }
}

/**
 * Obtiene todas las verticales
 * @returns {Array} Array de strings con nombres de verticales
 */
function getAllVerticales() {
  try {
    const sheet = getVerticalesDatabase();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return [];
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    return data.map(row => row[0]).filter(v => v);
  } catch (error) {
    console.error('Error loading verticales:', error);
    return [];
  }
}

// ============================================================================
// FUNCIONES DE ACCESO A NUEVAS TABLAS
// ============================================================================

/**
 * Obtiene referencia a la hoja t_master_iniciativas
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getMasterIniciativasSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(T_MASTER_INICIATIVAS_CONFIG.SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(T_MASTER_INICIATIVAS_CONFIG.SHEET_NAME);
      const headers = T_MASTER_INICIATIVAS_CONFIG.HEADERS;
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    return sheet;
  } catch (error) {
    console.error('Error accessing t_master_iniciativas:', error);
    throw new Error(`No se puede acceder a t_master_iniciativas: ${error.message}`);
  }
}

/**
 * Obtiene referencia a la hoja t_f1
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getF1Sheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(T_F1_CONFIG.SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(T_F1_CONFIG.SHEET_NAME);
      const headers = T_F1_CONFIG.HEADERS;
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    return sheet;
  } catch (error) {
    console.error('Error accessing t_f1:', error);
    throw new Error(`No se puede acceder a t_f1: ${error.message}`);
  }
}

/**
 * Obtiene referencia a la hoja t_f2
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getF2Sheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(T_F2_CONFIG.SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(T_F2_CONFIG.SHEET_NAME);
      const headers = T_F2_CONFIG.HEADERS;
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    return sheet;
  } catch (error) {
    console.error('Error accessing t_f2:', error);
    throw new Error(`No se puede acceder a t_f2: ${error.message}`);
  }
}

/**
 * Obtiene referencia a la hoja t_f3
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getF3Sheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(T_F3_CONFIG.SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(T_F3_CONFIG.SHEET_NAME);
      const headers = T_F3_CONFIG.HEADERS;
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    return sheet;
  } catch (error) {
    console.error('Error accessing t_f3:', error);
    throw new Error(`No se puede acceder a t_f3: ${error.message}`);
  }
}

/**
 * Obtiene referencia a la hoja t_f4
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getF4Sheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(T_F4_CONFIG.SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(T_F4_CONFIG.SHEET_NAME);
      const headers = T_F4_CONFIG.HEADERS;
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    return sheet;
  } catch (error) {
    console.error('Error accessing t_f4:', error);
    throw new Error(`No se puede acceder a t_f4: ${error.message}`);
  }
}