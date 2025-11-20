/**
 * Controlador transaccional para creación de iniciativas multi-fase
 * Gestiona las 5 tablas de manera coordinada
 */

/**
 * Valida los datos completos antes de crear la iniciativa
 * @param {Object} fullData - Datos completos de las 4 fases
 * @returns {Object} Resultado de validación {valid: boolean, errors: Array}
 */
function validateMultiPhaseData(fullData) {
  const errors = [];
  
  // Validar datos maestros
  if (!fullData.nombre || fullData.nombre.trim() === '') {
    errors.push('El nombre de la iniciativa es requerido');
  }
  if (!fullData.descripcion || fullData.descripcion.trim() === '') {
    errors.push('La descripción es requerida');
  }
  if (!fullData.id_proceso) {
    errors.push('El proceso es requerido');
  }
  if (!fullData.vertical || fullData.vertical.trim() === '') {
    errors.push('La vertical es requerida');
  }
  
  // Validar Fase 1
  if (!fullData.f1_problema_dolor || fullData.f1_problema_dolor.trim() === '') {
    errors.push('Fase 1: El problema o dolor es requerido');
  }
  if (!fullData.f1_unidad_metrica || fullData.f1_unidad_metrica.trim() === '') {
    errors.push('Fase 1: La unidad de métrica es requerida');
  }
  
  // Validar Fase 2
  if (!fullData.f2_responsable_nombre || fullData.f2_responsable_nombre.trim() === '') {
    errors.push('Fase 2: El responsable del negocio es requerido');
  }
  
  // Validar Fase 3
  if (!fullData.f3_tipo_solucion || fullData.f3_tipo_solucion.trim() === '') {
    errors.push('Fase 3: El tipo de solución es requerido');
  }
  if (!fullData.f3_infraestructura || fullData.f3_infraestructura.trim() === '') {
    errors.push('Fase 3: La infraestructura es requerida');
  }
  
  // Validar Fase 4 - porcentaje de adopción
  const adopcion = parseFloat(fullData.f4_e4_adopcion_pct);
  if (isNaN(adopcion) || adopcion < 0 || adopcion > 100) {
    errors.push('Fase 4: El porcentaje de adopción debe estar entre 0 y 100');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Crea una iniciativa completa en las 5 tablas de manera transaccional
 * @param {Object} fullData - Datos completos de las 4 fases más datos maestros
 * @returns {Object} Resultado de la operación
 */
function createMultiPhaseInitiative(fullData) {
  try {
    // Validar permisos
    const authResult = validateUserAction('create_initiative');
    if (!authResult.allowed) {
      return {
        success: false,
        error: authResult.reason
      };
    }
    
    const userInfo = authResult.userInfo;
    
    // Si no es admin, asignar su gerencia automáticamente
    if (!userInfo.isAdmin) {
      fullData.id_gerencia = userInfo.idGerencia;
    }
    
    // Validar que la gerencia esté definida
    if (!fullData.id_gerencia) {
      return {
        success: false,
        error: 'No se pudo determinar la gerencia para la iniciativa'
      };
    }
    
    // Validar datos completos
    const validation = validateMultiPhaseData(fullData);
    if (!validation.valid) {
      return {
        success: false,
        error: 'Errores de validación',
        validationErrors: validation.errors
      };
    }
    
    // Agregar información del usuario creador
    fullData.usuario_creador_cc = userInfo.cc;
    fullData.usuario_creador_nombre = userInfo.nombre;
    
    console.log(`Iniciando creación de iniciativa multi-fase por usuario: ${userInfo.nombre}`);
    
    // PASO 1: Insertar en t_master_iniciativas (genera el ID)
    const masterResult = insertMasterInitiative({
      nombre: fullData.nombre,
      descripcion: fullData.descripcion,
      estado: fullData.estado || 'sin iniciar',
      id_gerencia: fullData.id_gerencia,
      id_proceso: fullData.id_proceso,
      vertical: fullData.vertical,
      usuario_creador_cc: fullData.usuario_creador_cc,
      usuario_creador_nombre: fullData.usuario_creador_nombre,
      fecha_pedido_iniciativa: fullData.fecha_pedido_iniciativa || new Date(),
      observaciones: fullData.observaciones || '',
      // Datos para calcular semáforo (de fase 3 y 4)
      f3_capex_cop: fullData.f3_capex_cop,
      f4_roi_final: 0 // Se calculará después
    });
    
    if (!masterResult.success) {
      return {
        success: false,
        error: 'Error al crear iniciativa maestra: ' + masterResult.error
      };
    }
    
    const idIniciativa = masterResult.id_iniciativa;
    console.log(`ID de iniciativa generado: ${idIniciativa}`);
    
    // PASO 2: Insertar en t_f1
    const f1Result = insertPhase1Data(idIniciativa, {
      f1_problema_dolor: fullData.f1_problema_dolor,
      f1_metrica_dolor: fullData.f1_metrica_dolor,
      f1_unidad_metrica: fullData.f1_unidad_metrica,
      f1_proceso_solucion: fullData.f1_proceso_solucion,
      f1_volumen_mensual: fullData.f1_volumen_mensual,
      f1_usuario_final: fullData.f1_usuario_final
    });
    
    if (!f1Result.success) {
      // Rollback: eliminar master
      deleteMasterInitiative(idIniciativa);
      return {
        success: false,
        error: 'Error al crear Fase 1: ' + f1Result.error
      };
    }
    
    // PASO 3: Insertar en t_f2
    const f2Result = insertPhase2Data(idIniciativa, {
      f2_responsable_nombre: fullData.f2_responsable_nombre,
      f2_responsable_cargo: fullData.f2_responsable_cargo,
      f2_po_nombre: fullData.f2_po_nombre,
      f2_lider_tecnico_nombre: fullData.f2_lider_tecnico_nombre,
      f2_areas_involucradas: fullData.f2_areas_involucradas
    });
    
    if (!f2Result.success) {
      // Rollback: eliminar master y f1
      deletePhase1Data(idIniciativa);
      deleteMasterInitiative(idIniciativa);
      return {
        success: false,
        error: 'Error al crear Fase 2: ' + f2Result.error
      };
    }
    
    // PASO 4: Insertar en t_f3
    const f3Result = insertPhase3Data(idIniciativa, {
      f3_tipo_solucion: fullData.f3_tipo_solucion,
      f3_infraestructura: fullData.f3_infraestructura,
      f3_capex_cop: fullData.f3_capex_cop,
      f3_opex_anual_cop: fullData.f3_opex_anual_cop,
      f3_observacion_tec: fullData.f3_observacion_tec
    });
    
    if (!f3Result.success) {
      // Rollback: eliminar master, f1 y f2
      deletePhase2Data(idIniciativa);
      deletePhase1Data(idIniciativa);
      deleteMasterInitiative(idIniciativa);
      return {
        success: false,
        error: 'Error al crear Fase 3: ' + f3Result.error
      };
    }
    
    // PASO 5: Insertar en t_f4 (con cálculos automáticos)
    const f4Result = insertPhase4Data(idIniciativa, {
      f4_e1_ahorro_gastos: fullData.f4_e1_ahorro_gastos,
      f4_e2_horas_ahorradas: fullData.f4_e2_horas_ahorradas,
      f4_e2_costo_hora_rol: fullData.f4_e2_costo_hora_rol,
      f4_e3_costo_evitado: fullData.f4_e3_costo_evitado,
      f4_e4_adopcion_pct: fullData.f4_e4_adopcion_pct
    }, fullData.f3_capex_cop);
    
    if (!f4Result.success) {
      // Rollback: eliminar todas las fases anteriores
      deletePhase3Data(idIniciativa);
      deletePhase2Data(idIniciativa);
      deletePhase1Data(idIniciativa);
      deleteMasterInitiative(idIniciativa);
      return {
        success: false,
        error: 'Error al crear Fase 4: ' + f4Result.error
      };
    }
    
    // PASO 6: Actualizar semáforo de viabilidad en master con ROI calculado
    const semaforoViabilidad = calculateSemaforoViabilidad({
      f3_capex_cop: fullData.f3_capex_cop,
      f4_roi_final: f4Result.calculated.roi_final
    });
    
    updateMasterInitiative(idIniciativa, {
      semaforo_viabilidad: semaforoViabilidad
    });
    
    console.log(`✅ Iniciativa creada exitosamente: ${idIniciativa}`);
    console.log(`   ROI: ${f4Result.calculated.roi_final.toFixed(2)}%`);
    console.log(`   Semáforo: ${semaforoViabilidad}`);
    
    return {
      success: true,
      message: 'Iniciativa creada exitosamente',
      data: {
        id_iniciativa: idIniciativa,
        nombre: fullData.nombre,
        roi_final: f4Result.calculated.roi_final,
        beneficio_bruto: f4Result.calculated.beneficio_bruto,
        beneficio_ajustado: f4Result.calculated.beneficio_ajustado,
        semaforo_viabilidad: semaforoViabilidad
      }
    };
    
  } catch (error) {
    console.error('Error crítico en createMultiPhaseInitiative:', error);
    return {
      success: false,
      error: 'Error crítico al crear iniciativa: ' + error.message
    };
  }
}

/**
 * Obtiene una iniciativa completa con datos de las 5 tablas
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {Object} Iniciativa completa o error
 */
function getFullInitiative(idIniciativa) {
  try {
    // Validar permisos
    const authResult = validateUserAction('view_initiative', { initiativeId: idIniciativa });
    if (!authResult.allowed) {
      return {
        success: false,
        error: authResult.reason
      };
    }
    
    // Obtener datos de cada tabla
    const master = getMasterInitiativeById(idIniciativa);
    if (!master) {
      return {
        success: false,
        error: 'Iniciativa no encontrada'
      };
    }
    
    const f1 = getPhase1Data(idIniciativa);
    const f2 = getPhase2Data(idIniciativa);
    const f3 = getPhase3Data(idIniciativa);
    const f4 = getPhase4Data(idIniciativa);
    
    // Combinar todos los datos
    const fullInitiative = {
      ...master,
      ...f1,
      ...f2,
      ...f3,
      ...f4
    };
    
    return {
      success: true,
      data: fullInitiative
    };
    
  } catch (error) {
    console.error('Error getting full initiative:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtiene todas las iniciativas completas (con joins)
 * @returns {Object} Array de iniciativas o error
 */
function getAllFullInitiatives() {
  try {
    const authResult = validateUserAction('view_initiatives');
    if (!authResult.allowed) {
      return {
        success: false,
        error: authResult.reason
      };
    }
    
    const userInfo = authResult.userInfo;
    const allMaster = getAllMasterInitiatives();
    
    // Filtrar por gerencia si es user (no admin)
    let filteredMaster = allMaster;
    if (!userInfo.isAdmin) {
      filteredMaster = allMaster.filter(init => init.id_gerencia === userInfo.idGerencia);
    }
    
    // Obtener datos completos de cada iniciativa
    const fullInitiatives = filteredMaster.map(master => {
      const f1 = getPhase1Data(master.id_iniciativa) || {};
      const f2 = getPhase2Data(master.id_iniciativa) || {};
      const f3 = getPhase3Data(master.id_iniciativa) || {};
      const f4 = getPhase4Data(master.id_iniciativa) || {};
      
      return {
        ...master,
        ...f1,
        ...f2,
        ...f3,
        ...f4
      };
    });
    
    return {
      success: true,
      data: fullInitiatives
    };
    
  } catch (error) {
    console.error('Error getting all full initiatives:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Actualiza una iniciativa completa
 * @param {string} idIniciativa - ID de la iniciativa
 * @param {Object} fullData - Datos completos actualizados
 * @returns {Object} Resultado de la operación
 */
function updateMultiPhaseInitiative(idIniciativa, fullData) {
  try {
    // Validar permisos
    const authResult = validateUserAction('edit_initiative', { initiativeId: idIniciativa });
    if (!authResult.allowed) {
      return {
        success: false,
        error: authResult.reason
      };
    }
    
    const userInfo = authResult.userInfo;
    
    // Validar datos si están presentes
    if (fullData.nombre || fullData.descripcion || fullData.f1_problema_dolor) {
      const validation = validateMultiPhaseData(fullData);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Errores de validación',
          validationErrors: validation.errors
        };
      }
    }
    
    // Actualizar cada tabla según los datos presentes
    let hasErrors = false;
    const errors = [];
    
    // Actualizar master
    if (fullData.nombre || fullData.descripcion || fullData.estado || fullData.vertical) {
      const masterResult = updateMasterInitiative(idIniciativa, {
        nombre: fullData.nombre,
        descripcion: fullData.descripcion,
        estado: fullData.estado,
        vertical: fullData.vertical,
        observaciones: fullData.observaciones,
        usuario_ult_mod_cc: userInfo.cc,
        usuario_ult_mod_nombre: userInfo.nombre
      });
      if (!masterResult.success) {
        hasErrors = true;
        errors.push('Error actualizando datos maestros: ' + masterResult.error);
      }
    }
    
    // Actualizar f1
    if (fullData.f1_problema_dolor !== undefined) {
      const f1Result = updatePhase1Data(idIniciativa, fullData);
      if (!f1Result.success) {
        hasErrors = true;
        errors.push('Error actualizando Fase 1: ' + f1Result.error);
      }
    }
    
    // Actualizar f2
    if (fullData.f2_responsable_nombre !== undefined) {
      const f2Result = updatePhase2Data(idIniciativa, fullData);
      if (!f2Result.success) {
        hasErrors = true;
        errors.push('Error actualizando Fase 2: ' + f2Result.error);
      }
    }
    
    // Actualizar f3
    if (fullData.f3_tipo_solucion !== undefined) {
      const f3Result = updatePhase3Data(idIniciativa, fullData);
      if (!f3Result.success) {
        hasErrors = true;
        errors.push('Error actualizando Fase 3: ' + f3Result.error);
      }
    }
    
    // Actualizar f4 (recalcula automáticamente)
    if (fullData.f4_e1_ahorro_gastos !== undefined || fullData.f4_e2_horas_ahorradas !== undefined) {
      const f4Result = updatePhase4Data(idIniciativa, fullData, fullData.f3_capex_cop);
      if (!f4Result.success) {
        hasErrors = true;
        errors.push('Error actualizando Fase 4: ' + f4Result.error);
      } else {
        // Actualizar semáforo con nuevo ROI
        const semaforoViabilidad = calculateSemaforoViabilidad({
          f3_capex_cop: fullData.f3_capex_cop,
          f4_roi_final: f4Result.calculated.roi_final
        });
        updateMasterInitiative(idIniciativa, {
          semaforo_viabilidad: semaforoViabilidad
        });
      }
    }
    
    if (hasErrors) {
      return {
        success: false,
        error: 'Errores al actualizar',
        errors: errors
      };
    }
    
    console.log(`✅ Iniciativa actualizada: ${idIniciativa}`);
    
    return {
      success: true,
      message: 'Iniciativa actualizada exitosamente',
      id_iniciativa: idIniciativa
    };
    
  } catch (error) {
    console.error('Error updating multi-phase initiative:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Elimina una iniciativa completa de las 5 tablas (soft delete en master)
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {Object} Resultado de la operación
 */
function deleteMultiPhaseInitiative(idIniciativa) {
  try {
    // Validar permisos (solo admins)
    const authResult = validateUserAction('delete_initiative', { initiativeId: idIniciativa });
    if (!authResult.allowed) {
      return {
        success: false,
        error: authResult.reason
      };
    }
    
    // Soft delete en master (marca como inactivo)
    const masterResult = deleteMasterInitiative(idIniciativa);
    if (!masterResult.success) {
      return masterResult;
    }
    
    console.log(`✅ Iniciativa eliminada (soft delete): ${idIniciativa}`);
    
    return {
      success: true,
      message: 'Iniciativa eliminada exitosamente',
      id_iniciativa: idIniciativa
    };
    
  } catch (error) {
    console.error('Error deleting multi-phase initiative:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

