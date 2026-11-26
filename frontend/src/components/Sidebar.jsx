
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CarFront,
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  ClipboardList,
  ChartColumn,
  LogOut,
} from 'lucide-react';

const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Customers',
    path: '/customers',
    icon: Users,
  },
  {
    name: 'Vehicles',
    path: '/vehicles',
    icon: Car,
  },
  {
    name: 'Service Types',
    path: '/service-types',
    icon: Wrench,
  },
  {
    name: 'Service Records',
    path: '/service-records',
    icon: ClipboardList,
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: ChartColumn,
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      navigate('/login', { replace: true });
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <CarFront size={32} />
        <h2>AutoTrack</h2>
      </div>

      <p className="menu-label">MAIN MENU</p>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `menu-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
