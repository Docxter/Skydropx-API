# 🐍 Skydropx Python SDK

Cliente oficial en Python para la API de Skydropx, diseñado para integraciones logísticas, e-commerce, fulfilment y automatización de envíos en México y LATAM.

![License](https://img.shields.io/github/license/Docxter/Skydropx-API)
![Python](https://img.shields.io/badge/Python-3.7+-blue)
![Status](https://img.shields.io/badge/Status-Stable-success)
![Contributions](https://img.shields.io/badge/Contributions-Welcome-brightgreen)

## ✨ Características

- ✅ Python 3.7+
- ✅ Type hints completos
- ✅ Manejo automático de tokens
- ✅ Excepciones personalizadas
- ✅ Verificación HMAC para webhooks
- ✅ Cliente HTTP con requests
- ✅ Soporte para dotenv

## 📦 Instalación

```bash
pip install -r requirements.txt
```

## 🚀 Uso Básico

```python
import os
from dotenv import load_dotenv
from skydropx_client import SkydropxClient

# Cargar variables de entorno
load_dotenv()

# Crear cliente
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

## 📚 Documentación

### Clase SkydropxClient

#### Constructor

```python
client = SkydropxClient(
    client_id: str,
    client_secret: str,
    environment: str = 'sandbox',
    auto_renew_token: bool = True
)
```

**Parámetros:**
- `client_id`: Client ID de OAuth
- `client_secret`: Client Secret de OAuth
- `environment`: 'sandbox' o 'production'
- `auto_renew_token`: Renovar automáticamente el token

#### Métodos de Autenticación

```python
# Obtener token
token_info = client.authenticate()

# Revocar token
client.revoke_token()

# Introspeccionar token
info = client.introspect_token()
```

#### Métodos de Cotizaciones

```python
# Crear cotización
quotation = client.create_quotation(quotation_data)

# Obtener cotización
result = client.get_quotation(quotation_id)

# Esperar a que complete (polling)
result = client.wait_for_quotation(
    quotation_id,
    max_attempts=15,
    sleep_seconds=2
)
```

#### Métodos de Envíos

```python
# Crear envío
shipment = client.create_shipment(shipment_data)

# Listar envíos
shipments = client.get_shipments({'page': 1, 'per_page': 20})

# Obtener envío
shipment = client.get_shipment(shipment_id)

# Cancelar envío
cancelled = client.cancel_shipment(shipment_id, reason='Razón')

# Asegurar envío
protected = client.protect_shipment(shipment_id, declared_value=1000.0)
```

#### Métodos de Rastreo

```python
# Rastrear un envío
tracking = client.track_shipment('numero_guia', 'fedex')

# Rastrear múltiples
trackings = client.track_multiple_shipments([
    {'tracking_number': '123', 'carrier_code': 'fedex'},
    {'tracking_number': '456', 'carrier_code': 'dhl'}
])
```

#### Métodos de Recolecciones

```python
# Verificar cobertura
coverage = client.get_pickup_coverage('64000', 'MX')

# Crear recolección
pickup = client.create_pickup(pickup_data)

# Listar recolecciones
pickups = client.get_pickups()

# Reprogramar
updated = client.reschedule_pickup(pickup_id, new_data)
```

#### Métodos de Webhooks

```python
# Registrar webhook
webhook = client.create_webhook(webhook_data)

# Listar webhooks
webhooks = client.get_webhooks()

# Actualizar webhook
updated = client.update_webhook(webhook_id, new_data)

# Eliminar webhook
client.delete_webhook(webhook_id)
```

### Función verify_webhook_signature

```python
from skydropx_client import verify_webhook_signature

is_valid = verify_webhook_signature(
    signature='sha512=...',
    timestamp='1234567890',
    payload='{"event":"..."}',
    secret='tu_webhook_secret'
)
```

### Excepciones

```python
from skydropx_client import SkydropxError

try:
    shipment = client.create_shipment(data)
except SkydropxError as e:
    print(f"Error: {e.message}")
    print(f"Código: {e.status_code}")
    print(f"Datos: {e.response_data}")
```

**Atributos de SkydropxError:**
- `message`: Mensaje de error
- `status_code`: Código HTTP (opcional)
- `response_data`: Datos de respuesta (opcional)

## 🧪 Ejemplos

Todos los ejemplos están en el directorio `examples/`:

```bash
# Autenticación
python examples/auth/authenticate.py

# Cotización
python examples/quotations/create_quotation.py

# Crear envío
python examples/shipments/create_shipment.py

# Rastrear
python examples/tracking/track_shipment.py

# Servidor de webhooks
python examples/webhooks/webhook_server.py
```

## 🔔 Webhooks con Flask

```python
from flask import Flask, request, jsonify
from skydropx_client import verify_webhook_signature
import os

app = Flask(__name__)

@app.route('/webhooks/skydropx', methods=['POST'])
def handle_webhook():
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
    
    # Procesar evento
    if event['event'] == 'shipment.delivered':
        print('Paquete entregado!')
    
    return jsonify({'received': True}), 200

if __name__ == '__main__':
    app.run(port=3000)
```

## 📋 Convenciones de Código

Este SDK sigue las convenciones de Python:

- **Nombres de métodos**: `snake_case` (ej. `create_shipment`)
- **Nombres de clases**: `PascalCase` (ej. `SkydropxClient`)
- **Constantes**: `UPPER_CASE` (ej. `BASE_URLS`)
- **Privados**: prefijo `_` (ej. `_request`)

## 🆚 Comparación con JavaScript

| Característica | Python | JavaScript |
|----------------|--------|------------|
| Nombres de métodos | `create_shipment()` | `createShipment()` |
| Async/await | No necesario | Requerido |
| HTTP Client | requests | axios |
| Webhooks | Flask | Express |
| Acceso a dicts | `data['key']` | `data.key` |

Ver [JAVASCRIPT_VS_PYTHON.md](../../../JAVASCRIPT_VS_PYTHON.md) para más detalles.

## 🐛 Debugging

```python
import logging

# Activar logs
logging.basicConfig(level=logging.DEBUG)

# El cliente imprimirá información de debug
client = SkydropxClient(...)
```

## 🧪 Testing

```python
import unittest
from skydropx_client import SkydropxClient

class TestSkydropxClient(unittest.TestCase):
    def setUp(self):
        self.client = SkydropxClient(
            client_id='test_id',
            client_secret='test_secret',
            environment='sandbox'
        )
    
    def test_authenticate(self):
        token_info = self.client.authenticate()
        self.assertIsNotNone(token_info['access_token'])

if __name__ == '__main__':
    unittest.main()
```

## 📞 Soporte

- 📧 **Email**: api@skydropx.com
- 📚 **Docs**: https://app.skydropx.com/es-MX/api-docs
- 🐙 **GitHub**: https://github.com/Docxter/Skydropx-API

## 📄 Licencia

MIT License - Ver [LICENSE](../../../LICENSE) para más detalles.
