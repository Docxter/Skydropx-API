# 🚀 Guía de Ejecución Rápida - Skydropx API

## ⚡ Inicio en 3 Pasos

### Paso 1️⃣: Configurar

```bash
# Clonar repositorio
git clone https://github.com/Docxter/Skydropx-API.git
cd Skydropx-API

# Configurar credenciales
cp .env.example .env
# Editar .env con tus credenciales
```

### Paso 2️⃣: Instalar Dependencias

#### Para JavaScript
```bash
npm install
```

#### Para Python
```bash
pip install -r requirements.txt
```

### Paso 3️⃣: ¡Ejecutar!

---

## 🟢 JavaScript - Comandos

```bash
# ✅ 1. Autenticación
node examples/auth/authenticate.js

# 💰 2. Cotización
node examples/quotations/create-quotation.js

# 📦 3. Crear Envío Completo
node examples/shipments/create-shipment.js

# 🔍 4. Rastrear Envío
node examples/tracking/track-shipment.js

# 🔔 5. Servidor de Webhooks
node examples/webhooks/webhook-server.js
```

---

## 🐍 Python - Comandos

```bash
# ✅ 1. Autenticación
python examples/auth/authenticate.py

# 💰 2. Cotización
python examples/quotations/create_quotation.py

# 📦 3. Crear Envío Completo
python examples/shipments/create_shipment.py

# 🔍 4. Rastrear Envío
python examples/tracking/track_shipment.py

# 🔔 5. Servidor de Webhooks
python examples/webhooks/webhook_server.py
```

---

## 📋 Checklist de Ejecución

Antes de ejecutar los ejemplos, asegúrate de:

- [ ] ✅ Tener credenciales de Skydropx (Client ID y Secret)
- [ ] ✅ Archivo `.env` configurado
- [ ] ✅ Dependencias instaladas (`npm install` o `pip install -r requirements.txt`)
- [ ] ✅ Estar en el ambiente correcto (sandbox para pruebas)

---

## 🎯 Flujo Recomendado para Principiantes

### Primera Vez

1. **Autenticación** - Verifica que tus credenciales funcionan
   ```bash
   # JS
   node examples/auth/authenticate.js
   
   # Python
   python examples/auth/authenticate.py
   ```

2. **Cotización** - Compara tarifas de envío
   ```bash
   # JS
   node examples/quotations/create-quotation.js
   
   # Python
   python examples/quotations/create_quotation.py
   ```

3. **Crear Envío** - Flujo completo hasta obtener etiqueta
   ```bash
   # JS
   node examples/shipments/create-shipment.js
   
   # Python
   python examples/shipments/create_shipment.py
   ```

4. **Rastrear** - Sigue el estado de tu envío
   ```bash
   # JS
   node examples/tracking/track-shipment.js
   
   # Python
   python examples/tracking/track_shipment.py
   ```

5. **Webhooks** - Recibe notificaciones automáticas
   ```bash
   # JS
   node examples/webhooks/webhook-server.js
   
   # Python
   python examples/webhooks/webhook_server.py
   ```

---

## 🔧 Solución de Problemas

### Error: "Cannot find module"
```bash
# JavaScript
npm install

# Python
pip install -r requirements.txt
```

### Error: "Invalid credentials"
Verifica tu archivo `.env`:
```env
SKYDROPX_CLIENT_ID=tu_client_id_real
SKYDROPX_CLIENT_SECRET=tu_client_secret_real
SKYDROPX_ENVIRONMENT=sandbox
```

### Error: "Module not found" (Python)
El path puede necesitar ajuste. Los ejemplos ya incluyen:
```python
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / 'src' / 'clients' / 'python'))
```

---

## 💡 Tips

### JavaScript
- Usa Node.js v14 o superior
- Los ejemplos usan `async/await`
- Express para webhooks en puerto 3000

### Python
- Usa Python 3.7 o superior
- No necesita `async/await` (más simple)
- Flask para webhooks en puerto 3000

---

## 📚 Siguiente Paso

Una vez que hayas ejecutado los ejemplos básicos:

1. 📖 Lee la [Documentación Completa](docs/)
2. 🎓 Sigue el [Tutorial del Primer Envío](docs/guides/FIRST_SHIPMENT.md)
3. 📮 Prueba con [Postman](postman/)
4. 🔄 Integra en tu aplicación

---

## 🆘 Ayuda

¿Problemas? Consulta:
- [README.md](README.md) - Documentación completa
- [QUICKSTART.md](QUICKSTART.md) - Guía detallada
- [JAVASCRIPT_VS_PYTHON.md](JAVASCRIPT_VS_PYTHON.md) - Comparación
- 📧 api@skydropx.com

---

**¡Listo! Ahora tienes todos los comandos para empezar.** 🚀
