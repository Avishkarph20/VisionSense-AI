FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html
COPY styles.css /usr/share/nginx/html/styles.css
COPY api.js /usr/share/nginx/html/api.js
COPY app.js /usr/share/nginx/html/app.js
COPY vendor /usr/share/nginx/html/vendor
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
