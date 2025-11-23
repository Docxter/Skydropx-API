# Guía: Crear tu Primer Envío

Esta guía te llevará paso a paso para crear tu primer envío con Skydropx.

## Antes de Empezar

### Requisitos Previos

- ✅ Cuenta de Skydropx ([Crear cuenta](https://app.skydropx.com/es-MX/users/sign_up))
- ✅ Client ID y Client Secret ([Obtener credenciales](https://pro.skydropx.com/merchant_stores/applications))
- ✅ Node.js instalado (v14 o superior)
- ✅ SDK de Skydropx instalado

### Instalación del SDK

```bash
npm install skydropx-api-client
```

O clona el repositorio:

```bash
git clone https://github.com/yourusername/skydropx-api-sdk.git
cd skydropx-api-sdk
npm install
```

---

## Paso 1: Configurar Credenciales

Crea un archivo `.env` en la raíz de tu proyecto:

```env
SKYDROPX_CLIENT_ID=tu_client_id_aqui
SKYDROPX_CLIENT_SECRET=tu_client_secret_aqui
SKYDROPX_ENVIRONMENT=sandbox
```

⚠️ **Importante**: Nunca subas el archivo `.env` a tu repositorio. Agrega `.env` a tu `.gitignore`.

---

## Paso 2: Inicializar el Cliente

Crea un archivo `create-first-shipment.js`:

```javascript
require('dotenv').config();
const SkydropxClient = require('skydropx-api-client');

const client = new SkydropxClient({
  clientId: process.env.SKYDROPX_CLIENT_ID,
  clientSecret: process.env.SKYDROPX_CLIENT_SECRET,
  environment: process.env.SKYDROPX_ENVIRONMENT
});
```

---

## Paso 3: Cotizar el Envío

Primero necesitas obtener tarifas de las paqueterías:

```javascript
async function createFirstShipment() {
  try {
    // 1. Autenticar
    console.log('🔐 Autenticando...');
    await client.authenticate();
    console.log('✅ Autenticado\n');
    
    // 2. Crear cotización
    console.log('💰 Creando cotización...');
    const quotation = await client.createQuotation({
      address_from: {
        country_code: 'MX',
        postal_code: '64000',
        area_level1: 'Nuevo León',
        area_level2: 'Monterrey',
        area_level3: 'Centro'
      },
      address_to: {
        country_code: 'MX',
        postal_code: '01000',
        area_level1: 'Ciudad de México',
        area_level2: 'Álvaro Obregón',
        area_level3: 'Santa Fe'
      },
      packages: [{
        weight: 2.5,     // kg
        length: 30,      // cm
        width: 20,       // cm
        height: 15       // cm
      }]
    });
    
    console.log(`✅ Cotización creada: ${quotation.id}\n`);
```

---

## Paso 4: Esperar las Tarifas

Las cotizaciones son asíncronas. Debemos esperar a que se procesen:

```javascript
    // 3. Esperar a que la cotización complete
    console.log('⏳ Esperando tarifas de paqueterías...');
    let quotationResult = quotation;
    let attempts = 0;
    const maxAttempts = 15; // 30 segundos máximo
    
    while (!quotationResult.is_completed && attempts < maxAttempts) {
      await sleep(2000); // Esperar 2 segundos
      quotationResult = await client.getQuotation(quotation.id);
      attempts++;
      process.stdout.write('.');
    }
    console.log(' ✅\n');
    
    if (!quotationResult.is_completed) {
      throw new Error('Timeout esperando cotización');
    }
```

---

## Paso 5: Seleccionar una Tarifa

Filtra las tarifas exitosas y selecciona la más económica:

```javascript
    // 4. Seleccionar mejor tarifa
    console.log('📊 Analizando tarifas...');
    const successfulRates = quotationResult.rates
      .filter(r => r.success);
    
    if (successfulRates.length === 0) {
      throw new Error('No se encontraron tarifas disponibles');
    }
    
    // Ordenar por precio (más barata primero)
    successfulRates.sort((a, b) => 
      parseFloat(a.total) - parseFloat(b.total)
    );
    
    const selectedRate = successfulRates[0];
    
    console.log(`✅ Tarifa seleccionada:`);
    console.log(`   Paquetería: ${selectedRate.provider_display_name}`);
    console.log(`   Servicio: ${selectedRate.provider_service_name}`);
    console.log(`   Precio: $${selectedRate.total} ${selectedRate.currency_code}`);
    console.log(`   Días de entrega: ${selectedRate.days}`);
    console.log(`   Rate ID: ${selectedRate.id}\n`);
```

---

## Paso 6: Crear el Envío

Con la tarifa seleccionada, crea el envío con las direcciones completas:

```javascript
    // 5. Crear envío
    console.log('📦 Creando envío...');
    const shipment = await client.createShipment({
      rate_id: selectedRate.id,
      printing_format: 'thermal', // o 'standard'
      
      // Dirección de origen (remitente)
      address_from: {
        name: 'Juan Pérez',
        company: 'Mi Empresa SA de CV',
        street1: 'Av. Constitución 123',
        phone: '8112345678',
        email: 'juan.perez@miempresa.com',
        reference: 'Edificio azul, entrada principal'
      },
      
      // Dirección de destino (destinatario)
      address_to: {
        name: 'María García López',
        company: 'Cliente Premium',
        street1: 'Calle Insurgentes 456 Int 302',
        phone: '5587654321',
        email: 'maria.garcia@cliente.com',
        reference: 'Torre B, piso 3'
      }
    });
    
    console.log('✅ ¡Envío creado exitosamente!\n');
```

---

## Paso 7: Obtener la Etiqueta

El envío incluye la URL de la etiqueta para imprimir:

```javascript
    // 6. Obtener información del envío
    console.log('📋 Información del envío:');
    console.log(`   ID: ${shipment.data.id}`);
    console.log(`   Estado: ${shipment.data.attributes.workflow_status}`);
    console.log(`   Total: $${shipment.data.attributes.total}`);
    
    // 7. Obtener información del paquete
    const packageInfo = shipment.included.find(
      item => item.type === 'packages'
    );
    
    if (packageInfo) {
      console.log('\n📦 Información del paquete:');
      console.log(`   Número de rastreo: ${packageInfo.attributes.tracking_number}`);
      console.log(`   Estado: ${packageInfo.attributes.tracking_status}`);
      
      if (packageInfo.attributes.label_url) {
        console.log(`\n🎫 Etiqueta de envío:`);
        console.log(`   ${packageInfo.attributes.label_url}`);
        console.log('   ⬇️  Descarga e imprime esta etiqueta\n');
      }
      
      if (packageInfo.attributes.tracking_url_provider) {
        console.log(`🔍 URL de rastreo:`);
        console.log(`   ${packageInfo.attributes.tracking_url_provider}\n`);
      }
    }
    
    console.log('✅ ¡Listo! Tu envío está creado.');
    console.log('   1. Descarga e imprime la etiqueta');
    console.log('   2. Pégala en tu paquete');
    console.log('   3. Programa una recolección o llévalo a sucursal\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) {
      console.error('Detalles:', JSON.stringify(error.details.data, null, 2));
    }
    process.exit(1);
  }
}

// Función auxiliar para esperar
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ejecutar
createFirstShipment();
```

---

## Código Completo

Aquí está el código completo en un solo archivo:

```javascript
require('dotenv').config();
const SkydropxClient = require('skydropx-api-client');

const client = new SkydropxClient({
  clientId: process.env.SKYDROPX_CLIENT_ID,
  clientSecret: process.env.SKYDROPX_CLIENT_SECRET,
  environment: process.env.SKYDROPX_ENVIRONMENT
});

async function createFirstShipment() {
  try {
    // 1. Autenticar
    await client.authenticate();
    
    // 2. Crear cotización
    const quotation = await client.createQuotation({
      address_from: {
        country_code: 'MX',
        postal_code: '64000',
        area_level1: 'Nuevo León',
        area_level2: 'Monterrey',
        area_level3: 'Centro'
      },
      address_to: {
        country_code: 'MX',
        postal_code: '01000',
        area_level1: 'Ciudad de México',
        area_level2: 'Álvaro Obregón',
        area_level3: 'Santa Fe'
      },
      packages: [{
        weight: 2.5,
        length: 30,
        width: 20,
        height: 15
      }]
    });
    
    // 3. Esperar tarifas
    let quotationResult = quotation;
    let attempts = 0;
    
    while (!quotationResult.is_completed && attempts < 15) {
      await sleep(2000);
      quotationResult = await client.getQuotation(quotation.id);
      attempts++;
    }
    
    // 4. Seleccionar mejor tarifa
    const selectedRate = quotationResult.rates
      .filter(r => r.success)
      .sort((a, b) => parseFloat(a.total) - parseFloat(b.total))[0];
    
    // 5. Crear envío
    const shipment = await client.createShipment({
      rate_id: selectedRate.id,
      address_from: {
        name: 'Juan Pérez',
        company: 'Mi Empresa',
        street1: 'Av. Constitución 123',
        phone: '8112345678',
        email: 'juan@empresa.com',
        reference: 'Edificio azul'
      },
      address_to: {
        name: 'María García',
        street1: 'Calle Insurgentes 456',
        phone: '5587654321',
        email: 'maria@cliente.com',
        reference: 'Torre B'
      }
    });
    
    // 6. Mostrar resultados
    const packageInfo = shipment.included.find(i => i.type === 'packages');
    console.log('✅ Envío creado!');
    console.log('Número de rastreo:', packageInfo.attributes.tracking_number);
    console.log('Etiqueta:', packageInfo.attributes.label_url);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

createFirstShipment();
```

---

## Ejecutar el Script

```bash
node create-first-shipment.js
```

Deberías ver una salida similar a:

```
🔐 Autenticando...
✅ Autenticado

💰 Creando cotización...
✅ Cotización creada: dde96439-67a9-41ec-90ed-af7f4ca2cec9

⏳ Esperando tarifas de paqueterías........... ✅

📊 Analizando tarifas...
✅ Tarifa seleccionada:
   Paquetería: FedEx
   Servicio: Express Saver
   Precio: $246.74 MXN
   Días de entrega: 1
   Rate ID: 938f6079-e608-4baa-b9b5-8be7f4de0535

📦 Creando envío...
✅ ¡Envío creado exitosamente!

📋 Información del envío:
   ID: 93774c22-8275-4757-9963-71b79b2e8db7
   Estado: pending
   Total: $246.74

📦 Información del paquete:
   Número de rastreo: 794874381730
   Estado: created

🎫 Etiqueta de envío:
   https://api.example.com/label_794874381730.pdf
   ⬇️  Descarga e imprime esta etiqueta

🔍 URL de rastreo:
   https://www.fedex.com/fedextrack/?trknbr=794874381730

✅ ¡Listo! Tu envío está creado.
   1. Descarga e imprime la etiqueta
   2. Pégala en tu paquete
   3. Programa una recolección o llévalo a sucursal
```

---

## Siguiente Paso

Ahora que creaste tu primer envío, puedes:

1. 📦 [Programar una Recolección](PICKUPS.md)
2. 🔍 [Rastrear tu Envío](../TRACKING.md)
3. 🌍 [Crear un Envío Internacional](INTERNATIONAL_SHIPPING.md)
4. 📦 [Envíos con Múltiples Paquetes](MULTI_PACKAGE.md)

---

## Solución de Problemas

### Error: "Credenciales inválidas"

Verifica que tu `CLIENT_ID` y `CLIENT_SECRET` sean correctos. Obtén nuevas credenciales desde el panel de Skydropx.

### Error: "No se encontraron tarifas"

- Verifica que los códigos postales sean válidos
- Asegúrate de que las paqueterías tengan cobertura en esa ruta
- Revisa que las dimensiones y peso sean razonables

### Error: "Token expirado"

El SDK renueva automáticamente el token, pero si usas cURL u otra herramienta, genera un nuevo token.

---

## Recursos Adicionales

- [Documentación de Cotizaciones](../QUOTATIONS.md)
- [Documentación de Envíos](../SHIPMENTS.md)
- [Ejemplo Completo](../../examples/shipments/create-shipment.js)
- [API Reference](https://app.skydropx.com/es-MX/api-docs)

---

¿Necesitas ayuda? Contacta a soporte:
- 📧 api@skydropx.com
- 💬 https://help.skydropx.com
