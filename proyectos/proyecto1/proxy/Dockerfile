FROM nginx:latest

# Copia el archivo de configuración nginx.conf al directorio /etc/nginx/
COPY ./nginx.conf /etc/nginx/nginx.conf

# Expone el puerto 80
EXPOSE 80

# Establece el directorio de trabajo
WORKDIR /etc/nginx

# Comando de inicio para nginx
CMD ["nginx", "-g", "daemon off;"]
