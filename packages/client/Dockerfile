# ---- Stage Build ----
    FROM node:20-alpine AS build

    WORKDIR /app
    
    # Installer curl, bash et ca-certificates pour Bun
    RUN apk add --no-cache curl bash ca-certificates
    
    # Installer Bun
    RUN curl -fsSL https://bun.sh/install | bash
    ENV PATH="/root/.bun/bin:$PATH"
    
    # Copier package.json et bun.lockb (si présent)
    COPY package.json bun.lockb* ./
    
    # Installer les dépendances
    RUN bun install
    
    # Copier le code source
    COPY . .
    
    # Build Vite frontend
    RUN bun run build
    
    # ---- Stage Production ----
    FROM nginx:alpine AS prod
    
    # Copier le build frontend
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # Copier ton nginx.conf complet (avec events {} etc.)
    COPY ./nginx.conf /etc/nginx/nginx.conf
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]
    