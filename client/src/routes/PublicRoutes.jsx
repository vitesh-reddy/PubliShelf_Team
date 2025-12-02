import { Route } from 'react-router-dom';

import Home from '../pages/public/Home/Index';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import AdminDashboard from '../pages/admin/dashboard/Dashboard';
import NotFound from '../pages/public/NotFound';

const PublicRoutes = () => (
  <>
    <Route path="/" element={<Home />} />
    <Route path="*" element={<NotFound />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/admin/dashboard/:key" element={<AdminDashboard />} />
  </>
);

export default PublicRoutes;
