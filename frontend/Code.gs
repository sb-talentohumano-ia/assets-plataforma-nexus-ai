/**
 * Archivo principal de la aplicación Google Apps Script - Frontend
 * Punto de entrada y configuración de la aplicación web
 *
 * Este archivo actúa como el frontend de la aplicación y consume
 * la biblioteca del backend para todas las operaciones de datos.
 */

/**
 * Función principal para servir la aplicación web
 * @returns {GoogleAppsScript.HTML.HtmlOutput} Output HTML de la aplicación
 */
function doGet() {
  try {
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setTitle('Priorizador Nexus IA');
  } catch (error) {
    console.error('Error serving web app:', error);
    throw error;
  }
}

/**
 * Función para incluir archivos HTML parciales
 * @param {string} filename - Nombre del archivo a incluir
 * @returns {string} Contenido del archivo
 */
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    console.error('Error including file:', { filename, error: error.message });
    throw error;
  }
}

// ============================================================================
// FUNCIONES DE API - BRIDGE HACIA BACKEND LIBRARY
// ============================================================================

/**
 * Obtiene iniciativas para la interfaz web
 * @returns {string} JSON con las iniciativas
 */
function getInitiativesForWeb() {
  try {
    // Aquí se usará la biblioteca de backend cuando esté configurada
    const BackendLib = NexusBackend;
    return BackendLib.getInitiativesForWeb();
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al obtener iniciativas: ' + error.message
    });
  }
}

/**
 * Crea una iniciativa desde el formulario web
 * @param {Object} formData - Datos del formulario
 * @returns {string} JSON con el resultado
 */
function createInitiativeFromWeb(formData) {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.createInitiativeFromWeb(formData);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al crear iniciativa: ' + error.message
    });
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
    const BackendLib = NexusBackend;
    return BackendLib.updateInitiativeFromWeb(id, formData);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al actualizar iniciativa: ' + error.message
    });
  }
}

/**
 * Elimina una iniciativa desde la interfaz web
 * @param {string} id - ID de la iniciativa
 * @returns {string} JSON con el resultado
 */
function deleteInitiativeFromWeb(id) {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.deleteInitiativeFromWeb(id);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al eliminar iniciativa: ' + error.message
    });
  }
}

/**
 * Obtiene una iniciativa para la interfaz web
 * @param {string} id - ID de la iniciativa
 * @returns {string} JSON con el resultado
 */
function getInitiativeFromWeb(id) {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.getInitiativeFromWeb(id);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al obtener iniciativa: ' + error.message
    });
  }
}

/**
 * Obtiene estadísticas del dashboard para la web
 * @returns {string} JSON con las estadísticas
 */
function getDashboardStatsForWeb() {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.getDashboardStatsForWeb();
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al obtener estadísticas: ' + error.message
    });
  }
}

/**
 * Obtiene configuración de la aplicación para la web
 * @returns {string} JSON con la configuración
 */
function getAppConfigForWeb() {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.getAppConfigForWeb();
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al obtener configuración: ' + error.message
    });
  }
}

/**
 * Obtiene configuración específica del cliente
 * @returns {string} JSON con la configuración del cliente
 */
function getClientConfig() {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.getClientConfig();
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al obtener configuración del cliente: ' + error.message
    });
  }
}

/**
 * Obtiene información del usuario actual
 * @returns {string} JSON con la información del usuario
 */
function getUserInfoForWeb() {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.getUserInfoForWeb();
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al obtener información del usuario: ' + error.message
    });
  }
}

/**
 * Refresca el cache de usuarios autorizados
 * Solo disponible para administradores
 * @returns {string} JSON con el resultado
 */
function refreshUsersCacheForWeb() {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.refreshUsersCacheForWeb();
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al refrescar cache de usuarios: ' + error.message
    });
  }
}

/**
 * Obtiene estadísticas de usuarios autorizados
 * Solo disponible para administradores
 * @returns {string} JSON con las estadísticas
 */
function getUsersStatsForWeb() {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.getUsersStatsForWeb();
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al obtener estadísticas de usuarios: ' + error.message
    });
  }
}

/**
 * Obtiene el catálogo de gerencias
 * @returns {string} JSON con el listado de gerencias
 */
function getGerenciasForWeb() {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.getGerenciasForWeb();
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al obtener gerencias: ' + error.message
    });
  }
}

/**
 * Obtiene el catálogo de procesos
 * @returns {string} JSON con el listado de procesos
 */
function getProcesosForWeb() {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.getProcesosForWeb();
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al obtener procesos: ' + error.message
    });
  }
}

// ============================================================================
// FUNCIONES NUEVAS - SISTEMA MULTI-FASE
// ============================================================================

/**
 * Obtiene el catálogo de verticales
 * @returns {string} JSON con el listado de verticales
 */
function getVerticalesForWeb() {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.getVerticalesForWeb();
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al obtener verticales: ' + error.message
    });
  }
}

/**
 * Obtiene los tipos de solución
 * @returns {string} JSON con los tipos de solución
 */
function getTiposSolucionForWeb() {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.getTiposSolucionForWeb();
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al obtener tipos de solución: ' + error.message
    });
  }
}

/**
 * Obtiene los tipos de infraestructura
 * @returns {string} JSON con los tipos de infraestructura
 */
function getTiposInfraestructuraForWeb() {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.getTiposInfraestructuraForWeb();
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al obtener tipos de infraestructura: ' + error.message
    });
  }
}

/**
 * Crea una iniciativa multi-fase completa
 * @param {Object} fullData - Datos completos de las 4 fases
 * @returns {string} JSON con el resultado
 */
function createMultiPhaseInitiativeForWeb(fullData) {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.createMultiPhaseInitiativeForWeb(fullData);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al crear iniciativa multi-fase: ' + error.message
    });
  }
}

/**
 * Obtiene una iniciativa completa con datos de las 5 tablas
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {string} JSON con la iniciativa completa
 */
function getFullInitiativeForWeb(idIniciativa) {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.getFullInitiativeForWeb(idIniciativa);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al obtener iniciativa completa: ' + error.message
    });
  }
}

/**
 * Obtiene todas las iniciativas completas
 * @returns {string} JSON con las iniciativas
 */
function getAllFullInitiativesForWeb() {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.getAllFullInitiativesForWeb();
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al obtener iniciativas completas: ' + error.message
    });
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
    const BackendLib = NexusBackend;
    return BackendLib.updateMultiPhaseInitiativeForWeb(idIniciativa, fullData);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al actualizar iniciativa multi-fase: ' + error.message
    });
  }
}

/**
 * Elimina una iniciativa multi-fase
 * @param {string} idIniciativa - ID de la iniciativa
 * @returns {string} JSON con el resultado
 */
function deleteMultiPhaseInitiativeForWeb(idIniciativa) {
  try {
    const BackendLib = NexusBackend;
    return BackendLib.deleteMultiPhaseInitiativeForWeb(idIniciativa);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Error al eliminar iniciativa multi-fase: ' + error.message
    });
  }
}