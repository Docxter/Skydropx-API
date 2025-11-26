#!/usr/bin/env node

/**
 * 🚀 Quick Start - Skydropx API
 * 
 * Este script te ayuda a configurar y probar rápidamente el SDK de Skydropx
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀  SKYDROPX API - QUICK START                         ║
║                                                           ║
║   Este asistente te ayudará a configurar el SDK          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  try {
    console.log('\n📝 Configuración de Credenciales\n');
    console.log('Si aún no tienes credenciales, obtén las tuyas en:');
    console.log('  Sandbox: https://sb-pro.skydropx.com/merchant_stores/applications');
    console.log('  Producción: https://pro.skydropx.com/merchant_stores/applications\n');
    
    // Preguntar por credenciales
    const clientId = await question('🔑 Client ID: ');
    const clientSecret = await question('🔐 Client Secret: ');
    const environment = await question('🌍 Ambiente (sandbox/production) [sandbox]: ') || 'sandbox';
    
    // Crear archivo .env
    const envContent = `# Skydropx API Credentials
SKYDROPX_CLIENT_ID=${clientId}
SKYDROPX_CLIENT_SECRET=${clientSecret}
SKYDROPX_ENVIRONMENT=${environment}

# Webhook Configuration (opcional)
SKYDROPX_WEBHOOK_SECRET=
WEBHOOK_PORT=3000
`;
    
    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Archivo .env creado exitosamente\n');
    
    // Probar la conexión
    console.log('🧪 Probando conexión con la API...\n');
    
    require('dotenv').config();
    const SkydropxClient = require('./src/clients/javascript/SkydropxClient');
    
    const client = new SkydropxClient({
      clientId: process.env.SKYDROPX_CLIENT_ID,
      clientSecret: process.env.SKYDROPX_CLIENT_SECRET,
      environment: process.env.SKYDROPX_ENVIRONMENT
    });
    
    try {
      const tokenInfo = await client.authenticate();
      console.log('✅ Autenticación exitosa!');
      console.log(`   Token expira en: ${tokenInfo.expires_in / 3600} horas\n`);
      
      // Mostrar información del cliente
      const clientInfo = client.getClientInfo();
      console.log('📊 Información del cliente:');
      console.log(`   Environment: ${clientInfo.environment}`);
      console.log(`   Base URL: ${clientInfo.baseUrl}`);
      console.log(`   Token válido: ${clientInfo.hasValidToken ? '✅' : '❌'}\n`);
      
      // Preguntar si quiere crear un envío de prueba
      const testShipment = await question('¿Deseas crear una cotización de prueba? (s/n) [n]: ');
      
      if (testShipment.toLowerCase() === 's') {
        console.log('\n💰 Creando cotización de prueba...\n');
        
        const quotation = await client.createQuotation({
          address_from: {
            country_code: 'MX',
            postal_code: '64000',
            area_level1: 'Nuevo León',
            area_level2: 'Monterrey',
            area_level3: 'Centro'
          },
          address_to: {
            country_code: 'MX',
            postal_code: '01000',
            area_level1: 'Ciudad de México',
            area_level2: 'Álvaro Obregón',
            area_level3: 'Santa Fe'
          },
          packages: [{
            weight: 2.5,
            length: 30,
            width: 20,
            height: 15
          }]
        });
        
        console.log(`✅ Cotización creada: ${quotation.id}`);
        console.log('⏳ Esperando tarifas (esto puede tomar 5-10 segundos)...\n');
        
        // Polling para obtener tarifas
        let attempts = 0;
        let quotationResult = quotation;
        
        while (!quotationResult.is_completed && attempts < 15) {
          await sleep(2000);
          quotationResult = await client.getQuotation(quotation.id);
          attempts++;
          process.stdout.write('.');
        }
        
        console.log(' ✅\n');
        
        if (quotationResult.rates && quotationResult.rates.length > 0) {
          const successfulRates = quotationResult.rates.filter(r => r.success);
          
          console.log(`📊 Se encontraron ${successfulRates.length} tarifas:\n`);
          
          successfulRates
            .sort((a, b) => parseFloat(a.total) - parseFloat(b.total))
            .slice(0, 5)
            .forEach((rate, index) => {
              console.log(`   ${index + 1}. ${rate.provider_display_name} - ${rate.provider_service_name}`);
              console.log(`      💵 $${rate.total} ${rate.currency_code}`);
              console.log(`      📅 ${rate.days} días de entrega`);
              console.log('');
            });
        }
      }
      
      // Mostrar próximos pasos
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✅  CONFIGURACIÓN COMPLETADA                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

📚 Próximos pasos:

1. 📖 Lee la documentación:
   - docs/AUTH.md - Autenticación
   - docs/QUOTATIONS.md - Cotizaciones
   - docs/SHIPMENTS.md - Envíos
   - docs/guides/FIRST_SHIPMENT.md - Tu primer envío

2. 🧪 Prueba los ejemplos:
   node examples/auth/authenticate.js
   node examples/quotations/create-quotation.js
   node examples/shipments/create-shipment.js

3. 📮 Usa Postman:
   - Importa postman/Skydropx_API.postman_collection.json
   - Importa postman/Skydropx_Sandbox.postman_environment.json

4. 🔔 Configura webhooks:
   node examples/webhooks/webhook-server.js

5. 📚 Consulta la documentación oficial:
   https://app.skydropx.com/es-MX/api-docs

¿Necesitas ayuda?
  📧 api@skydropx.com
  💬 https://help.skydropx.com
  🐙 https://github.com/Docxter/Skydropx-API-sdk

¡Feliz desarrollo! 🚀
`);
      
    } catch (error) {
      console.error('\n❌ Error de autenticación:', error.message);
      console.error('\nVerifica tus credenciales y vuelve a intentar.');
      console.error('Puedes editar el archivo .env manualmente si lo prefieres.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ejecutar
main();
