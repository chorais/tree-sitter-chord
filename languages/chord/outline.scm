; Outline structure for Chord.
;
; @item  - the navigable range of an outline entry
; @name  - the symbol name shown in the outline
; @context - extra context shown alongside the name

; ---------- Top-level declarations ----------

(persona_decl (name_with_version) @name) @item

(persona_cognition_decl (name_with_version) @name) @item

(persona_config_decl (name_with_version) @name) @item

(cluster_cognition_decl (name_with_version) @name) @item

(cluster_config_decl (name_with_version) @name) @item

(chorus_decl (name_with_version) @name) @item

; Optional second name_with_version is the `extends` target.
(scena_decl
  (name_with_version) @name
  (name_with_version)? @context) @item

; Optional second name_with_version is the `extends` target.
(assembly_decl
  (name_with_version) @name
  (name_with_version)? @context) @item

(expansion_decl
  (expansion_category) @context
  (name_with_version) @name) @item

(profile_decl (name_with_version) @name) @item

(posture_decl (name_with_version) @name) @item

(capability_decl (name_with_version) @name) @item

(provider_decl (name_with_version) @name) @item

(test_decl (name_with_version) @name) @item

; ---------- Nested structural items ----------

(scena_stage_decl name: (identifier) @name) @item

(node_decl name: (identifier) @name) @item

(persona_override_entry name: (name_with_version) @name) @item
