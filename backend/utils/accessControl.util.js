// Access Control Matrix Implementation
class AccessControl {
  constructor() {
    // Define Access Control Matrix
    // Subjects: user, manager, admin
    // Objects: movies, bookings, users, reports, showtimes
    this.accessControlMatrix = {
      // Regular User - Like BookMyShow customers
      // Can browse movies, book tickets, manage own bookings
      user: {
        movies: ['read'],                    // Browse movies only
        bookings: ['read_own', 'create', 'cancel_own'],  // Book tickets, view/cancel own bookings
        users: ['read_own', 'update_own'],   // View/update own profile only
        reports: [],                          // No access to reports
        showtimes: ['read']                  // View showtimes
      },
      // Manager - Cinema staff
      // Can manage bookings, view reports, but not manage movies/users
      manager: {
        movies: ['read'],                    // View movies (cannot add/edit/delete)
        bookings: ['read', 'create', 'update', 'cancel'],  // Full booking management
        users: ['read'],                     // View users (cannot modify)
        reports: ['read', 'create'],         // View and generate reports
        showtimes: ['read', 'update']        // Manage showtimes
      },
      // Admin - System administrator
      // Full access to everything
      admin: {
        movies: ['read', 'create', 'update', 'delete'],    // Full movie management
        bookings: ['read', 'create', 'update', 'delete'],  // Full booking management
        users: ['read', 'create', 'update', 'delete'],     // Full user management
        reports: ['read', 'create', 'update', 'delete'],   // Full report management
        showtimes: ['read', 'create', 'update', 'delete']  // Full showtime management
      }
    };

    // Access Control List (ACL) for specific API routes
    this.acl = {
      // Public movie browsing - all authenticated users
      '/api/movies': {
        GET: ['user', 'manager', 'admin'],      // Everyone can browse movies
        POST: ['admin'],                         // Only admin can add movies
        PUT: ['admin'],                          // Only admin can edit movies
        DELETE: ['admin']                        // Only admin can delete movies
      },
      // Booking routes
      '/api/bookings': {
        GET: ['user', 'manager', 'admin'],      // Users see own, manager/admin see all
        POST: ['user', 'manager', 'admin'],     // Everyone can book
        PUT: ['manager', 'admin'],              // Only staff can modify bookings
        DELETE: ['manager', 'admin']            // Only staff can force-delete
      },
      // User's own bookings
      '/api/bookings/my': {
        GET: ['user', 'manager', 'admin'],
        DELETE: ['user', 'manager', 'admin']    // Users can cancel own bookings
      },
      // Alias for /my-bookings route used in router
      '/api/bookings/my-bookings': {
        GET: ['user', 'manager', 'admin'],
        DELETE: ['user', 'manager', 'admin']
      },
      // User management - Admin only
      '/api/users': {
        GET: ['admin'],
        POST: ['admin'],
        PUT: ['admin'],
        DELETE: ['admin']
      },
      // Admin dashboard and reports
      '/api/admin/reports': {
        GET: ['manager', 'admin'],
        POST: ['manager', 'admin']
      },
      '/api/admin/dashboard': {
        GET: ['manager', 'admin']
      },
      // Admin movie management
      '/api/admin/movies': {
        GET: ['admin'],
        POST: ['admin'],
        PUT: ['admin'],
        DELETE: ['admin']
      },
      // Admin booking management
      '/api/admin/bookings': {
        GET: ['manager', 'admin'],
        PUT: ['manager', 'admin'],
        DELETE: ['manager', 'admin']
      }
    };

    // Policy description for documentation
    this.policyDescription = {
      name: 'BookMyShow-Style Cinema Access Control Policy',
      description: 'Role-based access control modeled after BookMyShow ticket booking platform',
      roles: {
        user: {
          description: 'Regular customer - can browse movies and book tickets',
          capabilities: [
            'Browse all available movies',
            'View movie details and showtimes',
            'Book tickets for any show',
            'View own booking history',
            'Cancel own bookings',
            'Update own profile'
          ]
        },
        manager: {
          description: 'Cinema staff - can manage bookings and view reports',
          capabilities: [
            'All user capabilities',
            'View all bookings',
            'Modify any booking',
            'Cancel any booking',
            'View sales reports',
            'Generate reports'
          ]
        },
        admin: {
          description: 'System administrator - full system access',
          capabilities: [
            'All manager capabilities',
            'Add new movies',
            'Edit movie details',
            'Delete movies',
            'Manage user accounts',
            'Change user roles',
            'Full system configuration'
          ]
        }
      },
      justification: 'This policy ensures customers can easily book tickets while protecting administrative functions. Managers can handle day-to-day operations without risking system-wide changes. Only admins have full control.'
    };
  }

  // Check if subject has permission on object
  checkPermission(subject, object, action) {
    if (!this.accessControlMatrix[subject]) {
      return false;
    }
    
    if (!this.accessControlMatrix[subject][object]) {
      return false;
    }
    
    return this.accessControlMatrix[subject][object].includes(action);
  }

  // Check ACL for route access
  checkRouteAccess(route, method, userRole) {
    // Normalize route to match ACL keys
    const normalizedRoute = this.normalizeRoute(route);
    
    if (!this.acl[normalizedRoute]) {
      return false;
    }
    
    if (!this.acl[normalizedRoute][method]) {
      return false;
    }
    
    return this.acl[normalizedRoute][method].includes(userRole);
  }

  // Normalize route for ACL checking
  normalizeRoute(route) {
    // Remove IDs and query parameters
    const routeParts = route.split('?')[0].split('/');
    const normalizedParts = routeParts.map(part => {
      // Replace MongoDB ObjectIds and numeric IDs with placeholder
      if (/^[0-9a-fA-F]{24}$/.test(part) || /^\d+$/.test(part)) {
        return ':id';
      }
      return part;
    });
    
    let normalized = normalizedParts.join('/');
    
    // Match to known ACL patterns
    if (normalized.includes('/api/movies')) {
      return '/api/movies';
    } else if (normalized.includes('/api/bookings')) {
      return '/api/bookings';
    } else if (normalized.includes('/api/users')) {
      return '/api/users';
    } else if (normalized.includes('/api/admin/reports')) {
      return '/api/admin/reports';
    }
    
    return normalized;
  }

  // Get all permissions for a subject
  getSubjectPermissions(subject) {
    return this.accessControlMatrix[subject] || {};
  }

  // Get full policy for documentation
  getFullPolicy() {
    return {
      policyName: this.policyDescription.name,
      description: this.policyDescription.description,
      subjects: Object.keys(this.accessControlMatrix),
      objects: ['movies', 'bookings', 'users', 'reports', 'showtimes'],
      matrix: this.accessControlMatrix,
      roles: this.policyDescription.roles,
      justification: this.policyDescription.justification,
      accessControlList: this.acl
    };
  }

  // Log access attempt
  logAccess(subject, object, action, granted) {
    console.log(`[ACCESS CONTROL] Subject: ${subject}, Object: ${object}, Action: ${action}, Granted: ${granted}`);
  }
}

module.exports = new AccessControl();