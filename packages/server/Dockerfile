FROM oven/bun:alpine

WORKDIR /app

COPY package.json ./
RUN bun install 

COPY . .

# Build Prisma (gens client)
RUN bunx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "bunx prisma migrate deploy && bun run start"]
