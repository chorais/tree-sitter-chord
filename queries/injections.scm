; Language injections for Chord.
;
; Heredoc bodies are long-form free text (spec: HeredocBody is any line whose
; trimmed content != terminator id, typically prose/context blocks with
; {{interpolation}} / ${{ref}} placeholders). Inject as markdown so prose,
; lists and code spans highlight sensibly while plain text stays plain. The
; `<<TAG` header and terminator line are part of the single heredoc token and
; cannot be excluded from the injected range.

((heredoc) @injection.content
 (#set! injection.language "markdown"))
