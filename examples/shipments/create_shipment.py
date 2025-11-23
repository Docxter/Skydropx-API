"""
Ejemplo: Crear Envío Completo con Skydropx API (Python)

Este ejemplo muestra el flujo completo:
1. Crear cotización
2. Esperar tarifas
3. Seleccionar mejor tarifa
4. Crear envío
5. Obtener etiqueta y número de rastreo
"""

import os
import sys
from pathlib import Path

# Agregar el directorio src al path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / 'src' / 'clients' / 'python'))

from skydropx_client import SkydropxClient, SkydropxError
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()


def main():
    """Ejemplo de envío completo"""
    
    print('=' * 60)
    print('EJEMPLO: CREAR ENVÍO COMPLETO')
    print('=' * 60)
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
        
        # 2. Crear cotización
        print('💰 Paso 1: Creando cotización...')
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
            'packages': [
                {
                    'weight': 2.5,
                    'length': 30,
                    'width': 20,
                    'height': 15
                }
            ]
        })
        print(f"✅ Cotización creada: {quotation['id']}\n")
        
        # 3. Esperar tarifas
        print('⏳ Paso 2: Esperando tarifas', end='', flush=True)
        quotation_result = client.wait_for_quotation(quotation['id'])
        print(' ✅\n')
        
        # 4. Seleccionar mejor tarifa
        print('📊 Paso 3: Seleccionando mejor tarifa...')
        rates = [r for r in quotation_result.get('rates', []) if r.get('success')]
        
        if not rates:
            print('❌ No se encontraron tarifas disponibles')
            return
        
        # Ordenar por precio y seleccionar la más barata
        rates.sort(key=lambda r: float(r['total']))
        selected_rate = rates[0]
        
        print(f"✅ Tarifa seleccionada:")
        print(f"   Paquetería: {selected_rate['provider_display_name']}")
        print(f"   Servicio: {selected_rate['provider_service_name']}")
        print(f"   Precio: ${selected_rate['total']} {selected_rate['currency_code']}")
        print(f"   Días: {selected_rate['days']}")
        print(f"   Rate ID: {selected_rate['id']}")
        print()
        
        # 5. Crear envío
        print('📦 Paso 4: Creando envío...')
        shipment = client.create_shipment({
            'rate_id': selected_rate['id'],
            'printing_format': 'thermal',
            'address_from': {
                'name': 'Juan Pérez',
                'company': 'Mi Empresa SA de CV',
                'street1': 'Av. Constitución 123',
                'phone': '8112345678',
                'email': 'juan.perez@miempresa.com',
                'reference': 'Edificio azul, entrada principal'
            },
            'address_to': {
                'name': 'María García López',
                'company': 'Cliente Premium',
                'street1': 'Insurgentes Sur 456',
                'phone': '5587654321',
                'email': 'maria.garcia@cliente.com',
                'reference': 'Torre B, piso 3, tocar timbre'
            }
        })
        
        print('✅ ¡Envío creado exitosamente!\n')
        
        # 6. Mostrar información del envío
        shipment_data = shipment['data']
        print('📋 Información del envío:')
        print(f"   ID: {shipment_data['id']}")
        print(f"   Estado: {shipment_data['attributes']['workflow_status']}")
        print(f"   Total: ${shipment_data['attributes']['total']} {shipment_data['attributes']['currency']}")
        print()
        
        # 7. Obtener información del paquete
        package_info = None
        for item in shipment.get('included', []):
            if item['type'] == 'packages':
                package_info = item
                break
        
        if package_info:
            attrs = package_info['attributes']
            print('📦 Información del paquete:')
            print(f"   Número de rastreo: {attrs['tracking_number']}")
            print(f"   Estado: {attrs['tracking_status']}")
            print()
            
            if attrs.get('label_url'):
                print('🎫 Etiqueta de envío:')
                print(f"   {attrs['label_url']}")
                print('   ⬇️  Descarga e imprime esta etiqueta')
                print()
            
            if attrs.get('tracking_url_provider'):
                print('🔍 URL de rastreo:')
                print(f"   {attrs['tracking_url_provider']}")
                print()
        
        print('=' * 60)
        print('✅ ENVÍO COMPLETADO')
        print('=' * 60)
        print()
        print('📝 Próximos pasos:')
        print('   1. Descarga e imprime la etiqueta')
        print('   2. Pégala en tu paquete')
        print('   3. Programa una recolección o llévalo a sucursal')
        print()
        print('💡 Para rastrear el envío, usa:')
        print('   python examples/tracking/track_shipment.py')
        
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
