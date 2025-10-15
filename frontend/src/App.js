// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Componentes
import Navbar from './components/Navbar';
import Inventario from './components/Inventario';
import Proveedores from './components/Proveedores';
import AgregarProducto from './components/AgregarProducto';
import AgregarProveedor from './components/AgregarProveedor';
// --- NUEVOS COMPONENTES ---
import EditarProducto from './components/EditarProducto';
import EditarProveedor from './components/EditarProveedor';


function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        
        <main className="container-fluid py-4">
          <Routes>
            <Route path="/" element={<Inventario />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/agregar-producto" element={<AgregarProducto />} />
            <Route path="/agregar-proveedor" element={<AgregarProveedor />} />
            
            {/* --- RUTAS NUEVAS --- */}
            <Route path="/editar-producto/:id" element={<EditarProducto />} />
            <Route path="/editar-proveedor/:id" element={<EditarProveedor />} />
          </Routes>
        </main>
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;