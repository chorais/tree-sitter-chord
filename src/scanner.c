/**
 * External scanner for Chord heredocs.
 *
 * A heredoc is `<<TAG` followed by a newline, then body lines, terminated by
 * the first line whose trimmed content equals TAG (C-4, Runtime Wins; the
 * terminator line tolerates leading whitespace). TAG is >= 2 chars with an
 * upper/underscore lead (TerminatorId).
 *
 * This cannot be expressed with a tree-sitter regex (Rust's regex crate has no
 * lazy quantifiers or lookahead), so it is implemented as a single opaque
 * external token, matching the runtime lexer's treatment of HEREDOC.
 *
 * The external scanner is invoked by tree-sitter BEFORE extras (whitespace,
 * comments) are skipped, and the internal lexer never re-invokes it mid-scan.
 * A heredoc preceded by whitespace or comments therefore has to be reached by
 * skipping them here, with advance(skip=true) so skipped characters stay out
 * of the token. If no heredoc follows, the scan fails and tree-sitter resets
 * the lexer to its original position, so skipping is always safe.
 *
 * @license MIT
 */

#include "tree_sitter/parser.h"

#include <stdbool.h>
#include <stdint.h>
#include <string.h>

enum TokenType {
  HEREDOC,
};

#define MAX_TAG_LEN 64

static bool is_tag_start(int32_t c) {
  return (c >= 'A' && c <= 'Z') || c == '_';
}

static bool is_tag_char(int32_t c) {
  return is_tag_start(c) || (c >= '0' && c <= '9');
}

static bool is_space(int32_t c) {
  return c == ' ' || c == '\t' || c == '\n' || c == '\r' || c == '\f' || c == '\v';
}

static bool line_matches_tag(const char *line, size_t len, const char *tag, size_t tag_len) {
  size_t start = 0;
  size_t end = len;
  while (start < end && (line[start] == ' ' || line[start] == '\t')) start++;
  while (end > start && (line[end - 1] == ' ' || line[end - 1] == '\t')) end--;
  if (end - start != tag_len) return false;
  return memcmp(line + start, tag, tag_len) == 0;
}

void *tree_sitter_chord_external_scanner_create(void) { return NULL; }
void tree_sitter_chord_external_scanner_destroy(void *payload) { (void)payload; }
void tree_sitter_chord_external_scanner_reset(void *payload) { (void)payload; }

unsigned tree_sitter_chord_external_scanner_serialize(void *payload, char *buffer) {
  (void)payload;
  (void)buffer;
  return 0;
}

void tree_sitter_chord_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
  (void)payload;
  (void)buffer;
  (void)length;
}

bool tree_sitter_chord_external_scanner_scan(
  void *payload,
  TSLexer *lexer,
  const bool *valid_symbols
) {
  (void)payload;

  if (!valid_symbols[HEREDOC]) return false;

  // Reach a potential `<<` through any leading extras. Everything skipped is
  // marked as whitespace (skip=true) so it is never part of the token.
  if (lexer->lookahead != '<') {
    if (!is_space(lexer->lookahead) && lexer->lookahead != '#' &&
        lexer->lookahead != '/') {
      return false;
    }
    for (;;) {
      if (lexer->eof(lexer)) return false;
      if (is_space(lexer->lookahead)) {
        lexer->advance(lexer, true);
      } else if (lexer->lookahead == '#' || lexer->lookahead == '/') {
        // A possible line comment (`//`, `#`) or block comment (`/*`). Only
        // treat it as an extra if the shape matches; otherwise the scan fails
        // and the lexer resets, leaving the real token for the next scan.
        int32_t second = '\0';
        lexer->advance(lexer, true);
        second = lexer->lookahead;
        if (lexer->lookahead == '/' && second == '/') {
          lexer->advance(lexer, true);
          while (!lexer->eof(lexer) && lexer->lookahead != '\n' && lexer->lookahead != '\r') {
            lexer->advance(lexer, true);
          }
        } else if (lexer->lookahead == '*' && second == '*') {
          lexer->advance(lexer, true);
          // Skip to the first `*/` (matching the grammar's first-close rule).
          bool starred = false;
          while (!lexer->eof(lexer)) {
            if (lexer->lookahead == '*' ) {
              starred = true;
            } else if (lexer->lookahead == '/' && starred) {
              lexer->advance(lexer, true);
              break;
            } else {
              starred = false;
            }
            lexer->advance(lexer, true);
          }
          if (lexer->eof(lexer)) return false;
        } else {
          return false;
        }
      } else {
        break;
      }
    }
    if (lexer->lookahead != '<') return false;
  }

  lexer->advance(lexer, false);
  if (lexer->lookahead != '<') return false;
  lexer->advance(lexer, false);

  char tag[MAX_TAG_LEN];
  size_t tag_len = 0;
  if (!is_tag_start(lexer->lookahead)) return false;
  while (is_tag_char(lexer->lookahead) && !lexer->eof(lexer)) {
    if (tag_len < MAX_TAG_LEN) tag[tag_len++] = (char)lexer->lookahead;
    lexer->advance(lexer, false);
  }
  // TerminatorId is >= 2 chars with an upper/underscore lead.
  if (tag_len < 2 || tag_len >= MAX_TAG_LEN) return false;

  // The header must be followed immediately by a newline.
  if (lexer->lookahead == '\r') lexer->advance(lexer, false);
  if (lexer->lookahead != '\n') return false;
  lexer->advance(lexer, false);

  // Consume body lines until one whose trimmed content equals TAG. The token
  // ends at the end of the terminator line's tag; its trailing newline is left
  // for the whitespace extra.
  for (;;) {
    char line[256];
    size_t len = 0;
    bool truncated = false;

    while (!lexer->eof(lexer) && lexer->lookahead != '\n' && lexer->lookahead != '\r') {
      if (lexer->lookahead > 127) {
        truncated = true;
      } else if (len < sizeof(line)) {
        line[len++] = (char)lexer->lookahead;
      } else {
        truncated = true;
      }
      lexer->advance(lexer, false);
    }

    if (lexer->eof(lexer)) return false;

    if (!truncated && line_matches_tag(line, len, tag, tag_len)) {
      // End the token at the tag, before its trailing newline.
      lexer->mark_end(lexer);
      lexer->result_symbol = HEREDOC;
      return true;
    }

    if (lexer->lookahead == '\r') lexer->advance(lexer, false);
    if (lexer->lookahead == '\n') lexer->advance(lexer, false);
  }
}
