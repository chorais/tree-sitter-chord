; Bracket pairs for Chord: maps and value lists.
;
; Note: string literals are a single token() in the grammar (quotes included),
; so there is no standalone `"` node to pair here. Quote autoclose is handled
; via the `brackets` list in languages/chord/config.toml instead.

("{" @open "}" @close)

("[" @open "]" @close)
