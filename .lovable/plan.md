

## Plan: Add Admin Account

The user wants to create an admin account with email `fahad69gay@gmail.com` and assign it the admin role.

### Steps

1. **Check if user exists** — Query the database to see if this email is already registered
2. **If not registered** — Sign up the user with the provided credentials via the app's signup flow, or guide the user to register first
3. **Assign admin role** — Insert a record into `user_roles` table with `role = 'admin'` for this user

### Technical Details

- The `handle_new_user` trigger already creates a profile and assigns the default `user` role on signup
- After signup, a migration will insert an admin role: `INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email = 'fahad69gay@gmail.com'`
- This uses the existing `has_role` security definer function that the admin panel already relies on

### What I Need To Do

1. First register the user (or confirm they exist)
2. Run a database migration to grant admin role

