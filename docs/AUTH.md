# Autenticación - Skydropx API

## Resumen

La API de Skydropx utiliza **OAuth 2.0** con el flujo `client_credentials` para autenticación. Los tokens tienen una validez de **2 horas** y permiten hasta **2 solicitudes por segundo**.

## Endpoints

### 1. Obtener Token de Acceso

Obtiene un token de acceso para usar en todas las peticiones a la API.

```http
POST /api/v1/oauth/token
Content-Type: application/json

{
  "client_id": "tu_client_id",
  "client_secret": "tu_client_secret",
  "grant_type": "client_credentials"
}
```

#### Respuesta Exitosa (200)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 7200,
  "scope": "default",
  "created_at": 1699920000
}
```

#### Ejemplo en JavaScript

```javascript
const client = new SkydropxClient({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  environment: 'sandbox'
});

await client.authenticate();
```

#### Ejemplo en cURL

```bash
curl -X POST 'https://app.skydropx.com/api/v1/oauth/token' \
  -H 'Content-Type: application/json' \
  -d '{
    "client_id": "your_client_id",
    "client_secret": "your_client_secret",
    "grant_type": "client_credentials"
  }'
```

---

### 2. Revocar Token

Revoca un token de acceso existente.

```http
POST /api/v1/oauth/revoke
Content-Type: application/json

{
  "client_id": "tu_client_id",
  "client_secret": "tu_client_secret",
  "token": "tu_token",
  "token_type_hint": "access_token"
}
```

#### Ejemplo en JavaScript

```javascript
await client.revokeToken();
```

---

### 3. Introspección de Token

Obtiene información detallada sobre un token de acceso.

```http
POST /api/v1/oauth/introspect
Content-Type: application/json

{
  "client_id": "tu_client_id",
  "client_secret": "tu_client_secret",
  "token": "tu_token",
  "token_type_hint": "access_token"
}
```

#### Respuesta Exitosa (200)

```json
{
  "active": true,
  "scope": "default",
  "client_id": "your_client_id",
  "token_type": "Bearer",
  "exp": 1699927200,
  "iat": 1699920000
}
```

#### Ejemplo en JavaScript

```javascript
const tokenInfo = await client.introspectToken();
console.log('Token expira:', new Date(tokenInfo.exp * 1000));
```

---

## Uso del Token

Una vez obtenido el token, inclúyelo en el header `Authorization` de todas tus peticiones:

```http
GET /api/v1/shipments
Authorization: Bearer tu_access_token
Content-Type: application/json
```

---

## Renovación Automática

El cliente SDK de JavaScript renueva automáticamente el token 5 minutos antes de su expiración:

```javascript
// El cliente maneja la renovación automática
const client = new SkydropxClient({...});

// Primera petición: autentica automáticamente
await client.getShipments();

// 2 horas después: renueva el token automáticamente
await client.getShipments();
```

---

## Mejores Prácticas

### ✅ Recomendado

- **Renovar antes de expirar**: Renueva el token 5-10 minutos antes de que expire
- **Manejo de errores 401**: Implementa lógica para renovar el token en caso de error 401
- **Almacenamiento seguro**: Nunca expongas tus credenciales en el código fuente
- **Variables de entorno**: Usa `.env` para almacenar credenciales
- **Rate limiting**: Respeta el límite de 2 solicitudes por segundo

### ❌ Evitar

- **Credenciales en código**: Nunca hagas commit de credenciales
- **Token compartido**: No compartas el mismo token entre múltiples servicios
- **Sin expiración**: No asumas que el token es válido indefinidamente
- **Logs públicos**: No registres tokens completos en logs

---

## Códigos de Error

| Código | Descripción | Solución |
|--------|-------------|----------|
| 400 | Credenciales faltantes | Verifica que envías `client_id`, `client_secret` y `grant_type` |
| 401 | Credenciales inválidas | Verifica tus credenciales en el panel de Skydropx |
| 403 | Cliente no autorizado | Contacta a soporte para verificar tu cuenta |
| 429 | Rate limit excedido | Reduce la frecuencia de peticiones (máx 2/seg) |

---

## Ejemplo Completo

```javascript
const SkydropxClient = require('./SkydropxClient');

async function main() {
  // 1. Crear cliente
  const client = new SkydropxClient({
    clientId: process.env.SKYDROPX_CLIENT_ID,
    clientSecret: process.env.SKYDROPX_CLIENT_SECRET,
    environment: 'sandbox'
  });
  
  try {
    // 2. Autenticar
    const tokenInfo = await client.authenticate();
    console.log('Token obtenido:', tokenInfo.access_token.substring(0, 20) + '...');
    console.log('Expira en:', tokenInfo.expires_in, 'segundos');
    
    // 3. Verificar información del cliente
    const clientInfo = client.getClientInfo();
    console.log('Token válido:', clientInfo.hasValidToken);
    
    // 4. Introspeccionar token
    const introspection = await client.introspectToken();
    console.log('Token activo:', introspection.active);
    
    // 5. Usar la API
    const shipments = await client.getShipments();
    console.log('Envíos obtenidos:', shipments.data.length);
    
  } catch (error) {
    if (error.details?.status === 401) {
      console.error('Error de autenticación. Verifica tus credenciales.');
    } else {
      console.error('Error:', error.message);
    }
  }
}

main();
```

---

## Obtener Credenciales

### Sandbox (Pruebas)
1. Ve a https://sb-pro.skydropx.com/merchant_stores/applications
2. Crea una nueva aplicación o selecciona una existente
3. Copia tu `Client ID` y `Client Secret`

### Producción
1. Ve a https://pro.skydropx.com/merchant_stores/applications
2. Crea una nueva aplicación o selecciona una existente
3. Copia tu `Client ID` y `Client Secret`

---

## Recursos Adicionales

- [Guía de Inicio Rápido](../guides/QUICKSTART.md)
- [Ejemplo de Autenticación](../../examples/auth/authenticate.js)
- [Documentación Oficial](https://app.skydropx.com/es-MX/api-docs)

---

## Soporte

¿Problemas con la autenticación?
- 📧 Email: api@skydropx.com
- 📚 Documentación: https://help.skydropx.com
