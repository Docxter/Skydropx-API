require('dotenv').config();
const express = require('express');
const crypto = require('crypto');

/**
 * Ejemplo: Servidor de webhooks para Skydropx
 * 
 * Este ejemplo muestra cómo:
 * 1. Crear un servidor para recibir webhooks
 * 2. Verificar la firma HMAC para seguridad
 * 3. Procesar diferentes tipos de eventos
 * 4. Responder apropiadamente
 * 
 * IMPORTANTE: Solicita la configuración de webhooks escribiendo a hola@skydropx.com
 */

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3000;
const WEBHOOK_SECRET = process.env.SKYDROPX_WEBHOOK_SECRET;

// Middleware para recibir el body raw (necesario para verificar firma)
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

/**
 * Verifica la firma HMAC del webhook
 */
function verifyHmacSignature(signature, body, secret) {
  if (!signature || !secret) {
    return false;
  }
  
  // Remover el prefijo "HMAC " si existe
  const receivedSignature = signature.replace('HMAC ', '');
  
  // Calcular la firma esperada
  const expectedSignature = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex');
  
  // Comparación segura contra timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Endpoint principal del webhook
 */
app.post('/webhook/skydropx', async (req, res) => {
  console.log('\n📥 Webhook recibido');
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  try {
    // 1. Verificar firma HMAC
    const signature = req.headers['authorization'] || req.headers['Authorization'];
    
    if (WEBHOOK_SECRET) {
      if (!signature) {
        console.log('⚠️  Sin firma de autenticación');
        return res.status(401).json({ error: 'No signature provided' });
      }
      
      if (!verifyHmacSignature(signature, req.rawBody, WEBHOOK_SECRET)) {
        console.log('❌ Firma inválida');
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      console.log('✅ Firma verificada');
    } else {
      console.log('⚠️  WEBHOOK_SECRET no configurado - sin verificación de firma');
    }
    
    // 2. Procesar evento
    const event = req.body;
    const eventType = event.data.type;
    
    console.log(`📦 Tipo de evento: ${eventType}`);
    console.log(`🆔 ID: ${event.data.id}`);
    
    // 3. Manejar según tipo de evento
    switch (eventType) {
      case 'packages':
        await handlePackageEvent(event);
        break;
        
      case 'orders':
        await handleOrderEvent(event);
        break;
        
      case 'quotation':
        await handleQuotationEvent(event);
        break;
        
      case 'rate':
        await handleRateEvent(event);
        break;
        
      default:
        console.log(`ℹ️  Tipo de evento no manejado: ${eventType}`);
    }
    
    // 4. Responder exitosamente
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('❌ Error procesando webhook:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Maneja eventos de paquetes (cambios de estado)
 */
async function handlePackageEvent(event) {
  const attrs = event.data.attributes;
  
  console.log('\n📦 Evento de Paquete:');
  console.log(`   Estado: ${attrs.status}`);
  console.log(`   Número de rastreo: ${attrs.tracking_number}`);
  console.log(`   URL de etiqueta: ${attrs.label_url || 'N/A'}`);
  
  // Aquí puedes:
  // - Actualizar tu base de datos
  // - Notificar al cliente
  // - Enviar email/SMS
  // - Actualizar inventario
  
  if (attrs.status === 'delivered') {
    console.log('   ✅ PAQUETE ENTREGADO - Notificar cliente');
    // await notifyCustomer(attrs.tracking_number, 'delivered');
    // await updateDatabase(event.data.id, { status: 'delivered' });
  }
  
  if (attrs.status === 'exception') {
    console.log('   ⚠️  EXCEPCIÓN - Requiere atención');
    // await notifyAdmin(attrs.tracking_number, 'exception');
  }
  
  // Obtener información del envío relacionado
  if (event.data.relationships?.shipment) {
    const shipmentId = event.data.relationships.shipment.data.id;
    const shipmentUrl = event.data.relationships.shipment.links.related;
    console.log(`   🔗 Envío relacionado: ${shipmentId}`);
    console.log(`   📄 URL: ${shipmentUrl}`);
    
    // Puedes hacer una petición a la API para obtener más detalles:
    // const shipmentDetails = await fetchShipmentDetails(shipmentUrl);
  }
}

/**
 * Maneja eventos de órdenes
 */
async function handleOrderEvent(event) {
  const attrs = event.data.attributes;
  
  console.log('\n📋 Evento de Orden:');
  console.log(`   Estado: ${attrs.status}`);
  console.log(`   Plataforma: ${attrs.platform}`);
  console.log(`   Precio: ${attrs.price}`);
  console.log(`   Estado de pago: ${attrs.payment_status}`);
  
  if (attrs.status === 'sent') {
    console.log('   ✅ ORDEN ENVIADA');
    // await updateOrderStatus(event.data.id, 'sent');
  }
}

/**
 * Maneja eventos de cotizaciones
 */
async function handleQuotationEvent(event) {
  const attrs = event.data.attributes;
  
  console.log('\n💰 Evento de Cotización:');
  console.log(`   Estado: ${attrs.status}`);
  console.log(`   Desde: ${attrs.postal_code_from} (${attrs.area_level1_from})`);
  console.log(`   Hasta: ${attrs.postal_code_to} (${attrs.area_level1_to})`);
  
  // Procesar tarifas incluidas
  if (event.included) {
    const rates = event.included.filter(item => item.type === 'rate');
    console.log(`   📊 Tarifas obtenidas: ${rates.length}`);
    
    rates.forEach(rate => {
      if (rate.attributes.success) {
        console.log(`      - ${rate.attributes.provider_display_name}: $${rate.attributes.total}`);
      }
    });
  }
}

/**
 * Maneja eventos de tarifas
 */
async function handleRateEvent(event) {
  const attrs = event.data.attributes;
  
  console.log('\n💵 Evento de Tarifa:');
  console.log(`   Paquetería: ${attrs.provider_display_name}`);
  console.log(`   Servicio: ${attrs.provider_service_name}`);
  console.log(`   Precio: $${attrs.total} ${attrs.currency_code}`);
  console.log(`   Estado: ${attrs.status}`);
}

/**
 * Endpoint de health check
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    webhookConfigured: !!WEBHOOK_SECRET
  });
});

/**
 * Endpoint para información
 */
app.get('/', (req, res) => {
  res.json({
    service: 'Skydropx Webhook Server',
    version: '1.0.0',
    endpoints: {
      webhook: '/webhook/skydropx',
      health: '/health'
    },
    documentation: 'https://app.skydropx.com/es-MX/api-docs'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n🚀 Servidor de Webhooks iniciado');
  console.log(`📡 Escuchando en puerto: ${PORT}`);
  console.log(`🔗 Endpoint: http://localhost:${PORT}/webhook/skydropx`);
  console.log(`🔒 Verificación HMAC: ${WEBHOOK_SECRET ? 'ACTIVA' : 'DESACTIVADA'}`);
  
  if (!WEBHOOK_SECRET) {
    console.log('\n⚠️  IMPORTANTE: Configura SKYDROPX_WEBHOOK_SECRET en .env para seguridad');
  }
  
  console.log('\n📝 Para configurar webhooks en Skydropx:');
  console.log('   1. Contacta a hola@skydropx.com');
  console.log('   2. Proporciona tu URL pública (usa ngrok para desarrollo)');
  console.log('   3. Recibe tu webhook secret\n');
});

module.exports = app;
