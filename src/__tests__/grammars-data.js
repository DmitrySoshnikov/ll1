/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

`use strict`;

exports.GRAMMAR = `
  E  -> T E'
  E' -> "+" T E'
      | ε
  T  -> F T'
  T' -> "*" F T'
      | ε
  F  -> "id"
      | NUMBER
      | "(" E ")"
`;

exports.GRAMMAR_TERMINALS = [`"+"`, `"*"`, `"id"`, `"("`, `")"`];
exports.GRAMMAR_NON_TERMINALS = [`E`, `E'`, `T`, `T'`, `F`];
exports.GRAMMAR_LEX_VARS = ['NUMBER'];

exports.GRAMMAR_LEX_RULES = {
  '"("' : '"("',
  '")"' : '")"',
  '"+"' : '"+"',
  '"*"' : '"*"',
  '"id"': '"id"',
  '[0-9]+("."[0-9]+)?': `NUMBER`
};

exports.GRAMMAR_START_SYMBOL = 'E';

exports.GRAMMAR_FIRST_SETS = {
  E       : { '"id"': true, NUMBER: true, '"("': true },
  T       : { '"id"': true, NUMBER: true, '"("': true },
  F       : { '"id"': true, NUMBER: true, '"("': true },
  '"id"'  : { '"id"': true },
  NUMBER  : { NUMBER: true }, // NUMBER is a lexVar (terminal)
  '"("'   : { '"("': true },
  "E'"    : { '"+"': true, 'ε': true },
  '"+"'   : { '"+"': true },
  "T'"    : { '"*"': true, 'ε': true },
  '"*"'   : { '"*"': true }
};

exports.GRAMMAR_FOLLOW_SETS = {
  E       : { '$': true, '")"': true },
  "E'"    : { '$': true, '")"': true },
  T       : { '"+"': true, '$': true, '")"': true },
  "T'"    : { '"+"': true, '$': true, '")"': true },
  F       : { '"*"': true, '"+"': true, '$': true, '")"': true }
};

exports.GRAMMAR_PREDICT_SETS = {
  '1. E -> T E\''       : { '"id"': true, NUMBER: true, '"("': true },
  '2. E\' -> "+" T E\'' : { '"+"': true },
  '3. T -> F T\''       : { '"id"': true, NUMBER: true, '"("': true },
  '4. T\' -> "*" F T\'' : { '"*"': true },
  '5. F -> "id"'        : { '"id"': true },
  '6. F -> NUMBER'      : { NUMBER: true },
  '7. F -> "(" E ")"'   : { '"("': true }
};

exports.DEFAULT_GRAMMAR = `
  E  -> T E'
  E' -> "+" T E'
      | ε
  T  -> F T'
  T' -> "*" F T'
      | ε
  F  -> "id"
      | "(" E ")"
`;

exports.DEFAULT_LEX_VARS = [];

exports.DEFAULT_LEX_RULES = {
  '"("' : '"("',
  '")"' : '")"',
  '"+"' : '"+"',
  '"*"' : '"*"',
  '"id"': '"id"',
};
