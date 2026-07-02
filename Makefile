FRONTEND_DIR := frontend
NPM := npm
HOST_PORT := 5173
PROTO_DIR := proto
PROTO_TS_OUT := $(FRONTEND_DIR)/game/generated/proto
PROTOC_GEN_TS := $(FRONTEND_DIR)/node_modules/.bin/protoc-gen-ts
PROTO_FILES := $(shell find $(PROTO_DIR) -name '*.proto')

.PHONY: list help install proto-ts dev host build clean

# -shows all make commands with their comments.
# -run when you want to see what this Makefile can do.
list:
	@sh scripts/make-help.sh $(firstword $(MAKEFILE_LIST))

# -shows all make commands with their comments.
# -same as make list.
help: list

# -downloads the frontend tools this project needs.
# -run once after cloning, and again if package.json changes.
# -without this, make dev/build will not know what Vite or TypeScript are.
install:
	cd $(FRONTEND_DIR) && $(NPM) install

# -builds proto files into TypeScript files for the frontend.
# -run after changing proto files, and before using proto types in TS.
# -this gives the frontend generated classes/types instead of hand-written copies.
proto-ts:
	mkdir -p $(PROTO_TS_OUT)
	protoc --plugin=$(PROTOC_GEN_TS) --ts_out=$(PROTO_TS_OUT) --proto_path=$(PROTO_DIR) $(PROTO_FILES)

# -starts the frontend in development mode.
# -run this whenever you are working on the webpage.
# -it gives you a local browser page that updates while you edit.
dev: proto-ts
	cd $(FRONTEND_DIR) && $(NPM) run dev

# -makes the frontend available to other devices on your network.
# -run when you want to open the webpage from a phone, tablet, or another computer.
# -this binds Vite to your network instead of only this computer.
host:
	@FRONTEND_DIR=$(FRONTEND_DIR) NPM=$(NPM) HOST_PORT=$(HOST_PORT) sh scripts/host-frontend.sh

# -turns the frontend source code into final files in frontend/dist.
# -run before you want to test or ship the webpage.
# -this checks the TypeScript and makes the files a real server can host.
build: proto-ts
	cd $(FRONTEND_DIR) && $(NPM) run build

# -deletes frontend/dist.
# -run when you want to throw away old build output.
# -it lets the next make build start from a clean folder.
clean:
	rm -rf $(FRONTEND_DIR)/dist
