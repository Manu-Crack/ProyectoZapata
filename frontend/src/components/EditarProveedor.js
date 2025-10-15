// frontend/src/components/EditarProveedor.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { proveedoresService } from '../services/api';

const EditarProveedor = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    nombre_compania: '',
    telefono: '',
    email: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarProveedor = async () => {
      try {
        const response = await proveedoresService.getProveedor(id);
        const proveedor = response.data.data;
        setFormData({
          nombre_compania: proveedor.nombre_compania,
          telefono: proveedor.telefono || '',
          email: proveedor.email
        });
      } catch (err) {
        setError('Error al cargar los datos del proveedor.');
        toast.error('No se pudo cargar la información para editar.');
        console.error('Error:', err);
        setTimeout(() => navigate('/proveedores'), 2000);
      } finally {
        setLoadingInitialData(false);
      }
    };
    cargarProveedor();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await proveedoresService.actualizarProveedor(id, formData);
      toast.success('Proveedor actualizado exitosamente');
      setTimeout(() => navigate('/proveedores'), 1500);
    } catch (err) {
      const errorMessage = err.message || 'Ocurrió un error';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingInitialData) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="custom-card">
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0">🏢 Editar Proveedor</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form.Group className="mb-3">
                  <Form.Label><strong>Nombre de la Compañía *</strong></Form.Label>
                  <Form.Control type="text" name="nombre_compania" value={formData.nombre_compania} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Teléfono</strong></Form.Label>
                  <Form.Control type="tel" name="telefono" value={formData.telefono} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Email *</strong></Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button variant="outline-secondary" onClick={() => navigate('/proveedores')} disabled={loading} className="me-2">
                    Cancelar
                  </Button>
                  <Button variant="success" type="submit" disabled={loading}>
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

export default EditarProveedor;