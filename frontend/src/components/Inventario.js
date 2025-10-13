import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { inventarioService } from '../services/api';

const Inventario = () => {
  const navigate = useNavigate();
  
  // Estados
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  // Cargar inventario al montar el componente
  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await inventarioService.getInventario();
      setInventario(response.data.data);
    } catch (error) {
      setError('Error al cargar el inventario');
      toast.error('Error al cargar el inventario');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para determinar el estado del stock
  const getStockStatus = (stock) => {
    if (stock === 0) return { variant: 'danger', text: 'Sin Stock' };
    if (stock < 10) return { variant: 'warning', text: 'Stock Bajo' };
    return { variant: 'success', text: 'Stock OK' };
  };

  // Función para formatear moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  // Manejar eliminación de producto
  const handleEliminarClick = (producto) => {
    setProductoAEliminar(producto);
    setShowDeleteModal(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      await inventarioService.eliminarProducto(productoAEliminar.id_inventario);
      toast.success('Producto eliminado exitosamente');
      cargarInventario(); // Recargar la lista
      setShowDeleteModal(false);
      setProductoAEliminar(null);
    } catch (error) {
      toast.error('Error al eliminar el producto');
      console.error('Error:', error);
    }
  };

  const handleCancelarEliminar = () => {
    setShowDeleteModal(false);
    setProductoAEliminar(null);
  };

  // Calcular estadísticas
  const estadisticas = {
    totalProductos: inventario.length,
    stockTotal: inventario.reduce((sum, item) => sum + item.stock, 0),
    valorTotal: inventario.reduce((sum, item) => sum + (item.stock * item.costo_unitario), 0),
    stockBajo: inventario.filter(item => item.stock < 10 && item.stock > 0).length,
    sinStock: inventario.filter(item => item.stock === 0).length
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="loading-spinner">
          <Spinner animation="border" role="status" size="lg">
            <span className="visually-hidden">Cargando inventario...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error al cargar el inventario</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={cargarInventario}>
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
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">📦 Inventario Completo</h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center">
                  <h4 className="text-primary">{estadisticas.totalProductos}</h4>
                  <small className="text-muted">Total Productos</small>
                </Col>
                <Col md={3} className="text-center">
                  <h4 className="text-success">{estadisticas.stockTotal}</h4>
                  <small className="text-muted">Unidades en Stock</small>
                </Col>
                <Col md={3} className="text-center">
                  <h4 className="text-info">{formatearMoneda(estadisticas.valorTotal)}</h4>
                  <small className="text-muted">Valor Total</small>
                </Col>
                <Col md={3} className="text-center">
                  <div>
                    <Badge bg="warning" className="me-2">
                      {estadisticas.stockBajo} Stock Bajo
                    </Badge>
                    <Badge bg="danger">
                      {estadisticas.sinStock} Sin Stock
                    </Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Botón para agregar producto */}
      <Row className="mb-3">
        <Col>
          <Button 
            variant="primary" 
            onClick={() => navigate('/agregar-producto')}
            className="btn-custom"
          >
            ➕ Agregar Nuevo Producto
          </Button>
        </Col>
      </Row>

      {/* Tabla de inventario */}
      <Row>
        <Col>
          <Card className="custom-card">
            <Card.Body className="p-0">
              {inventario.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted">No hay productos en el inventario</h5>
                  <p className="text-muted">Comience agregando su primer producto</p>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/agregar-producto')}
                  >
                    Agregar Producto
                  </Button>
                </div>
              ) : (
                <Table responsive hover className="table-custom mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Producto</th>
                      <th>Descripción</th>
                      <th>Proveedor</th>
                      <th>Stock</th>
                      <th>Costo Unit.</th>
                      <th>Valor Total</th>
                      <th>Fecha Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventario.map((item) => {
                      const stockStatus = getStockStatus(item.stock);
                      const valorTotal = item.stock * item.costo_unitario;
                      
                      return (
                        <tr key={item.id_inventario}>
                          <td>
                            <Badge bg="secondary">#{item.id_inventario}</Badge>
                          </td>
                          <td>
                            <strong>{item.nombre}</strong>
                          </td>
                          <td>
                            <small className="text-muted">
                              {item.descripcion || 'Sin descripción'}
                            </small>
                          </td>
                          <td>
                            <Badge bg="info">{item.nombre_compania}</Badge>
                          </td>
                          <td>
                            <Badge bg={stockStatus.variant}>
                              {item.stock} - {stockStatus.text}
                            </Badge>
                          </td>
                          <td>
                            <strong>{formatearMoneda(item.costo_unitario)}</strong>
                          </td>
                          <td>
                            <strong className={valorTotal > 0 ? 'text-success' : 'text-muted'}>
                              {formatearMoneda(valorTotal)}
                            </strong>
                          </td>
                          <td>
                            <small>{formatearFecha(item.fecha_registro)}</small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/editar-producto/${item.id_inventario}`)}
                              >
                                ✏️
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleEliminarClick(item)}
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
          ¿Está seguro de que desea eliminar el producto "{productoAEliminar?.nombre}"?
          <br />
          <small className="text-muted">
            Esta acción no se puede deshacer.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCancelarEliminar}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmarEliminar}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Inventario;



