# ---- Build Stage ----
    FROM oven/bun:alpine AS build
    WORKDIR /app
    
    # Copier uniquement les fichiers de dépendances pour le cache
    COPY bun.lockb package.json ./
    RUN bun install --frozen-lockfile
    
    # Copier le reste du projet
    COPY . .
    
    # Build Vite avec Bun
    RUN bun run build
    
    # ---- Production Stage ----
    FROM nginx:alpine
    
    # Supprimer la config par défaut
    RUN rm /etc/nginx/conf.d/default.conf
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Copier le build Vite
    COPY --from=build /app/dist /usr/share/nginx/html
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    