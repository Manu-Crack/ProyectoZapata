// frontend/src/components/EditarProducto.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { inventarioService, proveedoresService } from '../services/api';

const EditarProducto = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtiene el ID del producto desde la URL

  const [formData, setFormData] = useState({
    id_proveedor: '',
    nombre: '',
    descripcion: '',
    stock: 0,
    costo_unitario: 0
  });
  
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Hacemos dos peticiones a la API en paralelo para más eficiencia
        const [resProducto, resProveedores] = await Promise.all([
          inventarioService.getProducto(id), // Usamos getProducto como está en tu api.js
          proveedoresService.getProveedores()
        ]);
        
        const productoActual = resProducto.data.data;
        
        // Rellenamos el formulario con los datos del producto existente
        setFormData({
          id_proveedor: productoActual.id_proveedor,
          nombre: productoActual.nombre,
          descripcion: productoActual.descripcion || '',
          stock: productoActual.stock,
          costo_unitario: productoActual.costo_unitario
        });

        setProveedores(resProveedores.data.data);
      } catch (err) {
        setError('Error al cargar los datos del producto.');
        toast.error('No se pudo cargar la información para editar.');
        console.error('Error:', err);
        setTimeout(() => navigate('/inventario'), 2000);
      } finally {
        setLoadingInitialData(false);
      }
    };

    cargarDatos();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const datosProductoActualizado = {
        ...formData,
        id_proveedor: parseInt(formData.id_proveedor),
        stock: parseInt(formData.stock),
        costo_unitario: parseFloat(formData.costo_unitario)
      };

      await inventarioService.actualizarProducto(id, datosProductoActualizado);
      
      toast.success('Producto actualizado exitosamente');
      
      setTimeout(() => navigate('/inventario'), 1500);
      
    } catch (err) {
      const errorMessage = err.message || 'Ocurrió un error';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error al actualizar producto:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingInitialData) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando datos...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="custom-card">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">✏️ Editar Producto</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}
                
                {/* El formulario es casi idéntico al de AgregarProducto */}
                <Form.Group className="mb-3">
                  <Form.Label><strong>Proveedor *</strong></Form.Label>
                  <Form.Select name="id_proveedor" value={formData.id_proveedor} onChange={handleChange} required>
                    <option value="">Seleccione un proveedor...</option>
                    {proveedores.map((p) => (
                      <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre_compania}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><strong>Nombre del Producto *</strong></Form.Label>
                  <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><strong>Descripción</strong></Form.Label>
                  <Form.Control as="textarea" rows={3} name="descripcion" value={formData.descripcion} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><strong>Stock *</strong></Form.Label>
                  <Form.Control type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><strong>Costo Unitario (S/.) *</strong></Form.Label>
                  <Form.Control type="number" name="costo_unitario" value={formData.costo_unitario} onChange={handleChange} min="0" step="0.01" required />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button variant="outline-secondary" onClick={() => navigate('/inventario')} disabled={loading} className="me-2">
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Guardar Cambios'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditarProducto;