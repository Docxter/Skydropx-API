"""
Ejemplo: Rastrear Envío con Skydropx API (Python)

Este ejemplo muestra cómo rastrear un envío por número de guía,
obtener su estado actual y ver el historial completo de eventos.
"""

import os
import sys
from pathlib import Path
from datetime import datetime

# Agregar el directorio src al path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / 'src' / 'clients' / 'python'))

from skydropx_client import SkydropxClient, SkydropxError
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()


def get_status_icon(status: str) -> str:
    """Obtiene un icono para el estado"""
    icons = {
        'created': '📝',
        'picked_up': '📦',
        'in_transit': '🚚',
        'out_for_delivery': '🚴',
        'delivered': '✅',
        'available_for_pickup': '🏪',
        'failed_attempt': '⚠️',
        'exception': '❌',
        'returned_to_sender': '↩️',
        'cancelled': '🚫'
    }
    return icons.get(status, '❓')


def get_status_message(status: str) -> str:
    """Obtiene mensaje en español para el estado"""
    messages = {
        'created': 'Etiqueta creada',
        'picked_up': 'Paquete recolectado',
        'in_transit': 'En camino',
        'out_for_delivery': 'Salió a entrega',
        'delivered': '¡Entregado!',
        'available_for_pickup': 'Disponible en sucursal',
        'failed_attempt': 'Intento de entrega fallido',
        'exception': 'Incidencia',
        'returned_to_sender': 'Devuelto al remitente',
        'cancelled': 'Cancelado'
    }
    return messages.get(status, 'Estado desconocido')


def format_datetime(dt_string: str) -> str:
    """Formatea una fecha ISO a formato legible"""
    try:
        dt = datetime.fromisoformat(dt_string.replace('Z', '+00:00'))
        return dt.strftime('%d/%m/%Y %H:%M')
    except:
        return dt_string


def main():
    """Ejemplo de rastreo"""
    
    print('=' * 60)
    print('EJEMPLO: RASTREAR ENVÍO')
    print('=' * 60)
    print()
    
    # Solicitar datos de rastreo
    tracking_number = input('📦 Número de guía: ').strip()
    if not tracking_number:
        print('❌ Debes proporcionar un número de guía')
        return
    
    print('\n🚚 Paqueterías disponibles:')
    print('   1. fedex')
    print('   2. dhl')
    print('   3. estafeta')
    print('   4. ups')
    print('   5. redpack')
    print('   6. sendex')
    print()
    
    carrier_code = input('Código de paquetería [fedex]: ').strip() or 'fedex'
    print()
    
    try:
        # 1. Autenticar
        print('🔐 Autenticando...')
        client = SkydropxClient(
            client_id=os.getenv('SKYDROPX_CLIENT_ID'),
            client_secret=os.getenv('SKYDROPX_CLIENT_SECRET'),
            environment=os.getenv('SKYDROPX_ENVIRONMENT', 'sandbox')
        )
        client.authenticate()
        print('✅ Autenticado\n')
        
        # 2. Rastrear envío
        print(f"🔍 Rastreando {tracking_number} con {carrier_code}...")
        tracking = client.track_shipment(tracking_number, carrier_code)
        print('✅ Información obtenida\n')
        
        # 3. Mostrar información general
        data = tracking['data']
        attrs = data['attributes']
        
        print('=' * 60)
        print('INFORMACIÓN DEL ENVÍO')
        print('=' * 60)
        print()
        
        # Estado actual
        status = attrs['tracking_status']
        print(f"{get_status_icon(status)} ESTADO ACTUAL: {get_status_message(status)}")
        print(f"   {attrs.get('status_detail', '')}")
        print()
        
        # Información general
        print('📋 Datos del envío:')
        print(f"   Número de guía: {attrs['tracking_number']}")
        print(f"   Paquetería: {attrs['carrier_name']}")
        print(f"   Servicio: {attrs.get('service_type', 'N/A')}")
        print(f"   Peso: {attrs.get('weight', 'N/A')} kg")
        print()
        
        # Origen y destino
        if attrs.get('origin'):
            origin = attrs['origin']
            print(f"📍 Origen: {origin.get('city')}, {origin.get('state')}, {origin.get('country')}")
        
        if attrs.get('destination'):
            dest = attrs['destination']
            print(f"📍 Destino: {dest.get('city')}, {dest.get('state')}, {dest.get('country')}")
        
        print()
        
        # Fechas
        if attrs.get('estimated_delivery_date'):
            print(f"📅 Entrega estimada: {attrs['estimated_delivery_date']}")
        
        if attrs.get('actual_delivery_date'):
            print(f"✅ Entregado el: {format_datetime(attrs['actual_delivery_date'])}")
            if attrs.get('signed_by'):
                print(f"   Firmado por: {attrs['signed_by']}")
        
        print()
        
        # 4. Historial de eventos
        events = [item for item in tracking.get('included', []) if item['type'] == 'tracking_events']
        
        if events:
            print('=' * 60)
            print('HISTORIAL DE EVENTOS')
            print('=' * 60)
            print()
            
            # Ordenar por fecha (más reciente primero)
            events.sort(key=lambda e: e['attributes']['datetime'], reverse=True)
            
            for i, event in enumerate(events, 1):
                event_attrs = event['attributes']
                event_status = event_attrs['status']
                
                print(f"{i}. {get_status_icon(event_status)} {event_attrs['description']}")
                print(f"   📅 {format_datetime(event_attrs['datetime'])}")
                
                if event_attrs.get('location'):
                    print(f"   📍 {event_attrs['location']}")
                
                if event_attrs.get('signed_by'):
                    print(f"   ✍️  Firmado por: {event_attrs['signed_by']}")
                
                print()
        
        print('=' * 60)
        print('✅ RASTREO COMPLETADO')
        print('=' * 60)
        
    except SkydropxError as e:
        print()
        print('❌ Error de Skydropx:')
        print(f'   Mensaje: {e.message}')
        if e.status_code:
            print(f'   Código: {e.status_code}')
        if e.response_data:
            print(f'   Detalles: {e.response_data}')
        sys.exit(1)
        
    except Exception as e:
        print()
        print(f'❌ Error inesperado: {e}')
        sys.exit(1)


if __name__ == '__main__':
    main()
