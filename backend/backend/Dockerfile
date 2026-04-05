# Build stage
FROM rust:slim AS builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends pkg-config libssl-dev curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -f target/release/deps/cybersim_backend*

COPY src ./src
COPY migrations ./migrations
RUN touch src/main.rs && cargo build --release
RUN cp target/release/cybersim-backend /usr/local/bin/

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates libssl3 && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/local/bin/cybersim-backend /usr/local/bin/

WORKDIR /app
RUN mkdir -p certificates

ENV RUST_LOG=info
EXPOSE 8000

CMD ["cybersim-backend"]
