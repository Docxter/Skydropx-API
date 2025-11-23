require('dotenv').config();
const SkydropxClient = require('../../src/clients/javascript/SkydropxClient');

/**
 * Ejemplo: Crear una cotización de envío
 * 
 * Este ejemplo muestra cómo:
 * 1. Crear una cotización con direcciones de origen y destino
 * 2. Esperar a que la cotización esté completa
 * 3. Ver y comparar las tarifas disponibles
 */

async function main() {
  console.log('💰 Ejemplo de Cotización de Envío\n');
  
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
    console.log('📝 Creando cotización...');
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
    console.log(`   Estado: ${quotation.is_completed ? 'Completa' : 'Procesando'}`);
    
    // 3. Esperar a que complete (polling)
    console.log('\n⏳ Esperando tarifas de paqueterías...');
    let quotationResult = quotation;
    let attempts = 0;
    const maxAttempts = 15; // 30 segundos máximo
    
    while (!quotationResult.is_completed && attempts < maxAttempts) {
      await sleep(2000); // Esperar 2 segundos
      quotationResult = await client.getQuotation(quotation.id);
      attempts++;
      process.stdout.write('.');
    }
    console.log('');
    
    if (!quotationResult.is_completed) {
      console.log('⚠️  Timeout esperando cotización. Intenta más tarde.');
      return;
    }
    
    // 4. Mostrar resultados
    console.log('\n📊 Tarifas disponibles:\n');
    
    const successfulRates = quotationResult.rates.filter(r => r.success);
    
    if (successfulRates.length === 0) {
      console.log('❌ No se encontraron tarifas disponibles');
      return;
    }
    
    // Ordenar por precio
    successfulRates.sort((a, b) => parseFloat(a.total) - parseFloat(b.total));
    
    successfulRates.forEach((rate, index) => {
      console.log(`${index + 1}. ${rate.provider_display_name} - ${rate.provider_service_name}`);
      console.log(`   💵 Precio: $${rate.total} ${rate.currency_code}`);
      console.log(`   📦 Peso: ${rate.weight} kg`);
      console.log(`   ⏱️  Días de entrega: ${rate.days}`);
      console.log(`   🔒 Asegurable: ${rate.insurable ? 'Sí' : 'No'}`);
      console.log(`   📍 Zona: ${rate.zone || 'N/A'}`);
      console.log(`   🔑 Rate ID: ${rate.id}`);
      
      if (rate.extra_fees && rate.extra_fees.length > 0) {
        console.log('   💸 Cargos extra:');
        rate.extra_fees.forEach(fee => {
          console.log(`      - ${fee.code}: $${fee.value}`);
        });
      }
      
      console.log('');
    });
    
    // 5. Mostrar recomendación
    const cheapestRate = successfulRates[0];
    const fastestRate = successfulRates.sort((a, b) => a.days - b.days)[0];
    
    console.log('💡 Recomendaciones:');
    console.log(`   Más económico: ${cheapestRate.provider_display_name} - $${cheapestRate.total}`);
    console.log(`   Más rápido: ${fastestRate.provider_display_name} - ${fastestRate.days} días`);
    
    // 6. Información de paquetes
    console.log('\n📦 Detalles del paquete:');
    quotationResult.packages.forEach((pkg, index) => {
      console.log(`   Paquete ${pkg.package_number}:`);
      console.log(`      Peso: ${pkg.weight} kg`);
      console.log(`      Dimensiones: ${pkg.length} x ${pkg.width} x ${pkg.height} cm`);
    });
    
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
