# Colección de Postman - Skydropx API

Esta carpeta contiene la colección completa de Postman para la API de Skydropx.

## 📦 Archivos

- `Skydropx_API.postman_collection.json` - Colección principal con todos los endpoints
- `Skydropx_Sandbox.postman_environment.json` - Environment para Sandbox

## 🚀 Instalación

### 1. Importar en Postman

1. Abre Postman
2. Click en **Import** (o `Ctrl+O`)
3. Arrastra los archivos `.json` o selecciónalos
4. Click en **Import**

### 2. Configurar Environment

1. Click en el selector de environment (esquina superior derecha)
2. Selecciona **Skydropx - Sandbox**
3. Click en el ícono de ojo 👁️ y luego en **Edit**
4. Completa las variables:
   - `client_id`: Tu Client ID de Skydropx
   - `client_secret`: Tu Client Secret de Skydropx
5. Click en **Save**

## 📖 Uso

### Flujo Básico

1. **Authentication** > **Get Access Token**
   - Ejecuta esta request primero
   - El token se guarda automáticamente en `access_token`

2. **Quotations** > **Create Quotation**
   - Crea una cotización
   - El `quotation_id` se guarda automáticamente

3. **Quotations** > **Get Quotation**
   - Espera 5-10 segundos
   - Ejecuta para obtener las tarifas
   - El mejor `rate_id` se guarda automáticamente

4. **Shipments** > **Create Shipment**
   - Usa el `rate_id` guardado
   - El `shipment_id` y `tracking_number` se guardan automáticamente

5. **Tracking** > **Track Shipment**
   - Usa el `tracking_number` guardado
   - Consulta el estado del envío

### Variables Automáticas

Las siguientes variables se actualizan automáticamente con los tests de Postman:

- `access_token` - Se obtiene al autenticar
- `quotation_id` - Al crear cotización
- `rate_id` - Al obtener tarifas (selecciona la más barata)
- `shipment_id` - Al crear envío
- `tracking_number` - Al crear envío
- `pickup_id` - Al crear recolección
- `webhook_id` - Al crear webhook
- `webhook_secret` - Al crear webhook

## 📂 Estructura de la Colección

```
Skydropx API/
├── Authentication/
│   ├── Get Access Token
│   ├── Introspect Token
│   └── Revoke Token
├── Quotations/
│   ├── Create Quotation (National)
│   └── Get Quotation
├── Shipments/
│   ├── Create Shipment
│   ├── Get Shipments
│   ├── Get Shipment by ID
│   ├── Cancel Shipment
│   └── Protect Shipment (Insurance)
├── Tracking/
│   ├── Track Shipment
│   └── Track Multiple Shipments
├── Pickups/
│   ├── Check Pickup Coverage
│   ├── Create Pickup
│   ├── Get Pickups
│   └── Reschedule Pickup
└── Webhooks/
    ├── Create Webhook
    ├── Get Webhooks
    └── Delete Webhook
```

## 🔄 Renovación de Token

El token de acceso expira cada 2 horas. Cuando recibas un error `401`, ejecuta:

**Authentication** > **Get Access Token**

El nuevo token se guardará automáticamente.

## 🌍 Environments

### Sandbox (Pruebas)

```json
{
  "base_url": "https://app.skydropx.com",
  "client_id": "tu_sandbox_client_id",
  "client_secret": "tu_sandbox_client_secret"
}
```

### Production (Producción)

Para producción, crea un nuevo environment con:

```json
{
  "base_url": "https://app.skydropx.com",
  "client_id": "tu_production_client_id",
  "client_secret": "tu_production_client_secret"
}
```

⚠️ **Importante**: Usa environments diferentes para Sandbox y Producción.

## 📝 Ejemplos de Uso

### Crear Envío Completo

1. **Authentication** > **Get Access Token**
2. **Quotations** > **Create Quotation (National)**
3. Esperar 5 segundos
4. **Quotations** > **Get Quotation**
5. **Shipments** > **Create Shipment**
6. **Tracking** > **Track Shipment**

### Programar Recolección

1. **Shipments** > **Create Shipment** (crea 1 o más envíos)
2. **Pickups** > **Check Pickup Coverage** (verificar cobertura)
3. **Pickups** > **Create Pickup** (programar recolección)

### Configurar Webhooks

1. **Webhooks** > **Create Webhook**
2. ⚠️ Copia el `secret` que se muestra en la respuesta
3. Guárdalo en `webhook_secret` del environment
4. Configura tu servidor para recibir los webhooks

## 🧪 Tests Automáticos

Cada request incluye tests que:

- Verifican el código de respuesta
- Extraen y guardan variables relevantes
- Muestran información en la consola

### Ver Resultados de Tests

Después de ejecutar una request:

1. Click en **Test Results** (abajo)
2. Revisa los tests pasados ✅
3. Ve a la **Console** (`Ctrl+Alt+C`) para logs detallados

## 🔐 Seguridad

⚠️ **Nunca compartas tus environments con credenciales**

Las variables marcadas como `secret` no se exportan al compartir la colección.

Para compartir la colección:

1. Exporta solo la Collection (sin environment)
2. Comparte `Skydropx_Sandbox.postman_environment.json` (sin llenar credenciales)
3. Cada usuario debe agregar sus propias credenciales

## 📚 Recursos

- [Documentación de API](https://app.skydropx.com/es-MX/api-docs)
- [Guía de Primer Envío](../docs/guides/FIRST_SHIPMENT.md)
- [Documentación de Autenticación](../docs/AUTH.md)
- [Postman Learning Center](https://learning.postman.com/)

## 🆘 Soporte

Si encuentras problemas con la colección:

1. Verifica que el token esté actualizado
2. Revisa los tests en la consola
3. Consulta la [documentación oficial](https://app.skydropx.com/es-MX/api-docs)
4. Contacta a soporte: api@skydropx.com

## 📋 Changelog

### v1.0.0 (2024-01-15)

- ✅ Colección inicial con todos los endpoints principales
- ✅ Environment de Sandbox configurado
- ✅ Tests automáticos para extraer variables
- ✅ Scripts de autenticación automática
- ✅ Documentación completa de cada endpoint
