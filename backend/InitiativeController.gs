/**
 * Controlador para operaciones CRUD de iniciativas
 */

/**
 * Obtiene todas las iniciativas procesadas (filtradas por permisos)
 * @returns {Object} Resultado con las iniciativas
 */
function getInitiatives() {
  try {
    const allInitiatives = getAllProcessedInitiatives();
    const filteredInitiatives = filterInitiativesByPermissions(allInitiatives);

    return {
      success: true,
      data: filteredInitiatives
    };
  } catch (error) {
    return handleError(error, 'getInitiatives');
  }
}

/**
 * Obtiene una iniciativa específica por ID
 * @param {string} id - ID de la iniciativa
 * @returns {Object} Resultado con la iniciativa
 */
function getInitiative(id) {
  try {
    const initiative = getInitiativeById(id);
    if (!initiative) {
      return {
        success: false,
        error: 'Iniciativa no encontrada'
      };
    }
    return {
      success: true,
      data: processInitiative(initiative)
    };
  } catch (error) {
    return handleError(error, 'getInitiative');
  }
}

/**
 * Crea una nueva iniciativa
 * @param {Object} initiativeData - Datos de la iniciativa
 * @returns {Object} Resultado de la operación
 */
function createNewInitiative(initiativeData) {
  try {
    // Validar permisos
    const authResult = validateUserAction('create_initiative');
    if (!authResult.allowed) {
      return {
        success: false,
        error: authResult.reason
      };
    }

    // Agregar información del usuario creador
    const userInfo = authResult.userInfo;
    initiativeData.usuarioCreadorCc = userInfo.cc;
    initiativeData.usuarioCreadorNombre = userInfo.nombre;
    initiativeData.usuarioUltimaModificacionCc = userInfo.cc;
    initiativeData.usuarioUltimaModificacionNombre = userInfo.nombre;

    // Si no es admin, asignar automáticamente su gerencia
    if (!userInfo.isAdmin && !initiativeData.idGerencia) {
      initiativeData.idGerencia = userInfo.idGerencia;
    }

    // Validar datos
    const validationErrors = validateInitiativeData(initiativeData);
    if (validationErrors.length > 0) {
      logMessage('error', 'Errores de validación', { errors: validationErrors, data: initiativeData });
      return {
        success: false,
        error: 'Datos inválidos: ' + validationErrors.join(', '),
        validationErrors: validationErrors
      };
    }

    const result = createInitiative(initiativeData);
    if (result.success) {
      logMessage('info', 'Nueva iniciativa creada', { id: result.initiative.id, user: userInfo.nombre });
      return {
        success: true,
        data: processInitiative(result.initiative),
        message: 'Iniciativa creada exitosamente'
      };
    } else {
      return result;
    }
  } catch (error) {
    return handleError(error, 'createNewInitiative');
  }
}

/**
 * Actualiza una iniciativa existente
 * @param {string} id - ID de la iniciativa
 * @param {Object} initiativeData - Datos actualizados
 * @returns {Object} Resultado de la operación
 */
function updateExistingInitiative(id, initiativeData) {
  try {
    // Validar permisos
    const authResult = validateUserAction('edit_initiative', { initiativeId: id });
    if (!authResult.allowed) {
      return {
        success: false,
        error: authResult.reason
      };
    }

    // Agregar información del usuario que modifica
    const userInfo = authResult.userInfo;
    initiativeData.usuarioUltimaModificacionCc = userInfo.cc;
    initiativeData.usuarioUltimaModificacionNombre = userInfo.nombre;

    // Validar datos
    const validationErrors = validateInitiativeData(initiativeData);
    if (validationErrors.length > 0) {
      logMessage('error', 'Errores de validación', { errors: validationErrors, data: initiativeData });
      return {
        success: false,
        error: 'Datos inválidos: ' + validationErrors.join(', '),
        validationErrors: validationErrors
      };
    }

    const result = updateInitiative(id, initiativeData);
    if (result.success) {
      logMessage('info', 'Iniciativa actualizada', { id: id, user: userInfo.nombre });
      return {
        success: true,
        data: processInitiative(result.initiative),
        message: 'Iniciativa actualizada exitosamente'
      };
    } else {
      return result;
    }
  } catch (error) {
    return handleError(error, 'updateExistingInitiative');
  }
}

/**
 * Elimina una iniciativa
 * @param {string} id - ID de la iniciativa
 * @returns {Object} Resultado de la operación
 */
function deleteExistingInitiative(id) {
  try {
    // Validar permisos
    const authResult = validateUserAction('delete_initiative', { initiativeId: id });
    if (!authResult.allowed) {
      return {
        success: false,
        error: authResult.reason
      };
    }

    const result = deleteInitiative(id);
    if (result.success) {
      logMessage('info', 'Iniciativa eliminada', { id: id });
      return {
        success: true,
        message: 'Iniciativa eliminada exitosamente'
      };
    } else {
      return result;
    }
  } catch (error) {
    return handleError(error, 'deleteExistingInitiative');
  }
}

/**
 * Obtiene estadísticas del dashboard
 * @returns {Object} Estadísticas del dashboard
 */
function getDashboardStats() {
  try {
    return {
      success: true,
      data: {
        quadrantStats: getQuadrantStats(),
        totalInitiatives: getAllProcessedInitiatives().length,
        userInfo: getUserInfo()
      }
    };
  } catch (error) {
    return handleError(error, 'getDashboardStats');
  }
}

/**
 * Obtiene configuración de la aplicación
 * @returns {Object} Configuración de la aplicación
 */
function getAppConfig() {
  try {
    return {
      success: true,
      data: {
        quadrantConfig: getQuadrantConfig(),
        userInfo: getUserInfo(),
        criteriaLabels: getCriteriaLabels()
      }
    };
  } catch (error) {
    return handleError(error, 'getAppConfig');
  }
}

/**
 * Obtiene el catálogo de gerencias
 * @returns {Object} Resultado con el listado de gerencias
 */
function getGerencias() {
  try {
    const gerencias = getAllGerencias();
    return {
      success: true,
      data: gerencias
    };
  } catch (error) {
    return handleError(error, 'getGerencias');
  }
}

/**
 * Obtiene el catálogo de procesos
 * @returns {Object} Resultado con el listado de procesos
 */
function getProcesos() {
  try {
    const procesos = getAllProcesos();
    return {
      success: true,
      data: procesos
    };
  } catch (error) {
    return handleError(error, 'getProcesos');
  }
}