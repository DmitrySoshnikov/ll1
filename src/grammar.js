/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

import {EPSILON} from './special-symbols';

/**
 * Grammar class encapsulates operations with the language
 * grammar. It normalizes it to faster internal representation,
 * and provides API for working with needed parts of productions.
 */
export default class Grammar {

  /**
   * User may pass grammar in several representations:
   *
   * As an array:
   *
   * let grammar = [
   *   'S -> F',
   *   '   | "(" S "+" F ")"',
   *   'F -> "a"'
   * ];
   *
   * Or as a string:
   *
   * let grammar = `
   *   S -> F
   *      | "(" S "+" F ")"
   *   F -> "a"
   * `;
   *
   * In addition, the grammar may be passed an object with
   * `lex` and `bnf` properties. The `lex` part is a set of rules
   * for the lexer, and `bnf` is actual context-free LL(1) grammar.
   *
   * let grammar = {
   *
   *   // Lexical grammar
   *   // format: <regexp rule>: token
   *   // The token can either be a raw string value, like "foo",
   *   // or a variable (written in ALL_CAPITALIZED notation), which
   *   // can be used in further in the `bnf` grammar.
   *
   *   lex: {
   *     '"a"': '"a"',
   *     '"("': '"("',
   *     '")"': '")"',
   *     '"+"': '"+"',
   *     '[0-9]+("."[0-9]+)?\b': 'NUMBER',
   *   },
   *
   *   // BNF grammar
   *
   *   bnf: `
   *     S -> F
   *        | "(" S "+" F ")"
   *     F -> "a"
   *        | NUMBER
   *   `
   * };
   *
   * Note: if no `lex` is provided, the lexical grammar is inferred
   * from the list of all terminals in the `bnf` grammar.
   *
   * The lexical grammar may also be provided as a string:
   *
   *   lex: `
   *     "a"                  : "a"
   *     "("                  : "("
   *     ")"                  : ")"
   *     "+"                  : "+"
   *     [0-9]+("."[0-9]+)?\b : NUMBER
   *   `
   */
  constructor(grammar) {
    this._orignalBnf = grammar;
    this._orignalLex = null;

    // Case when both `lex` and `bnf` are passed.
    if (Object.prototype.toString.call(grammar) === '[object Object]') {
      this._orignalBnf = grammar.bnf;
      this._orignalLex = grammar.lex;
    }

    this._terminals = null;
    this._nonTerminals = null;
    this._lexVars = null;

    this._lexRules = this._normalizeLex(this._orignalLex);
    this._grammar = this._normalizeBnf(this._orignalBnf);
  }

  /**
   * Returns normalized grammar.
   */
  get() {
    return this._grammar;
  }

  /**
   * Retusn original representation of the lexical grammar.
   */
  getOriginalLex() {
    return this._orignalLex;
  }

  /**
   * Retusn original representation of the bnf grammar.
   */
  getOriginalBnf() {
    return this._orignalBnf;
  }

  /**
   * Returns Start symbol of this grammar (it's initialized
   * during normalization process).
   */
  getStartSymbol() {
    return this._startSymbol;
  }

  /**
   * Returns list of terminals in this grammar.
   */
  getTerminals() {
    if (!this._terminals) {
      this._terminals = [];
      let grammarEntries = this.get();

      for (let k in grammarEntries) {
        this._terminals = this._terminals.concat(
          this.getRHS(grammarEntries[k]).filter(this.isTerminal)
        );
      }
    }

    return this._terminals;
  }

  /**
   * Returns list of terminals in this grammar.
   */
  getNonTerminals() {
    if (!this._nonTerminals) {
      let nonTerminals = {};
      let grammarEntries = this.get();

      for (let k in grammarEntries) {
        nonTerminals[this.getLHS(grammarEntries[k])] = true;
      }

      this._nonTerminals = Object.keys(nonTerminals);
    }
    return this._nonTerminals;
  }

  /**
   * Returns token variables.
   */
  getLexVars() {
    if (!this._lexVars) {
      this._lexVars = [];
      var lexRules = this.getLexRules();
      for (var k in lexRules) {
        if (!this.isTerminal(lexRules[k])) {
          this._lexVars.push(lexRules[k]);
        }
      }
    }
    return this._lexVars;
  }

  /**
   * All terminals are encoded in double-quotes
   * in the grammar productions, e.g. "+", or " ".
   */
  isTerminal(symbol) {
    return symbol[0] === '"' && symbol[symbol.length - 1] === '"';
  }

  /**
   * Tokens are either raw text values like "foo", or
   * one of the variables from the lexical grammar.
   */
  isToken(symbol) {
    return this.isTerminal(symbol) ||
      this.getLexVars().indexOf(symbol) !== -1;
  }

  /**
   * Outputs original grammar.
   */
  print() {
    console.log('\nGrammar:\n');
    let grammar = this._toArray(this._orignalBnf);
    for (let i = 0; i < grammar.length; i++) {
      console.log('  ' + (i + 1) + '. ' + grammar[i]);
    }
    console.log('');
  }

  /**
   * Returns lexical rules for tokenizer. If they were not provided
   * by a user, calculates automatically from terminals of BNF grammar.
   *
   * Format:
   *
   *  [
   *    "<regexp rule>": 'TOKEN_NAME' | '"actual terminal"'
   *  ]
   */
  getLexRules() {

    // Return if the rules were provided by a user,
    // or we have already calculated them from terminals.
    if (this._lexRules) {
      return this._lexRules;
    }

    this._lexRules = {};

    this.getTerminals().forEach(terminal => {
      this._lexRules[terminal] = terminal;
    });

    return this._lexRules;
  }

  /**
   * Normalizes lexical grammar which can be presented
   * as a plain object or a string.
   */
  _normalizeLex(lex) {
    if (typeof lex !== 'string') {
      return lex;
    }

    let normalizedLex = {};

    this._toArray(lex).forEach(lexRule => {
      let [LHS, RHS] = this._splitLexParts(lexRule);
      normalizedLex[LHS] = RHS;
    });

    return normalizedLex;
  }

  /**
   * Transforms original grammar to internal representation
   * for faster access of needed parts.
   *
   * let grammar = [
   *   'S -> F',
   *   '   | "(" S "+" F ")"',
   *   'F -> "a"'
   * ];
   *
   * let grammar = {
   *   1: [1, 'S', ['F']],
   *   2: [2, 'S', ['"("', 'S', '"+"', 'F', '")"']],
   *   3: [3, 'F', ['"a"']]
   * };
   */
  _normalizeBnf(grammar) {
    let normalizedBnf = {};
    let currentNonTerminal;

    this._toArray(grammar).forEach((production, k) => {
      let [LHS, RHS] = this._splitBnfParts(production.trim());
      let productionNumber = k + 1;

      // LHS of the first rule is considered as "Start symbol".
      if (k === 0) {
        this._startSymbol = LHS;
      }

      // In case of a short notation.
      if (!LHS) {
        LHS = currentNonTerminal;
      }

      // On full notation this saves current LHS:
      // e.g. `S -> F` saves `S` in order to use it
      // for short notations like ` | (S "+" F)`.
      currentNonTerminal = LHS;

      normalizedBnf[productionNumber] = [productionNumber, LHS, RHS];
    });

    return normalizedBnf;
  }

  /**
   * Turns original grammar in string representation
   * ito its array equivalent.
   */
  _toArray(grammar) {
    if (Array.isArray(grammar)) {
      return grammar;
    }

    return grammar
      .split('\n')
      .filter(production => !!production.trim());
  }

  _splitLexParts(lexRule) {
    var lastColonIdx = lexRule.lastIndexOf(':');
    return [
      lexRule.slice(0, lastColonIdx).trim(),
      lexRule.slice(lastColonIdx + 1).trim(),
    ];
  }

  /**
   * Returns a splitted production by parts:
   *
   * S -> A "+" B " " C
   *
   * ['S', ['A', '"+"', 'B', '" "', 'C']]
   */
  _splitBnfParts(production) {
    let splitter = production.indexOf('->') !== -1 ? '->' : '|';
    let splitted = production.split(splitter);
    let LHS = splitted[0].trim();
    let rhsStr = splitted[1].trim();

    let RHS = [];

    // If no RHS provided, assume it's ε. We support
    // both formats, explicit:
    //
    //   F -> ε
    //
    // and implicit:
    //
    //   F ->
    //
    if (!rhsStr) {
      RHS.push(EPSILON);
    } else {
      let rhsProd = rhsStr.split(/\s+/);
      for (let i = 0; i < rhsProd.length; i++) {
        if (rhsProd[i] === '"' && rhsProd[i + 1] === '"') {
          RHS.push('" "');
          i++;
        } else {
          RHS.push(rhsProd[i]);
        }
      }
    }

    return [LHS, RHS];
  }

  /**
   * Returns number of production as it appears in
   * the grammar (used in encoding the parsing table).
   */
  getNumber(production) {
    return production[0];
  }

  /**
   * Given production `S -> F`, returns `S`.
   */
  getLHS(production) {
    return production[1];
  }

  /**
   * Given production `S -> F`, returns `F`.
   */
  getRHS(production) {
    return production[2];
  }
};