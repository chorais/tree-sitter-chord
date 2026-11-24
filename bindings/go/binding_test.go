package tree_sitter_chord_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_chord "github.com/chorais/chorais/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_chord.Language())
	if language == nil {
		t.Errorf("Error loading Chord grammar")
	}
}
