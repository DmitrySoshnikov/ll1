/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

jest.autoMockOff();

let ParserGenerator = require('../parser-generator');

let {

  GRAMMAR,
  GRAMMAR_LEX_RULES,
  PARSING_TABLE,

} = require('./test-data');

describe('ParserGenerator', () => {

  it('builds parsing table', () => {
    let pg = new ParserGenerator({
      lex: GRAMMAR_LEX_RULES,
      bnf: GRAMMAR,
    });
    expect(pg.getTable()).toEqual(PARSING_TABLE);
  });

});