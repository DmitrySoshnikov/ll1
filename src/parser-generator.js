/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

import Grammar from './grammar';
import Parser from './parser';
import SetsGenerator from './sets-generator';
import TablePrinter from './table-printer';
import {EPSILON, EOF} from './special-symbols';

/**
 * Given an LL(1) grammar builds a parser for it.
 *
 * LL(1) by definition:
 *
 *   - Should not contain left recursion
 *   - Should be left-factored
 *
 * Grammar is presented as an array of productions in the
 * format `NonTerminal -> RHS` format. For the same non-terminal
 * the `|` symbol can be used instead of `->` as in full notation.
 * Terminal symbols should be wrapped into double-quotes. The symbols
 * on the RHS are space-separated.
 *
 * Example:
 *
 *  let grammar = `
 *    S -> F
 *       | "(" S "+" F ")"
 *    F -> "a"
 *  `;
 */
export default class ParserGenerator {

  /**
   * Constructs a new parser generator based on grammar.
   */
  constructor(grammar: Array) {
    this._grammar = new Grammar(grammar);
    this._sets = new SetsGenerator(this._grammar);
    this._initTablePrinter();
  }

  /**
   * Builds a parser object for this grammar.
   *
   * This parser only check a string for "acceptance".
   */
  generate() {
    return new Parser(
      this.getGrammar(),
      this.getTable()
    );
  }

  /**
   * Returns grammar.
   */
  getGrammar() {
    return this._grammar;
  }

  /**
   * Retuns the parsing table (builds one if it's not yet built).
   */
  getTable() {
    return this._table || (this._table = this._buildTable());
  }

  /**
   * Outputs the parsing table in readable format.
   */
  printTable() {
    this._grammar.print();

    console.log('Parsing table:\n');

    let tokens = this._grammar.getTerminals()
      .concat(this._grammar.getLexVars());

    let parsingTable = this.getTable();

    // Append $ to the list of terminals.
    tokens.push(EOF);

    for (let nonTerminal in parsingTable) {
      let data = [nonTerminal];
      for (let k = 0; k < tokens.length; k++) {
        data.push(parsingTable[nonTerminal][tokens[k]] || '-');
      }
      this._tablePrinter.push(data);
    }

    console.log(this._tablePrinter.toString());
    console.log('');
  }

  /**
   * Builds the parsing table from First and Follow sets.
   *
   * Basically for building LL(1) table we need the Predict set,
   * however the Predict set is just a combination of the
   * First set of the production, plus the Follow set if the
   * production derives epsilon. So in building the table
   * we use First and Follow sets directly delegating to needed
   * parts during the table construction.
   */
  _buildTable() {
    let table = {};

    let grammarEntries = this._grammar.get();
    for (let k in grammarEntries) {
      let production = grammarEntries[k];
      let LHS = this._grammar.getLHS(production);
      let RHS = this._grammar.getRHS(production);
      let productionNumber = this._grammar.getNumber(production);

      // Init columns for this non-terminal.
      if (!table[LHS]) {
        table[LHS] = {};
      }

      // All productions goes under the terminal column, if
      // this terminal is not epsilon.
      if (RHS[0] !== EPSILON) {
        for (let terminal in this._sets.firstOfRHS(RHS)) {
          table[LHS][terminal] = productionNumber;
        }
      } else {
        // Otherwise, this ε-production goes under the columns from
        // the Follow set.
        for (let terminal in this._sets.followOf(LHS)) {
          table[LHS][terminal] = productionNumber;
        }
      }
    }

    return table;
  }

  _initTablePrinter() {
    this._tablePrinter = new TablePrinter({
      head: [''].concat(
        this._grammar.getTerminals(),
        this._grammar.getLexVars(),
        EOF
      )
    });
  }

};