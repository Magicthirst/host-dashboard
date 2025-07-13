from node:22.17.0

workdir /app

copy package.json package-lock.json* ./

run npm install

copy . .

expose 8000

cmd ["npm", "run", "dev", "--", "--port", "8000", "--host", "0.0.0.0"]
