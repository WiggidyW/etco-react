# Builder
FROM node:20.8.0 AS builder

ARG NODE_TLS_REJECT_UNAUTHORIZED='1'
ARG ETCO_EVE_AUTH_CLIENT_ID
ARG ETCO_EVE_MARKETS_CLIENT_ID
ARG ETCO_EVE_STRUCTURE_INFO_CLIENT_ID
ARG ETCO_EVE_CORPORATION_CLIENT_ID
ARG NEXT_PUBLIC_ETCO_CORP_NAME='Eve Trading Co.'
ARG NEXT_PUBLIC_ETCO_CORP_ID
ARG NEXT_PUBLIC_ETCO_BASE_URL
ARG NEXT_PUBLIC_ETCO_BASE_DOMAIN
ARG BUILD_ETCO_GRPC_URL
ARG ETCO_GRPC_URL
ARG SKIP_GENSTATICDATA

COPY ./ /root/etco-react/
WORKDIR /root/etco-react/

RUN echo "NODE_TLS_REJECT_UNAUTHORIZED=${NODE_TLS_REJECT_UNAUTHORIZED}" >> .env && \
    echo "ETCO_EVE_AUTH_CLIENT_ID=${ETCO_EVE_AUTH_CLIENT_ID}" >> .env && \
    echo "ETCO_EVE_MARKETS_CLIENT_ID=${ETCO_EVE_MARKETS_CLIENT_ID}" >> .env && \
    echo "ETCO_EVE_STRUCTURE_INFO_CLIENT_ID=${ETCO_EVE_STRUCTURE_INFO_CLIENT_ID}" >> .env && \
    echo "ETCO_EVE_CORPORATION_CLIENT_ID=${ETCO_EVE_CORPORATION_CLIENT_ID}" >> .env && \
    echo "NEXT_PUBLIC_ETCO_CORP_ID=${NEXT_PUBLIC_ETCO_CORP_ID}" >> .env && \
    echo "NEXT_PUBLIC_ETCO_CORP_NAME=${NEXT_PUBLIC_ETCO_CORP_NAME}" >> .env && \
    echo "NEXT_PUBLIC_ETCO_BASE_URL=${NEXT_PUBLIC_ETCO_BASE_URL}" >> .env && \
    echo "NEXT_PUBLIC_ETCO_BASE_DOMAIN=${NEXT_PUBLIC_ETCO_BASE_DOMAIN}" >> .env && \
    echo "ETCO_GRPC_URL=${ETCO_GRPC_URL}" >> .env && \
    echo "BUILD_ETCO_GRPC_URL=${BUILD_ETCO_GRPC_URL}" >> .env

RUN npm install
RUN if [ "$SKIP_GENSTATICDATA" = true ]; then \
        echo "SKIP_GENSTATICDATA true: skip generating static data"; \
    else \
        echo "SKIP_GENSTATICDATA false: generating static data"; \
        npm run genstaticdata; \
    fi
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
