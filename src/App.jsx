import { BrowserRouter,Route,Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AppDataProvider } from './context/AppDataContext'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import StorePage from './pages/StorePage'
import CartPage from './pages/CartPage'
import AppointmentsPage from './pages/AppointmentsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminServicesPage from './pages/admin/AdminServicesPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminCatalogPage from './pages/admin/AdminCatalogPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage'
import AdminSuppliersPage from './pages/admin/AdminSuppliersPage'
import AdminPurchasesPage from './pages/admin/AdminPurchasesPage'
import AdminSalesPage from './pages/admin/AdminSalesPage'
import AdminPointOfSalePage from './pages/admin/AdminPointOfSalePage'
import AdminSaleDetailPage from './pages/admin/AdminSaleDetailPage'
import AdminStatisticsPage from './pages/admin/AdminStatisticsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminInventoryPage from './pages/admin/AdminInventoryPage'
import AdminCashPage from './pages/admin/AdminCashPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App(){return <ThemeProvider><AppDataProvider><BrowserRouter><Routes>
 <Route element={<PublicLayout/>}><Route path="/" element={<HomePage/>}/><Route path="/servicios" element={<ServicesPage/>}/><Route path="/store" element={<StorePage/>}/><Route path="/carrito" element={<CartPage/>}/><Route path="/turnos" element={<AppointmentsPage/>}/><Route path="/admin" element={<AdminLoginPage/>}/></Route>
 <Route path="/admin" element={<AdminLayout/>}><Route path="dashboard" element={<AdminDashboardPage/>}/><Route path="servicios" element={<AdminServicesPage/>}/><Route path="turnos" element={<AdminAppointmentsPage/>}/><Route path="productos" element={<AdminProductsPage/>}/><Route path="inventario" element={<AdminInventoryPage/>}/><Route path="compras" element={<AdminPurchasesPage/>}/><Route path="proveedores" element={<AdminSuppliersPage/>}/><Route path="pedidos" element={<AdminOrdersPage/>}/><Route path="caja" element={<AdminCashPage/>}/><Route path="ventas" element={<AdminSalesPage/>}/><Route path="ventas/nueva" element={<AdminPointOfSalePage/>}/><Route path="ventas/:id" element={<AdminSaleDetailPage/>}/><Route path="estadisticas" element={<AdminStatisticsPage/>}/><Route path="catalogo" element={<AdminCatalogPage/>}/><Route path="configuracion" element={<AdminSettingsPage/>}/></Route>
 <Route path="*" element={<NotFoundPage/>}/>
 </Routes></BrowserRouter></AppDataProvider></ThemeProvider>}
