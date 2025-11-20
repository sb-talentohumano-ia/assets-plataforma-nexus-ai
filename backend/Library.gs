/**
 * ============================================================================
 * NEXUS AI BACKEND LIBRARY
 * ============================================================================
 *
 * Biblioteca principal del backend de Nexus AI
 * Esta biblioteca expone todas las funciones necesarias para el frontend
 *
 * IMPORTANTE: Este archivo debe ser desplegado como una biblioteca de
 * Google Apps Script para ser consumida por el proyecto frontend.
 *
 * Estructura de módulos:
 * - AuthService: Autenticación y autorización
 * - UserService: Gestión de usuarios autorizados desde Google Sheet
 * - Database: Configuración de base de datos
 * - DatabaseService: Operaciones CRUD en base de datos
 * - Initiative: Lógica de negocio de iniciativas
 * - InitiativeController: Controladores de iniciativas
 * - WebController: Bridge entre frontend y backend
 * - constants: Configuraciones y constantes
 *
 * @version 1.1.0
 * @author Nexus AI Team
 * ============================================================================
 */

// ============================================================================
// EXPORTACIÓN DE FUNCIONES PÚBLICAS DE LA BIBLIOTECA
// ============================================================================

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
      fechaProductiva: formData.fechaProductiva,
      estado: formData.estado,
      gerencia: formData.gerencia,
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
    logMessage('info', 'updateInitiativeFromWeb - Datos recibidos', {
      id: id,
      formData: formData
    });

    const initiativeData = {
      name: formData.name,
      description: formData.description,
      doer: formData.doer,
      fechaPedido: formData.fechaPedido,
      fechaProductiva: formData.fechaProductiva,
      estado: formData.estado,
      gerencia: formData.gerencia,
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

    logMessage('info', 'updateInitiativeFromWeb - Datos procesados', {
      initiativeData: initiativeData
    });

    const result = updateExistingInitiative(id, initiativeData);

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
 * Obtiene información del usuario actual para el frontend
 * @returns {string} JSON con la información del usuario
 */
function getUserInfoForWeb() {
  try {
    const userInfo = getCurrentUserInfo();
    return JSON.stringify({
      success: userInfo.isAuthorized,
      data: userInfo,
      error: userInfo.error || null
    });
  } catch (error) {
    return JSON.stringify(handleError(error, 'getUserInfoForWeb'));
  }
}

/**
 * Refresca el cache de usuarios autorizados
 * Útil para administradores después de actualizar la lista
 * @returns {string} JSON con el resultado
 */
function refreshUsersCacheForWeb() {
  try {
    // Solo admins pueden refrescar el cache
    const userInfo = getCurrentUserInfo();
    if (!userInfo.isAdmin) {
      return JSON.stringify({
        success: false,
        error: 'Solo los administradores pueden refrescar el cache de usuarios'
      });
    }

    const result = refreshUsersCache();
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify(handleError(error, 'refreshUsersCacheForWeb'));
  }
}

/**
 * Obtiene estadísticas de usuarios autorizados
 * Solo disponible para administradores
 * @returns {string} JSON con las estadísticas
 */
function getUsersStatsForWeb() {
  try {
    const userInfo = getCurrentUserInfo();
    if (!userInfo.isAdmin) {
      return JSON.stringify({
        success: false,
        error: 'Solo los administradores pueden ver las estadísticas de usuarios'
      });
    }

    const stats = getUsersStats();
    return JSON.stringify({
      success: true,
      data: stats
    });
  } catch (error) {
    return JSON.stringify(handleError(error, 'getUsersStatsForWeb'));
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

/**
 * Obtiene el catálogo de verticales para la web
 * @returns {string} JSON con el listado de verticales
 */
function getVerticalesForWeb() {
  try {
    const verticales = getAllVerticales();
    return JSON.stringify({
      success: true,
      data: verticales
    });
  } catch (error) {
    return JSON.stringify(handleError(error, 'getVerticalesForWeb'));
  }
}

// ============================================================================
// FUNCIONES NUEVAS - SISTEMA MULTI-FASE
// ============================================================================

/**
 * Crea una iniciativa completa usando el sistema multi-fase
 * @param {Object} fullData - Datos completos de las 4 fases
 * @returns {string} JSON con el resultado
 */
function createMultiPhaseInitiativeForWeb(fullData) {
  try {
    const result = createMultiPhaseInitiative(fullData);
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify(handleError(error, 'createMultiPhaseInitiativeForWeb'));
  }
}

/**
 * Obtiene una iniciativa completa con datos de las 5 tablas
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {string} JSON con la iniciativa completa
 */
function getFullInitiativeForWeb(idIniciativa) {
  try {
    const result = getFullInitiative(idIniciativa);
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify(handleError(error, 'getFullInitiativeForWeb'));
  }
}

/**
 * Obtiene todas las iniciativas completas (con datos de las 5 tablas)
 * @returns {string} JSON con las iniciativas
 */
function getAllFullInitiativesForWeb() {
  try {
    const result = getAllFullInitiatives();
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify(handleError(error, 'getAllFullInitiativesForWeb'));
  }
}

/**
 * Actualiza una iniciativa multi-fase
 * @param {string} idIniciativa - ID de la iniciativa
 * @param {Object} fullData - Datos actualizados
 * @returns {string} JSON con el resultado
 */
function updateMultiPhaseInitiativeForWeb(idIniciativa, fullData) {
  try {
    const result = updateMultiPhaseInitiative(idIniciativa, fullData);
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify(handleError(error, 'updateMultiPhaseInitiativeForWeb'));
  }
}

/**
 * Elimina una iniciativa multi-fase
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {string} JSON con el resultado
 */
function deleteMultiPhaseInitiativeForWeb(idIniciativa) {
  try {
    const result = deleteMultiPhaseInitiative(idIniciativa);
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify(handleError(error, 'deleteMultiPhaseInitiativeForWeb'));
  }
}

/**
 * Obtiene las opciones de tipos de solución para la web
 * @returns {string} JSON con los tipos de solución
 */
function getTiposSolucionForWeb() {
  try {
    const tipos = getTiposSolucion();
    return JSON.stringify({
      success: true,
      data: tipos
    });
  } catch (error) {
    return JSON.stringify(handleError(error, 'getTiposSolucionForWeb'));
  }
}

/**
 * Obtiene las opciones de tipos de infraestructura para la web
 * @returns {string} JSON con los tipos de infraestructura
 */
function getTiposInfraestructuraForWeb() {
  try {
    const tipos = getTiposInfraestructura();
    return JSON.stringify({
      success: true,
      data: tipos
    });
  } catch (error) {
    return JSON.stringify(handleError(error, 'getTiposInfraestructuraForWeb'));
  }
}

// ============================================================================
// INFORMACIÓN DE LA BIBLIOTECA
// ============================================================================

/**
 * Retorna información sobre la biblioteca
 * @returns {Object} Información de la biblioteca
 */
function getLibraryInfo() {
  return {
    name: 'NexusBackend',
    version: '1.1.0',
    description: 'Biblioteca backend para Nexus AI - Sistema de priorización de iniciativas',
    modules: [
      'AuthService',
      'UserService',
      'Database',
      'DatabaseService',
      'Initiative',
      'InitiativeController',
      'WebController',
      'Constants'
    ],
    author: 'Nexus AI Team',
    lastUpdated: new Date().toISOString(),
    features: [
      'Autenticación basada en Google Sheet de usuarios',
      'Sistema de roles (admin/user)',
      'Cache de usuarios para optimización',
      'Gestión completa de iniciativas (CRUD)',
      'Matriz de priorización por cuadrantes',
      'Dashboard interactivo'
    ]
  };
}

/**
 * Función de prueba para verificar que la biblioteca está funcionando
 * @returns {Object} Estado de la biblioteca
 */
function testLibrary() {
  try {
    return {
      success: true,
      message: 'Nexus Backend Library está funcionando correctamente',
      info: getLibraryInfo(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
