/**
 * Servicio de gestión de datos en Google Sheets
 */

/**
 * Carga todas las iniciativas desde la base de datos
 * Excluye iniciativas con estado 'eliminada'
 * @returns {Array} Array de iniciativas
 */
function loadInitiatives() {
  try {
    const sheet = getDatabase();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return [];
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 33).getValues();
    const initiatives = data
      .map(rowToInitiative)
      .filter(initiative => {
        // Filtrar iniciativas que existen, tienen ID y no están eliminadas
        return initiative && 
               initiative.id && 
               initiative.estado !== 'eliminada';
      });
    
    return initiatives;
  } catch (error) {
    console.error('Error loading initiatives from database:', error);
    return [];
  }
}

/**
 * Guarda todas las iniciativas en la base de datos
 * @param {Array} initiatives - Array de iniciativas
 * @returns {Object} Resultado de la operación
 */
function saveInitiatives(initiatives) {
  try {
    const sheet = getDatabase();
    
    // Limpiar datos existentes (excepto header)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    // Insertar nuevos datos
    if (initiatives && initiatives.length > 0) {
      const rows = initiatives.map(initiativeToRow);
      sheet.getRange(2, 1, rows.length, 33).setValues(rows);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving initiatives to database:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene una iniciativa por ID
 * @param {string} id - ID de la iniciativa
 * @returns {Object|null} Iniciativa encontrada o null
 */
function getInitiativeById(id) {
  try {
    const sheet = getDatabase();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) return null;
    
    const data = sheet.getRange(2, 1, lastRow - 1, 33).getValues();
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === id) {
        return rowToInitiative(data[i]);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting initiative by ID:', error);
    return null;
  }
}

/**
 * Crea una nueva iniciativa
 * @param {Object} initiativeData - Datos de la iniciativa
 * @returns {Object} Resultado de la operación
 */
function createInitiative(initiativeData) {
  try {
    // Validar que tengamos los datos necesarios para generar el ID
    if (!initiativeData.idGerencia || !initiativeData.proceso || !initiativeData.usuarioCreadorCc) {
      throw new Error('Faltan datos requeridos para crear la iniciativa: idGerencia, proceso o usuarioCreadorCc');
    }

    // Generar ID único con el nuevo formato
    const uniqueId = generateUniqueId(
      initiativeData.idGerencia,
      initiativeData.proceso,
      initiativeData.usuarioCreadorCc
    );

    const newInitiative = {
      ...initiativeData,
      id: uniqueId,
      activo: true,
      createdAt: getCurrentColombiaDate(),
      updatedAt: getCurrentColombiaDate()
    };
    
    const sheet = getDatabase();
    const newRow = initiativeToRow(newInitiative);
    
    sheet.appendRow(newRow);
    
    return { success: true, initiative: newInitiative };
  } catch (error) {
    console.error('Error creating initiative:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza una iniciativa existente
 * @param {string} id - ID de la iniciativa
 * @param {Object} updatedData - Datos actualizados
 * @returns {Object} Resultado de la operación
 */
function updateInitiative(id, updatedData) {
  try {
    const sheet = getDatabase();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, error: 'Iniciativa no encontrada' };
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 33).getValues();
    let rowIndex = -1;
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === id) {
        rowIndex = i + 2;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, error: 'Iniciativa no encontrada' };
    }
    
    const currentInitiative = rowToInitiative(data[rowIndex - 2]);
    const updatedInitiative = { 
      ...currentInitiative, 
      ...updatedData, 
      id: id,
      updatedAt: getCurrentColombiaDate()
    };
    
    const updatedRow = initiativeToRow(updatedInitiative);
    sheet.getRange(rowIndex, 1, 1, 33).setValues([updatedRow]);
    
    return { success: true, initiative: updatedInitiative };
  } catch (error) {
    console.error('Error updating initiative:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina una iniciativa (soft delete - cambia estado a 'eliminada')
 * @param {string} id - ID de la iniciativa
 * @returns {Object} Resultado de la operación
 */
function deleteInitiative(id) {
  try {
    const sheet = getDatabase();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, error: 'Iniciativa no encontrada' };
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 33).getValues();
    let rowIndex = -1;
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === id) {
        rowIndex = i + 2;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, error: 'Iniciativa no encontrada' };
    }
    
    // Obtener la iniciativa actual
    const currentInitiative = rowToInitiative(data[rowIndex - 2]);
    
    // Cambiar estado a 'eliminada' en lugar de eliminar la fila
    const updatedInitiative = {
      ...currentInitiative,
      estado: 'eliminada',
      updatedAt: getCurrentColombiaDate()
    };
    
    // Actualizar la fila con el nuevo estado
    const updatedRow = initiativeToRow(updatedInitiative);
    sheet.getRange(rowIndex, 1, 1, 33).setValues([updatedRow]);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting initiative:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Inicializa la base de datos con datos de ejemplo
 * @returns {Array} Array de iniciativas iniciales
 */
function initializeWithSampleData() {
  try {
    const initialData = getInitialInitiatives();
    const saveResult = saveInitiatives(initialData);
    
    if (saveResult.success) {
      return initialData;
    } else {
      throw new Error(saveResult.error);
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return getInitialInitiatives();
  }
}