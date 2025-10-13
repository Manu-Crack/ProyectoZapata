import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { proveedoresService, inventarioService } from '../services/api';

const Proveedores = () => {
  const navigate = useNavigate();
  
  // Estados
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);
  const [productosPorProveedor, setProductosPorProveedor] = useState({});

  // Cargar proveedores al montar el componente
  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await proveedoresService.getTodosProveedores();
      setProveedores(response.data.data);
      
      // Cargar información de productos para cada proveedor
      await cargarProductosPorProveedor(response.data.data);
      
    } catch (error) {
      setError('Error al cargar la lista de proveedores');
      toast.error('Error al cargar proveedores');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarProductosPorProveedor = async (listaProveedores) => {
    const productosData = {};
    
    for (const proveedor of listaProveedores) {
      try {
        const response = await inventarioService.getProductosPorProveedor(proveedor.id_proveedor);
        productosData[proveedor.id_proveedor] = {
          cantidad: response.data.count,
          productos: response.data.data
        };
      } catch (error) {
        productosData[proveedor.id_proveedor] = {
          cantidad: 0,
          productos: []
        };
      }
    }
    
    setProductosPorProveedor(productosData);
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  // Manejar eliminación de proveedor
  const handleEliminarClick = (proveedor) => {
    setProveedorAEliminar(proveedor);
    setShowDeleteModal(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      await proveedoresService.eliminarProveedor(proveedorAEliminar.id_proveedor);
      toast.success('Proveedor eliminado exitosamente');
      cargarProveedores(); // Recargar la lista
      setShowDeleteModal(false);
      setProveedorAEliminar(null);
    } catch (error) {
      if (error.message.includes('productos asociados')) {
        toast.error('No se puede eliminar un proveedor que tiene productos asociados');
      } else {
        toast.error('Error al eliminar el proveedor');
      }
      console.error('Error:', error);
    }
  };

  const handleCancelarEliminar = () => {
    setShowDeleteModal(false);
    setProveedorAEliminar(null);
  };

  // Calcular estadísticas
  const estadisticas = {
    totalProveedores: proveedores.length,
    proveedoresConProductos: Object.values(productosPorProveedor).filter(p => p.cantidad > 0).length,
    totalProductos: Object.values(productosPorProveedor).reduce((sum, p) => sum + p.cantidad, 0)
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="loading-spinner">
          <Spinner animation="border" role="status" size="lg">
            <span className="visually-hidden">Cargando proveedores...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error al cargar proveedores</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={cargarProveedores}>
            Reintentar
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Header con estadísticas */}
      <Row className="mb-4">
        <Col>
          <Card className="custom-card">
            <Card.Header className="bg-success text-white">
              <h3 className="mb-0">🏢 Gestión de Proveedores</h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="text-center">
                  <h4 className="text-success">{estadisticas.totalProveedores}</h4>
                  <small className="text-muted">Total Proveedores</small>
                </Col>
                <Col md={4} className="text-center">
                  <h4 className="text-primary">{estadisticas.proveedoresConProductos}</h4>
                  <small className="text-muted">Con Productos</small>
                </Col>
                <Col md={4} className="text-center">
                  <h4 className="text-info">{estadisticas.totalProductos}</h4>
                  <small className="text-muted">Total Productos</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Botón para agregar proveedor */}
      <Row className="mb-3">
        <Col>
          <Button 
            variant="success" 
            onClick={() => navigate('/agregar-proveedor')}
            className="btn-custom"
          >
            ➕ Agregar Nuevo Proveedor
          </Button>
        </Col>
      </Row>

      {/* Tabla de proveedores */}
      <Row>
        <Col>
          <Card className="custom-card">
            <Card.Body className="p-0">
              {proveedores.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted">No hay proveedores registrados</h5>
                  <p className="text-muted">Comience agregando su primer proveedor</p>
                  <Button 
                    variant="success" 
                    onClick={() => navigate('/agregar-proveedor')}
                  >
                    Agregar Proveedor
                  </Button>
                </div>
              ) : (
                <Table responsive hover className="table-custom mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Compañía</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th>Productos</th>
                      <th>Fecha Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedores.map((proveedor) => {
                      const productosInfo = productosPorProveedor[proveedor.id_proveedor] || { cantidad: 0, productos: [] };
                      
                      return (
                        <tr key={proveedor.id_proveedor}>
                          <td>
                            <Badge bg="secondary">#{proveedor.id_proveedor}</Badge>
                          </td>
                          <td>
                            <strong>{proveedor.nombre_compania}</strong>
                          </td>
                          <td>
                            {proveedor.telefono ? (
                              <span>{proveedor.telefono}</span>
                            ) : (
                              <span className="text-muted">Sin teléfono</span>
                            )}
                          </td>
                          <td>
                            <a 
                              href={`mailto:${proveedor.email}`}
                              className="text-decoration-none"
                            >
                              {proveedor.email}
                            </a>
                          </td>
                          <td>
                            <Badge 
                              bg={productosInfo.cantidad > 0 ? 'primary' : 'secondary'}
                            >
                              {productosInfo.cantidad} productos
                            </Badge>
                          </td>
                          <td>
                            <small>{formatearFecha(proveedor.fecha_registro)}</small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => navigate(`/editar-proveedor/${proveedor.id_proveedor}`)}
                              >
                                ✏️
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleEliminarClick(proveedor)}
                                disabled={productosInfo.cantidad > 0}
                                title={productosInfo.cantidad > 0 ? 'No se puede eliminar: tiene productos asociados' : 'Eliminar proveedor'}
                              >
                                🗑️
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={handleCancelarEliminar}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro de que desea eliminar el proveedor "{proveedorAEliminar?.nombre_compania}"?
          <br />
          <small className="text-muted">
            Esta acción no se puede deshacer.
          </small>
          {productosPorProveedor[proveedorAEliminar?.id_proveedor]?.cantidad > 0 && (
            <Alert variant="warning" className="mt-2">
              ⚠️ Este proveedor tiene productos asociados y no puede ser eliminado.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCancelarEliminar}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmarEliminar}
            disabled={productosPorProveedor[proveedorAEliminar?.id_proveedor]?.cantidad > 0}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Proveedores;



