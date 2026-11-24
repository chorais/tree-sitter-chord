import XCTest
import SwiftTreeSitter
import TreeSitterChord

final class TreeSitterChordTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_chord())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Chord grammar")
    }
}
