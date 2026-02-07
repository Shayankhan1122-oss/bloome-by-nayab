# Admin Setup Guide for       IBREES-LIL-HUZAIFA

## Single Admin Feature

This e-commerce platform implements a single admin user constraint, meaning only one admin user can be registered and active at any time. This enhances security by limiting administrative access to a single account.

## Admin Credentials

The default admin account has the following credentials:
- **Email**: admin@qariwebstore.com
- **Password**: admin123

## Important Security Notes

1. **Change Default Password**: After first login, immediately change the default admin password
2. **Secure Email**: The admin email (admin@qariwebstore.com) cannot be used to register additional admin accounts
3. **Single Admin Rule**: Once an admin account is created, no additional admin accounts can be registered
4. **Account Recovery**: Implement a secure password recovery mechanism for the admin account

## Registration Process

1. The first user to register with the email "admin@qariwebstore.com" will automatically become the admin
2. Once an admin exists, any attempt to register with the same email will be rejected
3. Regular users can still register with different email addresses

## API Endpoints

- `POST /api/admin/register` - Register the admin account (only first call succeeds)
- `POST /api/auth/login` - Login for both admin and regular users
- `GET /api/admin/products` - Admin-only product management
- `POST /api/admin/products` - Admin-only product creation

## Security Measures

- Passwords are hashed using bcrypt
- JWT tokens for session management
- Admin privileges verified on each protected route
- Input validation and sanitization on all endpoints

## Troubleshooting

If you need to reset the admin account (e.g., if the admin account is compromised):
1. Access your database directly
2. Remove the existing admin user
3. Restart the registration process
4. Remember that only one admin can exist at a time