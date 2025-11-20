/**
 * Servicio para gestión de la tabla t_master_iniciativas
 */

/**
 * Genera un nuevo ID de iniciativa con formato: {id_gerencia}-{id_proceso}-{cc_creador}-{autoincremental}
 * @param {string} idGerencia - ID de la gerencia
 * @param {string} idProceso - ID del proceso
 * @param {string} ccCreador - Cédula del creador
 * @returns {string} ID único generado
 */
function generateInitiativeId(idGerencia, idProceso, ccCreador) {
  try {
    const sheet = getMasterIniciativasSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      // Primera iniciativa
      return `${idGerencia}-${idProceso}-${ccCreador}-001`;
    }
    
    // Buscar todas las iniciativas con el mismo prefijo
    const prefix = `${idGerencia}-${idProceso}-${ccCreador}-`;
    const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    
    let maxNumber = 0;
    data.forEach(row => {
      const id = row[0];
      if (id && id.startsWith(prefix)) {
        const parts = id.split('-');
        if (parts.length === 4) {
          const number = parseInt(parts[3]);
          if (!isNaN(number) && number > maxNumber) {
            maxNumber = number;
          }
        }
      }
    });
    
    // Incrementar y formatear con 3 dígitos
    const newNumber = (maxNumber + 1).toString().padStart(3, '0');
    return `${prefix}${newNumber}`;
    
  } catch (error) {
    console.error('Error generating initiative ID:', error);
    throw new Error(`Error al generar ID de iniciativa: ${error.message}`);
  }
}

/**
 * Calcula el semáforo de viabilidad basado en criterios
 * @param {Object} data - Datos de la iniciativa (fase 1, 3 y 4)
 * @returns {string} 'Verde', 'Amarillo', 'Rojo'
 */
function calculateSemaforoViabilidad(data) {
  // Lógica simple basada en ROI y otros factores
  // Puedes ajustar según los criterios del negocio
  
  const roi = parseFloat(data.f4_roi_final) || 0;
  const capex = parseFloat(data.f3_capex_cop) || 0;
  
  if (roi > 50 && capex < 50000000) {
    return 'Verde';
  } else if (roi > 20 || capex < 100000000) {
    return 'Amarillo';
  } else {
    return 'Rojo';
  }
}

/**
 * Inserta un registro en t_master_iniciativas
 * @param {Object} data - Datos maestros de la iniciativa
 * @returns {Object} Resultado de la operación
 */
function insertMasterInitiative(data) {
  try {
    const sheet = getMasterIniciativasSheet();
    const timestamp = new Date();
    
    // Generar ID de iniciativa
    const idIniciativa = generateInitiativeId(
      data.id_gerencia,
      data.id_proceso,
      data.usuario_creador_cc
    );
    
    // Calcular semáforo de viabilidad
    const semaforoViabilidad = calculateSemaforoViabilidad(data);
    
    const row = [
      idIniciativa,                           // id_iniciativa
      data.nombre || '',                      // nombre
      data.descripcion || '',                 // descripcion
      data.estado || 'sin iniciar',           // estado
      data.id_gerencia || '',                 // id_gerencia
      data.id_proceso || '',                  // id_proceso
      data.vertical || '',                    // vertical
      semaforoViabilidad,                     // semaforo_viabilidad
      data.usuario_creador_cc || '',          // usuario_creador_cc
      data.usuario_creador_nombre || '',      // usuario_creador_nombre
      data.fecha_pedido_iniciativa || timestamp, // fecha_pedido_iniciativa
      timestamp,                              // fecha_creacion
      data.usuario_creador_cc || '',          // usuario_ult_mod_cc
      data.usuario_creador_nombre || '',      // usuario_ult_mod_nombre
      timestamp,                              // fecha_actualizacion
      true,                                   // activo
      data.observaciones || ''                // observaciones
    ];
    
    sheet.appendRow(row);
    
    console.log(`Iniciativa master creada: ${idIniciativa}`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa,
      data: row
    };
    
  } catch (error) {
    console.error('Error inserting master initiative:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Actualiza un registro en t_master_iniciativas
 * @param {string} idIniciativa - ID de la iniciativa
 * @param {Object} data - Datos actualizados
 * @returns {Object} Resultado de la operación
 */
function updateMasterInitiative(idIniciativa, data) {
  try {
    const sheet = getMasterIniciativasSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, error: 'No hay iniciativas registradas' };
    }
    
    // Buscar la fila con el ID
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    let rowIndex = -1;
    
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === idIniciativa) {
        rowIndex = i + 2; // +2 porque empezamos en la fila 2 y el índice es 0-based
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, error: 'Iniciativa no encontrada' };
    }
    
    const timestamp = new Date();
    
    // Actualizar campos específicos (mantener ID, fechas de creación, etc.)
    if (data.nombre !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(data.nombre);
    }
    if (data.descripcion !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(data.descripcion);
    }
    if (data.estado !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(data.estado);
    }
    if (data.vertical !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(data.vertical);
    }
    if (data.semaforo_viabilidad !== undefined) {
      sheet.getRange(rowIndex, 8).setValue(data.semaforo_viabilidad);
    }
    if (data.observaciones !== undefined) {
      sheet.getRange(rowIndex, 17).setValue(data.observaciones);
    }
    
    // Actualizar campos de auditoría
    sheet.getRange(rowIndex, 13).setValue(data.usuario_ult_mod_cc || '');
    sheet.getRange(rowIndex, 14).setValue(data.usuario_ult_mod_nombre || '');
    sheet.getRange(rowIndex, 15).setValue(timestamp);
    
    console.log(`Iniciativa master actualizada: ${idIniciativa}`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa
    };
    
  } catch (error) {
    console.error('Error updating master initiative:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtiene una iniciativa por ID desde t_master_iniciativas
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {Object|null} Datos de la iniciativa o null
 */
function getMasterInitiativeById(idIniciativa) {
  try {
    const sheet = getMasterIniciativasSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return null;
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, T_MASTER_INICIATIVAS_CONFIG.HEADERS.length).getValues();
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === idIniciativa) {
        const row = data[i];
        return {
          id_iniciativa: row[0],
          nombre: row[1],
          descripcion: row[2],
          estado: row[3],
          id_gerencia: row[4],
          id_proceso: row[5],
          vertical: row[6],
          semaforo_viabilidad: row[7],
          usuario_creador_cc: row[8],
          usuario_creador_nombre: row[9],
          fecha_pedido_iniciativa: row[10],
          fecha_creacion: row[11],
          usuario_ult_mod_cc: row[12],
          usuario_ult_mod_nombre: row[13],
          fecha_actualizacion: row[14],
          activo: row[15],
          observaciones: row[16]
        };
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting master initiative:', error);
    return null;
  }
}

/**
 * Obtiene todas las iniciativas maestras activas
 * @returns {Array} Array de iniciativas
 */
function getAllMasterInitiatives() {
  try {
    const sheet = getMasterIniciativasSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return [];
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, T_MASTER_INICIATIVAS_CONFIG.HEADERS.length).getValues();
    const initiatives = [];
    
    data.forEach(row => {
      if (row[15] === true) { // Solo activas
        initiatives.push({
          id_iniciativa: row[0],
          nombre: row[1],
          descripcion: row[2],
          estado: row[3],
          id_gerencia: row[4],
          id_proceso: row[5],
          vertical: row[6],
          semaforo_viabilidad: row[7],
          usuario_creador_cc: row[8],
          usuario_creador_nombre: row[9],
          fecha_pedido_iniciativa: row[10],
          fecha_creacion: row[11],
          usuario_ult_mod_cc: row[12],
          usuario_ult_mod_nombre: row[13],
          fecha_actualizacion: row[14],
          activo: row[15],
          observaciones: row[16]
        });
      }
    });
    
    return initiatives;
    
  } catch (error) {
    console.error('Error getting all master initiatives:', error);
    return [];
  }
}

/**
 * Elimina (soft delete) una iniciativa
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {Object} Resultado de la operación
 */
function deleteMasterInitiative(idIniciativa) {
  try {
    const sheet = getMasterIniciativasSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, error: 'No hay iniciativas registradas' };
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
      return { success: false, error: 'Iniciativa no encontrada' };
    }
    
    // Soft delete: marcar como inactivo
    sheet.getRange(rowIndex, 16).setValue(false); // activo = false
    sheet.getRange(rowIndex, 15).setValue(new Date()); // fecha_actualizacion
    
    console.log(`Iniciativa eliminada (soft delete): ${idIniciativa}`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa
    };
    
  } catch (error) {
    console.error('Error deleting master initiative:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

