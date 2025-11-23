require('dotenv').config();
const SkydropxClient = require('../../src/clients/javascript/SkydropxClient');

/**
 * Ejemplo: Flujo completo de creación de envío
 * 
 * Este ejemplo muestra el flujo completo:
 * 1. Crear cotización
 * 2. Seleccionar mejor tarifa
 * 3. Crear envío con la tarifa seleccionada
 * 4. Obtener etiqueta de envío
 */

async function main() {
  console.log('📦 Ejemplo de Creación de Envío Completo\n');
  
  const client = new SkydropxClient({
    clientId: process.env.SKYDROPX_CLIENT_ID,
    clientSecret: process.env.SKYDROPX_CLIENT_SECRET,
    environment: process.env.SKYDROPX_ENVIRONMENT || 'sandbox'
  });
  
  try {
    // 1. Autenticar
    await client.authenticate();
    console.log('✅ Autenticado correctamente\n');
    
    // 2. Crear cotización
    console.log('📝 Paso 1: Creando cotización...');
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
        postal_code: '03100',
        area_level1: 'Ciudad de México',
        area_level2: 'Benito Juárez',
        area_level3: 'Del Valle Centro'
      },
      packages: [{
        weight: 1.5,
        length: 25,
        width: 15,
        height: 10
      }]
    });
    
    console.log(`✅ Cotización creada: ${quotation.id}`);
    
    // 3. Esperar a que complete
    console.log('\n⏳ Esperando tarifas...');
    let quotationResult = quotation;
    let attempts = 0;
    
    while (!quotationResult.is_completed && attempts < 15) {
      await sleep(2000);
      quotationResult = await client.getQuotation(quotation.id);
      attempts++;
      process.stdout.write('.');
    }
    console.log(' ✅\n');
    
    // 4. Seleccionar mejor tarifa
    console.log('📝 Paso 2: Seleccionando tarifa...');
    const successfulRates = quotationResult.rates.filter(r => r.success);
    
    if (successfulRates.length === 0) {
      console.log('❌ No hay tarifas disponibles');
      return;
    }
    
    // Seleccionar la más económica
    const selectedRate = successfulRates.sort((a, b) => 
      parseFloat(a.total) - parseFloat(b.total)
    )[0];
    
    console.log(`✅ Tarifa seleccionada: ${selectedRate.provider_display_name}`);
    console.log(`   Servicio: ${selectedRate.provider_service_name}`);
    console.log(`   Precio: $${selectedRate.total} ${selectedRate.currency_code}`);
    console.log(`   Días: ${selectedRate.days}`);
    
    // 5. Crear envío
    console.log('\n📝 Paso 3: Creando envío...');
    const shipment = await client.createShipment({
      rate_id: selectedRate.id,
      printing_format: 'thermal', // o 'standard'
      address_from: {
        name: 'Juan Pérez',
        company: 'Mi Empresa SA de CV',
        street1: 'Av. Constitución 123',
        phone: '8112345678',
        email: 'juan.perez@miempresa.com',
        reference: 'Edificio azul, entrada principal'
      },
      address_to: {
        name: 'María García López',
        company: 'Cliente Premium',
        street1: 'Calle Insurgentes 456 Int 302',
        phone: '5587654321',
        email: 'maria.garcia@cliente.com',
        reference: 'Torre B, piso 3'
      }
    });
    
    console.log('✅ Envío creado exitosamente!\n');
    
    // 6. Mostrar información del envío
    console.log('📊 Información del envío:');
    console.log(`   ID: ${shipment.data.id}`);
    console.log(`   Estado: ${shipment.data.attributes.workflow_status}`);
    console.log(`   Paquetería: ${shipment.data.attributes.carrier_name.toUpperCase()}`);
    console.log(`   Total: $${shipment.data.attributes.total}`);
    console.log(`   Estado de pago: ${shipment.data.attributes.payment_status}`);
    
    // 7. Información del paquete
    const packageInfo = shipment.included.find(item => item.type === 'packages');
    if (packageInfo) {
      console.log('\n📦 Información del paquete:');
      console.log(`   ID: ${packageInfo.id}`);
      console.log(`   Número de rastreo: ${packageInfo.attributes.tracking_number || 'Pendiente'}`);
      console.log(`   Estado: ${packageInfo.attributes.tracking_status || 'Creado'}`);
      console.log(`   Peso: ${packageInfo.attributes.weight} kg`);
      console.log(`   Dimensiones: ${packageInfo.attributes.length}x${packageInfo.attributes.width}x${packageInfo.attributes.height} cm`);
      
      if (packageInfo.attributes.label_url) {
        console.log(`\n🎫 Etiqueta de envío: ${packageInfo.attributes.label_url}`);
        console.log('   ⬇️  Descarga e imprime esta etiqueta para tu paquete');
      }
      
      if (packageInfo.attributes.tracking_url_provider) {
        console.log(`\n🔍 Rastreo: ${packageInfo.attributes.tracking_url_provider}`);
      }
    }
    
    // 8. Direcciones
    const addressFrom = shipment.included.find(item => 
      item.type === 'addresses' && item.attributes.address_type === 'from'
    );
    const addressTo = shipment.included.find(item => 
      item.type === 'addresses' && item.attributes.address_type === 'to'
    );
    
    if (addressFrom && addressTo) {
      console.log('\n📍 Direcciones:');
      console.log(`   Origen: ${addressFrom.attributes.name}, ${addressFrom.attributes.area_level2}, ${addressFrom.attributes.postal_code}`);
      console.log(`   Destino: ${addressTo.attributes.name}, ${addressTo.attributes.area_level2}, ${addressTo.attributes.postal_code}`);
    }
    
    console.log('\n✅ ¡Envío listo para ser recolectado o entregado en sucursal!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) {
      console.error('   Detalles:', JSON.stringify(error.details.data, null, 2));
    }
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ejecutar ejemplo
main();
