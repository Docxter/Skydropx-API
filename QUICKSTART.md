# Guía de Inicio Rápido - Skydropx API

## Configuración Inicial

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/skydropx-api.git
cd skydropx-api
```

### 2. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus credenciales
# SKYDROPX_CLIENT_ID=tu_client_id_aqui
# SKYDROPX_CLIENT_SECRET=tu_client_secret_aqui
# SKYDROPX_ENVIRONMENT=sandbox
```

### 3. Instalar Dependencias

#### JavaScript/Node.js
```bash
npm install
```

#### Python
```bash
pip install -r requirements.txt
```

---

## Ejemplos Rápidos

### 🔐 Autenticación

#### JavaScript
```bash
node examples/auth/authenticate.js
```

```javascript
const SkydropxClient = require('./src/clients/javascript/SkydropxClient');
require('dotenv').config();

const client = new SkydropxClient({
  clientId: process.env.SKYDROPX_CLIENT_ID,
  clientSecret: process.env.SKYDROPX_CLIENT_SECRET,
  environment: 'sandbox'
});

// Autenticar
const tokenInfo = await client.authenticate();
console.log('Token:', tokenInfo.access_token);
```

#### Python
```bash
python examples/auth/authenticate.py
```

```python
import os
import sys
from pathlib import Path

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
token_info = client.authenticate()
print('Token:', token_info['access_token'])
```

---

### 💰 Crear Cotización

#### JavaScript
```bash
node examples/quotations/create-quotation.js
```

```javascript
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

// Esperar resultados (polling)
const result = await client.waitForQuotation(quotation.id);

// Ver tarifas
result.rates.filter(r => r.success).forEach(rate => {
  console.log(`${rate.provider_display_name}: $${rate.total}`);
});
```

#### Python
```bash
python examples/quotations/create_quotation.py
```

```python
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

# Esperar resultados (polling)
result = client.wait_for_quotation(quotation['id'])

# Ver tarifas
for rate in [r for r in result['rates'] if r['success']]:
    print(f"{rate['provider_display_name']}: ${rate['total']}")
```

---

### 📦 Crear Envío

#### JavaScript
```bash
node examples/shipments/create-shipment.js
```

```javascript
// 1. Obtener cotización y seleccionar tarifa
const quotation = await client.createQuotation({ /* ... */ });
const result = await client.waitForQuotation(quotation.id);
const bestRate = result.rates.filter(r => r.success)[0];

// 2. Crear envío
const shipment = await client.createShipment({
  rate_id: bestRate.id,
  printing_format: 'thermal',
  address_from: {
    name: 'Juan Pérez',
    company: 'Mi Empresa SA',
    street1: 'Av. Constitución 123',
    phone: '8112345678',
    email: 'juan.perez@empresa.com'
  },
  address_to: {
    name: 'María García',
    company: 'Cliente Premium',
    street1: 'Insurgentes Sur 456',
    phone: '5587654321',
    email: 'maria@cliente.com'
  }
});

// 3. Obtener datos del envío
const pkg = shipment.included.find(i => i.type === 'packages');
console.log('Número de rastreo:', pkg.attributes.tracking_number);
console.log('Etiqueta:', pkg.attributes.label_url);
```

#### Python
```bash
python examples/shipments/create_shipment.py
```

```python
# 1. Obtener cotización y seleccionar tarifa
quotation = client.create_quotation({ ... })
result = client.wait_for_quotation(quotation['id'])
rates = [r for r in result['rates'] if r['success']]
best_rate = rates[0]

# 2. Crear envío
shipment = client.create_shipment({
    'rate_id': best_rate['id'],
    'printing_format': 'thermal',
    'address_from': {
        'name': 'Juan Pérez',
        'company': 'Mi Empresa SA',
        'street1': 'Av. Constitución 123',
        'phone': '8112345678',
        'email': 'juan.perez@empresa.com'
    },
    'address_to': {
        'name': 'María García',
        'company': 'Cliente Premium',
        'street1': 'Insurgentes Sur 456',
        'phone': '5587654321',
        'email': 'maria@cliente.com'
    }
})

# 3. Obtener datos del envío
for item in shipment['included']:
    if item['type'] == 'packages':
        print('Número de rastreo:', item['attributes']['tracking_number'])
        print('Etiqueta:', item['attributes']['label_url'])
```

---

### 🔍 Rastrear Envío

#### JavaScript
```bash
node examples/tracking/track-shipment.js
```

```javascript
const tracking = await client.trackShipment(
  'numero_de_guia',
  'fedex'
);

const data = tracking.data;
console.log(`Estado: ${data.attributes.tracking_status}`);
console.log(`Detalle: ${data.attributes.status_detail}`);

// Historial de eventos
tracking.included
  .filter(i => i.type === 'tracking_events')
  .forEach(event => {
    console.log(`${event.attributes.datetime}: ${event.attributes.description}`);
    console.log(`Ubicación: ${event.attributes.location}`);
  });
```

#### Python
```bash
python examples/tracking/track_shipment.py
```

```python
tracking = client.track_shipment(
    'numero_de_guia',
    'fedex'
)

data = tracking['data']
print(f"Estado: {data['attributes']['tracking_status']}")
print(f"Detalle: {data['attributes']['status_detail']}")

# Historial de eventos
for item in tracking['included']:
    if item['type'] == 'tracking_events':
        attrs = item['attributes']
        print(f"{attrs['datetime']}: {attrs['description']}")
        print(f"Ubicación: {attrs['location']}")
```

---

### 🔔 Servidor de Webhooks

#### JavaScript
```bash
node examples/webhooks/webhook-server.js
```

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.post('/webhooks/skydropx', (req, res) => {
  // Verificar firma HMAC
  const signature = req.headers['x-skydropx-signature'];
  const timestamp = req.headers['x-skydropx-timestamp'];
  
  const signedPayload = `${timestamp}.${JSON.stringify(req.body)}`;
  const expectedSignature = crypto
    .createHmac('sha512', process.env.SKYDROPX_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');
  
  if (signature.replace('sha512=', '') === expectedSignature) {
    const event = req.body;
    console.log('Evento recibido:', event.event);
    
    // Procesar evento
    switch (event.event) {
      case 'shipment.delivered':
        console.log('¡Paquete entregado!');
        break;
      case 'shipment.status.updated':
        console.log('Estado actualizado:', event.data.attributes.workflow_status);
        break;
    }
    
    res.status(200).send('OK');
  } else {
    res.status(401).send('Invalid signature');
  }
});

app.listen(3000, () => console.log('Servidor en puerto 3000'));
```

#### Python
```bash
python examples/webhooks/webhook_server.py
```

```python
from flask import Flask, request, jsonify
from skydropx_client import verify_webhook_signature

app = Flask(__name__)

@app.route('/webhooks/skydropx', methods=['POST'])
def handle_webhook():
    # Verificar firma HMAC
    signature = request.headers.get('X-Skydropx-Signature', '')
    timestamp = request.headers.get('X-Skydropx-Timestamp', '')
    payload = request.get_data(as_text=True)
    
    is_valid = verify_webhook_signature(
        signature,
        timestamp,
        payload,
        os.getenv('SKYDROPX_WEBHOOK_SECRET')
    )
    
    if not is_valid:
        return jsonify({'error': 'Invalid signature'}), 401
    
    event = request.get_json()
    print('Evento recibido:', event['event'])
    
    # Procesar evento
    if event['event'] == 'shipment.delivered':
        print('¡Paquete entregado!')
    elif event['event'] == 'shipment.status.updated':
        print('Estado actualizado:', event['data']['attributes']['workflow_status'])
    
    return jsonify({'received': True}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
```

---

## 🧪 Probar con Postman

1. Importar colección: `postman/Skydropx_API.postman_collection.json`
2. Importar entorno: `postman/Skydropx_API.postman_environment.json`
3. Configurar variables:
   - `client_id`: Tu Client ID
   - `client_secret`: Tu Client Secret
   - `base_url`: https://app.skydropx.com
4. Ejecutar el request "Authenticate" primero
5. Probar otros endpoints

---

## 📚 Documentación Completa

- [Autenticación](docs/AUTH.md)
- [Cotizaciones](docs/QUOTATIONS.md)
- [Envíos](docs/SHIPMENTS.md)
- [Recolecciones](docs/PICKUPS.md)
- [Rastreo](docs/TRACKING.md)
- [Webhooks](docs/WEBHOOKS.md)
- [Tutorial: Primer Envío](docs/guides/FIRST_SHIPMENT.md)

---

## 🆘 Solución de Problemas

### Error: "Invalid credentials"
- Verifica tu `CLIENT_ID` y `CLIENT_SECRET`
- Asegúrate de estar en el ambiente correcto (sandbox/production)

### Error: "Rate limit exceeded"
- La API permite 2 requests/segundo
- Implementa delays entre peticiones

### Token expirado
- Los tokens duran 2 horas
- El SDK renueva automáticamente
- Verifica la fecha/hora del servidor

### Webhook no recibe eventos
- Verifica que la URL sea accesible públicamente
- Usa ngrok para desarrollo local: `ngrok http 3000`
- Valida la firma HMAC correctamente

---

## 💡 Consejos

1. **Usa el ambiente sandbox** para todas las pruebas
2. **Guarda los Rate IDs** de cotizaciones para crear envíos
3. **Implementa webhooks** para rastreo en tiempo real
4. **Maneja errores** adecuadamente en producción
5. **Lee la documentación completa** antes de integrar

---

## 🚀 Próximos Pasos

1. ✅ Autenticar con la API
2. ✅ Crear tu primera cotización
3. ✅ Crear tu primer envío
4. ✅ Rastrear el envío
5. ✅ Implementar webhooks
6. 📦 Integrar con tu sistema de e-commerce
7. 🌍 Probar envíos internacionales
8. 🚀 Lanzar a producción

---

## 📞 Soporte

- 📧 API: api@skydropx.com
- 📚 Docs: https://app.skydropx.com/es-MX/api-docs
- 💬 Help: https://help.skydropx.com
