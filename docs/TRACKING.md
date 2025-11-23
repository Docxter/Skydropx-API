# Rastreo - Skydropx API

## Resumen

El endpoint de tracking permite rastrear envíos por número de guía y paquetería, obteniendo el historial completo de eventos y el estado actual del paquete.

## Endpoints

### 1. Rastrear Envío

Obtiene el estado y historial de tracking de un envío.

```http
GET /api/v1/tracking?tracking_number={number}&carrier_code={carrier}
Authorization: Bearer {token}
```

#### Parámetros de Query

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `tracking_number` | string | ✅ | Número de guía/rastreo |
| `carrier_code` | string | ✅ | Código de la paquetería |

#### Ejemplo de URL

```
GET /api/v1/tracking?tracking_number=794874381730&carrier_code=fedex
```

#### Respuesta (200 OK)

```json
{
  "data": {
    "id": "trk_abc123xyz789",
    "type": "tracking",
    "attributes": {
      "tracking_number": "794874381730",
      "carrier_code": "fedex",
      "carrier_name": "FedEx",
      "tracking_status": "delivered",
      "status_detail": "Entregado",
      "estimated_delivery_date": "2024-01-16",
      "actual_delivery_date": "2024-01-16T14:30:00.000Z",
      "signed_by": "J. GARCIA",
      "origin": {
        "city": "Monterrey",
        "state": "Nuevo León",
        "country": "MX"
      },
      "destination": {
        "city": "Ciudad de México",
        "state": "Ciudad de México",
        "country": "MX"
      },
      "weight": "2.5",
      "service_type": "Express Saver",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-16T14:30:00.000Z"
    },
    "relationships": {
      "events": {
        "data": [
          {"id": "evt_001", "type": "tracking_events"},
          {"id": "evt_002", "type": "tracking_events"},
          {"id": "evt_003", "type": "tracking_events"}
        ]
      }
    }
  },
  "included": [
    {
      "id": "evt_001",
      "type": "tracking_events",
      "attributes": {
        "status": "delivered",
        "description": "Entregado",
        "location": "Ciudad de México, MX",
        "datetime": "2024-01-16T14:30:00.000Z",
        "signed_by": "J. GARCIA"
      }
    },
    {
      "id": "evt_002",
      "type": "tracking_events",
      "attributes": {
        "status": "out_for_delivery",
        "description": "En ruta de entrega",
        "location": "Ciudad de México, MX",
        "datetime": "2024-01-16T08:00:00.000Z"
      }
    },
    {
      "id": "evt_003",
      "type": "tracking_events",
      "attributes": {
        "status": "in_transit",
        "description": "En tránsito",
        "location": "Querétaro, MX",
        "datetime": "2024-01-15T18:00:00.000Z"
      }
    }
  ]
}
```

---

### 2. Rastrear Múltiples Envíos

Obtiene información de múltiples envíos en una sola petición.

```http
POST /api/v1/tracking/bulk
Authorization: Bearer {token}
Content-Type: application/json
```

#### Body

```json
{
  "trackings": [
    {
      "tracking_number": "794874381730",
      "carrier_code": "fedex"
    },
    {
      "tracking_number": "9876543210",
      "carrier_code": "dhl"
    },
    {
      "tracking_number": "1234567890",
      "carrier_code": "estafeta"
    }
  ]
}
```

#### Respuesta (200 OK)

```json
{
  "data": [
    {
      "tracking_number": "794874381730",
      "carrier_code": "fedex",
      "status": "delivered",
      "success": true
    },
    {
      "tracking_number": "9876543210",
      "carrier_code": "dhl",
      "status": "in_transit",
      "success": true
    },
    {
      "tracking_number": "1234567890",
      "carrier_code": "estafeta",
      "status": "not_found",
      "success": false,
      "error": "Número de guía no encontrado"
    }
  ]
}
```

---

## Estados de Tracking

### tracking_status

| Estado | Descripción | Icono |
|--------|-------------|-------|
| `created` | Etiqueta creada | 📝 |
| `picked_up` | Recolectado | 📦 |
| `in_transit` | En tránsito | 🚚 |
| `out_for_delivery` | En reparto | 🚴 |
| `delivered` | Entregado | ✅ |
| `available_for_pickup` | Disponible en sucursal | 🏪 |
| `failed_attempt` | Intento fallido | ⚠️ |
| `exception` | Incidencia | ❌ |
| `returned_to_sender` | Devuelto | ↩️ |
| `cancelled` | Cancelado | 🚫 |

---

## Códigos de Paqueterías

| Código | Paquetería |
|--------|------------|
| `fedex` | FedEx |
| `dhl` | DHL |
| `estafeta` | Estafeta |
| `sendex` | Sendex |
| `redpack` | Redpack |
| `ups` | UPS |
| `paquetexpress` | PaquetExpress |
| `99minutos` | 99 Minutos |

---

## Ejemplos de Uso

### JavaScript - Rastrear Envío

```javascript
const client = new SkydropxClient({...});
await client.authenticate();

const tracking = await client.trackShipment('794874381730', 'fedex');

console.log('Estado:', tracking.data.attributes.tracking_status);
console.log('Última actualización:', tracking.data.attributes.updated_at);

// Mostrar historial de eventos
const events = tracking.included
  .filter(item => item.type === 'tracking_events')
  .sort((a, b) => new Date(b.attributes.datetime) - new Date(a.attributes.datetime));

console.log('\nHistorial:');
events.forEach(event => {
  const date = new Date(event.attributes.datetime);
  console.log(`${date.toLocaleString()} - ${event.attributes.description}`);
  console.log(`  ${event.attributes.location}`);
});
```

### JavaScript - Estado Simplificado

```javascript
function getStatusIcon(status) {
  const icons = {
    'created': '📝',
    'picked_up': '📦',
    'in_transit': '🚚',
    'out_for_delivery': '🚴',
    'delivered': '✅',
    'exception': '❌'
  };
  return icons[status] || '❓';
}

function getStatusMessage(status) {
  const messages = {
    'created': 'Etiqueta creada',
    'picked_up': 'Paquete recolectado',
    'in_transit': 'En camino',
    'out_for_delivery': 'Salió a entrega',
    'delivered': '¡Entregado!',
    'exception': 'Incidencia'
  };
  return messages[status] || 'Estado desconocido';
}

const tracking = await client.trackShipment('794874381730', 'fedex');
const status = tracking.data.attributes.tracking_status;

console.log(`${getStatusIcon(status)} ${getStatusMessage(status)}`);
```

### JavaScript - Rastreo Múltiple

```javascript
const trackings = [
  { tracking_number: '794874381730', carrier_code: 'fedex' },
  { tracking_number: '9876543210', carrier_code: 'dhl' },
  { tracking_number: '1234567890', carrier_code: 'estafeta' }
];

const results = await client.trackMultipleShipments(trackings);

results.data.forEach(result => {
  if (result.success) {
    console.log(`${result.tracking_number}: ${result.status}`);
  } else {
    console.log(`${result.tracking_number}: Error - ${result.error}`);
  }
});
```

### cURL - Rastrear Envío

```bash
curl -X GET 'https://app.skydropx.com/api/v1/tracking?tracking_number=794874381730&carrier_code=fedex' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### cURL - Rastreo Múltiple

```bash
curl -X POST 'https://app.skydropx.com/api/v1/tracking/bulk' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "trackings": [
      {"tracking_number": "794874381730", "carrier_code": "fedex"},
      {"tracking_number": "9876543210", "carrier_code": "dhl"}
    ]
  }'
```

---

## Eventos de Tracking

### Estructura de Evento

```json
{
  "id": "evt_001",
  "type": "tracking_events",
  "attributes": {
    "status": "in_transit",
    "description": "En tránsito hacia destino",
    "location": "Querétaro, QRO, MX",
    "datetime": "2024-01-15T18:00:00.000Z",
    "checkpoint_status": "IT",
    "substatus": null,
    "signed_by": null
  }
}
```

### Tipos de Eventos Comunes

| Evento | Descripción |
|--------|-------------|
| Label Created | Etiqueta generada |
| Pickup Scheduled | Recolección programada |
| Picked Up | Paquete recolectado |
| In Transit | En tránsito |
| Out for Delivery | En reparto |
| Delivered | Entregado exitosamente |
| Delivery Attempt | Intento de entrega |
| Exception | Incidencia (dirección incorrecta, cerrado, etc) |
| Returned | Devuelto al remitente |

---

## Frecuencia de Actualización

| Paquetería | Frecuencia | Notas |
|------------|-----------|-------|
| FedEx | Tiempo real | Updates cada hora en tránsito |
| DHL | Tiempo real | Updates cada 2-4 horas |
| Estafeta | 30-60 min | Puede haber retrasos |
| UPS | Tiempo real | Updates frecuentes |
| Redpack | 2-4 horas | Updates menos frecuentes |
| 99 Minutos | Tiempo real | Updates cada 15-30 min |

---

## Integración con Webhooks

Para recibir actualizaciones automáticas en lugar de hacer polling:

```json
{
  "event": "tracking.status.updated",
  "data": {
    "tracking_number": "794874381730",
    "carrier_code": "fedex",
    "tracking_status": "delivered",
    "status_detail": "Entregado",
    "delivered_at": "2024-01-16T14:30:00.000Z",
    "signed_by": "J. GARCIA"
  }
}
```

Ver [Documentación de Webhooks](WEBHOOKS.md)

---

## Widget de Tracking

### HTML Embebido

Puedes crear un widget para mostrar tracking en tu sitio:

```html
<div id="tracking-widget">
  <input type="text" id="tracking-number" placeholder="Número de guía">
  <select id="carrier">
    <option value="fedex">FedEx</option>
    <option value="dhl">DHL</option>
    <option value="estafeta">Estafeta</option>
  </select>
  <button onclick="trackShipment()">Rastrear</button>
  <div id="tracking-result"></div>
</div>

<script>
async function trackShipment() {
  const trackingNumber = document.getElementById('tracking-number').value;
  const carrier = document.getElementById('carrier').value;
  
  const response = await fetch(
    `https://app.skydropx.com/api/v1/tracking?tracking_number=${trackingNumber}&carrier_code=${carrier}`,
    {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN'
      }
    }
  );
  
  const data = await response.json();
  const status = data.data.attributes.tracking_status;
  
  document.getElementById('tracking-result').innerHTML = `
    <h3>Estado: ${status}</h3>
    <p>${data.data.attributes.status_detail}</p>
  `;
}
</script>
```

---

## Mejores Prácticas

### ✅ Recomendado

- **Usar webhooks**: Más eficiente que polling constante
- **Cache**: Guarda resultados por 15-30 minutos
- **Manejo de errores**: Algunos carriers tardan en actualizar
- **Rate limiting**: Respeta límite de 2 req/seg
- **Múltiples envíos**: Usa bulk endpoint para varios tracking
- **Mostrar hora**: Incluye fecha/hora en formato local del usuario

### ❌ Evitar

- **Polling agresivo**: No consultar más de 1 vez cada 15 min
- **Sin carrier_code**: Siempre especifica la paquetería
- **Asumir tiempo real**: Puede haber retrasos de 2-4 horas
- **Ignorar eventos**: Revisa el historial completo

---

## Interpretación de Estados

### Estados Positivos

- `delivered` → ✅ Entregado exitosamente
- `out_for_delivery` → 🚴 Llegará hoy
- `in_transit` → 🚚 En camino
- `picked_up` → 📦 Recolectado

### Estados que Requieren Atención

- `failed_attempt` → ⚠️ Contactar al destinatario
- `available_for_pickup` → 🏪 Ir a recoger a sucursal
- `exception` → ❌ Revisar incidencia

### Estados Negativos

- `returned_to_sender` → ↩️ Regresando al origen
- `cancelled` → 🚫 Envío cancelado

---

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `tracking_not_found` | Número no existe | Verificar número y carrier |
| `carrier_not_available` | Carrier inválido | Usar código correcto |
| `no_tracking_info` | Aún sin info | Esperar 2-4 horas después de crear |
| `rate_limit_exceeded` | Demasiadas peticiones | Esperar y usar webhooks |

---

## Página de Tracking Pública

Skydropx ofrece URLs públicas de tracking:

```
https://app.skydropx.com/es-MX/tracking/{tracking_number}
```

Ejemplo:
```
https://app.skydropx.com/es-MX/tracking/794874381730
```

---

## Notificaciones por Email/SMS

Puedes configurar notificaciones automáticas para tus clientes:

```javascript
// Al crear el envío, especifica emails
const shipment = await client.createShipment({
  rate_id: rateId,
  notification_emails: [
    'cliente@example.com',
    'soporte@miempresa.com'
  ],
  address_from: {...},
  address_to: {...}
});
```

Los emails incluirán:
- Confirmación de envío
- Actualizaciones de estado
- Link de tracking público

---

## Recursos

- [Ejemplo de Tracking](../examples/tracking/track-shipment.js)
- [Documentación de Webhooks](WEBHOOKS.md)
- [Widget de Tracking](https://app.skydropx.com/es-MX/tracking)

---

## Soporte

¿Problemas con el rastreo?
- 📧 Email: rastreo@skydropx.com
- 💬 Chat: https://app.skydropx.com
- 📚 Ayuda: https://help.skydropx.com
