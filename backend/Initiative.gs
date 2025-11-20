/**
 * Modulo de logica de negocio para iniciativas
 * Incluye procesamiento, calculo de scores y determinacion de cuadrantes
 */

/**
 * Obtiene la fecha actual en formato colombiano
 * @returns {string} Fecha en formato DD-MM-YYYY HH:MM:SS (zona horaria Bogota)
 */
function getCurrentColombiaDate() {
  const date = new Date();
  const colombiaDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  
  const day = colombiaDate.getDate().toString().padStart(2, '0');
  const month = (colombiaDate.getMonth() + 1).toString().padStart(2, '0');
  const year = colombiaDate.getFullYear();
  const hours = colombiaDate.getHours().toString().padStart(2, '0');
  const minutes = colombiaDate.getMinutes().toString().padStart(2, '0');
  const seconds = colombiaDate.getSeconds().toString().padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Genera un ID único para iniciativas con formato combinado
 * Formato: {id_gerencia}-{id_proceso}-{cc_creador}-{fecha_hora}
 * Ejemplo: VPTH-PO_9-1031125052-20241114153045
 * 
 * @param {string} idGerencia - ID de la gerencia
 * @param {string} idProceso - ID del proceso
 * @param {string} ccCreador - CC del usuario creador
 * @returns {string} ID único combinado
 */
function generateUniqueId(idGerencia, idProceso, ccCreador) {
  try {
    // Validar parámetros requeridos
    if (!idGerencia || !idProceso || !ccCreador) {
      throw new Error('Se requieren idGerencia, idProceso y ccCreador para generar el ID');
    }

    // Obtener fecha y hora actual en zona horaria de Colombia
    const date = new Date();
    const colombiaDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    
    // Formatear fecha y hora: YYYYMMDDHHMMSS (sin separadores)
    const year = colombiaDate.getFullYear();
    const month = (colombiaDate.getMonth() + 1).toString().padStart(2, '0');
    const day = colombiaDate.getDate().toString().padStart(2, '0');
    const hours = colombiaDate.getHours().toString().padStart(2, '0');
    const minutes = colombiaDate.getMinutes().toString().padStart(2, '0');
    const seconds = colombiaDate.getSeconds().toString().padStart(2, '0');
    const milliseconds = colombiaDate.getMilliseconds().toString().padStart(3, '0');
    
    // Incluir milisegundos para evitar colisiones si se crean múltiples iniciativas en el mismo segundo
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;

    // Generar el ID completo: gerencia-proceso-cc-timestamp
    return `${idGerencia}-${idProceso}-${ccCreador}-${timestamp}`;
  } catch (error) {
    console.error('Error generating unique ID:', error);
    // Fallback a formato con timestamp en caso de error
    return `INI-${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Calcula el score de impacto de una iniciativa
 * @param {Object} initiative - La iniciativa
 * @returns {number} Score de impacto (1-5)
 */
function _calculateImpactScore(initiative) {
  const strategicPillar = parseInt(initiative.strategicPillarImpact) || 1;
  const painResolution = parseInt(initiative.painResolutionImpact) || 1;
  const scope = parseInt(initiative.scopeImpact) || 1;

  return (strategicPillar + painResolution + scope) / 3;
}

/**
 * Calcula el score de viabilidad de una iniciativa
 * @param {Object} initiative - La iniciativa
 * @returns {number} Score de viabilidad (1-5)
 */
function _calculateViabilityScore(initiative) {
  const complexity = parseInt(initiative.complexityViability) || 1;
  const reusability = parseInt(initiative.reusabilityViability) || 1;
  const data = parseInt(initiative.dataViability) || 1;

  return (complexity + reusability + data) / 3;
}

/**
 * Calcula el score de valor de una iniciativa
 * @param {Object} initiative - La iniciativa
 * @returns {number} Score de valor (1-5)
 */
function _calculateValueScore(initiative) {
  const manualReduction = parseInt(initiative.manualReductionValue) || 1;
  const costReduction = parseInt(initiative.costReductionValue) || 1;
  const exImprovement = parseInt(initiative.exImprovementValue) || 1;

  return (manualReduction + costReduction + exImprovement) / 3;
}

/**
 * Determina el cuadrante de priorizacion de una iniciativa
 * @param {number} impactScore - Score de impacto
 * @param {number} viabilityScore - Score de viabilidad
 * @returns {string} Nombre del cuadrante
 */
function _determineQuadrant(impactScore, viabilityScore) {
  const quadrantConfig = getQuadrantConfig();

  if (impactScore > 3.5 && viabilityScore > 3.5) {
    return quadrantConfig.quickWin.name;
  } else if (impactScore > 3.5 && viabilityScore <= 3.5) {
    return quadrantConfig.strategic.name;
  } else if (impactScore <= 3.5 && viabilityScore > 3.5) {
    return quadrantConfig.incremental.name;
  } else {
    return quadrantConfig.reconsider.name;
  }
}

/**
 * Procesa una iniciativa individual calculando scores y cuadrante
 * @param {Object} initiative - La iniciativa a procesar
 * @returns {Object} Iniciativa procesada con scores y cuadrante
 */
function processInitiative(initiative) {
  if (!initiative) return null;

  const impactScore = _calculateImpactScore(initiative);
  const viabilityScore = _calculateViabilityScore(initiative);
  const valueScore = _calculateValueScore(initiative);
  const quadrant = _determineQuadrant(impactScore, viabilityScore);

  return {
    ...initiative,
    impactScore,
    viabilityScore,
    valueScore,
    quadrant
  };
}

/**
 * Obtiene todas las iniciativas procesadas
 * @returns {Array} Array de iniciativas procesadas
 */
function getAllProcessedInitiatives() {
  const initiatives = loadInitiatives();
  return initiatives.map(initiative => processInitiative(initiative));
}

/**
 * Obtiene estadisticas por cuadrante
 * @returns {Object} Estadisticas de cuadrantes
 */
function getQuadrantStats() {
  const initiatives = getAllProcessedInitiatives();
  const quadrantConfig = getQuadrantConfig();

  const stats = {
    quickWin: 0,
    strategic: 0,
    incremental: 0,
    reconsider: 0
  };

  initiatives.forEach(initiative => {
    switch(initiative.quadrant) {
      case quadrantConfig.quickWin.name:
        stats.quickWin++;
        break;
      case quadrantConfig.strategic.name:
        stats.strategic++;
        break;
      case quadrantConfig.incremental.name:
        stats.incremental++;
        break;
      case quadrantConfig.reconsider.name:
        stats.reconsider++;
        break;
    }
  });

  return stats;
}

/**
 * Convierte una fila de Google Sheets a objeto Initiative
 * @param {Array} row - Fila de datos
 * @returns {Object} Objeto Initiative
 */
function rowToInitiative(row) {
  if (!row || row.length === 0) return null;

  return {
    id: row[0] || '',
    name: row[1] || '',
    description: row[2] || '',
    doer: row[3] || '',
    usuarioCreadorCc: row[4] || '',
    usuarioCreadorNombre: row[5] || '',
    fechaPedido: row[6] || '',
    estado: row[7] || 'sin iniciar',
    idGerencia: row[8] || '',
    proceso: row[9] || '',
    oportunidad: row[10] || '',
    usuarioFinal: row[11] || '',
    strategicPillarImpact: parseInt(row[12]) || 1,
    painResolutionImpact: parseInt(row[13]) || 1,
    scopeImpact: parseInt(row[14]) || 1,
    complexityViability: parseInt(row[15]) || 1,
    reusabilityViability: parseInt(row[16]) || 1,
    dataViability: parseInt(row[17]) || 1,
    manualReductionValue: parseInt(row[18]) || 1,
    costReductionValue: parseInt(row[19]) || 1,
    exImprovementValue: parseInt(row[20]) || 1,
    manualHoursSaved: row[21] || '',
    costSavingAmount: row[22] || '',
    puntajeImpactoValor: row[23] || '',
    puntajeViabilidad: row[24] || '',
    puntajeValorNegocio: row[25] || '',
    puntajeTotal: row[26] || '',
    createdAt: row[27] || getCurrentColombiaDate(),
    updatedAt: row[28] || getCurrentColombiaDate(),
    usuarioUltimaModificacionCc: row[29] || '',
    usuarioUltimaModificacionNombre: row[30] || '',
    activo: row[31] !== false && row[31] !== 'FALSE' && row[31] !== 0,
    observaciones: row[32] || ''
  };
}

/**
 * Convierte un objeto Initiative a fila de Google Sheets
 * @param {Object} initiative - Objeto Initiative
 * @returns {Array} Fila de datos
 */
function initiativeToRow(initiative) {
  // Calcular puntajes automaticamente
  const impactScore = _calculateImpactScore(initiative);
  const viabilityScore = _calculateViabilityScore(initiative);
  const valueScore = _calculateValueScore(initiative);
  const totalScore = (impactScore + viabilityScore + valueScore) / 3;

  return [
    initiative.id || '',
    initiative.name || '',
    initiative.description || '',
    initiative.doer || '',
    initiative.usuarioCreadorCc || '',
    initiative.usuarioCreadorNombre || '',
    initiative.fechaPedido || '',
    initiative.estado || 'sin iniciar',
    initiative.idGerencia || '',
    initiative.proceso || '',
    initiative.oportunidad || '',
    initiative.usuarioFinal || '',
    parseInt(initiative.strategicPillarImpact) || 1,
    parseInt(initiative.painResolutionImpact) || 1,
    parseInt(initiative.scopeImpact) || 1,
    parseInt(initiative.complexityViability) || 1,
    parseInt(initiative.reusabilityViability) || 1,
    parseInt(initiative.dataViability) || 1,
    parseInt(initiative.manualReductionValue) || 1,
    parseInt(initiative.costReductionValue) || 1,
    parseInt(initiative.exImprovementValue) || 1,
    initiative.manualHoursSaved || '',
    initiative.costSavingAmount || '',
    impactScore.toFixed(2),
    viabilityScore.toFixed(2),
    valueScore.toFixed(2),
    totalScore.toFixed(2),
    initiative.createdAt || getCurrentColombiaDate(),
    initiative.updatedAt || getCurrentColombiaDate(),
    initiative.usuarioUltimaModificacionCc || '',
    initiative.usuarioUltimaModificacionNombre || '',
    initiative.activo !== undefined ? initiative.activo : true,
    initiative.observaciones || ''
  ];
}

/**
 * Valida los datos de una iniciativa
 * @param {Object} data - Datos de la iniciativa
 * @returns {Array} Array de errores de validacion
 */
function validateInitiativeData(data) {
  const errors = [];

  // Validar campos requeridos
  if (!data.name || data.name.trim() === '') {
    errors.push('El nombre es requerido');
  }

  if (!data.description || data.description.trim() === '') {
    errors.push('La descripcion es requerida');
  }

  if (!data.doer || data.doer.trim() === '') {
    errors.push('El responsable es requerido');
  }

  if (!data.fechaPedido) {
    errors.push('La fecha de pedido es requerida');
  }

  if (!data.idGerencia || data.idGerencia.trim() === '') {
    errors.push('La gerencia es requerida');
  }

  if (!data.proceso || data.proceso.trim() === '') {
    errors.push('El proceso es requerido');
  }

  if (!data.oportunidad || data.oportunidad.trim() === '') {
    errors.push('La oportunidad es requerida');
  }

  if (!data.usuarioFinal || data.usuarioFinal.trim() === '') {
    errors.push('El usuario final es requerido');
  }

  // Validar scores (deben estar entre 1 y 5)
  const scoreFields = [
    'strategicPillarImpact', 'painResolutionImpact', 'scopeImpact',
    'complexityViability', 'reusabilityViability', 'dataViability',
    'manualReductionValue', 'costReductionValue', 'exImprovementValue'
  ];

  scoreFields.forEach(field => {
    const value = parseInt(data[field]);
    if (isNaN(value) || value < 1 || value > 5) {
      errors.push(`${field} debe ser un valor entre 1 y 5`);
    }
  });

  // Validar estado
  const validStates = ['sin iniciar', 'en desarrollo', 'productivo', 'cancelada', 'eliminada'];
  if (data.estado && !validStates.includes(data.estado.toLowerCase())) {
    errors.push('Estado invalido');
  }

  return errors;
}

/**
 * Registra un mensaje en el log
 * @param {string} level - Nivel del log (info, warning, error)
 * @param {string} message - Mensaje a registrar
 * @param {Object} data - Datos adicionales opcionales
 */
function logMessage(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data
  };

  // Usar console.log apropiado segun el nivel
  switch(level) {
    case 'error':
      console.error(`[${timestamp}] ERROR: ${message}`, data);
      break;
    case 'warning':
      console.warn(`[${timestamp}] WARNING: ${message}`, data);
      break;
    case 'info':
    default:
      console.log(`[${timestamp}] INFO: ${message}`, data);
      break;
  }
}

/**
 * Maneja errores de forma centralizada
 * @param {Error} error - Error capturado
 * @param {string} context - Contexto donde ocurrio el error
 * @returns {Object} Respuesta de error formateada
 */
function handleError(error, context) {
  const errorMessage = error.message || 'Error desconocido';
  const errorStack = error.stack || '';

  logMessage('error', `Error en ${context}`, {
    message: errorMessage,
    stack: errorStack
  });

  return {
    success: false,
    error: `Error en ${context}: ${errorMessage}`
  };
}

/**
 * Obtiene iniciativas de ejemplo para inicializacion
 * @returns {Array} Array de iniciativas de ejemplo
 */
function getInitialInitiatives() {
  return [
    {
      id: generateUniqueId(),
      name: 'Automatizacion de Reportes Mensuales',
      description: 'Sistema para generar reportes mensuales de forma automatica',
      doer: 'Juan Perez',
      fechaPedido: '2024-01-15',
      fechaProductiva: '2024-03-01',
      estado: 'en desarrollo',
      gerencia: 'Gerencia de Tecnologia',
      proceso: 'Reporting',
      oportunidad: 'Reduccion de tiempo en generacion de reportes',
      usuarioFinal: 'Equipo de gestion',
      strategicPillarImpact: 4,
      painResolutionImpact: 5,
      scopeImpact: 4,
      complexityViability: 4,
      reusabilityViability: 5,
      dataViability: 5,
      manualReductionValue: 5,
      costReductionValue: 4,
      exImprovementValue: 4,
      manualHoursSaved: '80 horas/mes',
      costSavingAmount: '10',
      createdAt: getCurrentColombiaDate(),
      updatedAt: getCurrentColombiaDate()
    },
    {
      id: generateUniqueId(),
      name: 'Chatbot de Atencion al Cliente',
      description: 'Bot para responder preguntas frecuentes de clientes',
      doer: 'Maria Gonzalez',
      fechaPedido: '2024-02-01',
      fechaProductiva: '2024-05-15',
      estado: 'sin iniciar',
      gerencia: 'Gerencia de Servicio al Cliente',
      proceso: 'Atencion al Cliente',
      oportunidad: 'Mejora en tiempo de respuesta',
      usuarioFinal: 'Clientes',
      strategicPillarImpact: 5,
      painResolutionImpact: 4,
      scopeImpact: 5,
      complexityViability: 3,
      reusabilityViability: 4,
      dataViability: 4,
      manualReductionValue: 4,
      costReductionValue: 5,
      exImprovementValue: 5,
      manualHoursSaved: '120 horas/mes',
      costSavingAmount: '15',
      createdAt: getCurrentColombiaDate(),
      updatedAt: getCurrentColombiaDate()
    }
  ];
}
