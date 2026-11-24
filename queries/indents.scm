; Auto-indentation for Chord.
;
; Every block-ish construct is `KEY { ... }` (or a value map / list). Indent the
; content between the delimiters: the indent range starts after `{`/`[` and ends
; before `}`/`]`, so closing delimiters land at the parent level.

(persona_body "{" @start "}" @end) @indent

(persona_overrides_block "{" @start "}" @end) @indent

(chorus_body "{" @start "}" @end) @indent

(uses_block "{" @start "}" @end) @indent

(scena_body "{" @start "}" @end) @indent

(scena_stage_body "{" @start "}" @end) @indent

(scena_as_body "{" @start "}" @end) @indent

(scena_with_body "{" @start "}" @end) @indent

(expansion_body "{" @start "}" @end) @indent

(expansion_uses_block "{" @start "}" @end) @indent

(assembly_body "{" @start "}" @end) @indent

(graph_block "{" @start "}" @end) @indent

(nodes_block "{" @start "}" @end) @indent

(overrides_block "{" @start "}" @end) @indent

(map_value "{" @start "}" @end) @indent

(value_list "[" @start "]" @end) @indent
