/**
 * @file Tree-sitter grammar for the Chorais Description Language (Chord).
 *
 * Translated from chorais/spec/chord.ebnf
 * (sha256 c764579865e5eef259ae85ad18d83e2d3c33a85794fe4fbc56efb5f73d67029a),
 * cross-checked against the generated ANTLR grammar chord/grammar/Chord.g4.
 *
 * This is a deliberate pragmatic superset of the frozen spec: declaration
 * headers stay spec-faithful, but declaration bodies are unified around the
 * spec's MapEntry model so the real corpus (chorais/examples and the
 * ecosystem blueprint / scena-pattern-library templates) parses cleanly.
 * The corpus uses declaration kinds (capability/provider/test) and map keys
 * that postdate the frozen grammar, and every per-section "KEY [":"] Value"
 * field is exactly a MapEntry, so a single generalized entry rule covers it.
 *
 * Only shapes that are NOT maps stay structural: stage machinery, uses /
 * assembly-list entries (`persona X@1 as alias`), graph edges and node
 * declarations, override entries, and expansion use entries.
 *
 * Rule names are snake_case renderings of the EBNF productions for traceability.
 *
 * @author figurativelycthulhu <figurativelycthulhu@outlook.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/**
 * The 92 key/reference-capable words reserved by the language (F-1, Runtime
 * Wins). Valid as MapEntry keys and ReferenceParts. Seven further words —
 * extends, entry_stage, custom, strategy, barrier, deterministic, all — are
 * reserved in field positions only and appear quoted at their productions.
 * true/false/null are literal tokens, never map keys (C-5).
 */
const KEYWORDS = [
  'persona', 'cluster', 'assembly', 'chorus',
  'scena', 'expansion', 'cognition', 'config',
  'safety', 'composition', 'general', 'node',
  'using', 'args', 'assemblies', 'routing',
  'providers', 'models', 'execution', 'memory',
  'phases', 'resources', 'ingress', 'allow',
  'deny', 'registry', 'run', 'stage',
  'tool', 'goto', 'when', 'on_error',
  'output', 'outputs', 'return', 'inputs',
  'uses', 'graph', 'nodes', 'overrides',
  'as', 'description', 'profile', 'posture',
  'use', 'identity', 'governance', 'behavioral',
  'lifecycle', 'forensics', 'ethics', 'compatibility',
  'requires', 'forbids', 'defaults',
  'reasoning_modality', 'cognitive_priorities',
  'weighting_preferences', 'temperament',
  'signature_hierarchy', 'composability', 'weights',
  'inheritance_rules', 'governance_boundaries',
  'interaction_rights', 'epistemic_operations',
  'consensus_behaviour', 'aggregation_modes',
  'quantitative_capabilities', 'transformation_rules',
  'authority_model', 'behaviour_modes', 'signals',
  'hooks', 'metadata_requirements',
  'metadata_propagation', 'metadata', 'io_schema',
  'io_multiplicity', 'timeout', 'with',
  'parallel', 'wait', 'aggregate', 'continue',
  'partial', 'freeze', 'inheritance', 'visibility',
  'imports', 'capabilities', 'override',
];

/**
 * The ebnf's MapEntry production is ambiguous (alternatives 1–3 overlap, and
 * alternative 5 overlaps alternative 1 through ReferenceValue). Each shape is
 * a named rule so GLR conflicts can be declared between them.
 */
export default grammar({
  name: 'chord',

  externals: $ => [
    $.heredoc,
  ],

  extras: $ => [
    /\s/,
    $.line_comment,
    $.block_comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$.chorus_uses_field, $.map_key],
    [$.scena_uses_field, $.map_key],
    [$.assembly_uses_field, $.map_key],
    [$.expansion_uses_field, $.map_key],
    [$.assembly_graph_field, $.map_key],
    [$.assembly_nodes_field, $.map_key],
    [$.assembly_overrides_field, $.map_key],
    [$.persona_overrides_field, $.map_key],
    [$.reference_value, $._key_ref_map_entry],
    [$.scena_stage_decl, $.map_key],
    [$.node_decl, $.map_key],
    [$.edge_endpoint, $._edge_map_entry],
  ],

  rules: {
    // ChordFile ::= _ { TopLevelDecl _ } ;
    source_file: $ => repeat($.top_level_decl),

    top_level_decl: $ => choice(
      $.persona_decl,
      $.persona_cognition_decl,
      $.persona_config_decl,
      $.cluster_cognition_decl,
      $.cluster_config_decl,
      $.chorus_decl,
      $.scena_decl,
      $.expansion_decl,
      $.assembly_decl,
      $.profile_decl,
      $.posture_decl,
      // Corpus extensions beyond the frozen spec.
      $.capability_decl,
      $.provider_decl,
      $.test_decl,
    ),

    // ---------- Lexical layer ----------

    identifier: $ => /[a-zA-Z][a-zA-Z0-9_-]*/,

    // NameWithVersion ::= Name "@" Version ;
    // Version is kept as a single token: Digit { Digit | "." Digit } | "latest".
    name_with_version: $ => seq(
      field('name', $.identifier),
      '@',
      field('version', $.version),
    ),

    version: $ => choice(
      token(seq(/[0-9]+/, repeat(seq('.', /[0-9]+/)))),
      'latest',
    ),

    // The reserved KeyWord set (see KEYWORDS above).
    map_key: $ => choice(...KEYWORDS),

    reference_part: $ => choice($.identifier, $.map_key),

    reference: $ => seq($.reference_part, repeat(seq('.', $.reference_part))),

    // StringLiteral ::= '"' StringChar* '"' ;  (escapes absorbed lexically, C-2)
    string_literal: $ => token(seq(
      '"',
      repeat(choice(/[^"\\\n]+/, /\\./)),
      '"',
    )),

    // Unified numeric literal (row 6, C-3 Option A): 5, +5, -5, 5.0, 5e3, 5.0e3.
    number_literal: $ => token(seq(
      optional(choice('+', '-')),
      /[0-9]+/,
      optional(seq('.', /[0-9]+/)),
      optional(seq(/[eE]/, optional(choice('+', '-')), /[0-9]+/)),
    )),

    // Duration ::= Digit+ TimeUnit ; used only in timeout clauses, where the
    // longest-match rule makes "500ms" win over the number "500".
    duration: $ => token(seq(/[0-9]+/, choice('ms', 's', 'm', 'h'))),

    boolean_literal: $ => choice('true', 'false'),
    null_literal: $ => 'null',

    line_comment: $ => token(seq(choice('//', '#'), /[^\r\n]*/)),

    // Block comments terminate at the FIRST close marker (row 23). The classic
    // `[^*]*\*+(...)*` shape does not compile to a working token in the
    // tree-sitter CLI's lexer builder, so the equivalent first-close
    // non-greedy semantics are expressed as one regex: a `*` is only accepted
    // inside the body when not followed by the close slash.
    block_comment: $ => token(/\/\*([^*]|\*[^\/])*\*\//),

    // ---------- Values ----------

    // Value ::= PrimitiveValue | List | Map | ReferenceValue | NameWithVersion
    // | Heredoc. StringValue's members are inlined (StringLiteral is already
    // in PrimitiveValue; a separate named rule would force a reduce/reduce
    // conflict on every string). NameWithVersion is added beyond the spec so
    // values like `chorus: runtime@1.0` parse inside generalized map bodies.
    value: $ => choice(
      $.primitive_value,
      $.value_list,
      $.map_value,
      $.reference_value,
      $.name_with_version,
      $.heredoc,
    ),

    primitive_value: $ => choice(
      $.string_literal,
      $.number_literal,
      $.boolean_literal,
      $.null_literal,
    ),

    reference_value: $ => $.reference,

    value_list: $ => seq(
      '[',
      optional(seq($.value, repeat(seq(',', $.value)))),
      ']',
    ),

    // Map ::= "{" _ [ MapEntry { _ [ "," _ ] MapEntry } ] _ "}" ;
    map_value: $ => seq(
      '{',
      optional(seq($.map_entry, repeat(seq(optional(','), $.map_entry)))),
      '}',
    ),

    // MapEntry, collapsed from the spec's five alternatives to five shapes:
    //   plain:     Key [":"] Value                 (alternative 1)
    //   dotted:    Key "." Key {"." Key} [":"] Value (alternative 2)
    //   key_ref:   Key Reference [":"] Value       (alternative 3;
    //                                              e.g. `use profile "x"`)
    //   edge:      Key "->" Key                    (alternative 4)
    //   paired:    Key Key "->" Key                (alternative 5)
    // For a two-part dotted entry `a.b: v`, alternatives 2 and 3 both match
    // (key=`a`, ref=`b`); dynamic precedence prefers the dotted-key reading,
    // matching the spec's alternative order.
    map_entry: $ => choice(
      $._plain_map_entry,
      $._dotted_key_map_entry,
      $._key_ref_map_entry,
      $._edge_map_entry,
      $._paired_edge_map_entry,
    ),

    _dotted_key_map_entry: $ => prec.dynamic(1, seq(
      field('key', $._dotted_key),
      optional(':'),
      field('value', $.value),
    )),

    _dotted_key: $ => seq($.reference_part, repeat1(seq('.', $.reference_part))),

    _plain_map_entry: $ => seq(
      field('key', $.reference_part),
      optional(':'),
      field('value', $.value),
    ),

    _key_ref_map_entry: $ => seq(
      field('key', $.reference_part),
      field('ref', $.reference),
      optional(':'),
      field('value', $.value),
    ),
    // NOTE: `ref` is a fresh Reference starting after the key — it cannot
    // begin with '.', so dotted keys must use _dotted_key_map_entry.

    _edge_map_entry: $ => seq(
      field('from', $.reference_part),
      '->',
      field('to', $.reference_part),
    ),

    _paired_edge_map_entry: $ => seq(
      field('from', $.reference_part),
      field('via', $.reference_part),
      '->',
      field('to', $.reference_part),
    ),

    // ---------- Generic map body ----------

    // Bodies whose every member is a MapEntry (persona cognition/config,
    // clusters, nodes, profiles, postures, and the corpus's capability,
    // provider and test declarations).
    _map_body: $ => seq('{', repeat($.map_entry), '}'),

    // ---------- Personas ----------

    persona_decl: $ => seq('persona', '>', $.name_with_version, $.persona_body),

    // Every unified-persona section (cognition/config/inheritance/visibility/
    // imports/uses/capabilities) is a `KEY [":"] Value` shape and therefore a
    // MapEntry; only override entries (`override X@1 { ... }`) need structure.
    persona_body: $ => seq(
      '{', repeat(choice($.map_entry, $.persona_overrides_field)), '}',
    ),

    // PersonaOverridesBody ::= "{" { "override" NameWithVersion Map } "}" ;
    persona_overrides_field: $ => prec.dynamic(1, seq(
      'overrides', optional(':'), $.persona_overrides_block,
    )),

    persona_overrides_block: $ => seq(
      '{', repeat($.persona_override_entry), '}',
    ),

    persona_override_entry: $ => prec.dynamic(1, seq(
      'override', field('name', $.name_with_version), optional(':'), $.map_value,
    )),

    persona_cognition_decl: $ => seq(
      'persona', '>', 'cognition', $.name_with_version, $._map_body,
    ),

    persona_config_decl: $ => seq(
      'persona', '>', 'config', $.name_with_version, $._map_body,
    ),

    // ---------- Cluster cognition/config ----------

    cluster_cognition_decl: $ => seq(
      'cluster', '>', 'cognition', $.name_with_version, $._map_body,
    ),

    cluster_config_decl: $ => seq(
      'cluster', '>', 'config', $.name_with_version, $._map_body,
    ),

    // ---------- Choruses ----------

    chorus_decl: $ => seq('chorus', '>', $.name_with_version, $.chorus_body),

    // Routing/providers/safety/execution/memory/metadata/governance/
    // compatibility blocks and `use profile "x"` are all MapEntries; the
    // assemblies list is a map of alias → NameWithVersion. Only `uses`
    // (whose entries are `persona X@1 as alias`) stays structural.
    chorus_body: $ => seq(
      '{', repeat(choice($.map_entry, $.chorus_uses_field)), '}',
    ),

    chorus_uses_field: $ => prec.dynamic(1, seq('uses', optional(':'), $.uses_block)),

    uses_block: $ => seq('{', repeat($.uses_entry), '}'),

    uses_entry: $ => seq(
      choice('persona', 'cluster'), $.name_with_version, 'as', field('alias', $.identifier),
    ),

    // ---------- Scena ----------

    scena_decl: $ => seq(
      'scena', '>', $.name_with_version,
      optional(seq('extends', $.name_with_version)),
      $.scena_body,
    ),

    // resources/providers/memory/safety/ingress/allow/deny/registry/run/
    // entry_stage/metadata/governance/compatibility blocks are MapEntries.
    // Stage declarations and `uses` stay structural.
    scena_body: $ => seq(
      '{', repeat(choice($.map_entry, $.scena_uses_field, $.scena_stage_decl)), '}',
    ),

    scena_uses_field: $ => prec.dynamic(1, seq('uses', optional(':'), $.uses_block)),

    scena_stage_decl: $ => seq(
      'stage',
      field('name', $.identifier),
      optional(seq(':', field('anchor', $.scena_type_anchor))),
      optional($.scena_stage_governance),
      optional($.scena_stage_qualifier),
      $.scena_stage_body,
    ),

    scena_type_anchor: $ => choice('tool', 'persona', 'cluster', 'memory', 'custom'),

    scena_stage_governance: $ => seq('@', $.identifier, '(', $.identifier, ')'),

    scena_stage_qualifier: $ => choice(
      $.scena_parallel_qualifier,
      $.scena_wait_qualifier,
      $.scena_aggregate_qualifier,
      $.scena_barrier_qualifier,
      $.scena_deterministic_qualifier,
    ),

    scena_parallel_qualifier: $ => seq(
      '>', 'parallel',
      optional($.timeout_clause),
      optional($.scena_strategy_qualifier),
    ),

    timeout_clause: $ => seq('timeout', $.duration, $.timeout_mode),

    timeout_mode: $ => choice('continue', 'partial', 'freeze'),

    scena_strategy_qualifier: $ => seq('strategy', $.identifier),

    scena_barrier_qualifier: $ => seq('>', 'barrier', $.identifier),

    scena_deterministic_qualifier: $ => seq('>', 'deterministic'),

    scena_wait_qualifier: $ => seq(
      '>', 'wait', $.identifier, repeat(seq(',', $.identifier)),
    ),

    scena_aggregate_qualifier: $ => seq('>', 'aggregate'),

    scena_stage_body: $ => seq('{', repeat($.scena_stage_item), '}'),

    scena_stage_item: $ => choice(
      $.scena_invocation_stmt,
      $.scena_invocation_edge_stmt,
      $.scena_transition_stmt,
      $.scena_with_block,
      $.scena_as_block,
    ),

    // Corpus shape beyond the frozen spec: `invocation Name -> target.ref`.
    scena_invocation_edge_stmt: $ => seq(
      'invocation', field('name', $.identifier), '->', field('target', $.reference),
    ),

    scena_as_block: $ => seq('as', $.scena_type_anchor, $.scena_as_body),

    scena_as_body: $ => seq('{', repeat($.scena_invocation_stmt), '}'),

    scena_with_block: $ => seq(
      'with', choice($.identifier, 'all'), $.scena_with_body,
    ),

    scena_with_body: $ => seq('{', repeat($.scena_invocation_stmt), '}'),

    scena_invocation_stmt: $ => seq(
      optional(field('anchor', $.scena_type_anchor)),
      field('target', $.identifier),
      optional($.scena_invocation_args),
    ),

    scena_invocation_args: $ => seq(
      '(',
      optional(seq($.scena_invocation_arg, repeat(seq(',', $.scena_invocation_arg)))),
      ')',
    ),

    scena_invocation_arg: $ => choice(
      seq(field('name', $.reference_part), ':', field('value', $.value)),
      field('value', $.value),
    ),

    // Corpus shape: transitions may be prefixed with the `transition` keyword.
    scena_transition_stmt: $ => choice(
      seq(optional('transition'), 'goto', field('target', $.identifier)),
      seq(optional('transition'), 'when', field('value', $.value), '->', field('target', $.identifier)),
      seq(optional('transition'), 'on_error', field('target', $.identifier)),
    ),

    // ---------- Expansions ----------

    expansion_decl: $ => seq(
      'expansion', '>', $.expansion_category, $.name_with_version, $.expansion_body,
    ),

    expansion_category: $ => choice(
      'providers', 'memory', 'safety', 'cognition', 'persona',
      'cluster', 'assembly', 'composition', 'general',
    ),

    expansion_body: $ => seq(
      '{', repeat(choice($.map_entry, $.expansion_uses_field)), '}',
    ),

    expansion_uses_field: $ => prec.dynamic(1, seq(
      'uses', optional(':'), $.expansion_uses_block,
    )),

    expansion_uses_block: $ => seq(
      '{', repeat($.expansion_use_entry), '}',
    ),

    expansion_use_entry: $ => seq(
      $.expansion_category, $.name_with_version,
      optional(seq('as', field('alias', $.identifier))),
    ),

    // ---------- Assemblies ----------

    assembly_decl: $ => seq(
      'assembly', $.name_with_version,
      optional(seq('extends', $.name_with_version)),
      $.assembly_body,
    ),

    // inputs/output/outputs/args/routing/providers/models/execution/memory/
    // hooks/signals/metadata/governance/compatibility/description/profile are
    // MapEntries. uses/graph/nodes/overrides stay structural.
    assembly_body: $ => seq(
      '{',
      repeat(choice(
        $.map_entry,
        $.assembly_uses_field,
        $.assembly_graph_field,
        $.assembly_nodes_field,
        $.assembly_overrides_field,
      )),
      '}',
    ),

    assembly_uses_field: $ => prec.dynamic(1, seq('uses', optional(':'), $.uses_block)),

    assembly_graph_field: $ => prec.dynamic(1, seq('graph', optional(':'), $.graph_block)),

    graph_block: $ => seq(
      '{', repeat(choice($.node_decl, $.graph_edge, $.map_entry)), '}',
    ),

    graph_edge: $ => seq($.edge_endpoint, '->', $.edge_endpoint),

    edge_endpoint: $ => choice($.reference_part, $.name_with_version),

    assembly_nodes_field: $ => prec.dynamic(1, seq('nodes', optional(':'), $.nodes_block)),

    nodes_block: $ => seq('{', repeat($.node_decl), '}'),

    node_decl: $ => seq(
      'node', field('name', $.identifier), 'using',
      choice($.name_with_version, field('target', $.identifier)),
      $.node_body,
    ),

    node_body: $ => $._map_body,

    assembly_overrides_field: $ => prec.dynamic(1, seq(
      'overrides', optional(':'), $.overrides_block,
    )),

    overrides_block: $ => seq('{', repeat($.override_entry), '}'),

    override_entry: $ => choice(
      seq($.name_with_version, optional(':'), $.map_value),
      seq(choice('persona', 'cluster'), field('name', $.identifier), $.map_value),
    ),

    // ---------- Profiles / postures ----------

    profile_decl: $ => seq('profile', $.name_with_version, $._map_body),

    posture_decl: $ => seq('posture', $.name_with_version, $._map_body),

    // ---------- Corpus declarations beyond the frozen spec ----------

    capability_decl: $ => seq('capability', $.name_with_version, $._map_body),

    provider_decl: $ => seq('provider', $.name_with_version, $._map_body),

    test_decl: $ => seq('test', $.name_with_version, $._map_body),
  },
});
