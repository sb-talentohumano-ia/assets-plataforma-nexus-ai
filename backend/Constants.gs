/**
 * Constantes y configuraciones de la aplicación
 */

/**
 * Configuración de cuadrantes de priorización
 */
function getQuadrantConfig() {
  return {
    'quickWin': {
      name: '1. Quick Win (Hacer Ahora)',
      color: '#10B981',
      description: 'Alto impacto y alta viabilidad - Prioridad máxima'
    },
    'strategic': {
      name: '2. Proyecto Estratégico (Planificar)',
      color: '#059669',
      description: 'Alto impacto, baja viabilidad - Requiere planificación'
    },
    'incremental': {
      name: '3. Mejora Incremental (Delegar)',
      color: '#F59E0B',
      description: 'Bajo impacto, alta viabilidad - Para delegar'
    },
    'reconsider': {
      name: '4. Reconsiderar (Evitar)',
      color: '#EF4444',
      description: 'Bajo impacto y baja viabilidad - Evitar o reevaluar'
    }
  };
}

/**
 * Configuración de administración
 * NOTA: Los administradores ahora se leen dinámicamente de la Google Sheet de usuarios
 * con user_type = 'admin'. Ver UserService.gs para más detalles.
 */

/**
 * Etiquetas de criterios para la interfaz
 */
function getCriteriaLabels() {
  return {
    strategicPillarImpact: 'Impacto en Pilar Estratégico',
    painResolutionImpact: 'Resolución de Dolor/Problema',
    scopeImpact: 'Alcance e Impacto',
    complexityViability: 'Viabilidad Técnica/Complejidad',
    reusabilityViability: 'Reutilización/Escalabilidad',
    dataViability: 'Disponibilidad de Datos',
    manualReductionValue: 'Reducción de Trabajo Manual',
    costReductionValue: 'Reducción de Costos',
    exImprovementValue: 'Mejora de Experiencia'
  };
}