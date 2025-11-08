FROM golang:1.25.3-alpine3.21 AS build

WORKDIR /src

# Copy only dependency files first
COPY backend/go.mod backend/go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the source code
COPY . .

RUN cd backend &&  GO111MODULE=on go build -o=bootstrap main.go

## Now copy it into our base image.
FROM debian:trixie

RUN rm -rf /var/lib/apt/lists/* \
    && apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl
RUN update-ca-certificates
RUN rm -rf /var/lib/apt/lists/*

COPY --from=build /src/backend/bootstrap /

CMD ["/bootstrap"]