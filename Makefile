FRONTEND_DIR := frontend
NPM := npm
HOST_PORT := 5173
PROTO_DIR := proto
PROTO_TS_OUT := $(FRONTEND_DIR)/game/generated/proto
PROTOC_GEN_TS := $(FRONTEND_DIR)/node_modules/.bin/protoc-gen-ts
PROTO_FILES := $(shell find $(PROTO_DIR) -name '*.proto')

.PHONY: install proto-ts dev host build preview clean

# downloads the frontend tools this project needs.
# run once after cloning, and again if package.json changes.
# without this, make dev/build will not know what Vite or TypeScript are.
install:
	cd $(FRONTEND_DIR) && $(NPM) install

# what: builds proto files into TypeScript files for the frontend.
# when: run after changing proto files, and before using proto types in TS.
# why: this gives the frontend generated classes/types instead of hand-written copies.
proto-ts:
	mkdir -p $(PROTO_TS_OUT)
	protoc --plugin=$(PROTOC_GEN_TS) --ts_out=$(PROTO_TS_OUT) --proto_path=$(PROTO_DIR) $(PROTO_FILES)

# starts the frontend in development mode.
# run this whenever you are working on the webpage.
# it gives you a local browser page that updates while you edit.
dev: proto-ts
	cd $(FRONTEND_DIR) && $(NPM) run dev

# makes the frontend available to other devices on your network.
# run when you want to open the webpage from a phone, tablet, or another computer.
# this binds Vite to your network instead of only this computer.
host: proto-ts
	@IP=$$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null); \
	if [ -n "$$IP" ]; then \
		echo "Website should be available at: http://$$IP:$(HOST_PORT)"; \
	else \
		echo "Could not auto-detect your IP. Vite will still print its network URL below."; \
	fi
	cd $(FRONTEND_DIR) && $(NPM) run host -- --port $(HOST_PORT)

# turns the frontend source code into final files in frontend/dist.
# run before you want to test or ship the webpage.
# this checks the TypeScript and makes the files a real server can host.
build: proto-ts
	cd $(FRONTEND_DIR) && $(NPM) run build

# serves the already-built frontend/dist files locally.
# run after make build if you want to check the final version.
# dev mode and final build mode can behave slightly differently.
preview:
	cd $(FRONTEND_DIR) && $(NPM) run preview

# deletes frontend/dist.
# run when you want to throw away old build output.
# it lets the next make build start from a clean folder.
clean:
	rm -rf $(FRONTEND_DIR)/dist
