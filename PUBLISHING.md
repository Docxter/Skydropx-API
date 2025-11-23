# 🚀 Guía de Publicación en GitHub

Esta guía te ayudará a publicar el SDK de Skydropx en GitHub de manera profesional.

## Antes de Publicar

### 1. Verificar que no haya credenciales

```bash
# Buscar posibles credenciales en el código
grep -r "client_id" --exclude-dir=node_modules --exclude=".git" .
grep -r "client_secret" --exclude-dir=node_modules --exclude=".git" .
grep -r "access_token" --exclude-dir=node_modules --exclude=".git" .
```

Asegúrate de que solo aparezcan en:
- `.env.example` (como placeholders)
- Documentación (como ejemplos)

### 2. Verificar .gitignore

El archivo `.gitignore` ya está configurado para excluir:
- `.env` (credenciales)
- `node_modules/`
- Archivos de IDEs
- Logs

## Crear el Repositorio en GitHub

### Opción 1: Interfaz Web

1. Ve a https://github.com/new
2. Nombre: `skydropx-api-sdk`
3. Descripción: `SDK oficial para la API de Skydropx - Gestiona envíos, cotizaciones y rastreo fácilmente`
4. Público o Privado según tus necesidades
5. **NO** inicialices con README, .gitignore o license (ya los tienes)
6. Click en **Create repository**

### Opción 2: GitHub CLI

```bash
gh repo create skydropx-api-sdk --public --description "SDK oficial para la API de Skydropx"
```

## Inicializar Git y Subir

### Primera vez

```bash
# Navegar al directorio del proyecto
cd "e:\skydropx\Skydropx API"

# Inicializar Git
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "feat: initial release - complete SDK for Skydropx API"

# Conectar con GitHub (reemplaza USERNAME)
git remote add origin https://github.com/USERNAME/skydropx-api-sdk.git

# Crear rama main
git branch -M main

# Subir código
git push -u origin main
```

## Configurar el Repositorio

### 1. Agregar Topics (Etiquetas)

En GitHub, ve a tu repositorio y click en el ícono de engranaje junto a "About":

**Topics sugeridos:**
- `skydropx`
- `shipping`
- `logistics`
- `api-client`
- `sdk`
- `nodejs`
- `javascript`
- `fedex`
- `dhl`
- `mexico`
- `rest-api`
- `oauth2`

### 2. Configurar GitHub Pages (Opcional)

Si quieres publicar la documentación:

1. Ve a **Settings** > **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **docs**
4. Click **Save**

### 3. Crear Release

```bash
# Crear tag
git tag -a v1.0.0 -m "Release v1.0.0 - SDK completo para Skydropx API"

# Subir tag
git push origin v1.0.0
```

O en GitHub:
1. Ve a **Releases** > **Create a new release**
2. Tag: `v1.0.0`
3. Title: `🚀 v1.0.0 - First Release`
4. Description: Copia el contenido del CHANGELOG.md
5. Click **Publish release**

### 4. Proteger la Rama Main

1. **Settings** > **Branches**
2. **Add rule**
3. Branch name: `main`
4. Habilitar:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass

## README Badges

Agrega estos badges al README.md (reemplaza USERNAME y REPONAME):

```markdown
[![npm version](https://badge.fury.io/js/skydropx-api-client.svg)](https://www.npmjs.com/package/skydropx-api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/USERNAME/skydropx-api-sdk.svg)](https://github.com/USERNAME/skydropx-api-sdk/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/USERNAME/skydropx-api-sdk.svg)](https://github.com/USERNAME/skydropx-api-sdk/issues)
[![GitHub forks](https://img.shields.io/github/forks/USERNAME/skydropx-api-sdk.svg)](https://github.com/USERNAME/skydropx-api-sdk/network)
```

## Publicar en NPM (Opcional)

### 1. Crear cuenta en NPM

```bash
npm login
```

### 2. Actualizar package.json

```json
{
  "name": "skydropx-api-client",
  "version": "1.0.0",
  "description": "SDK oficial para la API de Skydropx",
  "main": "src/clients/javascript/SkydropxClient.js",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/USERNAME/skydropx-api-sdk.git"
  },
  "keywords": [
    "skydropx",
    "shipping",
    "logistics",
    "api",
    "sdk",
    "fedex",
    "dhl",
    "mexico"
  ],
  "author": "Your Name",
  "license": "MIT"
}
```

### 3. Publicar

```bash
npm publish
```

Ahora los usuarios podrán instalar con:

```bash
npm install skydropx-api-client
```

## Configurar GitHub Actions (CI/CD)

Crea `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    
    - name: Install dependencies
      run: npm install
    
    - name: Run tests
      run: npm test
```

## Promover el Repositorio

### 1. En Redes Sociales

```
🚀 ¡Nuevo SDK para Skydropx API!

Gestiona envíos, cotizaciones y rastreo con solo unas líneas de código.

✅ OAuth 2.0 automático
✅ Soporte para FedEx, DHL, Estafeta y más
✅ Documentación completa en español
✅ Ejemplos funcionales

⭐ https://github.com/USERNAME/skydropx-api-sdk

#Skydropx #Shipping #Logistics #API #SDK #NodeJS
```

### 2. En Foros/Comunidades

- Reddit: r/node, r/javascript, r/webdev
- Dev.to: Escribe un artículo tutorial
- Medium: Publica una guía de uso
- LinkedIn: Anuncia el lanzamiento

### 3. En la Documentación Oficial

Contacta a Skydropx para que listen tu SDK:
- 📧 api@skydropx.com
- Pide que lo agreguen a: https://app.skydropx.com/es-MX/api-docs

## Mantenimiento

### Versionado Semántico

```bash
# Parche (bug fix) - 1.0.0 → 1.0.1
npm version patch

# Minor (nueva funcionalidad) - 1.0.0 → 1.1.0
npm version minor

# Major (cambios incompatibles) - 1.0.0 → 2.0.0
npm version major

# Subir cambios
git push && git push --tags
```

### Issues y Pull Requests

1. Responde issues en menos de 24 horas
2. Usa labels: `bug`, `enhancement`, `documentation`
3. Mantén CHANGELOG.md actualizado
4. Revisa PRs con cuidado

### Security

1. Configura GitHub Dependabot
2. Habilita Security Alerts
3. Mantén dependencias actualizadas

```bash
npm audit
npm update
```

## Checklist de Publicación

- [ ] Código sin credenciales
- [ ] Tests pasando (si los hay)
- [ ] Documentación completa
- [ ] CHANGELOG actualizado
- [ ] LICENSE incluido
- [ ] .gitignore configurado
- [ ] README con badges
- [ ] Repositorio creado en GitHub
- [ ] Código subido
- [ ] Topics configurados
- [ ] Release v1.0.0 creado
- [ ] (Opcional) Publicado en NPM
- [ ] (Opcional) GitHub Actions configurado
- [ ] Promovido en redes sociales

## Recursos

- [GitHub Guides](https://guides.github.com/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [NPM Publishing](https://docs.npmjs.com/cli/v9/commands/npm-publish)

---

¡Listo! Ahora tu SDK está publicado y listo para que la comunidad lo use. 🎉
