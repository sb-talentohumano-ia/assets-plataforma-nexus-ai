/**
 * Servicio de gestión de usuarios autorizados
 * Maneja la carga, validación y cache de usuarios de la Google Sheet
 */

// Clave para el cache de usuarios
const USERS_CACHE_KEY = 'authorized_users_cache';
const USERS_CACHE_EXPIRATION = 300; // 5 minutos en segundos

/**
 * Carga todos los usuarios autorizados de la Google Sheet
 * Utiliza cache para optimizar performance
 * @returns {Array<Object>} Lista de usuarios autorizados
 */
function loadAuthorizedUsers() {
  try {
    // Intentar obtener del cache primero
    const cache = CacheService.getScriptCache();
    const cachedUsers = cache.get(USERS_CACHE_KEY);

    if (cachedUsers) {
      console.log('Usuarios cargados desde cache');
      return JSON.parse(cachedUsers);
    }

    // Si no hay cache, cargar desde la sheet
    console.log('Cargando usuarios desde Google Sheet');
    const sheet = getUsersDatabase();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      console.warn('No hay usuarios en la base de datos');
      return [];
    }

    // Procesar datos (saltar header)
    const headers = data[0];
    const users = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Saltar filas vacías
      if (!row[3] || row[3].trim() === '') continue; // correo vacío

      const user = {
        cc: row[0]?.toString() || '',
        userType: row[1]?.toString().toLowerCase() || 'user',
        nombre: row[2]?.toString() || '',
        correo: row[3]?.toString().toLowerCase().trim() || '',
        cargo: row[4]?.toString() || '',
        vertical: row[5]?.toString() || '',
        idGerencia: row[6]?.toString() || ''
      };

      users.push(user);
    }

    // Guardar en cache
    cache.put(USERS_CACHE_KEY, JSON.stringify(users), USERS_CACHE_EXPIRATION);
    console.log(`${users.length} usuarios cargados y cacheados`);

    return users;
  } catch (error) {
    console.error('Error cargando usuarios autorizados:', error);
    throw new Error(`No se pudieron cargar los usuarios autorizados: ${error.message}`);
  }
}

/**
 * Refresca el cache de usuarios autorizados
 * Útil cuando se actualiza la lista de usuarios
 */
function refreshUsersCache() {
  try {
    const cache = CacheService.getScriptCache();
    cache.remove(USERS_CACHE_KEY);
    const users = loadAuthorizedUsers();
    console.log(`Cache de usuarios refrescado: ${users.length} usuarios`);
    return {
      success: true,
      message: 'Cache refrescado correctamente',
      count: users.length
    };
  } catch (error) {
    console.error('Error refrescando cache de usuarios:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verifica si un email está en la lista de usuarios autorizados
 * @param {string} email - Email del usuario a verificar
 * @returns {boolean} True si el usuario está autorizado
 */
function isUserAuthorized(email) {
  if (!email) return false;

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const users = loadAuthorizedUsers();

    const isAuthorized = users.some(user => user.correo === normalizedEmail);

    if (!isAuthorized) {
      console.warn(`Usuario no autorizado intentó acceder: ${email}`);
    }

    return isAuthorized;
  } catch (error) {
    console.error('Error verificando autorización de usuario:', error);
    // En caso de error, denegar acceso por seguridad
    return false;
  }
}

/**
 * Obtiene el tipo de usuario (admin o user)
 * @param {string} email - Email del usuario
 * @returns {string|null} 'admin', 'user' o null si no está autorizado
 */
function getUserType(email) {
  if (!email) return null;

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const users = loadAuthorizedUsers();

    const user = users.find(u => u.correo === normalizedEmail);

    if (!user) {
      console.warn(`Usuario no encontrado: ${email}`);
      return null;
    }

    return user.userType === 'admin' ? 'admin' : 'user';
  } catch (error) {
    console.error('Error obteniendo tipo de usuario:', error);
    return null;
  }
}

/**
 * Obtiene información completa del usuario
 * @param {string} email - Email del usuario
 * @returns {Object|null} Objeto con información del usuario o null si no existe
 */
function getUserInfo(email) {
  if (!email) return null;

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const users = loadAuthorizedUsers();

    const user = users.find(u => u.correo === normalizedEmail);

    if (!user) {
      console.warn(`Usuario no encontrado: ${email}`);
      return null;
    }

    return {
      cc: user.cc,
      userType: user.userType,
      nombre: user.nombre,
      correo: user.correo,
      cargo: user.cargo,
      vertical: user.vertical,
      idGerencia: user.idGerencia,
      isAdmin: user.userType === 'admin',
      isAuthorized: true
    };
  } catch (error) {
    console.error('Error obteniendo información de usuario:', error);
    return null;
  }
}

/**
 * Valida que el usuario actual esté autorizado
 * Lanza error si no está autorizado
 * @param {string} email - Email del usuario actual
 * @throws {Error} Si el usuario no está autorizado
 */
function requireAuthorizedUser(email) {
  if (!isUserAuthorized(email)) {
    throw new Error(`Usuario no autorizado: ${email}. Contacte al administrador del sistema.`);
  }
}

/**
 * Obtiene estadísticas de usuarios autorizados
 * Útil para debugging y monitoreo
 * @returns {Object} Estadísticas de usuarios
 */
function getUsersStats() {
  try {
    const users = loadAuthorizedUsers();
    const admins = users.filter(u => u.userType === 'admin');
    const regularUsers = users.filter(u => u.userType !== 'admin');

    return {
      total: users.length,
      admins: admins.length,
      users: regularUsers.length,
      adminEmails: admins.map(u => u.correo),
      fromCache: CacheService.getScriptCache().get(USERS_CACHE_KEY) !== null
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de usuarios:', error);
    return {
      error: error.message
    };
  }
}
