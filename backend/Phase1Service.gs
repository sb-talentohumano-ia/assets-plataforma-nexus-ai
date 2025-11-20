/**
 * Servicio para gestión de la tabla t_f1 (Fase 1: Problema y Métricas)
 */

/**
 * Inserta un registro en t_f1
 * @param {string} idIniciativa - ID de la iniciativa (FK)
 * @param {Object} data - Datos de la fase 1
 * @returns {Object} Resultado de la operación
 */
function insertPhase1Data(idIniciativa, data) {
  try {
    const sheet = getF1Sheet();
    
    const row = [
      idIniciativa,                           // id_iniciativa (FK)
      data.f1_problema_dolor || '',           // f1_problema_dolor
      parseFloat(data.f1_metrica_dolor) || 0, // f1_metrica_dolor
      data.f1_unidad_metrica || '',           // f1_unidad_metrica (Horas, %, COP, Errores)
      data.f1_proceso_solucion || '',         // f1_proceso_solucion
      parseFloat(data.f1_volumen_mensual) || 0, // f1_volumen_mensual
      data.f1_usuario_final || ''             // f1_usuario_final
    ];
    
    sheet.appendRow(row);
    
    console.log(`Fase 1 creada para iniciativa: ${idIniciativa}`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa
    };
    
  } catch (error) {
    console.error('Error inserting phase 1 data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Actualiza un registro en t_f1
 * @param {string} idIniciativa - ID de la iniciativa
 * @param {Object} data - Datos actualizados
 * @returns {Object} Resultado de la operación
 */
function updatePhase1Data(idIniciativa, data) {
  try {
    const sheet = getF1Sheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, error: 'No hay datos de fase 1 registrados' };
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
      return { success: false, error: 'Datos de fase 1 no encontrados' };
    }
    
    // Actualizar campos
    if (data.f1_problema_dolor !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(data.f1_problema_dolor);
    }
    if (data.f1_metrica_dolor !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(parseFloat(data.f1_metrica_dolor) || 0);
    }
    if (data.f1_unidad_metrica !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(data.f1_unidad_metrica);
    }
    if (data.f1_proceso_solucion !== undefined) {
      sheet.getRange(rowIndex, 5).setValue(data.f1_proceso_solucion);
    }
    if (data.f1_volumen_mensual !== undefined) {
      sheet.getRange(rowIndex, 6).setValue(parseFloat(data.f1_volumen_mensual) || 0);
    }
    if (data.f1_usuario_final !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(data.f1_usuario_final);
    }
    
    console.log(`Fase 1 actualizada para iniciativa: ${idIniciativa}`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa
    };
    
  } catch (error) {
    console.error('Error updating phase 1 data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtiene los datos de fase 1 por ID de iniciativa
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {Object|null} Datos de la fase 1 o null
 */
function getPhase1Data(idIniciativa) {
  try {
    const sheet = getF1Sheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return null;
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, T_F1_CONFIG.HEADERS.length).getValues();
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === idIniciativa) {
        const row = data[i];
        return {
          id_iniciativa: row[0],
          f1_problema_dolor: row[1],
          f1_metrica_dolor: row[2],
          f1_unidad_metrica: row[3],
          f1_proceso_solucion: row[4],
          f1_volumen_mensual: row[5],
          f1_usuario_final: row[6]
        };
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting phase 1 data:', error);
    return null;
  }
}

/**
 * Elimina los datos de fase 1
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {Object} Resultado de la operación
 */
function deletePhase1Data(idIniciativa) {
  try {
    const sheet = getF1Sheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, error: 'No hay datos de fase 1 registrados' };
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
      return { success: false, error: 'Datos de fase 1 no encontrados' };
    }
    
    sheet.deleteRow(rowIndex);
    
    console.log(`Fase 1 eliminada para iniciativa: ${idIniciativa}`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa
    };
    
  } catch (error) {
    console.error('Error deleting phase 1 data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

