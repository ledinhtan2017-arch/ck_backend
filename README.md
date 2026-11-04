# E-commerce backend

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set the database connection values.
3. Generate a JWT secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and put the result in `.env` as `JWT_SECRET`. The server requires at least 32 characters.
4. Create the database by running `database/init.sql` with MySQL.
5. Start the server with `npm run dev`.

Do not commit `.env` or use the same JWT secret across environments. If a secret has been exposed, replace it; existing tokens signed with the old secret will no longer be valid.

## Create the first admin

Register the intended admin account through `POST /api/auth/register`, then promote that account using a trusted MySQL session:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'the-registered-admin@example.com';
```

Verify that exactly one account was updated before using the admin account. Public registration always assigns the `user` role.
