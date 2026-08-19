FROM golang:1.22-alpine AS builder
WORKDIR /app

COPY go.mod go.sum* ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/server ./cmd/api

FROM alpine:3.19
WORKDIR /app

RUN apk --no-cache add ca-certificates

COPY --from=builder /app/bin/server .

EXPOSE 8080
CMD ["./server"]