"""
Skydropx API Client for Python

Este cliente permite interactuar con la API de Skydropx de manera sencilla.
Incluye autenticación automática, renovación de tokens y manejo de errores.

Uso básico:
    from skydropx_client import SkydropxClient
    
    client = SkydropxClient(
        client_id='your_client_id',
        client_secret='your_client_secret',
        environment='sandbox'
    )
    
    # Autenticar
    client.authenticate()
    
    # Crear cotización
    quotation = client.create_quotation({
        'address_from': {...},
        'address_to': {...},
        'packages': [...]
    })
"""

import requests
import time
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta


class SkydropxError(Exception):
    """Excepción base para errores de Skydropx"""
    
    def __init__(self, message: str, status_code: Optional[int] = None, response_data: Optional[Dict] = None):
        self.message = message
        self.status_code = status_code
        self.response_data = response_data
        super().__init__(self.message)


class SkydropxClient:
    """
    Cliente para la API de Skydropx
    
    Args:
        client_id: Client ID de OAuth
        client_secret: Client Secret de OAuth
        environment: 'sandbox' o 'production'
        auto_renew_token: Si debe renovar automáticamente el token (default: True)
    """
    
    BASE_URLS = {
        'sandbox': 'https://app.skydropx.com',
        'production': 'https://app.skydropx.com'
    }
    
    def __init__(
        self,
        client_id: str,
        client_secret: str,
        environment: str = 'sandbox',
        auto_renew_token: bool = True
    ):
        self.client_id = client_id
        self.client_secret = client_secret
        self.environment = environment
        self.auto_renew_token = auto_renew_token
        
        self.base_url = self.BASE_URLS.get(environment, self.BASE_URLS['sandbox'])
        self.access_token: Optional[str] = None
        self.token_expires_at: Optional[datetime] = None
        
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Skydropx-Python-SDK/1.0.0'
        })
    
    def _should_renew_token(self) -> bool:
        """Verifica si el token debe renovarse"""
        if not self.access_token or not self.token_expires_at:
            return True
        
        # Renovar 5 minutos antes de expirar
        return datetime.now() >= (self.token_expires_at - timedelta(minutes=5))
    
    def _handle_error(self, response: requests.Response) -> None:
        """Maneja errores de la API"""
        try:
            error_data = response.json()
        except:
            error_data = {'error': response.text}
        
        error_messages = {
            400: 'Solicitud inválida',
            401: 'No autorizado - Verifica tus credenciales',
            403: 'Acceso prohibido',
            404: 'Recurso no encontrado',
            422: 'Error de validación',
            429: 'Límite de tasa excedido - Intenta más tarde',
            500: 'Error interno del servidor',
            503: 'Servicio no disponible'
        }
        
        message = error_messages.get(response.status_code, f'Error {response.status_code}')
        
        raise SkydropxError(
            message=message,
            status_code=response.status_code,
            response_data=error_data
        )
    
    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        requires_auth: bool = True
    ) -> Dict:
        """Realiza una petición a la API"""
        
        # Renovar token si es necesario
        if requires_auth and self.auto_renew_token and self._should_renew_token():
            self.authenticate()
        
        # Configurar headers
        headers = {}
        if requires_auth and self.access_token:
            headers['Authorization'] = f'Bearer {self.access_token}'
        
        # Realizar petición
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                params=params,
                headers=headers,
                timeout=30
            )
            
            if not response.ok:
                self._handle_error(response)
            
            return response.json() if response.content else {}
            
        except requests.exceptions.Timeout:
            raise SkydropxError('Timeout - La solicitud tardó demasiado')
        except requests.exceptions.ConnectionError:
            raise SkydropxError('Error de conexión - Verifica tu internet')
        except SkydropxError:
            raise
        except Exception as e:
            raise SkydropxError(f'Error inesperado: {str(e)}')
    
    # ============= AUTENTICACIÓN =============
    
    def authenticate(self) -> Dict:
        """
        Obtiene un access token de OAuth
        
        Returns:
            Dict con información del token
        """
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'grant_type': 'client_credentials'
        }
        
        response = self._request(
            'POST',
            '/api/v1/oauth/token',
            data=data,
            requires_auth=False
        )
        
        self.access_token = response['access_token']
        expires_in = response.get('expires_in', 7200)
        self.token_expires_at = datetime.now() + timedelta(seconds=expires_in)
        
        return response
    
    def revoke_token(self) -> Dict:
        """Revoca el token actual"""
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'token': self.access_token,
            'token_type_hint': 'access_token'
        }
        
        response = self._request(
            'POST',
            '/api/v1/oauth/revoke',
            data=data,
            requires_auth=False
        )
        
        self.access_token = None
        self.token_expires_at = None
        
        return response
    
    def introspect_token(self) -> Dict:
        """Obtiene información del token actual"""
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'token': self.access_token,
            'token_type_hint': 'access_token'
        }
        
        return self._request(
            'POST',
            '/api/v1/oauth/introspect',
            data=data,
            requires_auth=False
        )
    
    # ============= COTIZACIONES =============
    
    def create_quotation(self, quotation_data: Dict) -> Dict:
        """
        Crea una cotización
        
        Args:
            quotation_data: Datos de la cotización
            
        Returns:
            Dict con información de la cotización
        """
        return self._request(
            'POST',
            '/api/v1/quotations',
            data={'quotation': quotation_data}
        )
    
    def get_quotation(self, quotation_id: str) -> Dict:
        """
        Obtiene los resultados de una cotización
        
        Args:
            quotation_id: ID de la cotización
            
        Returns:
            Dict con tarifas disponibles
        """
        return self._request(
            'GET',
            f'/api/v1/quotations/{quotation_id}'
        )
    
    def wait_for_quotation(self, quotation_id: str, max_attempts: int = 15, sleep_seconds: int = 2) -> Dict:
        """
        Espera a que una cotización se complete (polling)
        
        Args:
            quotation_id: ID de la cotización
            max_attempts: Número máximo de intentos
            sleep_seconds: Segundos entre intentos
            
        Returns:
            Dict con cotización completada
        """
        attempts = 0
        
        while attempts < max_attempts:
            quotation = self.get_quotation(quotation_id)
            
            if quotation.get('is_completed'):
                return quotation
            
            time.sleep(sleep_seconds)
            attempts += 1
        
        raise SkydropxError('Timeout esperando cotización - Intenta más tarde')
    
    # ============= ENVÍOS =============
    
    def create_shipment(self, shipment_data: Dict) -> Dict:
        """
        Crea un envío
        
        Args:
            shipment_data: Datos del envío
            
        Returns:
            Dict con información del envío
        """
        return self._request(
            'POST',
            '/api/v1/shipments',
            data={'shipment': shipment_data}
        )
    
    def get_shipments(self, params: Optional[Dict] = None) -> Dict:
        """
        Lista envíos con filtros opcionales
        
        Args:
            params: Filtros (page, per_page, status, etc)
            
        Returns:
            Dict con lista de envíos
        """
        return self._request(
            'GET',
            '/api/v1/shipments',
            params=params
        )
    
    def get_shipment(self, shipment_id: str) -> Dict:
        """
        Obtiene un envío por ID
        
        Args:
            shipment_id: ID del envío
            
        Returns:
            Dict con información del envío
        """
        return self._request(
            'GET',
            f'/api/v1/shipments/{shipment_id}'
        )
    
    def cancel_shipment(self, shipment_id: str, reason: str = '') -> Dict:
        """
        Cancela un envío
        
        Args:
            shipment_id: ID del envío
            reason: Razón de cancelación
            
        Returns:
            Dict con envío cancelado
        """
        return self._request(
            'POST',
            f'/api/v1/shipments/{shipment_id}/cancel',
            data={'cancellation_reason': reason}
        )
    
    def protect_shipment(self, shipment_id: str, declared_value: float) -> Dict:
        """
        Agrega seguro a un envío
        
        Args:
            shipment_id: ID del envío
            declared_value: Valor declarado
            
        Returns:
            Dict con envío asegurado
        """
        return self._request(
            'POST',
            f'/api/v1/shipments/{shipment_id}/protect',
            data={'declared_value': declared_value}
        )
    
    # ============= RASTREO =============
    
    def track_shipment(self, tracking_number: str, carrier_code: str) -> Dict:
        """
        Rastrea un envío
        
        Args:
            tracking_number: Número de guía
            carrier_code: Código de paquetería (fedex, dhl, etc)
            
        Returns:
            Dict con información de rastreo
        """
        return self._request(
            'GET',
            '/api/v1/tracking',
            params={
                'tracking_number': tracking_number,
                'carrier_code': carrier_code
            }
        )
    
    def track_multiple_shipments(self, trackings: List[Dict]) -> Dict:
        """
        Rastrea múltiples envíos
        
        Args:
            trackings: Lista de dicts con tracking_number y carrier_code
            
        Returns:
            Dict con información de múltiples rastreos
        """
        return self._request(
            'POST',
            '/api/v1/tracking/bulk',
            data={'trackings': trackings}
        )
    
    # ============= RECOLECCIONES =============
    
    def get_pickup_coverage(self, postal_code: str, country_code: str = 'MX') -> Dict:
        """
        Verifica cobertura de recolección
        
        Args:
            postal_code: Código postal
            country_code: Código de país
            
        Returns:
            Dict con información de cobertura
        """
        return self._request(
            'POST',
            '/api/v1/pickup_coverage',
            data={
                'zip': postal_code,
                'country_code': country_code
            }
        )
    
    def create_pickup(self, pickup_data: Dict) -> Dict:
        """
        Programa una recolección
        
        Args:
            pickup_data: Datos de la recolección
            
        Returns:
            Dict con información de la recolección
        """
        return self._request(
            'POST',
            '/api/v1/pickups',
            data={'pickup': pickup_data}
        )
    
    def get_pickups(self, params: Optional[Dict] = None) -> Dict:
        """
        Lista recolecciones
        
        Args:
            params: Filtros opcionales
            
        Returns:
            Dict con lista de recolecciones
        """
        return self._request(
            'GET',
            '/api/v1/pickups',
            params=params
        )
    
    def reschedule_pickup(self, pickup_id: str, pickup_data: Dict) -> Dict:
        """
        Reprograma una recolección
        
        Args:
            pickup_id: ID de la recolección
            pickup_data: Nuevos datos
            
        Returns:
            Dict con recolección actualizada
        """
        return self._request(
            'PUT',
            f'/api/v1/pickups/{pickup_id}/reschedule',
            data=pickup_data
        )
    
    # ============= WEBHOOKS =============
    
    def create_webhook(self, webhook_data: Dict) -> Dict:
        """
        Registra un webhook
        
        Args:
            webhook_data: Datos del webhook
            
        Returns:
            Dict con información del webhook
        """
        return self._request(
            'POST',
            '/api/v1/webhooks',
            data={'webhook': webhook_data}
        )
    
    def get_webhooks(self) -> Dict:
        """
        Lista webhooks registrados
        
        Returns:
            Dict con lista de webhooks
        """
        return self._request(
            'GET',
            '/api/v1/webhooks'
        )
    
    def update_webhook(self, webhook_id: str, webhook_data: Dict) -> Dict:
        """
        Actualiza un webhook
        
        Args:
            webhook_id: ID del webhook
            webhook_data: Datos actualizados
            
        Returns:
            Dict con webhook actualizado
        """
        return self._request(
            'PUT',
            f'/api/v1/webhooks/{webhook_id}',
            data={'webhook': webhook_data}
        )
    
    def delete_webhook(self, webhook_id: str) -> Dict:
        """
        Elimina un webhook
        
        Args:
            webhook_id: ID del webhook
            
        Returns:
            Dict vacío en caso de éxito
        """
        return self._request(
            'DELETE',
            f'/api/v1/webhooks/{webhook_id}'
        )
    
    # ============= UTILIDADES =============
    
    def get_client_info(self) -> Dict:
        """
        Obtiene información del cliente
        
        Returns:
            Dict con información de configuración
        """
        return {
            'environment': self.environment,
            'base_url': self.base_url,
            'has_valid_token': bool(self.access_token and not self._should_renew_token()),
            'token_expires_at': self.token_expires_at.isoformat() if self.token_expires_at else None
        }


def verify_webhook_signature(signature: str, timestamp: str, payload: str, secret: str) -> bool:
    """
    Verifica la firma HMAC de un webhook
    
    Args:
        signature: Firma del header X-Skydropx-Signature
        timestamp: Timestamp del header X-Skydropx-Timestamp
        payload: Body del request como string
        secret: Secret del webhook
        
    Returns:
        True si la firma es válida
    """
    import hmac
    import hashlib
    
    # Crear payload firmado
    signed_payload = f"{timestamp}.{payload}"
    
    # Calcular HMAC-SHA512
    expected_signature = hmac.new(
        secret.encode(),
        signed_payload.encode(),
        hashlib.sha512
    ).hexdigest()
    
    # Comparar (time-safe)
    signature_without_prefix = signature.replace('sha512=', '')
    
    return hmac.compare_digest(signature_without_prefix, expected_signature)
