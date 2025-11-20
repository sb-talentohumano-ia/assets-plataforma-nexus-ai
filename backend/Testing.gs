/**
 * Funciones de Testing para Nexus AI
 * Permite probar la autenticación y otras funcionalidades del sistema
 */

/**
 * Test completo del sistema de autenticación de usuarios
 * Prueba todas las funciones relacionadas con usuarios
 * @returns {Object} Resultados detallados de todos los tests
 */
function testUserAuthentication() {
  const results = {
    timestamp: new Date().toISOString(),
    success: true,
    tests: []
  };

  console.log('========================================');
  console.log('NEXUS AI - TEST DE AUTENTICACIÓN');
  console.log('========================================\n');

  try {
    // Test 1: Obtener usuario actual
    console.log('Test 1: Obtener usuario actual');
    const currentUser = getCurrentUser();
    results.tests.push({
      name: 'getCurrentUser',
      success: !!currentUser,
      result: currentUser,
      message: currentUser ? `Usuario actual: ${currentUser}` : 'No se pudo obtener el usuario'
    });
    console.log(`✓ Usuario: ${currentUser}\n`);

    // Test 2: Cargar usuarios autorizados
    console.log('Test 2: Cargar usuarios autorizados desde Google Sheet');
    const users = loadAuthorizedUsers();
    const testResult2 = users && users.length > 0;
    results.tests.push({
      name: 'loadAuthorizedUsers',
      success: testResult2,
      result: {
        totalUsers: users ? users.length : 0,
        sampleUser: users && users.length > 0 ? users[0] : null
      },
      message: testResult2 ? `✓ ${users.length} usuarios cargados` : '✗ No se pudieron cargar usuarios'
    });
    console.log(`${testResult2 ? '✓' : '✗'} Total usuarios: ${users ? users.length : 0}\n`);

    if (!testResult2) {
      results.success = false;
      return results;
    }

    // Test 3: Verificar autorización del usuario actual
    console.log('Test 3: Verificar si el usuario actual está autorizado');
    const isAuthorized = isUserAuthorized(currentUser);
    results.tests.push({
      name: 'isUserAuthorized',
      success: true,
      result: isAuthorized,
      message: isAuthorized ? '✓ Usuario autorizado' : '✗ Usuario NO autorizado'
    });
    console.log(`${isAuthorized ? '✓' : '✗'} Usuario ${currentUser} ${isAuthorized ? 'SÍ' : 'NO'} está autorizado\n`);

    // Test 4: Obtener tipo de usuario
    console.log('Test 4: Obtener tipo de usuario (admin/user)');
    const userType = getUserType(currentUser);
    results.tests.push({
      name: 'getUserType',
      success: !!userType,
      result: userType,
      message: userType ? `✓ Tipo de usuario: ${userType}` : '✗ No se pudo determinar el tipo'
    });
    console.log(`${userType ? '✓' : '✗'} Tipo: ${userType || 'N/A'}\n`);

    // Test 5: Verificar si es administrador
    console.log('Test 5: Verificar si el usuario es administrador');
    const isAdminUser = isCurrentUserAdmin();
    results.tests.push({
      name: 'isCurrentUserAdmin',
      success: true,
      result: isAdminUser,
      message: isAdminUser ? '✓ Usuario es ADMINISTRADOR' : '✓ Usuario es REGULAR'
    });
    console.log(`${isAdminUser ? '✓' : '○'} ${isAdminUser ? 'ADMINISTRADOR' : 'Usuario regular'}\n`);

    // Test 6: Obtener información completa del usuario
    console.log('Test 6: Obtener información completa del usuario');
    const userInfo = getUserInfo(currentUser);
    const testResult6 = userInfo && userInfo.isAuthorized;
    results.tests.push({
      name: 'getUserInfo',
      success: testResult6,
      result: userInfo,
      message: testResult6 ? '✓ Información completa obtenida' : '✗ No se pudo obtener información'
    });
    console.log(testResult6 ? '✓' : '✗', 'Información del usuario:');
    console.log(JSON.stringify(userInfo, null, 2), '\n');

    // Test 7: Obtener estadísticas de usuarios
    console.log('Test 7: Obtener estadísticas de usuarios autorizados');
    const stats = getUsersStats();
    const testResult7 = stats && !stats.error;
    results.tests.push({
      name: 'getUsersStats',
      success: testResult7,
      result: stats,
      message: testResult7 ? `✓ ${stats.total} usuarios (${stats.admins} admins, ${stats.users} regulares)` : '✗ Error al obtener estadísticas'
    });
    if (testResult7) {
      console.log('✓ Estadísticas:');
      console.log(`  - Total usuarios: ${stats.total}`);
      console.log(`  - Administradores: ${stats.admins}`);
      console.log(`  - Usuarios regulares: ${stats.users}`);
      console.log(`  - Desde cache: ${stats.fromCache ? 'Sí' : 'No'}`);
      console.log(`  - Admins: ${stats.adminEmails.join(', ')}\n`);
    } else {
      console.log('✗ Error:', stats.error, '\n');
    }

    // Test 8: Validar acciones según permisos
    console.log('Test 8: Validar permisos para diferentes acciones');
    const actions = [
      { name: 'create_initiative', label: 'Crear iniciativa' },
      { name: 'edit_initiative', label: 'Editar iniciativa', data: { initiativeId: 'test-123' } },
      { name: 'delete_initiative', label: 'Eliminar iniciativa', data: { initiativeId: 'test-123' } },
      { name: 'modify_scores', label: 'Modificar scores' }
    ];

    const permissionsResults = actions.map(action => {
      const validation = validateUserAction(action.name, action.data || {});
      console.log(`  ${validation.allowed ? '✓' : '✗'} ${action.label}: ${validation.allowed ? 'PERMITIDO' : 'DENEGADO'}`);
      if (!validation.allowed) {
        console.log(`    Razón: ${validation.reason}`);
      }
      return {
        action: action.label,
        allowed: validation.allowed,
        reason: validation.reason
      };
    });

    results.tests.push({
      name: 'validateUserAction',
      success: true,
      result: permissionsResults,
      message: '✓ Validación de permisos completada'
    });
    console.log();

    // Test 9: Refrescar cache de usuarios
    console.log('Test 9: Refrescar cache de usuarios');
    const refreshResult = refreshUsersCache();
    const testResult9 = refreshResult && refreshResult.success;
    results.tests.push({
      name: 'refreshUsersCache',
      success: testResult9,
      result: refreshResult,
      message: testResult9 ? '✓ Cache refrescado exitosamente' : '✗ Error al refrescar cache'
    });
    console.log(`${testResult9 ? '✓' : '✗'} ${refreshResult.message}`);
    if (testResult9) {
      console.log(`  Usuarios en cache: ${refreshResult.count}\n`);
    }

  } catch (error) {
    console.error('✗ ERROR EN LOS TESTS:', error.message);
    results.success = false;
    results.error = error.message;
    results.stack = error.stack;
  }

  // Resumen final
  console.log('========================================');
  console.log('RESUMEN DE TESTS');
  console.log('========================================');
  const totalTests = results.tests.length;
  const successfulTests = results.tests.filter(t => t.success).length;
  const failedTests = totalTests - successfulTests;

  console.log(`Total tests: ${totalTests}`);
  console.log(`Exitosos: ${successfulTests}`);
  console.log(`Fallidos: ${failedTests}`);
  console.log(`Estado general: ${results.success ? '✓ ÉXITO' : '✗ FALLÓ'}`);
  console.log('========================================\n');

  results.summary = {
    total: totalTests,
    successful: successfulTests,
    failed: failedTests,
    successRate: `${((successfulTests / totalTests) * 100).toFixed(1)}%`
  };

  return results;
}

/**
 * Test rápido de autenticación - Solo verifica usuario actual
 * @returns {Object} Resultado del test rápido
 */
function quickAuthTest() {
  try {
    const currentUser = getCurrentUser();
    const isAuthorized = isUserAuthorized(currentUser);
    const userType = getUserType(currentUser);
    const isAdmin = isCurrentUserAdmin();

    return {
      success: true,
      user: currentUser,
      authorized: isAuthorized,
      userType: userType,
      isAdmin: isAdmin,
      message: `Usuario ${currentUser} - ${isAuthorized ? 'Autorizado' : 'NO Autorizado'} - Tipo: ${userType || 'N/A'}`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test de configuración de base de datos de usuarios
 * @returns {Object} Resultado del test de configuración
 */
function testUsersDatabase() {
  try {
    console.log('Test de configuración de base de datos de usuarios\n');

    // Verificar acceso a la sheet
    const sheet = getUsersDatabase();
    console.log('✓ Acceso a Google Sheet de usuarios exitoso');
    console.log(`  Sheet ID: ${USERS_DATABASE_CONFIG.SHEET_ID}`);
    console.log(`  Sheet Name: ${USERS_DATABASE_CONFIG.SHEET_NAME}`);

    // Obtener información de la sheet
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();

    console.log(`\nDatos de la sheet:`);
    console.log(`  Última fila con datos: ${lastRow}`);
    console.log(`  Última columna: ${lastColumn}`);
    console.log(`  Total usuarios (sin header): ${lastRow - 1}`);

    // Leer headers
    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    console.log(`\nHeaders encontrados:`);
    headers.forEach((header, index) => {
      console.log(`  ${index + 1}. ${header}`);
    });

    return {
      success: true,
      sheetId: USERS_DATABASE_CONFIG.SHEET_ID,
      sheetName: USERS_DATABASE_CONFIG.SHEET_NAME,
      totalRows: lastRow,
      totalUsers: lastRow - 1,
      headers: headers,
      message: 'Configuración de base de datos correcta'
    };
  } catch (error) {
    console.error('✗ Error:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Error al acceder a la base de datos de usuarios'
    };
  }
}
