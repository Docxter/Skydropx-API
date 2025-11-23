"""
Skydropx API Client para Python

Cliente oficial para interactuar con la API de Skydropx.
"""

from .skydropx_client import (
    SkydropxClient,
    SkydropxError,
    verify_webhook_signature
)

__version__ = '1.0.0'
__all__ = ['SkydropxClient', 'SkydropxError', 'verify_webhook_signature']
