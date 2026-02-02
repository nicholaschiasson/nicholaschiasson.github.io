FROM alpine:3.23

RUN apk update \
	&& apk add --no-cache \
		bash=~5.3 \
		build-base=~0.5 \
		curl=~8.17 \
		deno=~2.3 \
		ffmpeg=~8.0 \
		git=~2.52 \
		gomplate=~4.3 \
		just=~1.43 \
		miniserve=~0.32 \
		npm=~11.6 \
		sudo=~1.9 \
		watchexec=~2.3 \
	&& rm -rf /var/cache/apk/*

RUN npm install -g prettier@3.8 \
	tailwindcss@4.1 \
	@tailwindcss/cli@4.1 \
	&& npm cache clean --force

ENV CARGO_HOME=/usr/local/cargo
ENV RUSTUP_HOME=/usr/local/rustup
ENV PATH=/usr/local/cargo/bin:$PATH
RUN curl -fsSL https://sh.rustup.rs | sh -s -- -y --default-toolchain 1.85 \
	&& rustup --version \
	&& cargo --version \
	&& rustc --version

RUN rustup target add wasm32-unknown-unknown

RUN cargo install --locked wasm-pack@^0.13 jaq@^2.3 \
	&& wasm-pack --version \
	&& jaq --version

RUN git config --global --add safe.directory '*'
