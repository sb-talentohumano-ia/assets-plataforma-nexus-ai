/**
 * Servicio para gestión de la tabla t_f4 (Fase 4: Evaluación Económica)
 */

/**
 * Calcula el beneficio bruto
 * E1 + (E2 * Costo Hora * 12) + E3
 * @param {number} e1AhorroGastos - Ahorro directo anual
 * @param {number} e2HorasAhorradas - Horas ahorradas mensuales
 * @param {number} e2CostoHoraRol - Costo por hora del rol
 * @param {number} e3CostoEvitado - Costo evitado anual
 * @returns {number} Beneficio bruto calculado
 */
function calculateBeneficioBruto(e1AhorroGastos, e2HorasAhorradas, e2CostoHoraRol, e3CostoEvitado) {
  const e1 = parseFloat(e1AhorroGastos) || 0;
  const e2Horas = parseFloat(e2HorasAhorradas) || 0;
  const e2Costo = parseFloat(e2CostoHoraRol) || 0;
  const e3 = parseFloat(e3CostoEvitado) || 0;
  
  return e1 + (e2Horas * e2Costo * 12) + e3;
}

/**
 * Calcula el beneficio ajustado por adopción
 * Beneficio Bruto * (E4/100)
 * @param {number} beneficioBruto - Beneficio bruto calculado
 * @param {number} e4AdopcionPct - Porcentaje de adopción (0-100)
 * @returns {number} Beneficio ajustado
 */
function calculateBeneficioAjustado(beneficioBruto, e4AdopcionPct) {
  const bruto = parseFloat(beneficioBruto) || 0;
  const adopcion = parseFloat(e4AdopcionPct) || 0;
  
  return bruto * (adopcion / 100);
}

/**
 * Calcula el ROI final
 * ((Beneficio Ajustado - CAPEX) / CAPEX) * 100
 * @param {number} beneficioAjustado - Beneficio ajustado
 * @param {number} capex - Inversión inicial (CAPEX)
 * @returns {number} ROI en porcentaje
 */
function calculateROI(beneficioAjustado, capex) {
  const beneficio = parseFloat(beneficioAjustado) || 0;
  const inversion = parseFloat(capex) || 1; // Evitar división por cero
  
  if (inversion === 0) {
    return 0;
  }
  
  return ((beneficio - inversion) / inversion) * 100;
}

/**
 * Inserta un registro en t_f4 con cálculos automáticos
 * @param {string} idIniciativa - ID de la iniciativa (FK)
 * @param {Object} data - Datos de la fase 4
 * @param {number} capex - CAPEX de la fase 3 (para cálculo de ROI)
 * @returns {Object} Resultado de la operación
 */
function insertPhase4Data(idIniciativa, data, capex = 0) {
  try {
    const sheet = getF4Sheet();
    
    // Calcular beneficios y ROI
    const beneficioBruto = calculateBeneficioBruto(
      data.f4_e1_ahorro_gastos,
      data.f4_e2_horas_ahorradas,
      data.f4_e2_costo_hora_rol,
      data.f4_e3_costo_evitado
    );
    
    const beneficioAjustado = calculateBeneficioAjustado(
      beneficioBruto,
      data.f4_e4_adopcion_pct
    );
    
    const roiFinal = calculateROI(beneficioAjustado, capex);
    
    const row = [
      idIniciativa,                                   // id_iniciativa (FK)
      parseFloat(data.f4_e1_ahorro_gastos) || 0,      // f4_e1_ahorro_gastos
      parseFloat(data.f4_e2_horas_ahorradas) || 0,    // f4_e2_horas_ahorradas
      parseFloat(data.f4_e2_costo_hora_rol) || 0,     // f4_e2_costo_hora_rol
      parseFloat(data.f4_e3_costo_evitado) || 0,      // f4_e3_costo_evitado
      parseFloat(data.f4_e4_adopcion_pct) || 0,       // f4_e4_adopcion_pct
      beneficioBruto,                                 // f4_beneficio_bruto (calculado)
      beneficioAjustado,                              // f4_beneficio_ajustado (calculado)
      roiFinal                                        // f4_roi_final (calculado)
    ];
    
    sheet.appendRow(row);
    
    console.log(`Fase 4 creada para iniciativa: ${idIniciativa} - ROI: ${roiFinal.toFixed(2)}%`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa,
      calculated: {
        beneficio_bruto: beneficioBruto,
        beneficio_ajustado: beneficioAjustado,
        roi_final: roiFinal
      }
    };
    
  } catch (error) {
    console.error('Error inserting phase 4 data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Actualiza un registro en t_f4 con recálculo automático
 * @param {string} idIniciativa - ID de la iniciativa
 * @param {Object} data - Datos actualizados
 * @param {number} capex - CAPEX de la fase 3 (para recalcular ROI)
 * @returns {Object} Resultado de la operación
 */
function updatePhase4Data(idIniciativa, data, capex = 0) {
  try {
    const sheet = getF4Sheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, error: 'No hay datos de fase 4 registrados' };
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
      return { success: false, error: 'Datos de fase 4 no encontrados' };
    }
    
    // Obtener datos actuales para combinar con nuevos
    const currentData = sheet.getRange(rowIndex, 1, 1, T_F4_CONFIG.HEADERS.length).getValues()[0];
    
    const e1 = data.f4_e1_ahorro_gastos !== undefined ? parseFloat(data.f4_e1_ahorro_gastos) : currentData[1];
    const e2Horas = data.f4_e2_horas_ahorradas !== undefined ? parseFloat(data.f4_e2_horas_ahorradas) : currentData[2];
    const e2Costo = data.f4_e2_costo_hora_rol !== undefined ? parseFloat(data.f4_e2_costo_hora_rol) : currentData[3];
    const e3 = data.f4_e3_costo_evitado !== undefined ? parseFloat(data.f4_e3_costo_evitado) : currentData[4];
    const e4 = data.f4_e4_adopcion_pct !== undefined ? parseFloat(data.f4_e4_adopcion_pct) : currentData[5];
    
    // Recalcular
    const beneficioBruto = calculateBeneficioBruto(e1, e2Horas, e2Costo, e3);
    const beneficioAjustado = calculateBeneficioAjustado(beneficioBruto, e4);
    const roiFinal = calculateROI(beneficioAjustado, capex);
    
    // Actualizar todos los campos
    sheet.getRange(rowIndex, 2).setValue(e1);
    sheet.getRange(rowIndex, 3).setValue(e2Horas);
    sheet.getRange(rowIndex, 4).setValue(e2Costo);
    sheet.getRange(rowIndex, 5).setValue(e3);
    sheet.getRange(rowIndex, 6).setValue(e4);
    sheet.getRange(rowIndex, 7).setValue(beneficioBruto);
    sheet.getRange(rowIndex, 8).setValue(beneficioAjustado);
    sheet.getRange(rowIndex, 9).setValue(roiFinal);
    
    console.log(`Fase 4 actualizada para iniciativa: ${idIniciativa} - ROI: ${roiFinal.toFixed(2)}%`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa,
      calculated: {
        beneficio_bruto: beneficioBruto,
        beneficio_ajustado: beneficioAjustado,
        roi_final: roiFinal
      }
    };
    
  } catch (error) {
    console.error('Error updating phase 4 data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtiene los datos de fase 4 por ID de iniciativa
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {Object|null} Datos de la fase 4 o null
 */
function getPhase4Data(idIniciativa) {
  try {
    const sheet = getF4Sheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return null;
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, T_F4_CONFIG.HEADERS.length).getValues();
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === idIniciativa) {
        const row = data[i];
        return {
          id_iniciativa: row[0],
          f4_e1_ahorro_gastos: row[1],
          f4_e2_horas_ahorradas: row[2],
          f4_e2_costo_hora_rol: row[3],
          f4_e3_costo_evitado: row[4],
          f4_e4_adopcion_pct: row[5],
          f4_beneficio_bruto: row[6],
          f4_beneficio_ajustado: row[7],
          f4_roi_final: row[8]
        };
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting phase 4 data:', error);
    return null;
  }
}

/**
 * Elimina los datos de fase 4
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {Object} Resultado de la operación
 */
function deletePhase4Data(idIniciativa) {
  try {
    const sheet = getF4Sheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, error: 'No hay datos de fase 4 registrados' };
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
      return { success: false, error: 'Datos de fase 4 no encontrados' };
    }
    
    sheet.deleteRow(rowIndex);
    
    console.log(`Fase 4 eliminada para iniciativa: ${idIniciativa}`);
    
    return {
      success: true,
      id_iniciativa: idIniciativa
    };
    
  } catch (error) {
    console.error('Error deleting phase 4 data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

