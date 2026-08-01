# ---- Base ----
FROM node:lts AS base
WORKDIR /usr/src/app
COPY package*.json ./

# ---- Development ----
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]

# ---- Build (production assets) ----
FROM base AS build
RUN npm install
COPY . .
RUN npm run build

# ---- Production (static assets served by nginx) ----
FROM nginx:latest AS production
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
