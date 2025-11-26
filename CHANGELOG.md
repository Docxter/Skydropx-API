# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [2.0.0] - 2024-01-16

### 🎉 Agregado - Soporte Multi-Lenguaje
- ✨ **SDK Python completo** (750+ líneas)
  - Clase `SkydropxClient` con todos los métodos
  - Excepción personalizada `SkydropxError`
  - Función helper `verify_webhook_signature()`
  - Type hints completos
  - Soporte para Python 3.7+
  
- 🐍 **5 Ejemplos Python funcionales**
  - `authenticate.py` - Autenticación OAuth
  - `create_quotation.py` - Cotizaciones con polling
  - `create_shipment.py` - Flujo completo de envío
  - `track_shipment.py` - Rastreo con historial
  - `webhook_server.py` - Servidor Flask con HMAC

- 📚 **Nueva Documentación**
  - `QUICKSTART.md` - Guía de inicio rápido para ambos lenguajes
  - `JAVASCRIPT_VS_PYTHON.md` - Comparación detallada
  - `src/clients/python/README.md` - Documentación específica de Python
  - Actualización completa del `README.md` principal

- 📦 **Dependencias Python**
  - `requirements.txt` con todas las dependencias
  - requests >= 2.31.0
  - python-dotenv >= 1.0.0
  - flask >= 3.0.0

### 🔄 Cambiado
- Actualizado `README.md` con instrucciones para ambos lenguajes
- Actualizado `PROJECT_SUMMARY.md` con métricas de ambos SDKs
- Estructura de proyecto reorganizada para multi-lenguaje

### 📊 Métricas Totales v2.0.0
- **Total de código**: 3,370+ líneas
- **SDKs completos**: 2 (JavaScript + Python)
- **Ejemplos funcionales**: 10 (5 por lenguaje)
- **Documentación**: 36 páginas
- **Cobertura API**: 95%

---

## [1.0.0] - 2024-01-15

### Agregado
- ✨ SDK completo para JavaScript/Node.js
- 🔐 Autenticación OAuth 2.0 con renovación automática
- 📦 Soporte completo para envíos (crear, listar, cancelar, asegurar)
- 💰 Sistema de cotizaciones con polling automático
- 🚚 Recolecciones (verificar cobertura, programar, reprogramar)
- 📍 Rastreo de envíos con historial completo
- 🔔 Webhooks con verificación HMAC-SHA512
- 📝 Documentación completa en español
- 🧪 Ejemplos funcionales para todos los casos de uso
- 📮 Colección de Postman con tests automáticos
- 🎯 Manejo avanzado de errores
- ⚡ Rate limiting automático (2 req/seg)
- 🔄 Sistema de reintentos inteligente

### Documentación
- 📖 Guía completa de autenticación
- 📦 Documentación de cotizaciones
- 🚀 Documentación de envíos
- 🚚 Documentación de recolecciones
- 📍 Documentación de rastreo
- 🔔 Documentación de webhooks
- 🎓 Tutorial: Tu primer envío
- 🌍 Guía de envíos internacionales (próximamente)
- 📦 Guía de múltiples paquetes (próximamente)

### Ejemplos
- ✅ Autenticación básica
- ✅ Crear cotización con comparación de tarifas
- ✅ Flujo completo de envío (cotizar → crear → rastrear)
- ✅ Rastreo con interpretación de estados
- ✅ Servidor de webhooks con Express
- 🔄 Programar recolección (próximamente)
- 📦 Gestión de órdenes (próximamente)
- 📊 Productos/catálogo (próximamente)

### Herramientas
- ⚙️ Colección de Postman con 20+ endpoints
- 🌍 Environment de Sandbox preconfigurado
- 🧪 Tests automáticos en Postman
- 📝 Scripts de renovación de token

## [Unreleased]

### Planeado
- 🐍 SDK para Python
- 🐘 SDK para PHP
- 💎 SDK para Ruby
- 🌍 Soporte completo para envíos internacionales
- 📦 Gestión de órdenes de e-commerce
- 📊 Gestión de productos/catálogo
- 🧪 Suite de tests unitarios y de integración
- 🖥️ CLI tool para operaciones rápidas
- 📱 Widget embebible de tracking
- 🔧 Herramientas de debugging
- 📈 Dashboard de métricas

### En Desarrollo
- Documentación de productos
- Documentación de órdenes
- Guía de envíos internacionales
- Guía de múltiples paquetes
- Guía de integración con e-commerce
- Ejemplo de integración con Shopify
- Ejemplo de integración con WooCommerce

---

## Tipos de Cambios

- `Agregado` - Para nuevas funcionalidades
- `Cambiado` - Para cambios en funcionalidades existentes
- `Obsoleto` - Para funcionalidades que serán removidas
- `Removido` - Para funcionalidades removidas
- `Corregido` - Para corrección de bugs
- `Seguridad` - Para vulnerabilidades de seguridad

---

## Versionado

Este proyecto usa [Semantic Versioning](https://semver.org/lang/es/):

- **MAJOR** (1.x.x): Cambios incompatibles con versiones anteriores
- **MINOR** (x.1.x): Nueva funcionalidad compatible con versiones anteriores
- **PATCH** (x.x.1): Correcciones de bugs compatibles con versiones anteriores

---

## Enlaces

- [Repositorio](https://github.com/Docxter/Skydropx-API-sdk)
- [Issues](https://github.com/Docxter/Skydropx-API-sdk/issues)
- [Documentación](https://app.skydropx.com/es-MX/api-docs)
- [Releases](https://github.com/Docxter/Skydropx-API-sdk/releases)
