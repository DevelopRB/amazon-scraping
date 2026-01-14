# Application Credentials

This application uses hardcoded authentication credentials that are shared with the team.

## Login Credentials

**Username:** `admin`  
**Password:** `admin123`

## Changing Credentials

If you need to change these credentials, you can set environment variables on the backend server:

- `APP_USERNAME` - The username for login
- `APP_PASSWORD` - The password for login

For example, in your `.env` file or Render environment variables:
```
APP_USERNAME=your_username
APP_PASSWORD=your_password
```

## Security Note

These credentials are hardcoded for team access. For production deployments, consider:
- Using environment variables to set credentials
- Implementing more secure authentication methods if needed
- Regularly rotating credentials if security is a concern

