/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

jest.autoMockOff();

var Grammar = require('../grammar');

let {

  GRAMMAR,
  GRAMMAR_TERMINALS,
  GRAMMAR_NON_TERMINALS,
  GRAMMAR_LEX_VARS,
  GRAMMAR_LEX_RULES,
  GRAMMAR_NORMALIZED_LEX_RULES,
  GRAMMAR_START_SYMBOL,

  DEFAULT_GRAMMAR,
  DEFAULT_LEX_VARS,
  DEFAULT_LEX_RULES,

} = require('./grammars-data');

function testGrammar(
  grammar,
  terminals,
  nonTerminals,
  lexVars,
  lexRules,
  startSymbol
) {
  expect(grammar.getTerminals()).toEqual(terminals);
  expect(grammar.getNonTerminals()).toEqual(nonTerminals);
  expect(grammar.getLexVars()).toEqual(lexVars);
  expect(grammar.getLexRules()).toEqual(lexRules);
  expect(grammar.getStartSymbol()).toEqual(startSymbol);
}

describe('Grammar', () => {

  it('constructs grammar with ε and lex vars', () => {
    testGrammar(
      new Grammar({
        lex: GRAMMAR_LEX_RULES,
        bnf: GRAMMAR,
      }),
      GRAMMAR_TERMINALS,
      GRAMMAR_NON_TERMINALS,
      GRAMMAR_LEX_VARS,
      GRAMMAR_NORMALIZED_LEX_RULES,
      GRAMMAR_START_SYMBOL
    );
  });

  it('constructs grammar from the string with no lex vars', () => {
    testGrammar(
      new Grammar(DEFAULT_GRAMMAR),
      GRAMMAR_TERMINALS,
      GRAMMAR_NON_TERMINALS,
      DEFAULT_LEX_VARS,
      DEFAULT_LEX_RULES,
      GRAMMAR_START_SYMBOL
    );
  });

});