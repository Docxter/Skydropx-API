"""
Ejemplo: Crear Cotización con Skydropx API (Python)

Este ejemplo muestra cómo crear una cotización, esperar a que se complete,
y comparar las tarifas disponibles de diferentes paqueterías.
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
    """Ejemplo de cotización"""
    
    print('=' * 60)
    print('EJEMPLO: COTIZACIÓN DE ENVÍO')
    print('=' * 60)
    print()
    
    try:
        # 1. Crear y autenticar cliente
        print('🔐 Autenticando...')
        client = SkydropxClient(
            client_id=os.getenv('SKYDROPX_CLIENT_ID'),
            client_secret=os.getenv('SKYDROPX_CLIENT_SECRET'),
            environment=os.getenv('SKYDROPX_ENVIRONMENT', 'sandbox')
        )
        client.authenticate()
        print('✅ Autenticado\n')
        
        # 2. Crear cotización
        print('💰 Creando cotización...')
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
        
        print(f"✅ Cotización creada: {quotation['id']}")
        print(f"   Estado: {'Completa' if quotation['is_completed'] else 'Procesando'}\n")
        
        # 3. Esperar a que se complete (polling)
        print('⏳ Esperando tarifas de paqueterías', end='', flush=True)
        quotation_result = client.wait_for_quotation(quotation['id'])
        print(' ✅\n')
        
        # 4. Analizar tarifas
        rates = quotation_result.get('rates', [])
        successful_rates = [r for r in rates if r.get('success')]
        
        if not successful_rates:
            print('⚠️  No se encontraron tarifas disponibles')
            return
        
        print(f"📊 Se encontraron {len(successful_rates)} tarifas:\n")
        
        # Ordenar por precio
        successful_rates.sort(key=lambda r: float(r['total']))
        
        # Mostrar todas las tarifas
        for i, rate in enumerate(successful_rates, 1):
            print(f"{i}. {rate['provider_display_name']} - {rate['provider_service_name']}")
            print(f"   💵 Precio: ${rate['total']} {rate['currency_code']}")
            print(f"   📅 Días: {rate['days']}")
            print(f"   ⚖️  Peso: {rate['weight']} kg")
            print(f"   📍 Zona: {rate['zone']}")
            print(f"   🚚 Recolección: {'✅' if rate.get('pickup') else '❌'}")
            print(f"   🛡️  Asegurable: {'✅' if rate.get('insurable') else '❌'}")
            print(f"   🆔 Rate ID: {rate['id']}")
            print()
        
        # 5. Recomendaciones
        print('💡 Recomendaciones:\n')
        
        # Más económica
        cheapest = successful_rates[0]
        print(f"💵 Más económica: {cheapest['provider_display_name']}")
        print(f"   ${cheapest['total']} {cheapest['currency_code']} - {cheapest['days']} días")
        print()
        
        # Más rápida
        fastest = min(successful_rates, key=lambda r: int(r['days']))
        print(f"⚡ Más rápida: {fastest['provider_display_name']}")
        print(f"   ${fastest['total']} {fastest['currency_code']} - {fastest['days']} días")
        print()
        
        # Mejor relación calidad/precio
        if len(successful_rates) > 1:
            mid_price = successful_rates[len(successful_rates) // 2]
            print(f"⭐ Mejor relación: {mid_price['provider_display_name']}")
            print(f"   ${mid_price['total']} {mid_price['currency_code']} - {mid_price['days']} días")
            print()
        
        print('=' * 60)
        print('✅ EJEMPLO COMPLETADO EXITOSAMENTE')
        print('=' * 60)
        print()
        print('💡 Para crear un envío, usa el Rate ID de la tarifa seleccionada')
        print('   Ejemplo: create_shipment.py')
        
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
