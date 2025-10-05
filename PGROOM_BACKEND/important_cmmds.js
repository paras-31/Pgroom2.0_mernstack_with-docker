/**
 * docker run --name my_postgres -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=pgrooms -p 5432:5432 -d postgres
 * to create migration: - npx prisma migrate dev --create-only
 * to run the migrations : - npx prisma migrate dev --name init
 * Open Prisma Studio to view the database: - npx prisma studio
 * npx prisma db pull --> npx prisma generate --> npx prisma db push
 * 
 * http://localhost:5000/pgroomns/test
 **/ 