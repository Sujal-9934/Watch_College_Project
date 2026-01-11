# Admin User Setup Guide

## Default Admin Credentials

After setting up the database, you can create an admin user using one of the methods below:

**Default Credentials:**
- **Email:** `admin@watchstore.com`
- **Password:** `Admin@123`

⚠️ **Important:** Change the password after first login!

---

## Method 1: Using Node.js Script (Recommended)

This is the easiest method. Run the script from the backend directory:

```bash
cd backend
npm run create-admin
```

The script will:
- Create an admin user if it doesn't exist
- Update existing user to admin role if email already exists
- Use credentials from `.env` file or defaults

---

## Method 2: Using SQL Script

Run the SQL script directly in MySQL:

```bash
mysql -u root -p watch_store < database/create_admin.sql
```

Or manually in MySQL:

```sql
USE watch_store;

INSERT INTO users (
    first_name,
    last_name,
    email,
    password,
    role,
    is_email_verified,
    is_active
) VALUES (
    'Admin',
    'User',
    'admin@watchstore.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYq5q5q5q', -- Password: Admin@123
    'admin',
    1,
    1
);
```

---

## Method 3: Manual Registration + Database Update

1. Register a user normally through the frontend (`/register`)
2. Verify the email (or skip verification)
3. Update the user role in database:

```sql
UPDATE users 
SET role = 'admin', is_email_verified = 1 
WHERE email = 'your-email@example.com';
```

---

## Method 4: Create Admin with Custom Password

If you want to use a different password, generate bcrypt hash:

```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('YourPassword', 12);
console.log(hash);
```

Then use the hash in SQL:

```sql
INSERT INTO users (first_name, last_name, email, password, role, is_email_verified, is_active)
VALUES ('Admin', 'User', 'admin@watchstore.com', 'YOUR_HASH_HERE', 'admin', 1, 1);
```

---

## Verify Admin User

After creating admin user, verify:

```sql
SELECT id, first_name, last_name, email, role, is_email_verified, is_active 
FROM users 
WHERE role = 'admin';
```

---

## Login to Admin Panel

1. Go to frontend: `http://localhost:3000/login`
2. Login with admin credentials
3. After login, click on user icon in header
4. Click "Admin Dashboard" from dropdown
5. Or directly go to: `http://localhost:3000/admin`

---

## Troubleshooting

### Admin user created but can't login?
- Check if `is_email_verified = 1` in database
- Check if `is_active = 1` in database
- Check if `role = 'admin'` in database

### Password not working?
- Make sure password is properly hashed with bcrypt
- Use the Node.js script for automatic hashing

### Admin link not showing in header?
- Make sure user is logged in
- Check user role is 'admin' or 'super_admin'
- Refresh the page after login

