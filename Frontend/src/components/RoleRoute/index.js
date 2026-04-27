import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserService } from '../../services/UserService';

// RoleRoute: fetches current user and only renders the provided element
// when the user's cargo (role) is included in allowedRoles.
// Props:
// - allowedRoles: array of role strings allowed to view the route
// - element: React node to render when allowed
// Behavior: while loading it returns null (could show a spinner). If not
// authenticated or not allowed it redirects to '/' or '/login'.
export default function RoleRoute({ allowedRoles = [], element = null }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    const userService = new UserService();
    userService.getCurrentUser()
      .then((u) => {
        if (mounted) setUser(u);
      })
      .catch(() => {
        // If we can't load user, treat as unauthenticated
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  if (loading) return null; // or a spinner

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.cargo || '';
  // If allowedRoles contains 'ALL' treat as open to authenticated users
  const allowed = allowedRoles.includes('ALL') || allowedRoles.includes(role);

  if (!allowed) return <Navigate to="/" replace />;

  return element;
}
