"""
Ejemplo: Autenticación con Skydropx API (Python)

Este ejemplo muestra cómo autenticarse con la API de Skydropx,
obtener información del token y del cliente.
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
    """Ejemplo de autenticación"""
    
    print('=' * 60)
    print('EJEMPLO: AUTENTICACIÓN CON SKYDROPX API')
    print('=' * 60)
    print()
    
    try:
        # 1. Crear cliente
        print('🔧 Creando cliente...')
        client = SkydropxClient(
            client_id=os.getenv('SKYDROPX_CLIENT_ID'),
            client_secret=os.getenv('SKYDROPX_CLIENT_SECRET'),
            environment=os.getenv('SKYDROPX_ENVIRONMENT', 'sandbox')
        )
        print('✅ Cliente creado\n')
        
        # 2. Autenticar
        print('🔐 Autenticando...')
        token_info = client.authenticate()
        
        print('✅ Autenticación exitosa!')
        print(f"   Token: {token_info['access_token'][:20]}...")
        print(f"   Tipo: {token_info['token_type']}")
        print(f"   Expira en: {token_info['expires_in']} segundos")
        print(f"   Scope: {token_info['scope']}")
        print()
        
        # 3. Obtener información del cliente
        print('📊 Información del cliente:')
        client_info = client.get_client_info()
        
        print(f"   Environment: {client_info['environment']}")
        print(f"   Base URL: {client_info['base_url']}")
        print(f"   Token válido: {'✅' if client_info['has_valid_token'] else '❌'}")
        print(f"   Expira: {client_info['token_expires_at']}")
        print()
        
        # 4. Introspeccionar token
        print('🔍 Introspección del token:')
        introspection = client.introspect_token()
        
        print(f"   Activo: {introspection['active']}")
        print(f"   Client ID: {introspection['client_id']}")
        print(f"   Scope: {introspection['scope']}")
        print(f"   Tipo: {introspection['token_type']}")
        print()
        
        print('=' * 60)
        print('✅ EJEMPLO COMPLETADO EXITOSAMENTE')
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
