const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/inventario - Ver inventario completo con JOIN a proveedores
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        i.id_inventario,
        i.nombre,
        i.descripcion,
        i.stock,
        i.costo_unitario,
        i.fecha_registro,
        p.id_proveedor,
        p.nombre_compania
      FROM inventario i
      INNER JOIN proveedores p ON i.id_proveedor = p.id_proveedor
      ORDER BY i.fecha_registro DESC, i.nombre ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el inventario',
      message: error.message
    });
  }
});

// POST /api/inventario - Crear nuevo producto en inventario
router.post('/', async (req, res) => {
  try {
    const { id_proveedor, nombre, descripcion, stock, costo_unitario } = req.body;
    
    // Validaciones básicas
    if (!id_proveedor || !nombre) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos faltantes',
        message: 'id_proveedor y nombre son obligatorios'
      });
    }
    
    // Validar que el proveedor existe
    const proveedorQuery = 'SELECT id_proveedor FROM proveedores WHERE id_proveedor = $1';
    const proveedorResult = await pool.query(proveedorQuery, [id_proveedor]);
    
    if (proveedorResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Proveedor no válido',
        message: `No existe un proveedor con ID ${id_proveedor}`
      });
    }
    
    // Validar valores numéricos
    const stockValue = stock !== undefined ? parseInt(stock) : 0;
    const costoValue = costo_unitario !== undefined ? parseFloat(costo_unitario) : 0;
    
    if (stockValue < 0) {
      return res.status(400).json({
        success: false,
        error: 'Stock inválido',
        message: 'El stock no puede ser negativo'
      });
    }
    
    if (costoValue < 0) {
      return res.status(400).json({
        success: false,
        error: 'Costo inválido',
        message: 'El costo unitario no puede ser negativo'
      });
    }
    
    const query = `
      INSERT INTO inventario (id_proveedor, nombre, descripcion, stock, costo_unitario)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [id_proveedor, nombre, descripcion, stockValue, costoValue];
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      message: 'Producto agregado al inventario exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al agregar producto al inventario',
      message: error.message
    });
  }
});

// GET /api/inventario/:id - Obtener producto por ID con información del proveedor
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        i.id_inventario,
        i.nombre,
        i.descripcion,
        i.stock,
        i.costo_unitario,
        i.fecha_registro,
        p.id_proveedor,
        p.nombre_compania,
        p.telefono,
        p.email
      FROM inventario i
      INNER JOIN proveedores p ON i.id_proveedor = p.id_proveedor
      WHERE i.id_inventario = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado',
        message: `No existe un producto con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener producto',
      message: error.message
    });
  }
});

// PUT /api/inventario/:id - Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_proveedor, nombre, descripcion, stock, costo_unitario } = req.body;
    
    // Validaciones básicas
    if (!id_proveedor || !nombre) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos faltantes',
        message: 'id_proveedor y nombre son obligatorios'
      });
    }
    
    // Validar que el proveedor existe
    const proveedorQuery = 'SELECT id_proveedor FROM proveedores WHERE id_proveedor = $1';
    const proveedorResult = await pool.query(proveedorQuery, [id_proveedor]);
    
    if (proveedorResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Proveedor no válido',
        message: `No existe un proveedor con ID ${id_proveedor}`
      });
    }
    
    // Validar valores numéricos
    const stockValue = stock !== undefined ? parseInt(stock) : 0;
    const costoValue = costo_unitario !== undefined ? parseFloat(costo_unitario) : 0;
    
    if (stockValue < 0) {
      return res.status(400).json({
        success: false,
        error: 'Stock inválido',
        message: 'El stock no puede ser negativo'
      });
    }
    
    if (costoValue < 0) {
      return res.status(400).json({
        success: false,
        error: 'Costo inválido',
        message: 'El costo unitario no puede ser negativo'
      });
    }
    
    const query = `
      UPDATE inventario 
      SET id_proveedor = $1, nombre = $2, descripcion = $3, stock = $4, costo_unitario = $5
      WHERE id_inventario = $6
      RETURNING *
    `;
    
    const values = [id_proveedor, nombre, descripcion, stockValue, costoValue, id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado',
        message: `No existe un producto con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar producto',
      message: error.message
    });
  }
});

// DELETE /api/inventario/:id - Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      DELETE FROM inventario 
      WHERE id_inventario = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado',
        message: `No existe un producto con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Producto eliminado del inventario exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar producto',
      message: error.message
    });
  }
});

// GET /api/inventario/proveedor/:id - Obtener productos por proveedor
router.get('/proveedor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        i.id_inventario,
        i.nombre,
        i.descripcion,
        i.stock,
        i.costo_unitario,
        i.fecha_registro,
        p.id_proveedor,
        p.nombre_compania
      FROM inventario i
      INNER JOIN proveedores p ON i.id_proveedor = p.id_proveedor
      WHERE i.id_proveedor = $1
      ORDER BY i.nombre ASC
    `;
    
    const result = await pool.query(query, [id]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener productos por proveedor:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos del proveedor',
      message: error.message
    });
  }
});

module.exports = router;



