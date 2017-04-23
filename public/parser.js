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

RESERVED_WORD = {
    "CONST": "CONST",
    "FUNCTION": "FUNCTION",
    "IF": "IF",
    "LOOP": "LOOP",
    "THEN": "THEN",
    "END": "END",
    "ELSE": "ELSE"
};

String.prototype.tokens = function() {
  var from, getTok, i, key, m, make, n, result, rw, tokens, value;
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

var constant_table = {
    "true": 1,
    "false": 0
}

var symbol_table = {}

var parse = function(input) {
  var condition, expression, factor, lookahead, match, statement, arguments_, if_statement, statements, term, tokens, tree;
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

  sentences = function(stop_conditions){
    var results = []
    while (lookahead && (!stop_conditions || (stop_conditions.indexOf(lookahead.type) == -1))) {
      if(lookahead && lookahead.type == "FUNCTION"){
        results.push(functions());
      } else if (lookahead && (lookahead.type in RESERVED_WORD)) {
        results.push(statements());
      } else if (lookahead){
        results.push(assing());
        match(";");
      }
    }
    return results;
  };

  functions = function(){
    var results = []
    var sentence
    match("FUNCTION");
    if(lookahead && lookahead.type === "ID" && !(lookahead.value in symbol_table)){
      symbol_table[lookahead.value] = "FUNCTION";
      match("ID");
      results.push(arguments_());
      match("{");
      sentence = sentences(["}"]);
      results.push(sentence);
      match("}");
      match(";");
    }
    return results;
  };

  statements = function() {
    if (lookahead && lookahead.type == "IF")
      return if_statement();
    else if (lookahead && lookahead.type == "LOOP")
      return loop_statement();
  }

  loop_statement = function () {
      match("LOOP");
      match("(");
      repeat = assing();
      match(";");
      loop_condition = condition();
      match(")");
      match("THEN");
      code = sentences(["END"]);
      match("END");
      return {
          type: "LOOP",
          repeat: repeat,
          loop_condition: loop_condition,
          code: code
      }
  }

  comma = function() {
    var results = []
    results.push(assing());
    while (lookahead && lookahead.type === ",") {
      match(",");
      results.push(assing());
    }

    return {
        type: "COMMA",
        values: results
    };
  };

  assing = function() {
      var result, id;
      var is_const = false;

      if (lookahead && lookahead.type == "CONST") {
          match("CONST");
          is_const = true;
      }

      if (lookahead && lookahead2 && lookahead.type == "ID" && lookahead2.type == '=') {
          id = lookahead.value;

          // Si la variable es constante y ya existe en la tabla de simbolos y es volatil, error
          if (!is_const && symbol_table[id] == "const")
             throw "Syntax error. Cant make existing id '" + id + "' volatile";

          // Si la variable es volatil y ya existe en la tabla de simbolos y es constante, error
          if (is_const && symbol_table[id] == "volatile")
             throw "Syntax error. Cant make existing id '" + id + "' constant";

          if (!constant_table[id]) { // Si el ID no es una constante definida, se puede asignar
              match("ID");
              match("=");
              right = assing();
              result = {
                  type: "=",
                  left: id,
                  right: right
              }
              symbol_table[id] = is_const ? "const" : "volatile";
          } else {
              throw "Syntax error. Cant assing value to ID '" + id + "'";
          }
      } else if (lookahead && !is_const) {
          result  = condition();
      }

      return result;
  };

  if_statement = function() {
      console.log("G")
    var result, if_condition, if_sentence, else_sentece;
    if(lookahead && lookahead.type === "IF") {
      match("IF");
      if_condition = condition();
      match("THEN");
      if_sentence = sentences(["ELSE", "END"]);
      console.log("A");
      if(lookahead && lookahead.type === "ELSE") {
      console.log("B");
        match("ELSE");
        else_sentece = sentences(["END"]);
        console.log("C");
        match("END");
        console.log("D");
        return {
          type: "IF",
          if_condition: if_condition,
          if_sentence: if_sentence,
          else_sentece: else_sentece
        }
      }
      match("END");
      console.log("E");
      return {
        type: "IF",
        if_condition: if_condition,
        if_sentence: if_sentence
      }
    }
  };

  condition = function() {
    var result, right, type;

    result = expression();

    if (lookahead && lookahead.type === "COMPARISON") {
      type = lookahead.value;
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

    if (lookahead && lookahead2 && lookahead.type === "ID" && lookahead2.type === '(') {
        id = lookahead.value;
        //if (symbol_table[id] != "function")
        //  throw "Syntax Error. Unkown function '" + id + "'";
        match("ID");
        parameters = arguments_();
        result = {
              type: "CALL",
              id: id,
              arguments: parameters
        };
    } else {
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
    } else if (lookahead.type === "ID") {
        var key = lookahead.value;
        // Si no existe en la tabla de símbolos ni en la tabla de constantes, error
        if (!symbol_table[key] && !constant_table[key])
          throw "Syntax Error. Unkown identifier '" + key + "'";

        if (key.toUpperCase() in RESERVED_WORD)
          throw "Syntax Error. '" + key + "' is a reserved word";

        result = {
          type: "ID",
          value: lookahead.value
        };
        match("ID");
    } else if (lookahead.type === "(") {
      result = arguments_();
    } else {
      throw "Syntax Error. Expected number or identifier or '(' but found " + (lookahead ? lookahead.value : "end of input") + " near '" + input.substr(lookahead.from) + "'";
    }
    return result;
  };
  arguments_ = function() {
    var result;
    result = null;
    if (lookahead.type === "(") {
      match("(");
      result = comma();
      match(")");
    }
    return(result);
  };

  tree = sentences();

  if (lookahead != null) {
    throw "Syntax Error parsing statements. " + "Expected 'end of input' and found '" + input.substr(lookahead.from) + "'";
  }
  return {result: tree, symbolTable: symbol_table, constantTable: constant_table};
};
