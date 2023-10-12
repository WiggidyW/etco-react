# Builder
FROM node:20.8.0 AS builder

ARG ETCO_EVE_AUTH_CLIENT_ID
ARG ETCO_EVE_AUTH_CLIENT_SECRET
ARG ETCO_EVE_MARKETS_CLIENT_ID
ARG ETCO_EVE_MARKETS_CLIENT_SECRET
ARG ETCO_EVE_STRUCTURE_INFO_CLIENT_ID
ARG ETCO_EVE_STRUCTURE_INFO_CLIENT_SECRET
ARG ETCO_EVE_CORPORATION_CLIENT_ID
ARG ETCO_EVE_CORPORATION_CLIENT_SECRET
ARG NEXT_PUBLIC_ETCO_CORP_NAME='Eve Trading Co.'
ARG NEXT_PUBLIC_ETCO_BASE_URL
ARG NEXT_PUBLIC_ETCO_BASE_DOMAIN

COPY ./ /root/etco-react/
WORKDIR /root/etco-react/

RUN echo "ETCO_EVE_AUTH_CLIENT_ID=${ETCO_EVE_AUTH_CLIENT_ID}" >> .env && \
    echo "ETCO_EVE_AUTH_CLIENT_SECRET=${ETCO_EVE_AUTH_CLIENT_SECRET}" >> .env && \
    echo "ETCO_EVE_MARKETS_CLIENT_ID=${ETCO_EVE_MARKETS_CLIENT_ID}" >> .env && \
    echo "ETCO_EVE_MARKETS_CLIENT_SECRET=${ETCO_EVE_MARKETS_CLIENT_SECRET}" >> .env && \
    echo "ETCO_EVE_STRUCTURE_INFO_CLIENT_ID=${ETCO_EVE_STRUCTURE_INFO_CLIENT_ID}" >> .env && \
    echo "ETCO_EVE_STRUCTURE_INFO_CLIENT_SECRET=${ETCO_EVE_STRUCTURE_INFO_CLIENT_SECRET}" >> .env && \
    echo "ETCO_EVE_CORPORATION_CLIENT_ID=${ETCO_EVE_CORPORATION_CLIENT_ID}" >> .env && \
    echo "ETCO_EVE_CORPORATION_CLIENT_SECRET=${ETCO_EVE_CORPORATION_CLIENT_SECRET}" >> .env && \
    echo "NEXT_PUBLIC_ETCO_CORP_NAME=${NEXT_PUBLIC_ETCO_CORP_NAME}" >> .env && \
    echo "NEXT_PUBLIC_ETCO_BASE_URL=${NEXT_PUBLIC_ETCO_BASE_URL}" >> .env && \
    echo "NEXT_PUBLIC_ETCO_BASE_DOMAIN=${NEXT_PUBLIC_ETCO_BASE_DOMAIN}" >> .env

RUN npm install
RUN npm run generate-static-data
RUN npm run build

# Runner
FROM node:20.8.0-alpine3.18

RUN apk add --no-cache ca-certificates
RUN apk add --no-cache libc6-compat

WORKDIR /root/etco-react/
COPY --from=builder /root/etco-react/.env ./.env
COPY --from=builder /root/etco-react/public/ ./public/
COPY --from=builder /root/etco-react/.next/standalone/ ./
COPY --from=builder /root/etco-react/.next/static/ ./.next/static/

CMD ["node", "server.js"]
