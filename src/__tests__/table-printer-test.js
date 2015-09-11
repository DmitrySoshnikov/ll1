/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

jest.autoMockOff();

let ParserGenerator = require('../parser-generator');
let TablePrinter = require('../table-printer');
let {EOF} = require('../special-symbols');

let {

  GRAMMAR,
  GRAMMAR_LEX_RULES,
  PRINTED_PARSING_TABLE,

} = require('./test-data');

describe('ParserGenerator', () => {

  it('gets parsing table for printing', () => {
    let pg = new ParserGenerator({
      lex: GRAMMAR_LEX_RULES,
      bnf: GRAMMAR,
    });

    let tablePrinter = new TablePrinter({
      head: [''].concat(
        pg.getGrammar().getTerminals(),
        pg.getGrammar().getLexVars(),
        EOF
      )
    });

    let tokens = pg.getGrammar().getTerminals()
      .concat(pg.getGrammar().getLexVars());

    let parsingTable = pg.getTable();

    tokens.push(EOF);

    for (let nonTerminal in parsingTable) {
      let data = [nonTerminal];
      for (let k = 0; k < tokens.length; k++) {
        data.push(parsingTable[nonTerminal][tokens[k]] || '-');
      }
      tablePrinter.push(data);
    }

    expect(tablePrinter.toString()).toEqual(PRINTED_PARSING_TABLE);
  });

});