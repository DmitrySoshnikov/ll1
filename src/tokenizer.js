/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

import {EOF} from './special-symbols';

/**
 * A simple tokenizer that extracts tokens
 * from the string, based on the tokens
 * from the grammar.
 */
export default class Tokenizer {

  /**
   * Creates a tokenizer instance.
   */
  constructor(string, grammar) {
    this._string = string + EOF;
    this._cursor = 0;
    this._grammar = grammar;
    this._lexRules = this._grammar.getLexRules();
  }

  /**
   * Returns next token.
   */
  getNextToken() {

    // Analyze untokenized yet part of the string starting from
    // the current cursor position (so all regexp are from ^).
    let string = this._skipWhitespace(this._string.slice(this._cursor));

    if (string === EOF) {
      this._cursor++;
      return {
        type: EOF,
        value: EOF,
      };
    }

    for (let rule in this._lexRules) {
      let matched = this._match(
        string,
        new RegExp('^' + this._normalizeRegexp(rule))
      );
      if (matched) {
        return {
          type: this._lexRules[rule],
          value: this._grammar.isTerminal(this._lexRules[rule])
            ? this._wrapTerminal(matched)
            : matched,
        };
      }
    }

    // If we didn't match anything, just return
    // current char, it'll be parse error in the parser.
    return {
      type: this._string[this._cursor],
      value: this._string[this._cursor],
    };
  }

  isEOF() {
    return this._cursor >= this._string.length;
  }

  /**
   * a -> "a"
   */
  _wrapTerminal(terminal) {
    return `"${terminal}"`;
  }

  /**
   * "a" ->a
   */
  _unwrapTerminal(terminal) {
    return terminal.slice(1, -1);
  }

  /**
   * Skips whitespaces.
   */
  _skipWhitespace(string) {
    let matched = this._match(string, /^\s+/);
    if (matched) {
      return this._string.slice(this._cursor);
    }
    return string;
  }

  /**
   * Generic tokenizing based on current regexp.
   */
  _match(string, regexp) {
    let matched = string.match(regexp);
    if (matched) {
      this._cursor += matched[0].length;
      return matched[0];
    }
    return null;
  }

  /**
   * Replace our notation for terminals to regexp
   * notiaton, e.g. "." to \. for the actual dot string.
   */
  _normalizeRegexp(regexpString) {
    return regexpString.replace(/"([^"]+)"/g, '\\$1');
  }

};