require('dotenv').config();
const SkydropxClient = require('../../src/clients/javascript/SkydropxClient');

/**
 * Ejemplo: Autenticación con la API de Skydropx
 * 
 * Este ejemplo muestra cómo:
 * 1. Inicializar el cliente
 * 2. Obtener un token de acceso
 * 3. Verificar la información del token
 * 4. Introspeccionar el token
 */

async function main() {
  console.log('🔐 Ejemplo de Autenticación con Skydropx API\n');
  
  // 1. Inicializar el cliente
  const client = new SkydropxClient({
    clientId: process.env.SKYDROPX_CLIENT_ID,
    clientSecret: process.env.SKYDROPX_CLIENT_SECRET,
    environment: process.env.SKYDROPX_ENVIRONMENT || 'sandbox'
  });
  
  try {
    // 2. Autenticar y obtener token
    console.log('📝 Obteniendo token de acceso...');
    const tokenInfo = await client.authenticate();
    
    console.log('✅ Autenticación exitosa!');
    console.log(`   Token Type: ${tokenInfo.token_type}`);
    console.log(`   Expira en: ${tokenInfo.expires_in} segundos (${Math.floor(tokenInfo.expires_in / 3600)} horas)`);
    console.log(`   Scope: ${tokenInfo.scope || 'default'}`);
    console.log(`   Token: ${tokenInfo.access_token.substring(0, 20)}...`);
    
    // 3. Verificar información del cliente
    console.log('\n📊 Información del cliente:');
    const clientInfo = client.getClientInfo();
    console.log(`   Ambiente: ${clientInfo.environment}`);
    console.log(`   URL Base: ${clientInfo.baseURL}`);
    console.log(`   Token válido: ${clientInfo.hasValidToken ? 'Sí' : 'No'}`);
    console.log(`   Expira: ${clientInfo.tokenExpiresAt?.toLocaleString('es-MX')}`);
    
    // 4. Introspeccionar el token (obtener detalles)
    console.log('\n🔍 Introspección del token:');
    const introspection = await client.introspectToken();
    console.log(`   Activo: ${introspection.active}`);
    console.log(`   Client ID: ${introspection.client_id}`);
    console.log(`   Token Type: ${introspection.token_type}`);
    console.log(`   Creado: ${new Date(introspection.iat * 1000).toLocaleString('es-MX')}`);
    console.log(`   Expira: ${new Date(introspection.exp * 1000).toLocaleString('es-MX')}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) {
      console.error('   Detalles:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

// Ejecutar ejemplo
main();
