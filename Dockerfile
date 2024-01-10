FROM nginx:latest

WORKDIR /app

COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/ .

VOLUME /etc/nginx
VOLUME /var/log/nginx

EXPOSE 80
EXPOSE 443

RUN ln -s /app/dist /usr/share/nginx/html/chat2llm

CMD ["nginx", "-g", "daemon off;"]