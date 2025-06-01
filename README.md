# How to run the project

---

## Step 1: Install the necessary dependencies.

```
npm i
```

## Step 2: Start the development server with auto-reloading and an instant preview.
```
npm run dev
```

---

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase
    - Postgres (database)
    - Studio (dashboard)
    - GoTrue (Auth)
    - PostgREST (API)
    - Realtime (API & multiplayer)
    - Storage API (large file storage)
    - Deno (Edge Functions)
    - postgres-meta (database management)
    - Supavisor
    - Kong (API gateway)

---

# Role-Based Access Control (RBAC) System

## Database Structure

The RBAC system consists of the following tables:

1. `profiles` - Contains user information including their role
2. `roles` - Contains available roles in the system
3. `permissions` - Contains available permissions (resource + action combinations)
4. `role_permissions` - Maps roles to permissions

---

## Permission Structure

Permissions are defined as a combination of:
- **Resource**: The part of the application being accessed (e.g., 'inventory', 'users')
- **Action**: The operation being performed (e.g., 'view', 'edit', 'delete')

---

## Setting Up RBAC

When an admin user logs in, the system automatically initializes the RBAC tables with default roles and permissions if they don't exist yet.

It possible to manually run the initialization by calling:

```typescript
import { initializeRBAC } from "@/services/auth/rbacService";
await initializeRBAC();
```

---

## Using RBAC in Components

### Using the Permission Hook

```typescript
import usePermission from '@/hooks/usePermission';

function MyComponent() {
  const { canAccess, loading } = usePermission('inventory', 'edit');
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {canAccess ? (
        <button>Edit Inventory</button>
      ) : (
        <p>You don't have permission to edit inventory</p>
      )}
    </div>
  );
}
```

### Protecting Routes

```typescript
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected route */}
      <Route 
        path="/inventory" 
        element={
          <ProtectedRoute resource="inventory" action="view">
            <InventoryPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

---

## Checking Permissions in Code

```typescript
import { hasPermission } from '@/services/auth/rbacService';

async function handleAction() {
  if (await hasPermission('inventory', 'delete')) {
    // Perform delete operation
  } else {
    // Show access denied message
  }
}
```

---

## Default Roles and Permissions

The system comes with these default roles:

1. **admin** - Full access to all features
2. **warehouse** - Access to warehouse management features
3. **customer** - Access to shopping and order management
4. **analyst** - Read-only access to analytics data

Each role has pre-configured permissions based on their needs. It is possible to extend these by adding more resources and actions as needed.
