
import { useEffect, useState } from 'react';
import { CircleUserRound } from 'lucide-react';
import api from '../api/axios';

function Header() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('user') || '{}'
      ) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('token');

    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');

        if (
          !active ||
          !token ||
          localStorage.getItem('token') !== token
        ) {
          return;
        }

        setUser(response.data);

        localStorage.setItem(
          'user',
          JSON.stringify(response.data)
        );
      } catch (error) {
        console.error('Failed to fetch staff profile:', error);
      }
    };

    if (token) {
      fetchProfile();
    }

    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="main-header">
      <div className="header-title">
        Automotive Service Management
      </div>

      <div className="header-user">
        <CircleUserRound size={34} />

        <div>
          <h4>{user.fullName || 'Staff'}</h4>
          <p>Staff</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
