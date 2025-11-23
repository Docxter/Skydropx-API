require('dotenv').config();
const SkydropxClient = require('../../src/clients/javascript/SkydropxClient');

/**
 * Ejemplo: Rastreo de envíos
 * 
 * Este ejemplo muestra cómo:
 * 1. Rastrear un envío con su número de guía
 * 2. Ver el historial de eventos
 * 3. Interpretar los estados del envío
 */

async function main() {
  console.log('🔍 Ejemplo de Rastreo de Envío\n');
  
  const client = new SkydropxClient({
    clientId: process.env.SKYDROPX_CLIENT_ID,
    clientSecret: process.env.SKYDROPX_CLIENT_SECRET,
    environment: process.env.SKYDROPX_ENVIRONMENT || 'sandbox'
  });
  
  try {
    // 1. Autenticar
    await client.authenticate();
    console.log('✅ Autenticado correctamente\n');
    
    // 2. Configurar rastreo
    // Nota: Reemplaza estos valores con un número de rastreo real
    const trackingNumber = process.env.TRACKING_NUMBER || '794874381730';
    const carrierName = process.env.CARRIER_NAME || 'fedex';
    
    console.log(`📝 Rastreando envío:`);
    console.log(`   Número de guía: ${trackingNumber}`);
    console.log(`   Paquetería: ${carrierName.toUpperCase()}\n`);
    
    // 3. Obtener rastreo
    console.log('⏳ Obteniendo información de rastreo...\n');
    const tracking = await client.trackShipment(trackingNumber, carrierName);
    
    if (!tracking.data || tracking.data.length === 0) {
      console.log('ℹ️  No hay eventos de rastreo disponibles aún');
      return;
    }
    
    // 4. Mostrar historial de eventos
    console.log('📋 Historial de eventos:\n');
    console.log('='.repeat(80));
    
    tracking.data.forEach((event, index) => {
      const date = new Date(event.attributes.date);
      const statusIcon = getStatusIcon(event.attributes.status);
      
      console.log(`\n${index + 1}. ${statusIcon} ${event.attributes.description}`);
      console.log(`   📅 Fecha: ${date.toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`);
      console.log(`   📍 Ubicación: ${event.attributes.location}`);
      console.log(`   🏷️  Estado: ${translateStatus(event.attributes.status)}`);
    });
    
    console.log('\n' + '='.repeat(80));
    
    // 5. Estado actual
    const latestEvent = tracking.data[0];
    console.log('\n📊 Estado actual del envío:');
    console.log(`   ${getStatusIcon(latestEvent.attributes.status)} ${latestEvent.attributes.description}`);
    console.log(`   📍 ${latestEvent.attributes.location}`);
    console.log(`   ⏰ ${new Date(latestEvent.attributes.date).toLocaleString('es-MX')}`);
    
    // 6. Interpretación del estado
    console.log('\n💡 Interpretación:');
    const interpretation = interpretStatus(latestEvent.attributes.status);
    console.log(`   ${interpretation}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.details?.status === 404) {
      console.log('\n💡 Posibles razones:');
      console.log('   - El número de rastreo no existe');
      console.log('   - El número de rastreo aún no está activo en el sistema');
      console.log('   - El nombre de la paquetería es incorrecto');
    }
    
    if (error.details) {
      console.error('\n   Detalles:', JSON.stringify(error.details.data, null, 2));
    }
    process.exit(1);
  }
}

/**
 * Obtiene un icono según el estado
 */
function getStatusIcon(status) {
  const icons = {
    'created': '📝',
    'in_transit': '🚚',
    'out_for_delivery': '🏃',
    'last_mile': '🏠',
    'delivered': '✅',
    'exception': '⚠️',
    'failed': '❌',
    'returned': '↩️'
  };
  
  return icons[status] || '📦';
}

/**
 * Traduce el estado al español
 */
function translateStatus(status) {
  const translations = {
    'created': 'Creado',
    'in_transit': 'En tránsito',
    'out_for_delivery': 'En ruta de entrega',
    'last_mile': 'Última milla',
    'delivered': 'Entregado',
    'exception': 'Excepción',
    'failed': 'Fallido',
    'returned': 'Devuelto',
    'pickup': 'Recolectado'
  };
  
  return translations[status] || status;
}

/**
 * Interpreta el estado del envío
 */
function interpretStatus(status) {
  const interpretations = {
    'created': 'El envío ha sido creado y está esperando ser recolectado',
    'pickup': 'El paquete ha sido recolectado por la paquetería',
    'in_transit': 'El paquete está en camino hacia su destino',
    'out_for_delivery': 'El paquete está en el vehículo de reparto y será entregado hoy',
    'last_mile': 'El paquete está en la última etapa de entrega',
    'delivered': '¡El paquete ha sido entregado exitosamente!',
    'exception': 'Ha ocurrido un problema. Contacta a la paquetería',
    'failed': 'La entrega ha fallado. Se intentará nuevamente',
    'returned': 'El paquete está siendo devuelto al remitente'
  };
  
  return interpretations[status] || 'Estado del envío no reconocido';
}

// Ejecutar ejemplo
main();
