# Envíos - Skydropx API

## Resumen

El endpoint de shipments (envíos) permite crear, consultar, cancelar y gestionar envíos. Un envío se crea a partir de una tarifa (rate) obtenida en una cotización.

## Endpoints

### 1. Crear Envío

Crea un nuevo envío con la tarifa seleccionada de una cotización.

```http
POST /api/v1/shipments
Authorization: Bearer {token}
Content-Type: application/json
```

#### Body Mínimo

```json
{
  "shipment": {
    "rate_id": "938f6079-e608-4baa-b9b5-8be7f4de0535",
    "address_from": {
      "name": "Juan Pérez",
      "street1": "Av. Constitución 123",
      "phone": "8112345678",
      "email": "juan@empresa.com"
    },
    "address_to": {
      "name": "María García",
      "street1": "Insurgentes Sur 456",
      "phone": "5587654321",
      "email": "maria@cliente.com"
    }
  }
}
```

#### Body Completo

```json
{
  "shipment": {
    "rate_id": "938f6079-e608-4baa-b9b5-8be7f4de0535",
    "printing_format": "thermal",
    "content_description": "Electrónicos - Laptop Dell",
    "insurance": {
      "insurance": true,
      "declared_value": 1500.00
    },
    
    "address_from": {
      "name": "Juan Pérez Gómez",
      "company": "Mi Empresa SA de CV",
      "street1": "Av. Constitución 123",
      "street2": "Piso 4, Oficina 401",
      "city": "Monterrey",
      "province": "Nuevo León",
      "zip": "64000",
      "country_code": "MX",
      "phone": "8112345678",
      "email": "juan.perez@miempresa.com",
      "reference": "Edificio azul, entrada por estacionamiento"
    },
    
    "address_to": {
      "name": "María García López",
      "company": "Cliente Premium SA",
      "street1": "Insurgentes Sur 456",
      "street2": "Int 302",
      "city": "Ciudad de México",
      "province": "Ciudad de México",
      "zip": "01000",
      "country_code": "MX",
      "phone": "5587654321",
      "email": "maria.garcia@cliente.com",
      "reference": "Torre B, piso 3, tocar timbre"
    },
    
    "parcels": [{
      "weight": 2.5,
      "length": 30,
      "width": 20,
      "height": 15
    }]
  }
}
```

#### Respuesta (201 Created)

```json
{
  "data": {
    "id": "93774c22-8275-4757-9963-71b79b2e8db7",
    "type": "shipments",
    "attributes": {
      "workflow_status": "pending",
      "status_detail": null,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "total": "246.74",
      "currency": "MXN",
      "parcel_ids": ["pkg_abc123"],
      "label_url": null,
      "tracking_number": null,
      "tracking_status": null,
      "tracking_url_provider": null
    },
    "relationships": {
      "packages": {
        "data": [{
          "id": "pkg_abc123",
          "type": "packages"
        }]
      },
      "label": {
        "data": {
          "id": "lbl_xyz789",
          "type": "labels"
        }
      }
    }
  },
  "included": [
    {
      "id": "pkg_abc123",
      "type": "packages",
      "attributes": {
        "tracking_number": "794874381730",
        "tracking_status": "created",
        "tracking_url_provider": "https://fedex.com/track?trknbr=794874381730",
        "label_url": "https://api.skydropx.com/labels/794874381730.pdf",
        "weight": "2.5",
        "length": "30.0",
        "width": "20.0",
        "height": "15.0"
      }
    }
  ]
}
```

---

### 2. Obtener Envíos

Lista todos los envíos con filtros opcionales.

```http
GET /api/v1/shipments?page=1&per_page=20&status=pending
Authorization: Bearer {token}
```

#### Parámetros de Query

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | integer | Número de página (default: 1) |
| `per_page` | integer | Resultados por página (default: 20, max: 100) |
| `status` | string | Filtrar por estado |
| `created_at_from` | date | Desde fecha (YYYY-MM-DD) |
| `created_at_to` | date | Hasta fecha (YYYY-MM-DD) |
| `tracking_number` | string | Buscar por número de rastreo |

#### Respuesta (200 OK)

```json
{
  "data": [
    {
      "id": "93774c22-8275-4757-9963-71b79b2e8db7",
      "type": "shipments",
      "attributes": {
        "workflow_status": "delivered",
        "created_at": "2024-01-15T10:30:00.000Z",
        "total": "246.74",
        "currency": "MXN"
      }
    }
  ],
  "meta": {
    "total_pages": 5,
    "total_count": 95,
    "current_page": 1,
    "per_page": 20
  }
}
```

---

### 3. Obtener Envío por ID

Obtiene los detalles completos de un envío.

```http
GET /api/v1/shipments/{id}
Authorization: Bearer {token}
```

#### Respuesta (200 OK)

Igual que la respuesta de crear envío.

---

### 4. Cancelar Envío

Cancela un envío existente.

```http
POST /api/v1/shipments/{id}/cancel
Authorization: Bearer {token}
Content-Type: application/json
```

#### Body

```json
{
  "cancellation_reason": "Cliente solicitó cancelación"
}
```

#### Respuesta (200 OK)

```json
{
  "data": {
    "id": "93774c22-8275-4757-9963-71b79b2e8db7",
    "type": "shipments",
    "attributes": {
      "workflow_status": "cancelled",
      "status_detail": "Cliente solicitó cancelación"
    }
  }
}
```

---

### 5. Proteger Envío (Seguro)

Agrega seguro a un envío existente.

```http
POST /api/v1/shipments/{id}/protect
Authorization: Bearer {token}
Content-Type: application/json
```

#### Body

```json
{
  "declared_value": 1500.00
}
```

#### Respuesta (200 OK)

```json
{
  "data": {
    "id": "93774c22-8275-4757-9963-71b79b2e8db7",
    "type": "shipments",
    "attributes": {
      "insurance_amount": 1500.00,
      "insurance_fee": 35.00,
      "total": "281.74"
    }
  }
}
```

---

## Campos de Dirección

### address_from / address_to

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | ✅ | Nombre completo del contacto |
| `company` | string | ❌ | Nombre de la empresa |
| `street1` | string | ✅ | Calle y número |
| `street2` | string | ❌ | Datos adicionales (piso, interior, etc) |
| `city` | string | ❌* | Ciudad (*se infiere del código postal) |
| `province` | string | ❌* | Estado (*se infiere del código postal) |
| `zip` | string | ❌* | Código postal (*se infiere de cotización) |
| `country_code` | string | ❌* | Código ISO país (*se infiere de cotización) |
| `phone` | string | ✅ | Teléfono con lada |
| `email` | string | ✅ | Email de contacto |
| `reference` | string | ❌ | Referencias de ubicación |

---

## Estados de Envío

### workflow_status

| Estado | Descripción |
|--------|-------------|
| `pending` | Envío creado, esperando etiqueta |
| `label_printed` | Etiqueta generada |
| `in_transit` | En tránsito |
| `out_for_delivery` | En reparto |
| `delivered` | Entregado |
| `exception` | Incidencia |
| `cancelled` | Cancelado |
| `returned` | Devuelto al origen |

### tracking_status (del paquete)

| Estado | Descripción |
|--------|-------------|
| `created` | Etiqueta creada |
| `picked_up` | Recolectado |
| `in_transit` | En tránsito |
| `out_for_delivery` | En reparto |
| `delivered` | Entregado |
| `failed_attempt` | Intento de entrega fallido |
| `exception` | Incidencia |
| `returned_to_sender` | Devuelto |

---

## Formatos de Etiqueta

### printing_format

| Formato | Descripción | Tamaño |
|---------|-------------|--------|
| `thermal` | Térmica (recomendado) | 4x6 pulgadas (10x15 cm) |
| `standard` | Carta | 8.5x11 pulgadas (carta) |
| `pdf` | PDF estándar | A4 o carta |

---

## Ejemplos de Uso

### JavaScript - Crear Envío

```javascript
const client = new SkydropxClient({...});
await client.authenticate();

// 1. Obtener rate_id de una cotización
const quotation = await client.createQuotation({...});
// ... esperar y obtener tarifas ...
const selectedRate = quotation.rates[0];

// 2. Crear envío
const shipment = await client.createShipment({
  rate_id: selectedRate.id,
  printing_format: 'thermal',
  address_from: {
    name: 'Juan Pérez',
    street1: 'Av. Constitución 123',
    phone: '8112345678',
    email: 'juan@empresa.com',
    reference: 'Edificio azul'
  },
  address_to: {
    name: 'María García',
    street1: 'Insurgentes Sur 456',
    phone: '5587654321',
    email: 'maria@cliente.com'
  }
});

console.log('Envío creado:', shipment.data.id);
console.log('Rastreo:', shipment.included[0].attributes.tracking_number);
console.log('Etiqueta:', shipment.included[0].attributes.label_url);
```

### JavaScript - Listar Envíos

```javascript
// Obtener envíos pendientes de esta semana
const shipments = await client.getShipments({
  status: 'pending',
  created_at_from: '2024-01-08',
  created_at_to: '2024-01-15',
  per_page: 50
});

console.log(`Encontrados: ${shipments.meta.total_count} envíos`);
shipments.data.forEach(shipment => {
  console.log(`${shipment.id} - ${shipment.attributes.workflow_status}`);
});
```

### JavaScript - Cancelar Envío

```javascript
const result = await client.cancelShipment(
  '93774c22-8275-4757-9963-71b79b2e8db7',
  'Cliente solicitó cancelación'
);

if (result.data.attributes.workflow_status === 'cancelled') {
  console.log('Envío cancelado exitosamente');
}
```

### cURL - Crear Envío

```bash
curl -X POST 'https://app.skydropx.com/api/v1/shipments' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "shipment": {
      "rate_id": "938f6079-e608-4baa-b9b5-8be7f4de0535",
      "address_from": {
        "name": "Juan Pérez",
        "street1": "Av. Constitución 123",
        "phone": "8112345678",
        "email": "juan@empresa.com"
      },
      "address_to": {
        "name": "María García",
        "street1": "Insurgentes Sur 456",
        "phone": "5587654321",
        "email": "maria@cliente.com"
      }
    }
  }'
```

---

## Envíos Internacionales

Para envíos internacionales incluye información aduanal:

```json
{
  "shipment": {
    "rate_id": "...",
    "content_description": "Electronics - Laptop",
    "customs_info": {
      "contents_type": "merchandise",
      "customs_signer": "Juan Pérez",
      "eel_pfc": "NOEEI 30.37(a)"
    },
    "products": [
      {
        "name": "Dell Laptop",
        "sku": "DELL-XPS-13",
        "hs_code": "8471.30.01",
        "quantity": 1,
        "price": 1000.00,
        "weight": 2.5,
        "origin_country": "CN"
      }
    ],
    "address_from": {...},
    "address_to": {...}
  }
}
```

---

## Múltiples Paquetes

Envío con múltiples paquetes:

```json
{
  "shipment": {
    "rate_id": "...",
    "address_from": {...},
    "address_to": {...},
    "parcels": [
      {
        "weight": 2.5,
        "length": 30,
        "width": 20,
        "height": 15
      },
      {
        "weight": 3.0,
        "length": 35,
        "width": 25,
        "height": 20
      }
    ]
  }
}
```

---

## Mejores Prácticas

### ✅ Recomendado

- **Validar rate_id**: Usa solo rates con `success: true`
- **Guardar IDs**: Almacena shipment ID y tracking number
- **Referencias**: Incluye referencias claras en ambas direcciones
- **Emails válidos**: Asegura que los emails sean correctos para notificaciones
- **Dimensiones exactas**: Usa las mismas dimensiones de la cotización
- **Seguro**: Considera agregar seguro para envíos de alto valor

### ❌ Evitar

- **Rate expirado**: No uses rates de cotizaciones antiguas (>30 min)
- **Datos incompletos**: Completa toda la información de direcciones
- **Emails falsos**: No uses emails genéricos o inválidos
- **Dimensiones diferentes**: No cambies dimensiones después de cotizar

---

## Webhooks

Recibe notificaciones de cambios en tus envíos:

```json
{
  "event": "shipment.status.updated",
  "data": {
    "id": "93774c22-8275-4757-9963-71b79b2e8db7",
    "tracking_number": "794874381730",
    "tracking_status": "delivered",
    "workflow_status": "delivered"
  }
}
```

Ver [Documentación de Webhooks](WEBHOOKS.md)

---

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `rate_not_found` | Rate ID inválido o expirado | Crea nueva cotización |
| `invalid_address` | Dirección incompleta | Completa todos los campos requeridos |
| `insufficient_funds` | Saldo insuficiente | Recarga tu cuenta |
| `shipment_not_cancellable` | Envío ya en tránsito | No se puede cancelar |
| `weight_mismatch` | Peso difiere de cotización | Usa el mismo peso cotizado |

---

## Recursos

- [Guía: Primer Envío](guides/FIRST_SHIPMENT.md)
- [Guía: Envíos Internacionales](guides/INTERNATIONAL_SHIPPING.md)
- [Guía: Múltiples Paquetes](guides/MULTI_PACKAGE.md)
- [Ejemplo Completo](../examples/shipments/create-shipment.js)
- [Documentación de Cotizaciones](QUOTATIONS.md)
- [Documentación de Tracking](TRACKING.md)
