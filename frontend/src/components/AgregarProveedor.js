import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { proveedoresService } from '../services/api';

const AgregarProveedor = () => {
  const navigate = useNavigate();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre_compania: '',
    telefono: '',
    email: ''
  });
  
  // Estados para la UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validar email
  const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validaciones del lado del cliente
      if (!formData.nombre_compania.trim()) {
        throw new Error('El nombre de la compañía es obligatorio');
      }
      
      if (!formData.email.trim()) {
        throw new Error('El email es obligatorio');
      }

      if (!validarEmail(formData.email)) {
        throw new Error('El formato del email no es válido');
      }

      // Preparar datos para envío
      const datosProveedor = {
        nombre_compania: formData.nombre_compania.trim(),
        telefono: formData.telefono.trim() || null,
        email: formData.email.trim().toLowerCase()
      };

      // Enviar al backend
      const response = await proveedoresService.crearProveedor(datosProveedor);
      
      toast.success('Proveedor creado exitosamente');
      
      // Limpiar formulario
      setFormData({
        nombre_compania: '',
        telefono: '',
        email: ''
      });
      
      // Opcional: redirigir a la lista de proveedores
      setTimeout(() => {
        navigate('/proveedores');
      }, 1500);
      
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      console.error('Error al crear proveedor:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="custom-card">
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0">🏢 Agregar Nuevo Proveedor</h4>
            </Card.Header>
            
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="danger" className="error-message">
                    {error}
                  </Alert>
                )}

                {/* Campo Nombre de Compañía */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Nombre de la Compañía *</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre_compania"
                    value={formData.nombre_compania}
                    onChange={handleChange}
                    placeholder="Ej: TechCorp Solutions"
                    required
                  />
                  <Form.Text className="text-muted">
                    Nombre completo de la empresa proveedora
                  </Form.Text>
                </Form.Group>

                {/* Campo Teléfono */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Teléfono</strong>
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej: +1-555-0101"
                  />
                  <Form.Text className="text-muted">
                    Número de teléfono de contacto (opcional)
                  </Form.Text>
                </Form.Group>

                {/* Campo Email */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Email *</strong>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ej: contacto@empresa.com"
                    required
                  />
                  <Form.Text className="text-muted">
                    Email de contacto de la empresa
                  </Form.Text>
                </Form.Group>

                {/* Información adicional */}
                <Alert variant="info" className="mt-4">
                  <Alert.Heading>ℹ️ Información importante</Alert.Heading>
                  <ul className="mb-0">
                    <li>El email debe ser único en el sistema</li>
                    <li>Una vez creado, podrá seleccionar este proveedor al agregar productos</li>
                    <li>Los campos marcados con * son obligatorios</li>
                  </ul>
                </Alert>

                {/* Botones */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/proveedores')}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    variant="success"
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
                      'Crear Proveedor'
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

export default AgregarProveedor;



