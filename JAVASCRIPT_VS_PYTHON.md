# Comparación: JavaScript vs Python - Skydropx API

Esta guía muestra las diferencias y similitudes entre las implementaciones de JavaScript y Python del SDK de Skydropx.

## 📋 Tabla de Contenidos

- [Instalación](#instalación)
- [Configuración](#configuración)
- [Autenticación](#autenticación)
- [Cotizaciones](#cotizaciones)
- [Envíos](#envíos)
- [Rastreo](#rastreo)
- [Webhooks](#webhooks)
- [Manejo de Errores](#manejo-de-errores)

---

## Instalación

### JavaScript/Node.js
```bash
npm install
```

**Dependencias:**
- axios (HTTP client)
- dotenv (variables de entorno)
- express (webhooks)

### Python
```bash
pip install -r requirements.txt
```

**Dependencias:**
- requests (HTTP client)
- python-dotenv (variables de entorno)
- flask (webhooks)

---

## Configuración

### JavaScript
```javascript
const SkydropxClient = require('./src/clients/javascript/SkydropxClient');
require('dotenv').config();

const client = new SkydropxClient({
  clientId: process.env.SKYDROPX_CLIENT_ID,
  clientSecret: process.env.SKYDROPX_CLIENT_SECRET,
  environment: 'sandbox'
});
```

### Python
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
```

**Diferencias clave:**
- JavaScript usa `require()`, Python usa `import`
- JavaScript: camelCase (`clientId`)
- Python: snake_case (`client_id`)

---

## Autenticación

### JavaScript
```javascript
// Async/await
const tokenInfo = await client.authenticate();

console.log(`Token: ${tokenInfo.access_token}`);
console.log(`Expira en: ${tokenInfo.expires_in} segundos`);
```

### Python
```python
# Síncrono (no necesita async/await)
token_info = client.authenticate()

print(f"Token: {token_info['access_token']}")
print(f"Expira en: {token_info['expires_in']} segundos")
```

**Diferencias clave:**
- JavaScript usa async/await para operaciones asíncronas
- Python es síncrono (más simple)
- JavaScript: template strings con ``${variable}``
- Python: f-strings con `f"{variable}"`

---

## Cotizaciones

### JavaScript
```javascript
// Crear cotización
const quotation = await client.createQuotation({
  address_from: {
    country_code: 'MX',
    postal_code: '64000'
  },
  address_to: {
    country_code: 'MX',
    postal_code: '01000'
  },
  packages: [{
    weight: 2.5,
    length: 30,
    width: 20,
    height: 15
  }]
});

// Esperar con polling
const result = await client.waitForQuotation(quotation.id);

// Filtrar tarifas exitosas
const successfulRates = result.rates.filter(r => r.success);

// Ordenar por precio
successfulRates.sort((a, b) => parseFloat(a.total) - parseFloat(b.total));

// Iterar
successfulRates.forEach((rate, index) => {
  console.log(`${index + 1}. ${rate.provider_display_name}`);
  console.log(`   Precio: $${rate.total}`);
});
```

### Python
```python
# Crear cotización
quotation = client.create_quotation({
    'address_from': {
        'country_code': 'MX',
        'postal_code': '64000'
    },
    'address_to': {
        'country_code': 'MX',
        'postal_code': '01000'
    },
    'packages': [{
        'weight': 2.5,
        'length': 30,
        'width': 20,
        'height': 15
    }]
})

# Esperar con polling
result = client.wait_for_quotation(quotation['id'])

# Filtrar tarifas exitosas
successful_rates = [r for r in result['rates'] if r['success']]

# Ordenar por precio
successful_rates.sort(key=lambda r: float(r['total']))

# Iterar
for i, rate in enumerate(successful_rates, 1):
    print(f"{i}. {rate['provider_display_name']}")
    print(f"   Precio: ${rate['total']}")
```

**Diferencias clave:**
- JavaScript: `.filter()`, `.sort()`, `.forEach()`
- Python: list comprehensions `[x for x in list]`, `.sort()`, `for x in list`
- JavaScript: acceso con punto (`quotation.id`)
- Python: acceso con corchetes (`quotation['id']`)

---

## Envíos

### JavaScript
```javascript
const shipment = await client.createShipment({
  rate_id: bestRate.id,
  printing_format: 'thermal',
  address_from: {
    name: 'Juan Pérez',
    company: 'Mi Empresa',
    street1: 'Av. Principal 123',
    phone: '8112345678',
    email: 'juan@empresa.com'
  },
  address_to: {
    name: 'María García',
    street1: 'Calle Secundaria 456',
    phone: '5587654321',
    email: 'maria@cliente.com'
  }
});

// Obtener info del paquete
const pkg = shipment.included.find(i => i.type === 'packages');
console.log(`Tracking: ${pkg.attributes.tracking_number}`);
console.log(`Etiqueta: ${pkg.attributes.label_url}`);
```

### Python
```python
shipment = client.create_shipment({
    'rate_id': best_rate['id'],
    'printing_format': 'thermal',
    'address_from': {
        'name': 'Juan Pérez',
        'company': 'Mi Empresa',
        'street1': 'Av. Principal 123',
        'phone': '8112345678',
        'email': 'juan@empresa.com'
    },
    'address_to': {
        'name': 'María García',
        'street1': 'Calle Secundaria 456',
        'phone': '5587654321',
        'email': 'maria@cliente.com'
    }
})

# Obtener info del paquete
for item in shipment['included']:
    if item['type'] == 'packages':
        pkg = item
        break

print(f"Tracking: {pkg['attributes']['tracking_number']}")
print(f"Etiqueta: {pkg['attributes']['label_url']}")
```

**Diferencias clave:**
- JavaScript: `.find()` para buscar
- Python: `for` loop con `if` y `break`

---

## Rastreo

### JavaScript
```javascript
const tracking = await client.trackShipment(
  'numero_de_guia',
  'fedex'
);

const { data, included } = tracking;

console.log(`Estado: ${data.attributes.tracking_status}`);

// Eventos
const events = included.filter(i => i.type === 'tracking_events');
events.forEach(event => {
  const { datetime, description, location } = event.attributes;
  console.log(`${datetime}: ${description}`);
  console.log(`Ubicación: ${location}`);
});
```

### Python
```python
tracking = client.track_shipment(
    'numero_de_guia',
    'fedex'
)

data = tracking['data']

print(f"Estado: {data['attributes']['tracking_status']}")

# Eventos
events = [i for i in tracking['included'] if i['type'] == 'tracking_events']
for event in events:
    attrs = event['attributes']
    print(f"{attrs['datetime']}: {attrs['description']}")
    print(f"Ubicación: {attrs['location']}")
```

**Diferencias clave:**
- JavaScript: destructuring `const { data, included } = tracking`
- Python: acceso directo `data = tracking['data']`

---

## Webhooks

### JavaScript (Express)
```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.post('/webhooks/skydropx', (req, res) => {
  const signature = req.headers['x-skydropx-signature'];
  const timestamp = req.headers['x-skydropx-timestamp'];
  
  // Verificar firma
  const signedPayload = `${timestamp}.${JSON.stringify(req.body)}`;
  const expectedSignature = crypto
    .createHmac('sha512', process.env.SKYDROPX_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');
  
  if (signature.replace('sha512=', '') === expectedSignature) {
    const event = req.body;
    
    // Procesar evento
    if (event.event === 'shipment.delivered') {
      console.log('Paquete entregado');
    }
    
    res.status(200).send('OK');
  } else {
    res.status(401).send('Invalid signature');
  }
});

app.listen(3000, () => console.log('Server on port 3000'));
```

### Python (Flask)
```python
from flask import Flask, request, jsonify
from skydropx_client import verify_webhook_signature

app = Flask(__name__)

@app.route('/webhooks/skydropx', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Skydropx-Signature', '')
    timestamp = request.headers.get('X-Skydropx-Timestamp', '')
    payload = request.get_data(as_text=True)
    
    # Verificar firma
    is_valid = verify_webhook_signature(
        signature,
        timestamp,
        payload,
        os.getenv('SKYDROPX_WEBHOOK_SECRET')
    )
    
    if is_valid:
        event = request.get_json()
        
        # Procesar evento
        if event['event'] == 'shipment.delivered':
            print('Paquete entregado')
        
        return jsonify({'received': True}), 200
    else:
        return jsonify({'error': 'Invalid signature'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
```

**Diferencias clave:**
- JavaScript: Express con `app.post()`, `app.listen()`
- Python: Flask con `@app.route()`, `app.run()`
- JavaScript: verificación manual con `crypto`
- Python: función helper `verify_webhook_signature()`

---

## Manejo de Errores

### JavaScript
```javascript
try {
  const quotation = await client.createQuotation(data);
  console.log('Éxito:', quotation.id);
  
} catch (error) {
  if (error.statusCode === 401) {
    console.error('Error de autenticación');
  } else if (error.statusCode === 422) {
    console.error('Error de validación:', error.responseData);
  } else {
    console.error('Error:', error.message);
  }
}
```

### Python
```python
from skydropx_client import SkydropxError

try:
    quotation = client.create_quotation(data)
    print('Éxito:', quotation['id'])
    
except SkydropxError as e:
    if e.status_code == 401:
        print('Error de autenticación')
    elif e.status_code == 422:
        print('Error de validación:', e.response_data)
    else:
        print('Error:', e.message)
```

**Diferencias clave:**
- JavaScript: clase `Error` estándar
- Python: clase custom `SkydropxError`
- Ambos usan try/catch (JS) o try/except (Python)

---

## Similitudes

✅ **Estructura de datos idéntica**: Ambos SDKs usan los mismos JSON schemas de la API

✅ **Funcionalidad completa**: Todas las funciones disponibles en ambos lenguajes

✅ **Renovación automática de tokens**: Implementado en ambos

✅ **Verificación HMAC**: Ambos verifican firmas de webhooks

✅ **Polling de cotizaciones**: Misma lógica de espera

---

## Tabla de Métodos

| Funcionalidad | JavaScript | Python |
|---------------|------------|--------|
| Autenticar | `authenticate()` | `authenticate()` |
| Crear cotización | `createQuotation()` | `create_quotation()` |
| Obtener cotización | `getQuotation()` | `get_quotation()` |
| Esperar cotización | `waitForQuotation()` | `wait_for_quotation()` |
| Crear envío | `createShipment()` | `create_shipment()` |
| Listar envíos | `getShipments()` | `get_shipments()` |
| Obtener envío | `getShipment()` | `get_shipment()` |
| Cancelar envío | `cancelShipment()` | `cancel_shipment()` |
| Rastrear envío | `trackShipment()` | `track_shipment()` |
| Crear webhook | `createWebhook()` | `create_webhook()` |
| Verificar firma | `verifyWebhookSignature()` | `verify_webhook_signature()` |

---

## ¿Cuál usar?

### Usa JavaScript si:
- Ya tienes un proyecto Node.js
- Necesitas un servidor web (Express es muy popular)
- Tu equipo conoce JavaScript/TypeScript
- Estás desarrollando una aplicación web

### Usa Python si:
- Ya tienes un proyecto Python
- Trabajas con data science o ML
- Prefieres sintaxis más simple (no async/await)
- Tu equipo conoce Python
- Estás automatizando scripts

---

## Rendimiento

Ambas implementaciones tienen rendimiento similar:
- **Latencia**: Depende de la red, no del lenguaje
- **Renovación de tokens**: Automática en ambos
- **Rate limiting**: 2 req/s en ambos
- **Timeouts**: 30s por defecto en ambos

---

## Conclusión

Ambos SDKs ofrecen la misma funcionalidad completa. La elección depende de:
1. Tu lenguaje de programación actual
2. Preferencias del equipo
3. Ecosistema de tu proyecto

**Ambos son igualmente profesionales y listos para producción.**
