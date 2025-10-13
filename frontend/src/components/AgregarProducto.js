import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { inventarioService, proveedoresService } from '../services/api';

const AgregarProducto = () => {
  const navigate = useNavigate();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    id_proveedor: '',
    nombre: '',
    descripcion: '',
    stock: 0,
    costo_unitario: 0
  });
  
  // Estados para la UI
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProveedores, setLoadingProveedores] = useState(true);
  const [error, setError] = useState('');

  // Cargar proveedores al montar el componente
  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        setLoadingProveedores(true);
        const response = await proveedoresService.getProveedores();
        setProveedores(response.data.data);
      } catch (error) {
        setError('Error al cargar la lista de proveedores');
        toast.error('Error al cargar proveedores');
        console.error('Error:', error);
      } finally {
        setLoadingProveedores(false);
      }
    };

    cargarProveedores();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validaciones del lado del cliente
      if (!formData.id_proveedor) {
        throw new Error('Debe seleccionar un proveedor');
      }
      
      if (!formData.nombre.trim()) {
        throw new Error('El nombre del producto es obligatorio');
      }

      if (parseInt(formData.stock) < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      if (parseFloat(formData.costo_unitario) < 0) {
        throw new Error('El costo unitario no puede ser negativo');
      }

      // Preparar datos para envío
      const datosProducto = {
        id_proveedor: parseInt(formData.id_proveedor),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        stock: parseInt(formData.stock) || 0,
        costo_unitario: parseFloat(formData.costo_unitario) || 0
      };

      // Enviar al backend
      const response = await inventarioService.crearProducto(datosProducto);
      
      toast.success('Producto agregado exitosamente al inventario');
      
      // Limpiar formulario
      setFormData({
        id_proveedor: '',
        nombre: '',
        descripcion: '',
        stock: 0,
        costo_unitario: 0
      });
      
      // Opcional: redirigir al inventario
      setTimeout(() => {
        navigate('/inventario');
      }, 1500);
      
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      console.error('Error al crear producto:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProveedores) {
    return (
      <Container className="mt-4">
        <Row className="justify-content-center">
          <Col md={6}>
            <div className="loading-spinner">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando proveedores...</span>
              </Spinner>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  if (proveedores.length === 0) {
    return (
      <Container className="mt-4">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="warning">
              <Alert.Heading>⚠️ No hay proveedores disponibles</Alert.Heading>
              <p>
                Para agregar un producto, primero debe existir al menos un proveedor en el sistema.
              </p>
              <hr />
              <Button 
                variant="outline-primary" 
                onClick={() => navigate('/agregar-proveedor')}
              >
                Agregar Proveedor
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="custom-card">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">➕ Agregar Nuevo Producto</h4>
            </Card.Header>
            
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="danger" className="error-message">
                    {error}
                  </Alert>
                )}

                {/* Campo Proveedor - Dropdown */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Proveedor *</strong>
                  </Form.Label>
                  <Form.Select
                    name="id_proveedor"
                    value={formData.id_proveedor}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">Seleccione un proveedor...</option>
                    {proveedores.map((proveedor) => (
                      <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                        {proveedor.nombre_compania}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Seleccione el proveedor del producto
                  </Form.Text>
                </Form.Group>

                {/* Campo Nombre */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Nombre del Producto *</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Laptop Dell XPS 13"
                    required
                  />
                </Form.Group>

                {/* Campo Descripción */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Descripción</strong>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción detallada del producto (opcional)"
                  />
                </Form.Group>

                {/* Campo Stock */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Stock Inicial *</strong>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    required
                  />
                  <Form.Text className="text-muted">
                    Cantidad inicial en inventario
                  </Form.Text>
                </Form.Group>

                {/* Campo Costo Unitario */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Costo Unitario ($) *</strong>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="costo_unitario"
                    value={formData.costo_unitario}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                  <Form.Text className="text-muted">
                    Precio de costo por unidad
                  </Form.Text>
                </Form.Group>

                {/* Botones */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/inventario')}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="btn-custom"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Guardando...
                      </>
                    ) : (
                      'Agregar Producto'
                    )}
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

export default AgregarProducto;



