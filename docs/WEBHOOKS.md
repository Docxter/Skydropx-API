# Webhooks - Skydropx API

## Resumen

Los webhooks permiten recibir notificaciones en tiempo real cuando ocurren eventos en tu cuenta de Skydropx. En lugar de hacer polling constante a la API, Skydropx envía automáticamente actualizaciones a tu servidor.

## Tipos de Eventos

### 1. Eventos de Envíos (Shipments)

| Evento | Descripción | Cuándo se dispara |
|--------|-------------|-------------------|
| `shipment.created` | Envío creado | Al crear un nuevo envío |
| `shipment.label.generated` | Etiqueta generada | Cuando la etiqueta está lista |
| `shipment.status.updated` | Estado actualizado | Cambio en el estado del envío |
| `shipment.delivered` | Envío entregado | Cuando se entrega el paquete |
| `shipment.cancelled` | Envío cancelado | Al cancelar un envío |
| `shipment.exception` | Incidencia | Problema con el envío |

### 2. Eventos de Paquetes (Packages)

| Evento | Descripción | Cuándo se dispara |
|--------|-------------|-------------------|
| `package.tracking.updated` | Tracking actualizado | Nuevo evento de tracking |
| `package.in_transit` | En tránsito | Paquete recogido y en camino |
| `package.out_for_delivery` | En reparto | En ruta de entrega |
| `package.delivered` | Paquete entregado | Entrega confirmada |
| `package.failed_attempt` | Intento fallido | No se pudo entregar |
| `package.returned` | Devuelto | Paquete regresando al origen |

### 3. Eventos de Recolecciones (Pickups)

| Evento | Descripción | Cuándo se dispara |
|--------|-------------|-------------------|
| `pickup.scheduled` | Recolección programada | Al programar recolección |
| `pickup.in_progress` | En progreso | Mensajero en camino |
| `pickup.completed` | Completada | Paquetes recolectados |
| `pickup.failed` | Fallida | Intento de recolección fallido |
| `pickup.cancelled` | Cancelada | Al cancelar recolección |

### 4. Eventos de Cotizaciones (Quotations)

| Evento | Descripción | Cuándo se dispara |
|--------|-------------|-------------------|
| `quotation.completed` | Cotización completa | Todas las tarifas obtenidas |
| `quotation.rates_available` | Tarifas disponibles | Al menos una tarifa encontrada |

### 5. Eventos de Órdenes (Orders)

| Evento | Descripción | Cuándo se dispara |
|--------|-------------|-------------------|
| `order.created` | Orden creada | Nueva orden de envío |
| `order.updated` | Orden actualizada | Cambios en la orden |
| `order.shipped` | Orden enviada | Guía generada para la orden |

---

## Configuración de Webhooks

### 1. Registrar un Webhook

```http
POST /api/v1/webhooks
Authorization: Bearer {token}
Content-Type: application/json
```

#### Body

```json
{
  "webhook": {
    "url": "https://miservidor.com/webhooks/skydropx",
    "events": [
      "shipment.created",
      "shipment.status.updated",
      "shipment.delivered",
      "package.tracking.updated"
    ],
    "active": true,
    "description": "Webhook para notificaciones de envíos"
  }
}
```

#### Respuesta (201 Created)

```json
{
  "data": {
    "id": "wh_abc123xyz789",
    "type": "webhooks",
    "attributes": {
      "url": "https://miservidor.com/webhooks/skydropx",
      "secret": "whsec_a1b2c3d4e5f6g7h8i9j0",
      "events": [
        "shipment.created",
        "shipment.status.updated",
        "shipment.delivered",
        "package.tracking.updated"
      ],
      "active": true,
      "description": "Webhook para notificaciones de envíos",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

⚠️ **Importante**: Guarda el `secret` de forma segura. Se usa para verificar la autenticidad de los webhooks.

---

### 2. Listar Webhooks

```http
GET /api/v1/webhooks
Authorization: Bearer {token}
```

#### Respuesta (200 OK)

```json
{
  "data": [
    {
      "id": "wh_abc123xyz789",
      "type": "webhooks",
      "attributes": {
        "url": "https://miservidor.com/webhooks/skydropx",
        "events": ["shipment.created", "shipment.status.updated"],
        "active": true,
        "last_triggered_at": "2024-01-15T14:30:00.000Z",
        "success_rate": 98.5
      }
    }
  ]
}
```

---

### 3. Actualizar Webhook

```http
PUT /api/v1/webhooks/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

#### Body

```json
{
  "webhook": {
    "url": "https://miservidor.com/webhooks/skydropx-v2",
    "events": ["shipment.created", "shipment.delivered"],
    "active": true
  }
}
```

---

### 4. Eliminar Webhook

```http
DELETE /api/v1/webhooks/{id}
Authorization: Bearer {token}
```

#### Respuesta (204 No Content)

---

## Estructura de Webhook

### Headers Recibidos

```http
POST /webhooks/skydropx HTTP/1.1
Host: miservidor.com
Content-Type: application/json
X-Skydropx-Event: shipment.status.updated
X-Skydropx-Signature: sha512=abc123...xyz789
X-Skydropx-Webhook-Id: wh_abc123xyz789
X-Skydropx-Timestamp: 1705329000
User-Agent: Skydropx-Webhook/1.0
```

### Payload

```json
{
  "id": "evt_9876xyz",
  "event": "shipment.status.updated",
  "created_at": "2024-01-16T14:30:00.000Z",
  "data": {
    "id": "93774c22-8275-4757-9963-71b79b2e8db7",
    "type": "shipments",
    "attributes": {
      "workflow_status": "delivered",
      "status_detail": "Entregado",
      "tracking_number": "794874381730",
      "carrier_code": "fedex",
      "delivered_at": "2024-01-16T14:30:00.000Z",
      "signed_by": "J. GARCIA"
    }
  }
}
```

---

## Verificación de Firma (HMAC)

Para garantizar que el webhook proviene de Skydropx:

### Algoritmo

```
HMAC-SHA512(webhook_secret, timestamp + "." + payload)
```

### Ejemplo en JavaScript/Node.js

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(req, webhookSecret) {
  const signature = req.headers['x-skydropx-signature'];
  const timestamp = req.headers['x-skydropx-timestamp'];
  const payload = JSON.stringify(req.body);
  
  // Crear firma esperada
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha512', webhookSecret)
    .update(signedPayload)
    .digest('hex');
  
  // Comparar (time-safe)
  return crypto.timingSafeEqual(
    Buffer.from(signature.replace('sha512=', '')),
    Buffer.from(expectedSignature)
  );
}

// Uso en Express
app.post('/webhooks/skydropx', express.json(), (req, res) => {
  const webhookSecret = process.env.SKYDROPX_WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(req, webhookSecret)) {
    console.error('⚠️ Firma inválida');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Procesar webhook
  const event = req.body;
  console.log('✅ Webhook válido:', event.event);
  
  // Tu lógica aquí
  handleWebhookEvent(event);
  
  res.status(200).json({ received: true });
});
```

### Ejemplo en Python

```python
import hmac
import hashlib

def verify_webhook_signature(request, webhook_secret):
    signature = request.headers.get('X-Skydropx-Signature', '')
    timestamp = request.headers.get('X-Skydropx-Timestamp', '')
    payload = request.get_data(as_text=True)
    
    # Crear firma esperada
    signed_payload = f"{timestamp}.{payload}"
    expected_signature = hmac.new(
        webhook_secret.encode(),
        signed_payload.encode(),
        hashlib.sha512
    ).hexdigest()
    
    # Comparar
    return hmac.compare_digest(
        signature.replace('sha512=', ''),
        expected_signature
    )
```

---

## Implementación del Servidor

### Express (Node.js)

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
const WEBHOOK_SECRET = process.env.SKYDROPX_WEBHOOK_SECRET;

// Middleware para verificar firma
function verifyWebhook(req, res, next) {
  const signature = req.headers['x-skydropx-signature'];
  const timestamp = req.headers['x-skydropx-timestamp'];
  
  // Verificar timestamp (prevenir replay attacks)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) { // 5 minutos
    return res.status(400).json({ error: 'Timestamp too old' });
  }
  
  // Verificar firma
  const payload = JSON.stringify(req.body);
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha512', WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');
  
  if (!crypto.timingSafeEqual(
    Buffer.from(signature.replace('sha512=', '')),
    Buffer.from(expectedSignature)
  )) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
}

app.post('/webhooks/skydropx', 
  express.json(),
  verifyWebhook,
  async (req, res) => {
    const event = req.body;
    
    console.log('📨 Webhook recibido:', event.event);
    
    try {
      // Procesar por tipo de evento
      switch (event.event) {
        case 'shipment.created':
          await handleShipmentCreated(event.data);
          break;
        
        case 'shipment.status.updated':
          await handleShipmentStatusUpdated(event.data);
          break;
        
        case 'shipment.delivered':
          await handleShipmentDelivered(event.data);
          break;
        
        case 'package.tracking.updated':
          await handleTrackingUpdated(event.data);
          break;
        
        default:
          console.log('Evento no manejado:', event.event);
      }
      
      // Responder rápido
      res.status(200).json({ received: true });
      
    } catch (error) {
      console.error('Error procesando webhook:', error);
      // Aún así responder 200 para evitar reintentos
      res.status(200).json({ received: true, error: error.message });
    }
  }
);

// Handlers de eventos
async function handleShipmentCreated(data) {
  console.log('Nuevo envío creado:', data.id);
  // Guardar en base de datos, enviar notificación, etc.
}

async function handleShipmentStatusUpdated(data) {
  console.log('Estado actualizado:', data.attributes.workflow_status);
  // Actualizar base de datos, notificar al cliente, etc.
}

async function handleShipmentDelivered(data) {
  console.log('Envío entregado:', data.attributes.tracking_number);
  console.log('Firmado por:', data.attributes.signed_by);
  // Enviar email de confirmación, cerrar orden, etc.
}

async function handleTrackingUpdated(data) {
  console.log('Tracking actualizado:', data.attributes.tracking_number);
  // Actualizar timeline de tracking, notificar cambios, etc.
}

app.listen(3000, () => {
  console.log('Servidor de webhooks escuchando en puerto 3000');
});
```

---

## Reintentos

Skydropx reintenta enviar webhooks si tu servidor no responde:

| Intento | Tiempo de espera |
|---------|------------------|
| 1 | Inmediato |
| 2 | 1 minuto |
| 3 | 5 minutos |
| 4 | 15 minutos |
| 5 | 1 hora |
| 6 | 6 horas |
| 7 | 24 horas |

Después de 7 intentos fallidos, el webhook se desactiva automáticamente.

---

## Mejores Prácticas

### ✅ Recomendado

- **Verificar firma**: Siempre valida la firma HMAC
- **Responder rápido**: Responde 200 en < 5 segundos
- **Procesar async**: Procesa en background
- **Idempotencia**: Maneja duplicados (mismo event ID)
- **Verificar timestamp**: Previene replay attacks
- **Logs detallados**: Registra todos los webhooks
- **Monitoreo**: Alerta si fallan muchos webhooks
- **HTTPS**: Solo endpoints seguros

### ❌ Evitar

- **Procesamiento largo**: No hagas operaciones pesadas antes de responder
- **Sin verificación**: Nunca confíes en webhooks sin verificar firma
- **HTTP**: Usa solo HTTPS en producción
- **Sin reintentos**: Implementa lógica de reintentos en tu lado
- **Sin logs**: Siempre registra para debugging

---

## Testing de Webhooks

### 1. Endpoint de Prueba

Usa herramientas como:
- **ngrok**: `ngrok http 3000` → URL pública temporal
- **webhook.site**: Endpoint de prueba online
- **Postman**: Crear mock server

### 2. Webhook de Prueba Manual

```http
POST /api/v1/webhooks/{id}/test
Authorization: Bearer {token}
```

Envía un webhook de prueba a tu endpoint.

---

## Ejemplos de Payloads

### shipment.created

```json
{
  "event": "shipment.created",
  "data": {
    "id": "93774c22-8275-4757-9963-71b79b2e8db7",
    "type": "shipments",
    "attributes": {
      "workflow_status": "pending",
      "tracking_number": "794874381730",
      "carrier_code": "fedex",
      "total": "246.74",
      "currency": "MXN"
    }
  }
}
```

### package.tracking.updated

```json
{
  "event": "package.tracking.updated",
  "data": {
    "id": "pkg_abc123",
    "type": "packages",
    "attributes": {
      "tracking_number": "794874381730",
      "tracking_status": "in_transit",
      "location": "Querétaro, MX",
      "event_description": "En tránsito",
      "event_datetime": "2024-01-16T10:00:00.000Z"
    }
  }
}
```

### shipment.delivered

```json
{
  "event": "shipment.delivered",
  "data": {
    "id": "93774c22-8275-4757-9963-71b79b2e8db7",
    "type": "shipments",
    "attributes": {
      "workflow_status": "delivered",
      "tracking_number": "794874381730",
      "delivered_at": "2024-01-16T14:30:00.000Z",
      "signed_by": "J. GARCIA",
      "delivery_location": "Ciudad de México, MX"
    }
  }
}
```

---

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| 401 Unauthorized | Firma inválida | Verificar webhook secret |
| 404 Not Found | URL incorrecta | Verificar endpoint |
| 408 Timeout | Respuesta lenta (>30s) | Procesar async |
| 500 Server Error | Error en tu servidor | Revisar logs, corregir bug |

---

## Monitoreo

### Dashboard de Webhooks

En el panel de Skydropx puedes ver:
- Webhooks enviados (últimos 30 días)
- Tasa de éxito
- Tiempos de respuesta
- Errores recientes
- Reintentos

### Alertas

Configura alertas si:
- Tasa de éxito < 95%
- Múltiples reintentos
- Webhook desactivado automáticamente

---

## Recursos

- [Ejemplo Completo](../examples/webhooks/webhook-server.js)
- [Testing con ngrok](https://ngrok.com)
- [Webhook.site](https://webhook.site) - Testing online

---

## Soporte

¿Problemas con webhooks?
- 📧 Email: webhooks@skydropx.com
- 💬 Slack: #api-webhooks
- 📚 Docs: https://help.skydropx.com/webhooks
