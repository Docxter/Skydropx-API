const axios = require('axios');

/**
 * Cliente profesional para la API de Skydropx
 * 
 * @class SkydropxClient
 * @description Cliente completo para interactuar con todos los endpoints de la API de Skydropx
 * @author Skydropx Community
 * @version 1.0.0
 * 
 * @example
 * const client = new SkydropxClient({
 *   clientId: 'your_client_id',
 *   clientSecret: 'your_client_secret',
 *   environment: 'sandbox'
 * });
 * 
 * await client.authenticate();
 * const quotation = await client.createQuotation({...});
 */
class SkydropxClient {
  /**
   * @param {Object} config - Configuración del cliente
   * @param {string} config.clientId - Client ID de Skydropx
   * @param {string} config.clientSecret - Client Secret de Skydropx
   * @param {string} [config.environment='sandbox'] - Ambiente: 'sandbox' o 'production'
   * @param {number} [config.timeout=30000] - Timeout de las peticiones en ms
   * @param {number} [config.retryAttempts=3] - Número de reintentos en caso de error
   */
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.environment = config.environment || 'sandbox';
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    
    // URL base según ambiente
    this.baseURL = 'https://app.skydropx.com';
    
    this.accessToken = null;
    this.tokenExpiresAt = null;
    
    // Configurar axios
    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Interceptor para manejar renovación automática de token
    this.httpClient.interceptors.request.use(
      async (config) => {
        if (this.shouldRenewToken()) {
          await this.authenticate();
        }
        
        if (this.accessToken && !config.url.includes('/oauth/token')) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Interceptor para manejar errores
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          await this.authenticate();
          error.config.headers.Authorization = `Bearer ${this.accessToken}`;
          return this.httpClient(error.config);
        }
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Verifica si el token debe renovarse
   * @private
   */
  shouldRenewToken() {
    if (!this.accessToken || !this.tokenExpiresAt) return true;
    
    // Renovar 5 minutos antes de expirar
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return now >= (this.tokenExpiresAt - fiveMinutes);
  }
  
  // ==================== AUTENTICACIÓN ====================
  
  /**
   * Obtiene un token de acceso
   * @returns {Promise<Object>} Información del token
   * @throws {Error} Si las credenciales son inválidas
   * 
   * @example
   * await client.authenticate();
   */
  async authenticate() {
    try {
      const response = await this.httpClient.post('/api/v1/oauth/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials'
      });
      
      this.accessToken = response.data.access_token;
      
      // Calcular tiempo de expiración (expires_in en segundos)
      const expiresIn = response.data.expires_in * 1000; // Convertir a ms
      this.tokenExpiresAt = Date.now() + expiresIn;
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al autenticar', error);
    }
  }
  
  /**
   * Revoca el token actual
   * @returns {Promise<void>}
   */
  async revokeToken() {
    try {
      await this.httpClient.post('/api/v1/oauth/revoke', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        token: this.accessToken,
        token_type_hint: 'access_token'
      });
      
      this.accessToken = null;
      this.tokenExpiresAt = null;
    } catch (error) {
      throw this.handleError('Error al revocar token', error);
    }
  }
  
  /**
   * Obtiene información del token actual
   * @returns {Promise<Object>} Detalles del token
   */
  async introspectToken() {
    try {
      const response = await this.httpClient.post('/api/v1/oauth/introspect', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        token: this.accessToken,
        token_type_hint: 'access_token'
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al inspeccionar token', error);
    }
  }
  
  // ==================== COTIZACIONES ====================
  
  /**
   * Crea una cotización
   * @param {Object} quotationData - Datos de la cotización
   * @returns {Promise<Object>} Cotización creada
   * 
   * @example
   * const quotation = await client.createQuotation({
   *   address_from: {
   *     country_code: 'MX',
   *     postal_code: '64000',
   *     area_level1: 'Nuevo León',
   *     area_level2: 'Monterrey',
   *     area_level3: 'Centro'
   *   },
   *   address_to: {
   *     country_code: 'MX',
   *     postal_code: '01000',
   *     area_level1: 'Ciudad de México',
   *     area_level2: 'Álvaro Obregón',
   *     area_level3: 'Santa Fe'
   *   },
   *   packages: [{
   *     weight: 2.5,
   *     length: 30,
   *     width: 20,
   *     height: 15
   *   }]
   * });
   */
  async createQuotation(quotationData) {
    try {
      const response = await this.httpClient.post('/api/v1/quotations', {
        quotation: quotationData
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al crear cotización', error);
    }
  }
  
  /**
   * Obtiene una cotización por ID
   * @param {string} quotationId - ID de la cotización
   * @returns {Promise<Object>} Detalles de la cotización
   */
  async getQuotation(quotationId) {
    try {
      const response = await this.httpClient.get(`/api/v1/quotations/${quotationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError('Error al obtener cotización', error);
    }
  }
  
  // ==================== ENVÍOS ====================
  
  /**
   * Crea un envío
   * @param {Object} shipmentData - Datos del envío
   * @returns {Promise<Object>} Envío creado
   * 
   * @example
   * const shipment = await client.createShipment({
   *   rate_id: 'rate_id_from_quotation',
   *   address_from: {
   *     name: 'Juan Pérez',
   *     company: 'Mi Empresa',
   *     street1: 'Av. Principal 123',
   *     phone: '8112345678',
   *     email: 'juan@example.com',
   *     reference: 'Edificio azul'
   *   },
   *   address_to: {
   *     name: 'María García',
   *     street1: 'Calle 456',
   *     phone: '5587654321',
   *     email: 'maria@example.com'
   *   }
   * });
   */
  async createShipment(shipmentData) {
    try {
      const response = await this.httpClient.post('/api/v1/shipments', {
        shipment: shipmentData
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al crear envío', error);
    }
  }
  
  /**
   * Obtiene todos los envíos (paginados)
   * @param {number} [page=1] - Número de página
   * @returns {Promise<Object>} Lista de envíos
   */
  async getShipments(page = 1) {
    try {
      const response = await this.httpClient.get('/api/v1/shipments', {
        params: { page }
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al obtener envíos', error);
    }
  }
  
  /**
   * Obtiene un envío por ID
   * @param {string} shipmentId - ID del envío
   * @returns {Promise<Object>} Detalles del envío
   */
  async getShipment(shipmentId) {
    try {
      const response = await this.httpClient.get(`/api/v1/shipments/${shipmentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError('Error al obtener envío', error);
    }
  }
  
  /**
   * Cancela un envío
   * @param {string} shipmentId - ID del envío
   * @param {string} reason - Razón de cancelación
   * @returns {Promise<Object>} Confirmación de cancelación
   */
  async cancelShipment(shipmentId, reason = 'Cancelado por el usuario') {
    try {
      const response = await this.httpClient.post(
        `/api/v1/shipments/${shipmentId}/cancellations`,
        { reason, shipment_id: shipmentId }
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al cancelar envío', error);
    }
  }
  
  /**
   * Protege un envío
   * @param {string} shipmentId - ID del envío
   * @param {number} declaredValue - Valor declarado del envío
   * @returns {Promise<Object>} Detalles de la protección
   */
  async protectShipment(shipmentId, declaredValue) {
    try {
      const response = await this.httpClient.post(
        `/api/v1/shipments/${shipmentId}/protect`,
        {
          protect: {
            declared_value: declaredValue,
            shipment_id: shipmentId
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al proteger envío', error);
    }
  }
  
  /**
   * Rastrea un envío
   * @param {string} trackingNumber - Número de rastreo
   * @param {string} carrierName - Nombre de la paquetería (fedex, dhl, etc)
   * @returns {Promise<Object>} Eventos de rastreo
   * 
   * @example
   * const tracking = await client.trackShipment('123456789', 'fedex');
   */
  async trackShipment(trackingNumber, carrierName) {
    try {
      const response = await this.httpClient.get('/api/v1/shipments/tracking', {
        params: {
          tracking_number: trackingNumber,
          carrier_name: carrierName
        }
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al rastrear envío', error);
    }
  }
  
  // ==================== RECOLECCIONES ====================
  
  /**
   * Obtiene cobertura de fechas para recolección
   * @param {string} shipmentId - ID del envío
   * @returns {Promise<Object>} Fechas disponibles
   */
  async getPickupCoverage(shipmentId) {
    try {
      const response = await this.httpClient.get('/api/v1/pickups/coverage', {
        params: { shipment_id: shipmentId }
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al obtener cobertura de recolección', error);
    }
  }
  
  /**
   * Crea una recolección
   * @param {Object} pickupData - Datos de la recolección
   * @returns {Promise<Object>} Recolección creada
   * 
   * @example
   * const pickup = await client.createPickup({
   *   reference_shipment_id: 'shipment_id',
   *   packages: 1,
   *   total_weight: 2.5,
   *   scheduled_from: '2024-01-15T09:00:00.000-06:00',
   *   scheduled_to: '2024-01-15T14:00:00.000-06:00'
   * });
   */
  async createPickup(pickupData) {
    try {
      const response = await this.httpClient.post('/api/v1/pickups', {
        pickup: pickupData
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al crear recolección', error);
    }
  }
  
  /**
   * Obtiene todas las recolecciones (paginadas)
   * @param {number} [page=1] - Número de página
   * @returns {Promise<Object>} Lista de recolecciones
   */
  async getPickups(page = 1) {
    try {
      const response = await this.httpClient.get('/api/v1/pickups', {
        params: { page }
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al obtener recolecciones', error);
    }
  }
  
  /**
   * Obtiene una recolección por ID
   * @param {string} pickupId - ID de la recolección
   * @returns {Promise<Object>} Detalles de la recolección
   */
  async getPickup(pickupId) {
    try {
      const response = await this.httpClient.get(`/api/v1/pickups/${pickupId}`);
      return response.data;
    } catch (error) {
      throw this.handleError('Error al obtener recolección', error);
    }
  }
  
  /**
   * Reprograma una recolección
   * @param {Object} pickupData - Datos de reprogramación
   * @returns {Promise<Object>} Recolección reprogramada
   */
  async reschedulePickup(pickupData) {
    try {
      const response = await this.httpClient.post('/api/v1/pickups/reschedule', {
        pickup: pickupData
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al reprogramar recolección', error);
    }
  }
  
  // ==================== ÓRDENES ====================
  
  /**
   * Obtiene todas las órdenes
   * @returns {Promise<Object>} Lista de órdenes
   */
  async getOrders() {
    try {
      const response = await this.httpClient.get('/api/v1/orders');
      return response.data;
    } catch (error) {
      throw this.handleError('Error al obtener órdenes', error);
    }
  }
  
  /**
   * Obtiene una orden por ID
   * @param {string} orderId - ID de la orden
   * @returns {Promise<Object>} Detalles de la orden
   */
  async getOrder(orderId) {
    try {
      const response = await this.httpClient.get(`/api/v1/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw this.handleError('Error al obtener orden', error);
    }
  }
  
  /**
   * Crea una orden
   * @param {Object} orderData - Datos de la orden
   * @returns {Promise<Object>} Orden creada
   */
  async createOrder(orderData) {
    try {
      const response = await this.httpClient.post('/api/v1/orders', {
        order: orderData
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al crear orden', error);
    }
  }
  
  /**
   * Actualiza una orden
   * @param {string} orderId - ID de la orden
   * @param {Object} orderData - Datos actualizados
   * @returns {Promise<Object>} Orden actualizada
   */
  async updateOrder(orderId, orderData) {
    try {
      const response = await this.httpClient.patch(`/api/v1/orders/${orderId}`, {
        order: orderData
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al actualizar orden', error);
    }
  }
  
  // ==================== PRODUCTOS ====================
  
  /**
   * Obtiene lista de productos (paginados)
   * @param {number} [page=1] - Número de página
   * @param {Object} [filters={}] - Filtros opcionales
   * @returns {Promise<Object>} Lista de productos
   */
  async getProducts(page = 1, filters = {}) {
    try {
      const response = await this.httpClient.get('/api/v1/products', {
        params: { page, ...filters }
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError('Error al obtener productos', error);
    }
  }
  
  // ==================== CONFIGURACIÓN ====================
  
  /**
   * Actualiza el formato de impresión
   * @param {string} format - Formato: 'standard' o 'thermal'
   * @returns {Promise<void>}
   */
  async updatePrintingFormat(format) {
    try {
      await this.httpClient.patch('/api/v1/settings/printing_formats', {
        printing_format: format
      });
    } catch (error) {
      throw this.handleError('Error al actualizar formato de impresión', error);
    }
  }
  
  // ==================== UTILIDADES ====================
  
  /**
   * Maneja errores de la API
   * @private
   */
  handleError(message, error) {
    const errorInfo = {
      message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      originalError: error.message
    };
    
    const errorMessage = `${message}: ${error.response?.data?.message || error.message}`;
    const apiError = new Error(errorMessage);
    apiError.details = errorInfo;
    
    return apiError;
  }
  
  /**
   * Obtiene información del cliente
   * @returns {Object} Información de configuración
   */
  getClientInfo() {
    return {
      environment: this.environment,
      baseURL: this.baseURL,
      hasValidToken: !!this.accessToken && Date.now() < this.tokenExpiresAt,
      tokenExpiresAt: this.tokenExpiresAt ? new Date(this.tokenExpiresAt) : null
    };
  }
}

module.exports = SkydropxClient;
