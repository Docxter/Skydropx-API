"""
Ejemplo: Servidor de Webhooks con Flask (Python)

Este ejemplo muestra cómo crear un servidor HTTP que recibe webhooks
de Skydropx con verificación de firma HMAC-SHA512.

Instalación:
    pip install flask

Uso:
    python webhook_server.py
"""

import os
import sys
import hmac
import hashlib
import time
from pathlib import Path

from flask import Flask, request, jsonify
from dotenv import load_dotenv

# Agregar el directorio src al path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / 'src' / 'clients' / 'python'))

from skydropx_client import verify_webhook_signature

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)

# Configuración
WEBHOOK_SECRET = os.getenv('SKYDROPX_WEBHOOK_SECRET', '')
PORT = int(os.getenv('WEBHOOK_PORT', 3000))


def verify_webhook(request) -> tuple[bool, str]:
    """
    Verifica la firma HMAC del webhook
    
    Returns:
        (es_válido, mensaje_error)
    """
    # Obtener headers
    signature = request.headers.get('X-Skydropx-Signature', '')
    timestamp = request.headers.get('X-Skydropx-Timestamp', '')
    
    if not signature or not timestamp:
        return False, 'Missing signature or timestamp'
    
    # Verificar que el timestamp no sea muy antiguo (prevenir replay attacks)
    try:
        request_time = int(timestamp)
        current_time = int(time.time())
        
        # Si el timestamp es más de 5 minutos viejo, rechazar
        if abs(current_time - request_time) > 300:
            return False, 'Timestamp too old'
    except ValueError:
        return False, 'Invalid timestamp'
    
    # Obtener payload
    payload = request.get_data(as_text=True)
    
    # Verificar firma
    if not WEBHOOK_SECRET:
        print('⚠️  WARNING: WEBHOOK_SECRET no configurado')
        return True, ''  # Permitir en desarrollo
    
    is_valid = verify_webhook_signature(signature, timestamp, payload, WEBHOOK_SECRET)
    
    if not is_valid:
        return False, 'Invalid signature'
    
    return True, ''


@app.route('/webhooks/skydropx', methods=['POST'])
def handle_webhook():
    """Endpoint principal para recibir webhooks"""
    
    # Verificar firma
    is_valid, error_message = verify_webhook(request)
    
    if not is_valid:
        print(f'⚠️  Firma inválida: {error_message}')
        return jsonify({'error': error_message}), 401
    
    # Obtener datos del webhook
    try:
        event = request.get_json()
    except:
        return jsonify({'error': 'Invalid JSON'}), 400
    
    event_type = event.get('event', 'unknown')
    event_id = event.get('id', 'unknown')
    
    print('=' * 60)
    print(f'📨 Webhook recibido: {event_type}')
    print(f'   ID: {event_id}')
    print(f'   Timestamp: {event.get("created_at", "N/A")}')
    print('=' * 60)
    print()
    
    # Procesar según el tipo de evento
    try:
        if event_type.startswith('shipment.'):
            handle_shipment_event(event)
        elif event_type.startswith('package.'):
            handle_package_event(event)
        elif event_type.startswith('pickup.'):
            handle_pickup_event(event)
        elif event_type.startswith('order.'):
            handle_order_event(event)
        elif event_type.startswith('quotation.'):
            handle_quotation_event(event)
        else:
            print(f'⚠️  Evento no manejado: {event_type}')
    except Exception as e:
        print(f'❌ Error procesando webhook: {e}')
        # Aún así responder 200 para evitar reintentos
    
    print()
    
    # Siempre responder 200 OK
    return jsonify({'received': True}), 200


def handle_shipment_event(event: dict):
    """Maneja eventos de envíos"""
    event_type = event['event']
    data = event.get('data', {})
    attrs = data.get('attributes', {})
    
    print('📦 EVENTO DE ENVÍO')
    
    if event_type == 'shipment.created':
        print(f'   ✨ Nuevo envío creado')
        print(f'   ID: {data.get("id")}')
        print(f'   Total: ${attrs.get("total")} {attrs.get("currency")}')
        # Aquí: guardar en DB, enviar notificación, etc.
        
    elif event_type == 'shipment.status.updated':
        print(f'   🔄 Estado actualizado')
        print(f'   Nuevo estado: {attrs.get("workflow_status")}')
        print(f'   Detalle: {attrs.get("status_detail", "N/A")}')
        # Aquí: actualizar DB, notificar al cliente
        
    elif event_type == 'shipment.delivered':
        print(f'   ✅ Envío entregado')
        print(f'   Número de guía: {attrs.get("tracking_number")}')
        print(f'   Firmado por: {attrs.get("signed_by", "N/A")}')
        # Aquí: marcar como entregado, cerrar orden, enviar confirmación
        
    elif event_type == 'shipment.cancelled':
        print(f'   🚫 Envío cancelado')
        print(f'   Razón: {attrs.get("status_detail", "N/A")}')
        # Aquí: actualizar inventario, reembolsar, notificar
        
    elif event_type == 'shipment.exception':
        print(f'   ❌ Incidencia en el envío')
        print(f'   Detalle: {attrs.get("status_detail")}')
        # Aquí: alertar al equipo, contactar al cliente


def handle_package_event(event: dict):
    """Maneja eventos de paquetes/tracking"""
    event_type = event['event']
    data = event.get('data', {})
    attrs = data.get('attributes', {})
    
    print('📦 EVENTO DE TRACKING')
    
    if event_type == 'package.tracking.updated':
        print(f'   📍 Nueva actualización de tracking')
        print(f'   Número: {attrs.get("tracking_number")}')
        print(f'   Estado: {attrs.get("tracking_status")}')
        print(f'   Ubicación: {attrs.get("location", "N/A")}')
        # Aquí: actualizar timeline, notificar cambios
        
    elif event_type == 'package.in_transit':
        print(f'   🚚 Paquete en tránsito')
        
    elif event_type == 'package.out_for_delivery':
        print(f'   🚴 En ruta de entrega')
        # Aquí: notificar al cliente que llegará hoy
        
    elif event_type == 'package.delivered':
        print(f'   ✅ Paquete entregado')
        
    elif event_type == 'package.failed_attempt':
        print(f'   ⚠️  Intento de entrega fallido')
        # Aquí: contactar al destinatario
        
    elif event_type == 'package.returned':
        print(f'   ↩️  Paquete devuelto')
        # Aquí: gestionar devolución


def handle_pickup_event(event: dict):
    """Maneja eventos de recolecciones"""
    event_type = event['event']
    data = event.get('data', {})
    
    print('🚚 EVENTO DE RECOLECCIÓN')
    
    if event_type == 'pickup.scheduled':
        print(f'   📅 Recolección programada')
        
    elif event_type == 'pickup.in_progress':
        print(f'   🚚 Mensajero en camino')
        
    elif event_type == 'pickup.completed':
        print(f'   ✅ Paquetes recolectados')
        
    elif event_type == 'pickup.failed':
        print(f'   ❌ Recolección fallida')
        
    elif event_type == 'pickup.cancelled':
        print(f'   🚫 Recolección cancelada')


def handle_order_event(event: dict):
    """Maneja eventos de órdenes"""
    event_type = event['event']
    
    print('🛒 EVENTO DE ORDEN')
    
    if event_type == 'order.created':
        print(f'   ✨ Nueva orden creada')
        
    elif event_type == 'order.updated':
        print(f'   🔄 Orden actualizada')
        
    elif event_type == 'order.shipped':
        print(f'   📦 Orden enviada')


def handle_quotation_event(event: dict):
    """Maneja eventos de cotizaciones"""
    event_type = event['event']
    
    print('💰 EVENTO DE COTIZACIÓN')
    
    if event_type == 'quotation.completed':
        print(f'   ✅ Cotización completa')
        
    elif event_type == 'quotation.rates_available':
        print(f'   💵 Tarifas disponibles')


@app.route('/health', methods=['GET'])
def health():
    """Endpoint de salud"""
    return jsonify({
        'status': 'ok',
        'service': 'skydropx-webhooks',
        'timestamp': time.time()
    })


@app.route('/', methods=['GET'])
def index():
    """Página de inicio"""
    return '''
    <html>
        <head><title>Skydropx Webhook Server</title></head>
        <body>
            <h1>🔔 Skydropx Webhook Server</h1>
            <p>Servidor funcionando correctamente</p>
            <ul>
                <li><code>POST /webhooks/skydropx</code> - Recibir webhooks</li>
                <li><code>GET /health</code> - Health check</li>
            </ul>
            <p>Configuración:</p>
            <ul>
                <li>Puerto: ''' + str(PORT) + '''</li>
                <li>Verificación HMAC: ''' + ('✅ Activa' if WEBHOOK_SECRET else '⚠️ Desactivada') + '''</li>
            </ul>
        </body>
    </html>
    '''


def main():
    """Inicia el servidor"""
    print('=' * 60)
    print('🔔 SERVIDOR DE WEBHOOKS SKYDROPX')
    print('=' * 60)
    print()
    print(f'🌍 URL: http://localhost:{PORT}')
    print(f'📨 Endpoint: http://localhost:{PORT}/webhooks/skydropx')
    print(f'🔒 Verificación HMAC: {"✅ Activa" if WEBHOOK_SECRET else "⚠️ Desactivada"}')
    print()
    print('💡 Para probar en desarrollo, usa ngrok:')
    print(f'   ngrok http {PORT}')
    print()
    print('📝 Presiona Ctrl+C para detener')
    print('=' * 60)
    print()
    
    app.run(host='0.0.0.0', port=PORT, debug=True)


if __name__ == '__main__':
    main()
