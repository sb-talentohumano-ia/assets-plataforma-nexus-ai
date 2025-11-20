/**
 * Servicio para gestión de la tabla t_f2 (Fase 2: Equipo y Responsables)
 */

/**
 * Inserta un registro en t_f2
 * @param {string} idIniciativa - ID de la iniciativa (FK)
 * @param {Object} data - Datos de la fase 2
 * @returns {Object} Resultado de la operación
 */
function insertPhase2Data(idIniciativa, data) {
  try {
    const sheet = getF2Sheet();
    
    const row = [
      idIniciativa,                           // id_iniciativa (FK)
      data.f2_responsable_nombre || '',       // f2_responsable_nombre
      data.f2_responsable_cargo || '',        // f2_responsable_cargo
      data.f2_po_nombre || '',                // f2_po_nombre
      data.f2_lider_tecnico_nombre || '',     // f2_lider_tecnico_nombre
      data.f2_areas_involucradas || ''        // f2_areas_involucradas (separadas por comas)
    ];
    
    sheet.appendRow(row);
    
    console.log(`Fase 2 creada para iniciativa: ${idIniciativa}`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa
    };
    
  } catch (error) {
    console.error('Error inserting phase 2 data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Actualiza un registro en t_f2
 * @param {string} idIniciativa - ID de la iniciativa
 * @param {Object} data - Datos actualizados
 * @returns {Object} Resultado de la operación
 */
function updatePhase2Data(idIniciativa, data) {
  try {
    const sheet = getF2Sheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, error: 'No hay datos de fase 2 registrados' };
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
      return { success: false, error: 'Datos de fase 2 no encontrados' };
    }
    
    // Actualizar campos
    if (data.f2_responsable_nombre !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(data.f2_responsable_nombre);
    }
    if (data.f2_responsable_cargo !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(data.f2_responsable_cargo);
    }
    if (data.f2_po_nombre !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(data.f2_po_nombre);
    }
    if (data.f2_lider_tecnico_nombre !== undefined) {
      sheet.getRange(rowIndex, 5).setValue(data.f2_lider_tecnico_nombre);
    }
    if (data.f2_areas_involucradas !== undefined) {
      sheet.getRange(rowIndex, 6).setValue(data.f2_areas_involucradas);
    }
    
    console.log(`Fase 2 actualizada para iniciativa: ${idIniciativa}`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa
    };
    
  } catch (error) {
    console.error('Error updating phase 2 data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtiene los datos de fase 2 por ID de iniciativa
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {Object|null} Datos de la fase 2 o null
 */
function getPhase2Data(idIniciativa) {
  try {
    const sheet = getF2Sheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return null;
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, T_F2_CONFIG.HEADERS.length).getValues();
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === idIniciativa) {
        const row = data[i];
        return {
          id_iniciativa: row[0],
          f2_responsable_nombre: row[1],
          f2_responsable_cargo: row[2],
          f2_po_nombre: row[3],
          f2_lider_tecnico_nombre: row[4],
          f2_areas_involucradas: row[5]
        };
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting phase 2 data:', error);
    return null;
  }
}

/**
 * Elimina los datos de fase 2
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {Object} Resultado de la operación
 */
function deletePhase2Data(idIniciativa) {
  try {
    const sheet = getF2Sheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, error: 'No hay datos de fase 2 registrados' };
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
      return { success: false, error: 'Datos de fase 2 no encontrados' };
    }
    
    sheet.deleteRow(rowIndex);
    
    console.log(`Fase 2 eliminada para iniciativa: ${idIniciativa}`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa
    };
    
  } catch (error) {
    console.error('Error deleting phase 2 data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

