const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/proveedores - Obtener lista de proveedores para dropdowns
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id_proveedor, nombre_compania 
      FROM proveedores 
      ORDER BY nombre_compania ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la lista de proveedores',
      message: error.message
    });
  }
});

// GET /api/proveedores/todos - Obtener lista completa de proveedores para visualización
router.get('/todos', async (req, res) => {
  try {
    const query = `
      SELECT 
        id_proveedor,
        nombre_compania,
        telefono,
        email
      FROM proveedores 
      ORDER BY nombre_compania ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener todos los proveedores:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la lista completa de proveedores',
      message: error.message
    });
  }
});

// POST /api/proveedores - Crear nuevo proveedor
router.post('/', async (req, res) => {
  try {
    const { nombre_compania, telefono, email } = req.body;
    
    // Validaciones básicas
    if (!nombre_compania || !email) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos faltantes',
        message: 'nombre_compania y email son obligatorios'
      });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido',
        message: 'El formato del email no es válido'
      });
    }
    
    const query = `
      INSERT INTO proveedores (nombre_compania, telefono, email)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [nombre_compania, telefono, email];
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      message: 'Proveedor creado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    
    // Manejar error de email duplicado
    if (error.code === '23505' && error.constraint === 'proveedores_email_key') {
      return res.status(409).json({
        success: false,
        error: 'Email duplicado',
        message: 'Ya existe un proveedor con este email'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al crear proveedor',
      message: error.message
    });
  }
});

// GET /api/proveedores/:id - Obtener proveedor por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id_proveedor,
        nombre_compania,
        telefono,
        email,
        fecha_registro
      FROM proveedores 
      WHERE id_proveedor = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Proveedor no encontrado',
        message: `No existe un proveedor con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener proveedor por ID:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener proveedor',
      message: error.message
    });
  }
});

// PUT /api/proveedores/:id - Actualizar proveedor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_compania, telefono, email } = req.body;
    
    // Validaciones básicas
    if (!nombre_compania || !email) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos faltantes',
        message: 'nombre_compania y email son obligatorios'
      });
    }
    
    const query = `
      UPDATE proveedores 
      SET nombre_compania = $1, telefono = $2, email = $3
      WHERE id_proveedor = $4
      RETURNING *
    `;
    
    const values = [nombre_compania, telefono, email, id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Proveedor no encontrado',
        message: `No existe un proveedor con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Proveedor actualizado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar proveedor',
      message: error.message
    });
  }
});

// DELETE /api/proveedores/:id - Eliminar proveedor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      DELETE FROM proveedores 
      WHERE id_proveedor = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Proveedor no encontrado',
        message: `No existe un proveedor con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Proveedor eliminado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    
    // Manejar error de restricción de clave foránea
    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        error: 'No se puede eliminar',
        message: 'Este proveedor tiene productos asociados en el inventario'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al eliminar proveedor',
      message: error.message
    });
  }
});

module.exports = router;



