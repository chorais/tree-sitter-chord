; Chord syntax highlighting.
;
; Zed applies later captures over earlier ones at equal priority, so generic
; captures come first and node-specific refinements follow.

; ---------- Comments ----------

(line_comment) @comment
(block_comment) @comment

; ---------- Literals ----------

(string_literal) @string
(heredoc) @string.special

(number_literal) @number
(duration) @number

(boolean_literal) @boolean
(null_literal) @constant.builtin

(version) @number

; ---------- Identifiers (generic) ----------

(identifier) @variable

; Names with versions are types (persona/assembly/scena/capability names etc).
(name_with_version name: (identifier) @type)

; Map entry keys.
(map_entry key: (reference_part (identifier)) @variable.member)
(map_entry key: (reference_part (map_key)) @variable.member)

; ---------- Declarations ----------

(node_decl name: (identifier) @type)
(node_decl target: (identifier) @type)

(scena_stage_decl name: (identifier) @type)

(override_entry name: (identifier) @type)

(uses_entry alias: (identifier) @type)
(expansion_use_entry alias: (identifier) @type)

; ---------- Scena invocations & transitions ----------

(scena_invocation_stmt target: (identifier) @function.call)
(scena_invocation_edge_stmt target: (reference) @function.call)
(scena_invocation_arg name: (reference_part) @variable.parameter)

(scena_transition_stmt target: (identifier) @label)

; `@policy(param)` governance annotations.
(scena_stage_governance (identifier) @attribute)

; ---------- Operators & punctuation ----------

["->" ">" "@"] @operator

["." "," ":"] @punctuation.delimiter

["(" ")" "[" "]" "{" "}"] @punctuation.bracket

; ---------- Keywords ----------

; Declaration heads.
["persona" "cluster" "chorus" "scena" "expansion" "assembly"
 "profile" "posture" "capability" "provider" "test"] @keyword

; Modifiers & structure.
["extends" "using" "as" "use" "uses" "override" "overrides"
 "imports" "inheritance" "visibility" "requires" "forbids"
 "defaults" "with" "all" "timeout"] @keyword

; Stage machinery.
["stage" "node" "nodes" "graph" "invocation" "transition"
 "goto" "when" "on_error" "parallel" "wait" "aggregate"
 "continue" "partial" "freeze" "barrier" "deterministic"
 "strategy"] @keyword

; Section/field keywords (also common map keys).
["cognition" "config" "safety" "composition" "general" "args"
 "assemblies" "routing" "providers" "models" "execution" "memory"
 "phases" "resources" "ingress" "allow" "deny" "registry" "run"
 "tool" "output" "outputs" "return" "inputs" "description"
 "identity" "governance" "behavioral" "lifecycle" "forensics"
 "ethics" "compatibility" "capabilities" "signals" "hooks"
 "metadata" "metadata_requirements" "metadata_propagation"
 "io_schema" "io_multiplicity" "custom"] @keyword

; Cognition-persona field keywords.
["reasoning_modality" "cognitive_priorities" "weighting_preferences"
 "temperament" "signature_hierarchy" "composability" "weights"
 "inheritance_rules" "governance_boundaries" "interaction_rights"
 "epistemic_operations" "consensus_behaviour" "aggregation_modes"
 "quantitative_capabilities" "transformation_rules"
 "authority_model" "behaviour_modes"] @keyword
