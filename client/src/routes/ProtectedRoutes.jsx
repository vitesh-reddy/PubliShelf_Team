import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Dashboard from '../pages/buyer/dashboard/Dashboard';
import SearchPage from '../pages/buyer/search/Search';
import BuyerProfile from '../pages/buyer/profile/Profile';
import ProductDetail from '../pages/buyer/product-detail/ProductDetail';
import Checkout from '../pages/buyer/checkout/Checkout';
import Cart from '../pages/buyer/cart/Cart';
import AuctionPage from '../pages/buyer/auction/AuctionPage';
import AuctionItemDetail from '../pages/buyer/auction/AuctionItemDetail';
import AuctionOngoing from '../pages/buyer/auction/AuctionOngoing';

import ActiveBooks from '../pages/publisher/active-books/ActiveBooks';
import DeletedBooks from '../pages/publisher/deleted-books/DeletedBooks';
import Auctions from '../pages/publisher/auctions/Auctions';
import PublishBook from '../pages/publisher/publish-book/PublishBook';
import SellAntique from '../pages/publisher/sell-antique/SellAntique';
import EditBookPage from '../pages/publisher/edit-book/EditBookPage';
import PublisherViewBook from '../pages/publisher/view-book/ViewBook';
import PublisherDashboard from '../pages/publisher/dashboard/Dashboard';
import PublisherDashboard_Old from '../pages/publisher/dashboard old/Dashboard_Old';

import ManagerDashboard from '../pages/manager/dashboard/Dashboard';
import AuctionsLayout from '../pages/manager/auctions/AuctionsLayout';
import ManagerAuctions from '../pages/manager/auctions/Auctions';
import AuctionOverview from '../pages/manager/auctions/AuctionOverview';
import ManagerAuctionsOverview from '../pages/manager/auctions/Overview';
import PublishersLayout from '../pages/manager/publishers/PublishersLayout';
import Publishers from '../pages/manager/publishers/Publishers';
import PublisherOverview from '../pages/manager/publishers/PublisherOverview';

import AdminDashboard from '../pages/admin/dashboard/Dashboard';
import ManagersLayout from '../pages/admin/managers/ManagersLayout';
import Managers from '../pages/admin/managers/Managers';
import ManagerOverview from '../pages/admin/managers/ManagerOverview';
import Settings from '../pages/admin/settings/Settings';

const ProtectedRoutes = () => (
  <>
    {/* Buyer Routes */}
    <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
      <Route path="/buyer/dashboard" element={<Dashboard />} />
      <Route path="/buyer/search" element={<SearchPage />} />
      <Route path="/buyer/profile" element={<BuyerProfile />} />
      <Route path="/buyer/product-detail/:id" element={<ProductDetail />} />
      <Route path="/buyer/checkout" element={<Checkout />} />
      <Route path="/buyer/cart" element={<Cart />} />
      <Route path="/buyer/auction-page" element={<AuctionPage />} />
      <Route path="/buyer/auction-item-detail/:id" element={<AuctionItemDetail />} />
      <Route path="/buyer/auction-ongoing/:id" element={<AuctionOngoing />} />
    </Route>

    {/* Publisher Routes */}
    <Route element={<ProtectedRoute allowedRoles={['publisher']} />}>
      <Route path="/publisher/old-dashboard" element={<PublisherDashboard_Old/> } />
      <Route path="/publisher/dashboard" element={<PublisherDashboard />} />
      <Route path="/publisher/active-books" element={<ActiveBooks />} />
      <Route path="/publisher/deleted-books" element={<DeletedBooks />} />
      <Route path="/publisher/auctions" element={<Auctions />} />
      <Route path="/publisher/publish-book" element={<PublishBook />} />
      <Route path="/publisher/sell-antique" element={<SellAntique />} />
      <Route path="/publisher/edit-book/:id" element={<EditBookPage />} />
      <Route path="/publisher/view-book/:id" element={<PublisherViewBook />} />
    </Route>

    {/* Manager Routes */}
    <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
      <Route path="/manager/dashboard" element={<ManagerDashboard />} />
      <Route path="/manager/auctions" element={<AuctionsLayout />}>
        <Route index element={<Navigate to="/manager/auctions/pending" replace />} />
        <Route path="overview" element={<ManagerAuctionsOverview />} />
        <Route path="pending" element={<ManagerAuctions type="pending" />} />
        <Route path="approved" element={<ManagerAuctions type="approved" />} />
        <Route path="rejected" element={<ManagerAuctions type="rejected" />} />
      </Route>
      <Route path="/manager/auctions/:id/overview" element={<AuctionOverview />} />
      <Route path="/manager/publishers" element={<PublishersLayout />}>
        <Route index element={<Navigate to="/manager/publishers/pending" replace />} />
        <Route path="pending" element={<Publishers type="pending" />} />
        <Route path="active" element={<Publishers type="active" />} />
        <Route path="banned" element={<Publishers type="banned" />} />
      </Route>
      <Route path="/manager/publishers/:id/overview" element={<PublisherOverview />} />
    </Route>

    {/* Admin Routes */}
    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/managers" element={<ManagersLayout />}>
        <Route index element={<Navigate to="/admin/managers/pending" replace />} />
        <Route path="pending" element={<Managers type="pending" />} />
        <Route path="active" element={<Managers type="active" />} />
        <Route path="banned" element={<Managers type="banned" />} />
      </Route>
      <Route path="/admin/managers/:id" element={<ManagerOverview />} />
      <Route path="/admin/settings" element={<Settings />} />
    </Route>
  </>
);

export default ProtectedRoutes;
