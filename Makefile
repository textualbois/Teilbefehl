FRONTEND_DIR := frontend
NPM := npm
HOST_PORT := 5173
PROTO_DIR := proto
PROTO_TS_OUT := $(FRONTEND_DIR)/game/generated/proto
PROTOC_GEN_TS := $(FRONTEND_DIR)/node_modules/.bin/protoc-gen-ts
PROTO_FILES := $(shell find $(PROTO_DIR) -name '*.proto')

.PHONY: list help install proto-ts dev host build preview clean

# -shows all make commands with their comments.
# -run when you want to see what this Makefile can do.
list:
	@TERM_SIZE=$$( (stty size < /dev/tty) 2>/dev/null || true); \
	TERM_WIDTH=$${TERM_SIZE##* }; \
	case "$$TERM_WIDTH" in ""|*[!0-9]*) TERM_WIDTH=$$( (tput cols < /dev/tty) 2>/dev/null || true);; esac; \
	case "$$TERM_WIDTH" in ""|*[!0-9]*) TERM_WIDTH=$${COLUMNS:-};; esac; \
	case "$$TERM_WIDTH" in ""|*[!0-9]*) set -- $$(stty size 2>/dev/null); TERM_WIDTH=$$2;; esac; \
	case "$$TERM_WIDTH" in ""|*[!0-9]*) TERM_WIDTH=100;; esac; \
	awk -v width="$$TERM_WIDTH" '\
		BEGIN { \
			target_width = 14; \
			desc_width = width - target_width - 7; \
			if (desc_width < 40) desc_width = 40; \
			bold = sprintf("%c[1m", 27); \
			reset = sprintf("%c[0m", 27); \
			border = "+" repeat("-", target_width + 2) "+" repeat("-", desc_width + 2) "+"; \
			print border; \
			print_cell("COMMAND", "DESCRIPTION"); \
			print border; \
		} \
		/^# / { \
			line = substr($$0, 3); \
			comment = comment ? comment " " line : line; \
			next; \
		} \
		/^[A-Za-z0-9_-]+:/ { \
			target = $$1; \
			sub(/:.*/, "", target); \
			if (comment) { \
				if (rows_printed > 0) print_cell("", ""); \
				print_row(target, comment); \
				rows_printed++; \
			} \
			comment = ""; \
			next; \
		} \
		{ comment = ""; } \
		END { print border; } \
		function repeat(char, count, out) { \
			out = ""; \
			while (count-- > 0) out = out char; \
			return out; \
		} \
		function print_cell(target, desc, raw_target, target_padding, target_cell) { \
			raw_target = toupper(target); \
			target_padding = repeat(" ", target_width - length(raw_target)); \
			target_cell = raw_target ? bold raw_target reset target_padding : target_padding; \
			printf "| %s | %-" desc_width "s |\n", target_cell, desc; \
		} \
		function print_row(target, desc, words, count, i, line, word) { \
			count = split(desc, words, " "); \
			line = ""; \
			for (i = 1; i <= count; i++) { \
				word = words[i]; \
				if (line == "") { \
					line = word; \
				} else if (length(line) + length(word) + 1 <= desc_width) { \
					line = line " " word; \
				} else { \
					print_cell(target, line); \
					target = ""; \
					line = word; \
				} \
			} \
			if (line != "") print_cell(target, line); \
		} \
	' $(MAKEFILE_LIST)

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
host: proto-ts
	@IP=$$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null); \
	if [ -n "$$IP" ]; then \
		echo "Website should be available at: http://$$IP:$(HOST_PORT)"; \
	else \
		echo "Could not auto-detect your IP. Vite will still print its network URL below."; \
	fi
	cd $(FRONTEND_DIR) && $(NPM) run host -- --port $(HOST_PORT)

# -turns the frontend source code into final files in frontend/dist.
# -run before you want to test or ship the webpage.
# -this checks the TypeScript and makes the files a real server can host.
build: proto-ts
	cd $(FRONTEND_DIR) && $(NPM) run build

# -serves the already-built frontend/dist files locally.
# -run after make build if you want to check the final version.
# -dev mode and final build mode can behave slightly differently.
preview:
	cd $(FRONTEND_DIR) && $(NPM) run preview

# -deletes frontend/dist.
# -run when you want to throw away old build output.
# -it lets the next make build start from a clean folder.
clean:
	rm -rf $(FRONTEND_DIR)/dist
