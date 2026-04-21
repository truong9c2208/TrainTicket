# TrainTicket

Backend for Train Ticket Management System.

> [!NOTE]
> This project is for educational purposes only, not for commercial purposes

## Tech stack
- NestJS
- Prisma ORM
- PostgreSQL
- Redis (cache & locking)
- JWT Authentication

## Requirements
- Node.js 18 >=
- PostgreSQL
- Redis
- Docker

## Installation
1. Clone the repository

```bash
git clone -b back-end --single-branch https://github.com/shibaa05/TrainTicket.git
```
2. Install dependencies

```bash
npm install
```
3. Set up environment variables

```bash
DATABASE_URL=""
JWT_SECRET=""
JWT_EXPIRES_IN=""
REDIS_URL=""
```
4. Generate Prisma client

```bash
npx prisma generate
```
5. Run database migrations

```bash
npx prisma migrate dev --name init
```
6. Docker compose (optional, for local development)

```bash
docker compose up -d
```
7. Start the development server

```bash
npm run start:dev
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support
- Star the repository if you find it useful
- Open issues for bugs or feature requests
- Follow the project for updates
- A coffee
    - [Buy me a coffee](https://ko-fi.com/shibaa05)
    - [PayPal](https://www.paypal.com/paypalme/shibaadev)
    - [VietQR](https://i.ibb.co/939NhNt2/86d59cfe-2589-45d0-a97b-0300077e5e3d.jpg)