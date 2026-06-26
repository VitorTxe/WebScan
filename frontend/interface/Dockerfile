# Compilação (Build)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Variável necessária em tempo de compilação para o bundle do Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Servidor Web de Produção (Nginx)
FROM nginx:alpine
# Copia o bundle gerado no estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html
# Copia a configuração personalizada do Nginx para suportar SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
