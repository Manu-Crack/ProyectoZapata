import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <LinkContainer to="/">
          <BootstrapNavbar.Brand>
            📦 Control de Inventario
          </BootstrapNavbar.Brand>
        </LinkContainer>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/inventario">
              <Nav.Link className={isActive('/inventario') || isActive('/') ? 'active' : ''}>
                📋 Inventario
              </Nav.Link>
            </LinkContainer>
            
            <LinkContainer to="/proveedores">
              <Nav.Link className={isActive('/proveedores') ? 'active' : ''}>
                🏢 Proveedores
              </Nav.Link>
            </LinkContainer>
            
            <LinkContainer to="/agregar-producto">
              <Nav.Link className={isActive('/agregar-producto') ? 'active' : ''}>
                ➕ Agregar Producto
              </Nav.Link>
            </LinkContainer>
            
            <LinkContainer to="/agregar-proveedor">
              <Nav.Link className={isActive('/agregar-proveedor') ? 'active' : ''}>
                ➕ Agregar Proveedor
              </Nav.Link>
            </LinkContainer>
          </Nav>
          
          <Nav>
            <Nav.Link href="https://github.com" target="_blank" rel="noopener noreferrer">
              🔗 GitHub
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;



