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
