Object.constructor.prototype.error = function(message, t) {
  t = t || this;
  t.name = "SyntaxError";
  t.message = message;
  throw treturn;
};

RegExp.prototype.bexec = function(str) {
  var i, m;
  i = this.lastIndex;
  m = this.exec(str);
  if (m && m.index === i) {
    return m;
  }
  return null;
};

String.prototype.tokens = function() {
  var RESERVED_WORD, from, getTok, i, key, m, make, n, result, rw, tokens, value;
  from = void 0;
  i = 0;
  n = void 0;
  m = void 0;
  result = [];
  tokens = {
    WHITES: /\s+/g,
    ID: /[a-zA-Z_]\w*/g,
    NUM: /\b\d+(\.\d*)?([eE][+-]?\d+)?\b/g,
    STRING: /('(\\.|[^'])*'|"(\\.|[^"])*")/g,
    ONELINECOMMENT: /\/\/.*/g,
    MULTIPLELINECOMMENT: /\/[*](.|\n)*?[*]\//g,
    COMPARISONOPERATOR: /[<>=!]=|[<>]/g,
    ONECHAROPERATORS: /([=()&|;:,{}[\]])/g,
    ADDOP: /[+-]/g,
    MULTOP: /[*\/]/g
  };
  RESERVED_WORD = {
    p: "P",
    "if": "IF",
    then: "THEN"
  };
  make = function(type, value) {
    return {
      type: type,
      value: value,
      from: from,
      to: i
    };
  };
  getTok = function() {
    var str;
    str = m[0];
    i += str.length;
    return str;
  };
  if (!this) {
    return;
  }
  while (i < this.length) {
    for (key in tokens) {
      value = tokens[key];
      value.lastIndex = i;
    }
    from = i;
    if (m = tokens.WHITES.bexec(this) || (m = tokens.ONELINECOMMENT.bexec(this)) || (m = tokens.MULTIPLELINECOMMENT.bexec(this))) {
      getTok();
    } else if (m = tokens.ID.bexec(this)) {
      rw = RESERVED_WORD[m[0]];
      if (rw) {
        result.push(make(rw, getTok()));
      } else {
        result.push(make("ID", getTok()));
      }
    } else if (m = tokens.NUM.bexec(this)) {
      n = +getTok();
      if (isFinite(n)) {
        result.push(make("NUM", n));
      } else {
        make("NUM", m[0]).error("Bad number");
      }
    } else if (m = tokens.STRING.bexec(this)) {
      result.push(make("STRING", getTok().replace(/^["']|["']$/g, "")));
    } else if (m = tokens.COMPARISONOPERATOR.bexec(this)) {
      result.push(make("COMPARISON", getTok()));
    } else if (m = tokens.ADDOP.bexec(this)) {
      result.push(make("ADDOP", getTok()));
    } else if (m = tokens.MULTOP.bexec(this)) {
      result.push(make("MULTOP", getTok()));
    } else if (m = tokens.ONECHAROPERATORS.bexec(this)) {
      result.push(make(m[0], getTok()));
    } else {
      throw "Syntax error near '" + (this.substr(i)) + "'";
    }
  }
  return result;
};

var parse = function(input) {
  var condition, expression, factor, lookahead, match, statement, statements, term, tokens, tree;
  var results = [];
  tokens = input.tokens();
  lookahead = tokens.shift();
  lookahead2 = (tokens.length > 0) ? tokens[0] : null;
  match = function(t) {
    if (lookahead.type === t) {
      lookahead = tokens.shift();
      lookahead2 = (tokens.length > 0) ? tokens[0] : null;
      if (typeof lookahead === "undefined") {
        lookahead = lookahead2 = null;
      }
    } else {
      throw ("Syntax Error. Expected " + t + " found '") + lookahead.value + "' near '" + input.substr(lookahead.from) + "'";
    }
  };

  comma = function() {
    var result = assing();
    results.push(result);
    while(lookahead && lookahead.type === ","){
      match(",");
      result = assing();
      results.push(result);
    }
    return result;
  };

  var constant_table = {
      "true": 1,
      "false": 0
  }
  var symbol_table = {}
  assing = function() {
      var result, id;

      if (lookahead && lookahead2 && lookahead.type == "ID" && lookahead2.type == '=') {
          id = lookahead.value;
          if (!constant_table[id]) { // Si el ID no es una constante, se puede asignar
              match("ID");
              match("=");
              result = symbol_table[id] = assing();
          } else {
              throw "Syntax error. Cant assing value to ID '" + id + "'";
          }
      } else if (lookahead) {
          result  = condition();
      }

      return result;
  };
  condition = function() {
    var result, right, type;

    result = expression();

    if (lookahead && lookahead.type === "COMPARISON") {
      type = lookahead.value; <
      match("COMPARISON");
      right = expression();
      result = {
            type: type,
            left: result,
            right: right
      };
    }

    return result;
  }
  expression = function() {
    var result, right, type;
    result = term();

    while (lookahead && lookahead.type === "ADDOP") {
      type = lookahead.value;
      match("ADDOP");
      right = term();
      result = {
            type: type,
            left: result,
            right: right
      };
    }

    return result;
  };

  term = function() {
    var result, right, type;
    result = factor();
    while (lookahead && lookahead.type === "MULTOP") {
      type = lookahead.value;
      match("MULTOP");
      right = term();
      result = {
            type: type,
            left: result,
            right: right
      };
    }
    return result;
  };
  factor = function() {
    var result;
    result = null;
    if (lookahead.type === "NUM") {
      result = {
        type: "NUM",
        value: lookahead.value
      };
      match("NUM");
    } else if (lookahead.type === "(") {
      match("(");
      result = comma();
      match(")");
    } else if (lookahead.type === "ID") {
        var key = lookahead.value;
        // Si no existe en la tabla de símbolos ni en la tabla de constantes, error
        if (!symbol_table[key] && !constant_table[key])
          throw "Syntax Error. Unkown identifier '" + key + "'";
        result = {
          type: "ID",
          value: lookahead.value
        };
        match("ID");
    } else {
      throw "Syntax Error. Expected number or identifier or '(' but found " + (lookahead ? lookahead.value : "end of input") + " near '" + input.substr(lookahead.from) + "'";
    }
    return result;
  };

  tree = comma(input);

  if (lookahead != null) {
    throw "Syntax Error parsing statements. " + "Expected 'end of input' and found '" + input.substr(lookahead.from) + "'";
  }
  return {result: tree, results: results, symbolTable: symbol_table, constantTable: constant_table};
};
