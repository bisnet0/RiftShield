# Usando a mesma imagem base leve do backend
FROM node:20-alpine

WORKDIR /usr/src/app

# Copia os arquivos de dependência
COPY package.json yarn.lock ./

# Instala as dependências
RUN yarn install

# Copia o restante do código
COPY . .

# Expõe a porta padrão do Vite
EXPOSE 5173

# O PULO DO GATO: O Vite por padrão só roda no localhost interno. 
# Precisamos da flag --host para ele expor a porta para fora do contêiner Docker!
CMD ["yarn", "dev", "--host"]