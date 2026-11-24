; Text objects for Chord (vim-mode navigation).
;
; Chord has no functions/classes, so the mapping is:
;   @class    - top-level declarations (the big navigable sections)
;   @function - intra-declaration structures (stages, nodes, override entries)
;   @comment  - comments

; ---------- @class: top-level declarations ----------

(persona_decl (persona_body "{" (_)* @class.inside)) @class.around

; persona/cluster cognition & config decls end in a hidden _map_body, so the
; braces are direct children of the decl node.
(persona_cognition_decl "{" (_)* @class.inside) @class.around

(persona_config_decl "{" (_)* @class.inside) @class.around

(cluster_cognition_decl "{" (_)* @class.inside) @class.around

(cluster_config_decl "{" (_)* @class.inside) @class.around

(chorus_decl (chorus_body "{" (_)* @class.inside)) @class.around

(scena_decl (scena_body "{" (_)* @class.inside)) @class.around

(expansion_decl (expansion_body "{" (_)* @class.inside)) @class.around

(assembly_decl (assembly_body "{" (_)* @class.inside)) @class.around

(profile_decl "{" (_)* @class.inside) @class.around

(posture_decl "{" (_)* @class.inside) @class.around

(capability_decl "{" (_)* @class.inside) @class.around

(provider_decl "{" (_)* @class.inside) @class.around

(test_decl "{" (_)* @class.inside) @class.around

; ---------- @function: nested structures ----------

(scena_stage_decl
  (scena_stage_body "{" (_)* @function.inside)) @function.around

(node_decl
  (node_body "{" (_)* @function.inside)) @function.around

(persona_override_entry
  (map_value "{" (_)* @function.inside)) @function.around

; ---------- @comment ----------

(line_comment) @comment.around

(block_comment) @comment.around
