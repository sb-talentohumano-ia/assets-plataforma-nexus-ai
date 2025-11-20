/**
 * Controlador para interfaz web - Bridge entre frontend y backend
 */

/**
 * Obtiene iniciativas para la interfaz web
 * @returns {string} JSON con las iniciativas
 */
function getInitiativesForWeb() {
  const result = getInitiatives();
  return JSON.stringify(result);
}

/**
 * Crea una iniciativa desde el formulario web
 * @param {Object} formData - Datos del formulario
 * @returns {string} JSON con el resultado
 */
function createInitiativeFromWeb(formData) {
  try {
    const initiativeData = {
      name: formData.name,
      description: formData.description,
      doer: formData.doer,
      fechaPedido: formData.fechaPedido,
      estado: formData.estado,
      idGerencia: formData.idGerencia,
      proceso: formData.proceso,
      oportunidad: formData.oportunidad,
      usuarioFinal: formData.usuarioFinal,
      strategicPillarImpact: parseInt(formData.strategicPillarImpact) || 1,
      painResolutionImpact: parseInt(formData.painResolutionImpact) || 1,
      scopeImpact: parseInt(formData.scopeImpact) || 1,
      complexityViability: parseInt(formData.complexityViability) || 1,
      reusabilityViability: parseInt(formData.reusabilityViability) || 1,
      dataViability: parseInt(formData.dataViability) || 1,
      manualReductionValue: parseInt(formData.manualReductionValue) || 1,
      costReductionValue: parseInt(formData.costReductionValue) || 1,
      exImprovementValue: parseInt(formData.exImprovementValue) || 1,
      manualHoursSaved: formData.manualHoursSaved,
      costSavingAmount: formData.costSavingAmount
    };

    const result = createNewInitiative(initiativeData);
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify(handleError(error, 'createInitiativeFromWeb'));
  }
}

/**
 * Actualiza una iniciativa desde el formulario web
 * @param {string} id - ID de la iniciativa
 * @param {Object} formData - Datos del formulario
 * @returns {string} JSON con el resultado
 */
function updateInitiativeFromWeb(id, formData) {
  try {
    // Log datos recibidos
    logMessage('info', 'updateInitiativeFromWeb - Datos recibidos', { 
      id: id, 
      formData: formData 
    });

    const initiativeData = {
      name: formData.name,
      description: formData.description,
      doer: formData.doer,
      fechaPedido: formData.fechaPedido,
      estado: formData.estado,
      idGerencia: formData.idGerencia,
      proceso: formData.proceso,
      oportunidad: formData.oportunidad,
      usuarioFinal: formData.usuarioFinal,
      strategicPillarImpact: parseInt(formData.strategicPillarImpact) || 1,
      painResolutionImpact: parseInt(formData.painResolutionImpact) || 1,
      scopeImpact: parseInt(formData.scopeImpact) || 1,
      complexityViability: parseInt(formData.complexityViability) || 1,
      reusabilityViability: parseInt(formData.reusabilityViability) || 1,
      dataViability: parseInt(formData.dataViability) || 1,
      manualReductionValue: parseInt(formData.manualReductionValue) || 1,
      costReductionValue: parseInt(formData.costReductionValue) || 1,
      exImprovementValue: parseInt(formData.exImprovementValue) || 1,
      manualHoursSaved: formData.manualHoursSaved,
      costSavingAmount: formData.costSavingAmount
    };

    // Log datos procesados
    logMessage('info', 'updateInitiativeFromWeb - Datos procesados', { 
      initiativeData: initiativeData 
    });

    const result = updateExistingInitiative(id, initiativeData);
    
    // Log resultado
    logMessage('info', 'updateInitiativeFromWeb - Resultado', { 
      result: result 
    });

    return JSON.stringify(result);
  } catch (error) {
    logMessage('error', 'updateInitiativeFromWeb - Error', { 
      error: error.message,
      stack: error.stack 
    });
    return JSON.stringify(handleError(error, 'updateInitiativeFromWeb'));
  }
}

/**
 * Elimina una iniciativa desde la interfaz web
 * @param {string} id - ID de la iniciativa
 * @returns {string} JSON con el resultado
 */
function deleteInitiativeFromWeb(id) {
  try {
    const result = deleteExistingInitiative(id);
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify(handleError(error, 'deleteInitiativeFromWeb'));
  }
}

/**
 * Obtiene una iniciativa para la interfaz web
 * @param {string} id - ID de la iniciativa
 * @returns {string} JSON con el resultado
 */
function getInitiativeFromWeb(id) {
  try {
    const result = getInitiative(id);
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify(handleError(error, 'getInitiativeFromWeb'));
  }
}

/**
 * Obtiene estadísticas del dashboard para la web
 * @returns {string} JSON con las estadísticas
 */
function getDashboardStatsForWeb() {
  const result = getDashboardStats();
  return JSON.stringify(result);
}

/**
 * Obtiene configuración de la aplicación para la web
 * @returns {string} JSON con la configuración
 */
function getAppConfigForWeb() {
  const result = getAppConfig();
  return JSON.stringify(result);
}

/**
 * Obtiene configuración específica del cliente
 * @returns {string} JSON con la configuración del cliente
 */
function getClientConfig() {
  try {
    return JSON.stringify({
      success: true,
      data: {
        userInfo: getCurrentUserInfo(),
        quadrantConfig: getQuadrantConfig(),
        criteriaLabels: getCriteriaLabels()
      }
    });
  } catch (error) {
    return JSON.stringify(handleError(error, 'getClientConfig'));
  }
}

/**
 * Obtiene información del usuario actual para la web
 * @returns {string} JSON con la información del usuario
 */
function getUserInfoForWeb() {
  try {
    const userInfo = getCurrentUserInfo();
    return JSON.stringify({
      success: userInfo.isAuthorized,
      data: userInfo,
      error: userInfo.isAuthorized ? null : 'Usuario no autorizado'
    });
  } catch (error) {
    return JSON.stringify(handleError(error, 'getUserInfoForWeb'));
  }
}

/**
 * Obtiene el catálogo de gerencias para la web
 * @returns {string} JSON con el listado de gerencias
 */
function getGerenciasForWeb() {
  try {
    const result = getGerencias();
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify(handleError(error, 'getGerenciasForWeb'));
  }
}

/**
 * Obtiene el catálogo de procesos para la web
 * @returns {string} JSON con el listado de procesos
 */
function getProcesosForWeb() {
  try {
    const result = getProcesos();
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify(handleError(error, 'getProcesosForWeb'));
  }
}