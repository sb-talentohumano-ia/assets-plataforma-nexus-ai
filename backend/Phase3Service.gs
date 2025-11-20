/**
 * Servicio para gestión de la tabla t_f3 (Fase 3: Solución Técnica)
 */

// Opciones para tipo de solución
const TIPOS_SOLUCION = [
  'Agente IA',
  'Modelo Predictivo',
  'RPA (Automatización)',
  'Analítica Avanzada',
  'Dashboard',
  'Chatbot',
  'API',
  'Otros'
];

// Opciones para infraestructura
const TIPOS_INFRAESTRUCTURA = [
  'Azure',
  'On-premise',
  'Híbrida',
  'AWS',
  'Google Cloud',
  'Otros'
];

/**
 * Inserta un registro en t_f3
 * @param {string} idIniciativa - ID de la iniciativa (FK)
 * @param {Object} data - Datos de la fase 3
 * @returns {Object} Resultado de la operación
 */
function insertPhase3Data(idIniciativa, data) {
  try {
    const sheet = getF3Sheet();
    
    const row = [
      idIniciativa,                                 // id_iniciativa (FK)
      data.f3_tipo_solucion || '',                  // f3_tipo_solucion
      data.f3_infraestructura || '',                // f3_infraestructura
      parseFloat(data.f3_capex_cop) || 0,           // f3_capex_cop
      parseFloat(data.f3_opex_anual_cop) || 0,      // f3_opex_anual_cop
      data.f3_observacion_tec || ''                 // f3_observacion_tec
    ];
    
    sheet.appendRow(row);
    
    console.log(`Fase 3 creada para iniciativa: ${idIniciativa}`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa
    };
    
  } catch (error) {
    console.error('Error inserting phase 3 data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Actualiza un registro en t_f3
 * @param {string} idIniciativa - ID de la iniciativa
 * @param {Object} data - Datos actualizados
 * @returns {Object} Resultado de la operación
 */
function updatePhase3Data(idIniciativa, data) {
  try {
    const sheet = getF3Sheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, error: 'No hay datos de fase 3 registrados' };
    }
    
    // Buscar la fila con el ID
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    let rowIndex = -1;
    
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === idIniciativa) {
        rowIndex = i + 2;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, error: 'Datos de fase 3 no encontrados' };
    }
    
    // Actualizar campos
    if (data.f3_tipo_solucion !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(data.f3_tipo_solucion);
    }
    if (data.f3_infraestructura !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(data.f3_infraestructura);
    }
    if (data.f3_capex_cop !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(parseFloat(data.f3_capex_cop) || 0);
    }
    if (data.f3_opex_anual_cop !== undefined) {
      sheet.getRange(rowIndex, 5).setValue(parseFloat(data.f3_opex_anual_cop) || 0);
    }
    if (data.f3_observacion_tec !== undefined) {
      sheet.getRange(rowIndex, 6).setValue(data.f3_observacion_tec);
    }
    
    console.log(`Fase 3 actualizada para iniciativa: ${idIniciativa}`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa
    };
    
  } catch (error) {
    console.error('Error updating phase 3 data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtiene los datos de fase 3 por ID de iniciativa
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {Object|null} Datos de la fase 3 o null
 */
function getPhase3Data(idIniciativa) {
  try {
    const sheet = getF3Sheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return null;
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, T_F3_CONFIG.HEADERS.length).getValues();
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === idIniciativa) {
        const row = data[i];
        return {
          id_iniciativa: row[0],
          f3_tipo_solucion: row[1],
          f3_infraestructura: row[2],
          f3_capex_cop: row[3],
          f3_opex_anual_cop: row[4],
          f3_observacion_tec: row[5]
        };
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting phase 3 data:', error);
    return null;
  }
}

/**
 * Elimina los datos de fase 3
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {Object} Resultado de la operación
 */
function deletePhase3Data(idIniciativa) {
  try {
    const sheet = getF3Sheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, error: 'No hay datos de fase 3 registrados' };
    }
    
    // Buscar la fila con el ID
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    let rowIndex = -1;
    
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === idIniciativa) {
        rowIndex = i + 2;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, error: 'Datos de fase 3 no encontrados' };
    }
    
    sheet.deleteRow(rowIndex);
    
    console.log(`Fase 3 eliminada para iniciativa: ${idIniciativa}`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa
    };
    
  } catch (error) {
    console.error('Error deleting phase 3 data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtiene las opciones de tipos de solución
 * @returns {Array} Array con los tipos de solución
 */
function getTiposSolucion() {
  return TIPOS_SOLUCION;
}

/**
 * Obtiene las opciones de tipos de infraestructura
 * @returns {Array} Array con los tipos de infraestructura
 */
function getTiposInfraestructura() {
  return TIPOS_INFRAESTRUCTURA;
}

