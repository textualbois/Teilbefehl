#!/bin/sh
set -eu

MAKEFILE=${1:-Makefile}

TERM_SIZE=$((stty size < /dev/tty) 2>/dev/null || true)
TERM_WIDTH=${TERM_SIZE##* }

case "$TERM_WIDTH" in
	""|*[!0-9]*) TERM_WIDTH=$((tput cols < /dev/tty) 2>/dev/null || true) ;;
esac

case "$TERM_WIDTH" in
	""|*[!0-9]*) TERM_WIDTH=${COLUMNS:-} ;;
esac

case "$TERM_WIDTH" in
	""|*[!0-9]*)
		set -- $(stty size 2>/dev/null || true)
		TERM_WIDTH=${2:-}
		;;
esac

case "$TERM_WIDTH" in
	""|*[!0-9]*) TERM_WIDTH=100 ;;
esac

awk -v width="$TERM_WIDTH" '
	BEGIN {
		target_width = 14;
		desc_width = width - target_width - 7;
		if (desc_width < 40) desc_width = 40;
		bold = sprintf("%c[1m", 27);
		reset = sprintf("%c[0m", 27);
		border = "+" repeat("-", target_width + 2) "+" repeat("-", desc_width + 2) "+";
		print border;
		print_cell("COMMAND", "DESCRIPTION");
		print border;
	}
	/^# / {
		line = substr($0, 3);
		comment = comment ? comment " " line : line;
		next;
	}
	/^[A-Za-z0-9_-]+:/ {
		target = $1;
		sub(/:.*/, "", target);
		if (comment) {
			if (rows_printed > 0) print_cell("", "");
			print_row(target, comment);
			rows_printed++;
		}
		comment = "";
		next;
	}
	{ comment = ""; }
	END { print border; }
	function repeat(char, count, out) {
		out = "";
		while (count-- > 0) out = out char;
		return out;
	}
	function print_cell(target, desc, raw_target, target_padding, target_cell) {
		raw_target = toupper(target);
		target_padding = repeat(" ", target_width - length(raw_target));
		target_cell = raw_target ? bold raw_target reset target_padding : target_padding;
		printf "| %s | %-" desc_width "s |\n", target_cell, desc;
	}
	function print_row(target, desc, words, count, i, line, word) {
		count = split(desc, words, " ");
		line = "";
		for (i = 1; i <= count; i++) {
			word = words[i];
			if (line == "") {
				line = word;
			} else if (length(line) + length(word) + 1 <= desc_width) {
				line = line " " word;
			} else {
				print_cell(target, line);
				target = "";
				line = word;
			}
		}
		if (line != "") print_cell(target, line);
	}
' "$MAKEFILE"
