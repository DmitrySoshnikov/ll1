/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

import Tokenizer from './tokenizer';
import {EPSILON, EOF} from './special-symbols';

/**
 * Parser class encapsulates logic of traversing
 * the parse table (received from the `ParserGenerator`),
 * and checking a string for "acceptance".
 *
 * TODO: productions handler to build a parse tree.
 */
export default class Parser {

  /**
   * Constructs a Parser instance from an LL(1)
   * parsing table, which was built for built
   * for a specific grammar by `ParserGenerator`.
   */
  constructor(grammar, parsingTable) {
    this._grammar = grammar;
    this._table = parsingTable;

    // Parsing stack.
    this._stack = [];

    // Stores production numbers used at parsing.
    this._productionNumbers = [];
  }

  /**
   * Parses a string using the table.
   * In cases of success outputs list of productions
   * which were used to to parse the source, or
   * throws a parse error.
   */
  parse(string) {
    console.log(`Parsing: "${string}"\n`);

    let tokenizer = new Tokenizer(string, this._grammar);
    let token = tokenizer.getNextToken();
    let top = null;

    // Init the stack with the `$` at the bottom, and the start symbol.
    this._stack = [EOF, this._grammar.getStartSymbol()];
    this._productionNumbers = [];

    while (!tokenizer.isEOF()) {
      top = this._stack.pop();

      // Terminal is on the stack, just advance.
      if (this._grammar.isToken(top) && top === token.type) {
        // We already popped the symbol from the stack,
        // so just advance the cursor.
        token = tokenizer.getNextToken();
        continue;
      }

      // Else, it's a non-terminal, do derivation (replace it
      // in the stack with corresponding production).
      this._doDerivation(top, token);
    }

    // If the string reached EOF, and we still have non-terminal symbols
    // on the stack, we need to clean them up, they have to derive ε.
    while (this._stack.length !== 1) {
      this._doDerivation(this._stack.pop(), token);
    }

    // At the end the stack shoud contain only `$`,
    // as well as the last token should be the `$` marker.
    if (this._stack[0] !== EOF || token.value !== EOF) {
      throw new Error(
        'Parse error, stack is not empty:',
        this._stack,
        token.value
      );
    }

    console.log(
      'Accepted. Productions:',
      this._productionNumbers.join(', '), '\n'
    );
  }

  _doDerivation(top, token) {
    let production = this._getProduction(top, token);

    // If we have production like F -> ε, we should just pop
    // the symbole, and don't push its derivation (the ε).
    if (production[0] !== EPSILON) {
      this._stack.push(...production);
    }
  }

  _getProduction(top, token) {
    let nextProductionNumber = this._table[top][token.type];

    if (!nextProductionNumber) {
      throw Error('Parse error, unexpected token: ' + token.value);
    }

    let nextProduction = this._grammar.get()[nextProductionNumber];

    this._productionNumbers.push(nextProductionNumber);

    // We should return reversed RHS in order to push on the stack.
    return this._grammar
      .getRHS(nextProduction)
      .slice()
      .reverse();
  }

};