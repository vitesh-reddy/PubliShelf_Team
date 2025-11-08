import { Route } from 'react-router-dom';
import PublicOnlyRoute from './PublicOnlyRoute';

import Login from '../pages/auth/login/Login';
import BuyerSignup from '../pages/auth/signup/buyer/BuyerSignup';
import PublisherSignup from '../pages/auth/signup/publisher/PublisherSignup';

const PublicOnlyRoutes = () => (
  <Route element={<PublicOnlyRoute />}>
    <Route path="/auth/login" element={<Login />} />
    <Route path="/buyer/signup" element={<BuyerSignup />} />
    <Route path="/publisher/signup" element={<PublisherSignup />} />
  </Route>
);

export default PublicOnlyRoutes;
