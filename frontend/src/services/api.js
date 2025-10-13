import axios from 'axios';

// Configuración base de axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // El servidor respondió con un código de estado de error
      const message = error.response.data?.message || error.response.data?.error || 'Error del servidor';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      return Promise.reject(new Error('No se pudo conectar con el servidor'));
    } else {
      // Algo más pasó
      return Promise.reject(new Error('Error inesperado'));
    }
  }
);

// Servicios para Proveedores
export const proveedoresService = {
  // Obtener lista de proveedores para dropdowns
  getProveedores: () => api.get('/proveedores'),
  
  // Obtener lista completa de proveedores
  getTodosProveedores: () => api.get('/proveedores/todos'),
  
  // Obtener proveedor por ID
  getProveedor: (id) => api.get(`/proveedores/${id}`),
  
  // Crear nuevo proveedor
  crearProveedor: (data) => api.post('/proveedores', data),
  
  // Actualizar proveedor
  actualizarProveedor: (id, data) => api.put(`/proveedores/${id}`, data),
  
  // Eliminar proveedor
  eliminarProveedor: (id) => api.delete(`/proveedores/${id}`),
};

// Servicios para Inventario
export const inventarioService = {
  // Obtener inventario completo con JOIN a proveedores
  getInventario: () => api.get('/inventario'),
  
  // Obtener producto por ID
  getProducto: (id) => api.get(`/inventario/${id}`),
  
  // Obtener productos por proveedor
  getProductosPorProveedor: (id) => api.get(`/inventario/proveedor/${id}`),
  
  // Crear nuevo producto
  crearProducto: (data) => api.post('/inventario', data),
  
  // Actualizar producto
  actualizarProducto: (id, data) => api.put(`/inventario/${id}`, data),
  
  // Eliminar producto
  eliminarProducto: (id) => api.delete(`/inventario/${id}`),
};

// Servicios generales
export const generalService = {
  // Verificar salud del servidor
  checkHealth: () => api.get('/health'),
};

export default api;



