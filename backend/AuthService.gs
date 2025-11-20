/**
 * Servicio de autenticación y autorización
 */

/**
 * Obtiene el email del usuario actual
 * @returns {string|null} Email del usuario o null si hay error
 */
function getCurrentUser() {
  try {
    return Session.getActiveUser().getEmail();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Verifica si el usuario actual es administrador
 * @returns {boolean} True si es administrador
 */
function isCurrentUserAdmin() {
  const currentUserEmail = getCurrentUser();
  if (!currentUserEmail) return false;

  const userType = getUserType(currentUserEmail);
  return userType === 'admin';
}

/**
 * Verifica permisos de edición para una iniciativa
 * @param {string} initiativeId - ID de la iniciativa
 * @returns {boolean} True si puede editar
 */
function canEditInitiative(initiativeId) {
  const userInfo = getCurrentUserInfo();

  // Los admins pueden editar todo
  if (userInfo.isAdmin) return true;

  // Los usuarios normales solo pueden editar iniciativas de su gerencia
  const initiative = getInitiativeById(initiativeId);
  if (!initiative) return false;

  return initiative.idGerencia === userInfo.idGerencia;
}

/**
 * Verifica permisos de eliminación
 * @param {string} initiativeId - ID de la iniciativa
 * @returns {boolean} True si puede eliminar
 */
function canDeleteInitiative(initiativeId) {
  return isCurrentUserAdmin();
}

/**
 * Verifica permisos para modificar scores
 * @returns {boolean} True si puede modificar scores
 */
function canModifyScores() {
  return isCurrentUserAdmin();
}

/**
 * Obtiene información del usuario actual para el frontend
 * @returns {Object} Información del usuario
 */
function getCurrentUserInfo() {
  const email = getCurrentUser();
  if (!email) {
    return {
      email: null,
      isAuthorized: false,
      isAdmin: false,
      error: 'No se pudo obtener el usuario actual'
    };
  }

  const userInfo = getUserInfo(email);

  if (!userInfo) {
    return {
      email: email,
      isAuthorized: false,
      isAdmin: false,
      error: 'Usuario no autorizado'
    };
  }

  return userInfo;
}

/**
 * Valida una acción basada en permisos
 * @param {string} action - Acción a validar
 * @param {Object} data - Datos adicionales
 * @returns {Object} Resultado de la validación
 */
function validateUserAction(action, data = {}) {
  const userInfo = getCurrentUserInfo();

  // Verificar que el usuario esté autorizado
  if (!userInfo.isAuthorized) {
    return {
      allowed: false,
      reason: 'Usuario no autorizado para usar la aplicación'
    };
  }

  switch (action) {
    case 'create_initiative':
      return { allowed: true, userInfo: userInfo };

    case 'edit_initiative':
      if (!data.initiativeId) {
        return { allowed: false, reason: 'ID de iniciativa requerido' };
      }
      if (!canEditInitiative(data.initiativeId)) {
        return { allowed: false, reason: 'No tienes permisos para editar esta iniciativa. Solo puedes editar iniciativas de tu gerencia.' };
      }
      return { allowed: true, userInfo: userInfo };

    case 'delete_initiative':
      if (!canDeleteInitiative(data.initiativeId)) {
        return { allowed: false, reason: 'Solo los administradores pueden eliminar iniciativas' };
      }
      return { allowed: true, userInfo: userInfo };

    case 'modify_scores':
      if (!canModifyScores()) {
        return { allowed: false, reason: 'Solo los administradores pueden modificar los scores' };
      }
      return { allowed: true, userInfo: userInfo };

    default:
      return { allowed: false, reason: 'Acción no reconocida' };
  }
}

/**
 * Filtra iniciativas según permisos del usuario
 * @param {Array} initiatives - Lista de iniciativas
 * @returns {Array} Iniciativas filtradas
 */
function filterInitiativesByPermissions(initiatives) {
  const userInfo = getCurrentUserInfo();

  if (!userInfo || !userInfo.isAuthorized) {
    return [];
  }

  // Los admins ven todas las iniciativas
  if (userInfo.isAdmin) {
    return initiatives;
  }

  // Los usuarios normales solo ven las de su gerencia
  return initiatives.filter(initiative => {
    return initiative.idGerencia === userInfo.idGerencia;
  });
}