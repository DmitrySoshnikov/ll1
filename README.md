## LL(1) Parser generator [![Build Status](https://travis-ci.org/DmitrySoshnikov/ll1.svg?branch=master)](https://travis-ci.org/DmitrySoshnikov/ll1)

Note: see also generic [syntax](https://github.com/DmitrySoshnikov/syntax) repo, that implements both, LR and LL algorithms.

The `ll1` implements non-recursive [LL(1) parsing](https://en.wikipedia.org/wiki/LL_parser) algorithm, building a _Parsing table_ from _First_ and _Follow_ sets.

The tool can be used for educational purposes in a compilers course, to trace and analyze an LL(1) Parsing table, as well as for automatic parsers generation for LL(1) grammars (note, the grammar should not contain _left recursion_, and should already be _left factored_ if needed).

### Installation

```
npm install -g ll1
```

### Usage

Generator can be used as a node module, or as a CLI tool. Both work with LL(1) grammars written in BNF.

#### Example of output

![grammar](http://dmitrysoshnikov.com/wp-content/uploads/2015/09/imageedit_10_9190665297.gif)

#### Grammar format

Grammar is presented in BNF (with some variations of EBNF). Raw literal strings should be quoted with double-quotes. Example:

```javascript
let grammar = `
  S -> F
     | "(" S "+" F ")"
  F -> "id"
`;
```

The lexical grammar can also be provided explicitly in case you need to use lexical variables (otherwise, it's automatically inferred from set of terminals). In this case grammar is presented as an object with `lex` and `bnf` properties accordingly:

```javascript
let grammar = {
  lex: `
    "("  : "("
    ")"  : ")"
    "+"  : "+"
    "*"  : "*"
    "id" : "id"
    [0-9]+("."[0-9]+)?  : NUMBER
  `,

  bnf: `
    E  -> T E'
    E' -> "+" T E'
        | ε
    T  -> F T'
    T' -> "*" F T'
        | ε
    F  -> "id"
        | NUMBER // Lex variable
        | "(" E ")"
  `
};
```

The `ε` ("empty" string, _epsilon_) value can either be specified explicitly, or presented as an empty string (omitted).

See some examples of the grammars [here](https://github.com/DmitrySoshnikov/ll1/blob/master/src/__tests__/test-data.js).

#### Usage as CLI

The CLI tool is the simplest form when we need quickly analyze some grammar. For example, this command will print parsing table for the grammar from `~/grammar.json` file:

```
./bin/ll1 --grammar examples/simple.ll1 --table
```

A string can be parsed and checked for acceptance via the `--parse` option:

```
./bin/ll1 --grammar examples/simple.ll1 --parse "(id + id)"
```

#### Usage as a module

The `ParserGenerator` class can be used for generating a parser object from an LL(1) grammar:

```javascript
import {ParserGenerator} from 'll1';

// Define a grammar
let grammar = `
  S -> F
  S -> "(" S "+" F ")"
  F -> "id"
`;

// Instance of the parser generator.
var pg = new ParserGenerator(grammar);

// Generate a parser object for this grammar.
let parser = pg.generate();

// Parse a string
parser.parse('(id + id)'); // Accepted
```

##### Parsing table

In addition, parser generator provides API for analyzing the parsing table:

```javascript
// Returns the parsing table.
pg.getTable();

// Outputs in convenient format the parsing table.
pg.printTable();
```

After the `pg.printTable()` we get the following output:

```javascript

Grammar:

  1.  S -> F
  2.  S -> "(" S "+" F ")"
  3.  F -> "id"

Parsing table:

+---+-----+-----+-----+------+---+
|   │ "(" │ "+" │ ")" │ "id" │ $ |
+---+-----+-----+-----+------+---+
| S │  2  │  -  │  -  │  1   │ - |
+---+-----+-----+-----+------+---+
| F │  -  │  -  │  -  │  3   │ - |
+---+-----+-----+-----+------+---+

```

##### Sets generator

The `SetsGenerator` module can be used for generating `First`, `Follow`, and `Predict` sets.

```javascript
import {SetsGenerator} from 'll1';

var sg = new SetsGenerator(grammar);

sg.printSet(sg.getFirstSet());
```

We get the following output for the first sets:

```javascript

First set:
+--------+-----------+
| Symbol │ First set |
+--------+-----------+
| S      │ "id", "(" |
+--------+-----------+
| F      │ "id"      |
+--------+-----------+
| "id"   │ "id"      |
+--------+-----------+
| "("    │ "("       |
+--------+-----------+

```

##### Grammar object

You can analyze grammar's parts, to get list of _terminals_ or _non-terminals_, etc:

```javascript
import {Grammar} from 'll1';

var g = new Grammar(grammar);

// Outputs list of non-terminals.
console.log(g.getNonTerminals()); // ['S', 'F']
```

