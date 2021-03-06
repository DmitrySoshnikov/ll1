/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

jest.autoMockOff();

let SetsGenerator = require('../sets-generator');

let {

  GRAMMAR,
  GRAMMAR_LEX_RULES,
  GRAMMAR_FIRST_SETS,
  GRAMMAR_FOLLOW_SETS,
  GRAMMAR_PREDICT_SETS,

} = require('./test-data');

describe('SetsGenerator', () => {

  it('constructs First set', () => {
    let sg = new SetsGenerator({
      lex: GRAMMAR_LEX_RULES,
      bnf: GRAMMAR,
    });
    expect(sg.getFirstSets()).toEqual(GRAMMAR_FIRST_SETS);
  });

  it('constructs Follow set', () => {
    let sg = new SetsGenerator({
      lex: GRAMMAR_LEX_RULES,
      bnf: GRAMMAR,
    });
    expect(sg.getFollowSets()).toEqual(GRAMMAR_FOLLOW_SETS);
  });

  it('constructs Follow set', () => {
    let sg = new SetsGenerator({
      lex: GRAMMAR_LEX_RULES,
      bnf: GRAMMAR,
    });
    expect(sg.getPredictSets()).toEqual(GRAMMAR_PREDICT_SETS);
  });

});