import About from './pages/About';
import Dashboard from './pages/Dashboard';
import DealDetail from './pages/DealDetail';
import Deals from './pages/Deals';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import RequestAccess from './pages/RequestAccess';
import AdminDashboard from './pages/AdminDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Dashboard": Dashboard,
    "DealDetail": DealDetail,
    "Deals": Deals,
    "Home": Home,
    "Portfolio": Portfolio,
    "Profile": Profile,
    "RequestAccess": RequestAccess,
    "AdminDashboard": AdminDashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};