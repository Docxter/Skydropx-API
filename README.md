# Skydropx API - SDK y Documentación 📦

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![API Version](https://img.shields.io/badge/API-v1-blue.svg)](https://app.skydropx.com/es-MX/api-docs)
[![JavaScript](https://img.shields.io/badge/JavaScript-Node.js-yellow.svg)](src/clients/javascript)
[![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)](src/clients/python)

Cliente SDK profesional para la API de Skydropx. Automatiza envíos, cotizaciones, recolecciones y seguimiento de paquetes con las principales paqueterías de México y Latinoamérica.

**🚀 [Ver Guía de Ejecución Rápida](RUN_EXAMPLES.md)** | **📖 [Documentación Completa](docs/)** | **🎯 [Comparar JS vs Python](JAVASCRIPT_VS_PYTHON.md)**

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Inicio Rápido](#-inicio-rápido)
- [Documentación Completa](#-documentación-completa)
- [Ejemplos](#-ejemplos)
- [Ambientes](#-ambientes)
- [Soporte](#-soporte)

## ✨ Características

- 🔐 **Autenticación OAuth2** con renovación automática de tokens
- 📦 **Gestión de Envíos**: Crear, rastrear y cancelar envíos
- 💰 **Cotizaciones**: Comparar tarifas de múltiples paqueterías
- 🚚 **Recolecciones**: Programar y gestionar recolecciones
- 📊 **Órdenes**: Sincronización con e-commerce
- 🌐 **Envíos Internacionales**: Soporte completo con códigos HS
- 🔔 **Webhooks**: Notificaciones en tiempo real
- 📄 **Etiquetas**: Generación de guías en formato térmico o estándar

## 🚀 Instalación

### JavaScript/Node.js
```bash
# Clonar el repositorio
git clone https://github.com/Docxter/Skydropx-API.git
cd Skydropx-API

# Instalar dependencias
npm install
```

### Python
```bash
# Clonar el repositorio
git clone https://github.com/Docxter/Skydropx-API.git
cd Skydropx-API

# Instalar dependencias
pip install -r requirements.txt
```

## ⚙️ Configuración

### 1. Obtener Credenciales

Ve a tu panel de Skydropx:
- **Sandbox**: https://sb-pro.skydropx.com/merchant_stores/applications
- **Producción**: https://pro.skydropx.com/merchant_stores/applications

Copia tu `Client ID` y `Client Secret` de la sección **Conexiones > API**.

### 2. Variables de Entorno

Crea un archivo `.env` en la raíz de tu proyecto:

```env
SKYDROPX_CLIENT_ID=tu_client_id
SKYDROPX_CLIENT_SECRET=tu_client_secret
SKYDROPX_ENVIRONMENT=sandbox # o production
```

### 3. Ejecutar Ejemplos

#### JavaScript
```bash
npm install
node examples/auth/authenticate.js
node examples/shipments/create-shipment.js
```

#### Python
```bash
pip install -r requirements.txt
python examples/auth/authenticate.py
python examples/shipments/create_shipment.py
```

## 🎯 Inicio Rápido

### JavaScript/Node.js

```javascript
const SkydropxClient = require('./src/clients/javascript/SkydropxClient');
require('dotenv').config();

const client = new SkydropxClient({
  clientId: process.env.SKYDROPX_CLIENT_ID,
  clientSecret: process.env.SKYDROPX_CLIENT_SECRET,
  environment: 'sandbox'
});

// Autenticar
await client.authenticate();

// Crear cotización
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

console.log(`Cotización ID: ${quotation.id}`);
```

### Python

```python
import os
import sys
from pathlib import Path

# Agregar el directorio src al path
sys.path.insert(0, str(Path(__file__).parent / 'src' / 'clients' / 'python'))

from skydropx_client import SkydropxClient
from dotenv import load_dotenv

load_dotenv()

client = SkydropxClient(
    client_id=os.getenv('SKYDROPX_CLIENT_ID'),
    client_secret=os.getenv('SKYDROPX_CLIENT_SECRET'),
    environment='sandbox'
)

# Autenticar
client.authenticate()

# Crear cotización
quotation = client.create_quotation({
    'address_from': {
        'country_code': 'MX',
        'postal_code': '64000',
        'area_level1': 'Nuevo León',
        'area_level2': 'Monterrey',
        'area_level3': 'Centro'
    },
    'address_to': {
        'country_code': 'MX',
        'postal_code': '01000',
        'area_level1': 'Ciudad de México',
        'area_level2': 'Álvaro Obregón',
        'area_level3': 'Santa Fe'
    },
    'packages': [{
        'weight': 2.5,
        'length': 30,
        'width': 20,
        'height': 15
    }]
})

print(f"Cotización ID: {quotation['id']}")
```

## 📚 Documentación Completa

### Recursos Principales

| Recurso | Documentación | Ejemplos |
|---------|--------------|----------|
| **Autenticación** | [docs/AUTH.md](docs/AUTH.md) | [examples/auth](examples/auth) |
| **Cotizaciones** | [docs/QUOTATIONS.md](docs/QUOTATIONS.md) | [examples/quotations](examples/quotations) |
| **Envíos** | [docs/SHIPMENTS.md](docs/SHIPMENTS.md) | [examples/shipments](examples/shipments) |
| **Recolecciones** | [docs/PICKUPS.md](docs/PICKUPS.md) | [examples/pickups](examples/pickups) |
| **Órdenes** | [docs/ORDERS.md](docs/ORDERS.md) | [examples/orders](examples/orders) |
| **Rastreo** | [docs/TRACKING.md](docs/TRACKING.md) | [examples/tracking](examples/tracking) |
| **Webhooks** | [docs/WEBHOOKS.md](docs/WEBHOOKS.md) | [examples/webhooks](examples/webhooks) |
| **Productos** | [docs/PRODUCTS.md](docs/PRODUCTS.md) | [examples/products](examples/products) |

### Guías Paso a Paso

- 📘 [Crear tu Primer Envío Nacional](docs/guides/FIRST_SHIPMENT.md)
- 🌎 [Envíos Internacionales](docs/guides/INTERNATIONAL_SHIPPING.md)
- 📦 [Envíos con Múltiples Paquetes](docs/guides/MULTI_PACKAGE.md)
- 🔄 [Integración con E-commerce](docs/guides/ECOMMERCE_INTEGRATION.md)
- ⚡ [Mejores Prácticas](docs/guides/BEST_PRACTICES.md)

## 🌍 Ambientes

### Sandbox (Pruebas)
- **URL Base**: `https://app.skydropx.com`
- **Panel**: https://sb-pro.skydropx.com
- Usa este ambiente para desarrollo y pruebas

### Producción
- **URL Base**: `https://app.skydropx.com`
- **Panel**: https://pro.skydropx.com
- Para envíos reales

## 📦 Ejemplos de Uso

### 🚀 Ejecutar Ejemplos

#### JavaScript
```bash
# Autenticación
node examples/auth/authenticate.js

# Cotización
node examples/quotations/create-quotation.js

# Crear envío completo
node examples/shipments/create-shipment.js

# Rastrear envío
node examples/tracking/track-shipment.js

# Servidor de webhooks
node examples/webhooks/webhook-server.js
```

#### Python
```bash
# Autenticación
python examples/auth/authenticate.py

# Cotización
python examples/quotations/create_quotation.py

# Crear envío completo
python examples/shipments/create_shipment.py

# Rastrear envío
python examples/tracking/track_shipment.py

# Servidor de webhooks
python examples/webhooks/webhook_server.py
```

### 📝 Flujo Completo: Cotizar y Crear Envío

```javascript
// 1. Autenticar
await client.authenticate();

// 2. Crear cotización
const quotation = await client.createQuotation({
  address_from: { /* ... */ },
  address_to: { /* ... */ },
  packages: [{ /* ... */ }]
});

// 3. Esperar a que complete
let quotationResult;
do {
  await sleep(2000);
  quotationResult = await client.getQuotation(quotation.id);
} while (!quotationResult.is_completed);

// 4. Seleccionar mejor tarifa
const bestRate = quotationResult.rates
  .filter(r => r.success)
  .sort((a, b) => parseFloat(a.total) - parseFloat(b.total))[0];

// 5. Crear envío
const shipment = await client.createShipment({
  rate_id: bestRate.id,
  address_from: {
    name: 'Juan Pérez',
    company: 'Mi Empresa',
    street1: 'Av. Principal 123',
    phone: '8112345678',
    email: 'juan@miempresa.com'
  },
  address_to: {
    name: 'María García',
    company: 'Cliente SA',
    street1: 'Calle Secundaria 456',
    phone: '5587654321',
    email: 'maria@cliente.com'
  }
});

console.log(`Envío creado: ${shipment.data.id}`);
console.log(`Número de rastreo: ${shipment.included[0].attributes.tracking_number}`);
console.log(`Etiqueta: ${shipment.included[0].attributes.label_url}`);
```

### Rastrear un Envío

```javascript
const tracking = await client.trackShipment(
  'tracking_number_here',
  'fedex'
);

tracking.data.forEach(event => {
  console.log(`${event.attributes.date}: ${event.attributes.description}`);
  console.log(`Ubicación: ${event.attributes.location}`);
});
```

### Programar Recolección

```javascript
// 1. Verificar cobertura
const coverage = await client.getPickupCoverage(shipmentId);

if (coverage.success) {
  // 2. Programar recolección
  const pickup = await client.createPickup({
    reference_shipment_id: shipmentId,
    packages: 1,
    total_weight: 2.5,
    scheduled_from: coverage.pickupDates[0].startHour,
    scheduled_to: coverage.pickupDates[0].endHour
  });
  
  console.log(`Recolección programada: ${pickup.data.attributes.request_number}`);
}
```

## 🔔 Webhooks

Recibe notificaciones en tiempo real de cambios en tus envíos:

```javascript
const express = require('express');
const crypto = require('crypto');

app.post('/webhook/skydropx', (req, res) => {
  // Verificar firma HMAC
  const signature = req.headers['authorization'].replace('HMAC ', '');
  const expectedSignature = crypto
    .createHmac('sha512', process.env.SKYDROPX_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (signature === expectedSignature) {
    const event = req.body;
    
    switch (event.data.type) {
      case 'packages':
        console.log(`Paquete ${event.data.attributes.tracking_number}`);
        console.log(`Estado: ${event.data.attributes.status}`);
        break;
      case 'orders':
        console.log(`Orden ${event.data.id} - ${event.data.attributes.status}`);
        break;
    }
    
    res.status(200).send('OK');
  } else {
    res.status(401).send('Invalid signature');
  }
});
```

## 📊 Estructura del Proyecto

```
skydropx-api/
├── src/
│   ├── clients/           # Clientes SDK por lenguaje
│   │   ├── javascript/
│   │   ├── python/
│   │   ├── php/
│   │   └── ruby/
│   └── utils/            # Utilidades compartidas
├── examples/             # Ejemplos prácticos
│   ├── auth/
│   ├── quotations/
│   ├── shipments/
│   ├── pickups/
│   └── webhooks/
├── docs/                 # Documentación detallada
│   ├── api/             # Referencia de endpoints
│   └── guides/          # Guías paso a paso
├── tests/               # Tests unitarios e integración
├── postman/             # Colección de Postman
└── tools/               # Herramientas auxiliares
```

## 🛠️ Herramientas Incluidas

### Colección de Postman
Importa la colección completa: [postman/Skydropx_API.postman_collection.json](postman/Skydropx_API.postman_collection.json)

### CLI Tool
```bash
# Instalar CLI
npm install -g @skydropx/cli

# Crear cotización desde terminal
skydropx quote --from="64000" --to="01000" --weight=2.5

# Rastrear envío
skydropx track --number="123456789" --carrier="fedex"
```

## 🔒 Seguridad

- **Nunca** expongas tus credenciales en el código
- Usa variables de entorno
- Implementa rate limiting
- Valida firmas HMAC en webhooks
- Usa HTTPS en producción

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Límites de la API

- **Rate Limit**: 2 solicitudes por segundo
- **Token Expiration**: 2 horas
- **Timeout**: 30 segundos por request

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor abre un issue en GitHub con:
- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Versión del SDK y lenguaje

## 📞 Soporte

- 📧 **Email API**: api@skydropx.com
- 📧 **Soporte General**: hola@skydropx.com
- 📚 **Documentación Oficial**: https://app.skydropx.com/es-MX/api-docs
- 💬 **Centro de Ayuda**: https://help.skydropx.com

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🌟 Créditos

Desarrollado y mantenido por la comunidad de Skydropx.

---

**¿Listo para empezar?** Sigue nuestra guía [Crear tu Primer Envío](docs/guides/FIRST_SHIPMENT.md) 🚀
