# CONTRIBUTING.md

¡Gracias por tu interés en contribuir al SDK de Skydropx API! 🎉

## Cómo Contribuir

### Reportar Bugs

Si encuentras un bug, por favor:

1. Verifica que no exista ya un issue similar
2. Crea un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Versión de Node.js y del SDK
   - Logs de error (sin credenciales)

### Sugerir Mejoras

Para sugerir nuevas características:

1. Abre un issue con la etiqueta "enhancement"
2. Describe la funcionalidad deseada
3. Explica el caso de uso
4. Propón una implementación si es posible

### Pull Requests

#### Antes de Empezar

1. Fork el repositorio
2. Clona tu fork: `git clone https://github.com/tu-usuario/skydropx-api-sdk.git`
3. Crea una branch: `git checkout -b feature/nueva-funcionalidad`
4. Instala dependencias: `npm install`

#### Durante el Desarrollo

1. Sigue las convenciones de código existentes
2. Escribe tests para nuevas funcionalidades
3. Actualiza la documentación según sea necesario
4. Asegura que todos los tests pasen: `npm test`
5. Verifica el linting: `npm run lint`

#### Enviar tu Pull Request

1. Commit tus cambios: `git commit -m "feat: descripción del cambio"`
2. Push a tu fork: `git push origin feature/nueva-funcionalidad`
3. Abre un Pull Request en GitHub
4. Describe claramente qué cambios hiciste y por qué
5. Enlaza issues relacionados

### Convenciones de Código

#### JavaScript/Node.js

```javascript
// ✅ Bueno
async function createShipment(data) {
  try {
    const response = await this.client.post('/shipments', { shipment: data });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}

// ❌ Malo
async function create_shipment(data){
  const response=await this.client.post('/shipments',{shipment:data})
  return response.data
}
```

#### Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: agregar soporte para envíos internacionales`
- `fix: corregir error en cálculo de peso volumétrico`
- `docs: actualizar guía de autenticación`
- `test: agregar tests para tracking`
- `refactor: mejorar manejo de errores`

### Documentación

Si agregas nuevas funcionalidades:

1. Actualiza el README.md
2. Agrega documentación en `/docs`
3. Incluye ejemplos en `/examples`
4. Actualiza la colección de Postman si aplica

### Tests

Todos los PRs deben incluir tests:

```javascript
// tests/client.test.js
describe('SkydropxClient', () => {
  describe('createShipment', () => {
    it('should create a shipment successfully', async () => {
      const client = new SkydropxClient({...});
      const shipment = await client.createShipment({...});
      
      expect(shipment).toHaveProperty('data');
      expect(shipment.data).toHaveProperty('id');
    });
    
    it('should throw error for invalid rate_id', async () => {
      const client = new SkydropxClient({...});
      
      await expect(
        client.createShipment({ rate_id: 'invalid' })
      ).rejects.toThrow('rate_not_found');
    });
  });
});
```

### Código de Conducta

- Sé respetuoso y profesional
- Acepta críticas constructivas
- Enfócate en lo mejor para el proyecto
- Ayuda a otros contribuidores

### Licencia

Al contribuir, aceptas que tus contribuciones se licencien bajo la licencia MIT del proyecto.

## Necesitas Ayuda?

- 📧 Email: api@skydropx.com
- 💬 Discussions: https://github.com/Docxter/Skydropx-API-sdk/discussions
- 📚 Docs: https://app.skydropx.com/es-MX/api-docs

¡Gracias por hacer este proyecto mejor! 🚀
