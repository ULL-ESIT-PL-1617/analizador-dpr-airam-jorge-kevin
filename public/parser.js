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
  return (m && m.index === i) ? m : null
};

/** Conjunto de palabras reservadas del lenguaje **/
RESERVED_WORD = {
    "CONST": "CONST",
    "FUNCTION": "FUNCTION",
    "IF": "IF",
    "LOOP": "LOOP",
    "ELSE": "ELSE",
    "EXIT": "EXIT",
    "RETURN": "RETURN"
};

/** Tokeniza la cadena **/
String.prototype.tokens = function() {
  var from, getTok, i, key, m, make, n, result, rw, tokens, value;
  from = void 0;
  i = 0;
  n = void 0;
  m = void 0;
  result = [];
  tokens = {
    WHITES:               /\s+/g,
    ID:                   /[a-zA-Z_]\w*/g,
    NUM:                  /\b\d+(\.\d*)?([eE][+-]?\d+)?\b/g,
    STRING:               /('(\\.|[^'])*'|"(\\.|[^"])*")/g,
    ONELINECOMMENT:       /\/\/.*/g,
    MULTIPLELINECOMMENT:  /\/[*](.|\n)*?[*]\//g,
    COMPARISONOPERATOR:   /[<>=!]=|[<>]/g,
    ONECHAROPERATORS:     /([=()&|;:,{}[\]])/g,
    ADDOP:                /[+-]/g,
    MULTOP:               /[*\/]/g
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

  if (!this) return;

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
      result.push(rw ? make(rw, getTok()) : make("ID", getTok()));
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
  var condition, expression, factor, lookahead, match, statement, arguments_, if_statement, statements, term, tokens, tree;
  tokens = input.tokens();
  lookahead = tokens.shift(); // Contiene información sobre el siguiente valor
  lookahead2 = (tokens.length > 0) ? tokens[0] : null; // Contiene información sobre el segundo siguiente valor

  /** Hace un match con el siguiente valor **/
  match = function(t) {
    if (lookahead && lookahead.type === t) {
      lookahead  = tokens.shift();
      lookahead2 = (tokens.length > 0 && lookahead) ? tokens[0] : null;
    } else {
      if (lookahead)
        throw "Syntax Error. Expected " + t + " found '" + lookahead.value + "' near '" + input.substr(lookahead.from) + "'";
      else
        throw "Syntax Error. Expected " + t + " found 'End of input'";
    }
  };

  /** Tabla con los valores constantes. NO las variables constantes **/
  var constant_table = {
      "true": 1,
      "false": 0
  }

  var inside_statement = 0; // Indica si estamos dentro de algún tipo de sentencia.
  var symbol_table    = {}; // Tabla de símbolos, contiene los símbolos de las variables globales
  var function_table  = {}; // Contiene los ids de las funciones con sus tablas de símbolos locales
  var scope_stack     = []; // Indica el scope en el que se encuentra el analizador. Permite diferenciar las variables locales a las funciones de las globales

  // sentences → ((assing ';') | function | statement)*
  // sentences devuelve un array con un conjunto de sentencias. stop_conditions contiene
  // en un array los valores hasta los que sentence puede avanzar.
  // Por ejemplo, stop_conditions = ["END", "ELSE"], provocará que se dejen de analizar sentencias
  // justo en el momento en el que se encuentre la palabra clave "END" o "ELSE"
  sentences = function(stop_conditions) {
    var results = []
    while (lookahead && (!stop_conditions || (stop_conditions.indexOf(lookahead.type) === -1))) {
      if (lookahead && lookahead.type === "FUNCTION") {
        inside_statement++;
        results.push(functions());
        inside_statement--;
      } else if (lookahead && (lookahead.type === "LOOP" || lookahead.type === "IF")) {
        inside_statement++;
        results.push(statements());
        inside_statement--;
      } else if (lookahead) {
        results.push(assing());
        match(";");
      }
    }
    return results;
  };

  // functions → FUNCTION ID '(' ID (',' ID)* ')' '{' sentences '}'
  functions = function() {
    var code, parameters, id;
    var function_symbols = {}; // Tabla de símbolos de la función
    match("FUNCTION");

    // Nombre de la función
    id = lookahead.value;
    match("ID");

    // No se puede declarar una función dentro de ningún tipo de sentencia
    if (inside_statement > 1)
      throw "Cant declare function '" + id + "' in this scope.";

    // Evita declarar una función que ya existe
    if (!!function_table[id])
      throw "Syntax error. Redeclaring function '" + id + "'";

    // Parámetros de la función
    match("(");
    while (lookahead && lookahead.type === "ID") {
      param_id = lookahead.value;
      // Evita declarar un parámetro que ya existe
      if (function_symbols[param_id] === "parameter")
      throw "Syntax error. Redeclaring parameter '" + param_id + "' in function '" + id + "'";

      function_symbols[param_id] = "parameter";
      match("ID");

      // Si hay otro parámetro, debe hacer un match con la coma
      if (lookahead2 && lookahead2.type === "ID")
        match(",");
    }
    match(")");
    function_table[id] = {
      "local_symbol_table": function_symbols
    }
    // Indica que ahora estamos en el scope de esta función
    scope_stack.push(id);
    match("{");
    code = sentences(["}"]);
    match("}");
    // Abandona el scope de la función
    scope_stack.pop();
    return {
      type: "FUNCTION",
      id: id,
      parameters: function_symbols,
      code: code
    }
  };

  // statements → if_statement | loop_statement
  // Permite más modularidad, para dividir cada statement en distintas funciones
  statements = function() {
    if (lookahead && lookahead.type === "IF")
      return if_statement();
    else if (lookahead && lookahead.type === "LOOP")
      return loop_statement();
  };

  // loop_statement → loop '(' comma ';' condition ';' comma ')' '{' sentences '}'
  loop_statement = function () {
    match("LOOP");
    match("(");
    loop_start = comma(); // Código que se ejecutará antes de empezar
    match(";");
    loop_condition = condition(); // Condición de ejecución del bucle
    match(";");
    loop_iteration = comma(); // Código que se ejecutará en cada iteración del bucle
    match(")");
    match("{");
    code = sentences(["}"]); // Código que ejecuta el bucle
    match("}");
    return {
      type: "LOOP",
      loop_start: loop_start,
      loop_condition: loop_condition,
      loop_iteration: loop_iteration,
      code: code
    }
  };

  // if_statement → IF condition THEN sentences (ELSE sentences)? END
  if_statement = function() {
    var result, if_condition, elseif_condition;
    var if_sentences = {};
    var elseif_sentences = [];
    var else_senteces = {};
    match("IF");
    if_condition = condition(); // Condición del IF
    match("{");
    if_sentences = sentences(["}"]); // Código del IF
    match("}");

    while (lookahead && lookahead2 && lookahead.type === "ELSE" && lookahead2.type === "IF") {
      match("ELSE");
      match("IF");
      elseif_condition = condition(); // Condición del ELSE IF
      match("{");
      elseif_sentences.push({ // Código del ELSE IF
        condition: elseif_condition,
        sentences: sentences(["}"])
      });
      match("}");
    }

    // En caso de que haya un ELSE
    if (lookahead && lookahead.type === "ELSE") {
      match("ELSE");
      match("{");
      else_senteces = sentences(["}"]); // Código del ELSE
      match("}");
    }

    return {
      type: "IF",
      if_condition:     if_condition,
      if_sentences:     if_sentences,
      elseif_sentences: elseif_sentences,
      else_sentece:     else_senteces
    }
  };

  // comma → assing (',' assing)*
  comma = function() {
    var results = [];
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

  // assing → CONST? ID '=' assing | condition
  assing = function() {
    var result, id;
    var type = "volatile"; // Indica si el ID de la asignación es constante o volatil o de otro tipo

    if (lookahead && lookahead.type === "CONST") {
      match("CONST");
      type = "const";
    }

    if (lookahead && lookahead2 && lookahead.type === "ID" && lookahead2.type === '=') {
      id = lookahead.value;

      // Si estamos dentro del scope de una función y la variable existe como parámetro, no se puede asignar como const, error
      if (type === "const" && symbolTableForScope()[id] === "parameter")
        throw "Syntax error. Cant make existing id '" + id + "' " + " constant, parameters are always volatile";

      // Si la variable era un parámetro del scope actual, sigue tratándola como parámetro
      if (symbolTableForScope()[id] === "parameter")
        type = "parameter";

      // No se puede cambiar el valor a una variable const
      if (symbolTableForScope()[id] === "const")
        throw "Syntax error. Cant modify constant id '" + id + "'";

      // Si la variable es declarada CONST y ya existe en la tabla de simbolos como volatil, error
      if (type === "const" && symbolTableForScope()[id] === "volatile")
        throw "Syntax error. Cant make existing id '" + id + "' constant";

      // Si el ID no es una constante definida, se puede asignar
      if (constant_table[id] === undefined) {
        match("ID");
        match("=");
        right = assing();
        result = {
          type: "=",
          left: id,
          right: right
        }
        symbolTableForScope()[id] = type;
      } else {
        throw "Syntax error. Cant assing value to ID '" + id + "'";
      }
    } else if (lookahead && (type !== "const")) {
      result  = condition();
    }

    return result;
  };

  // condition → expression (COMPARISON expression)?
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

  // expression → term (ADDOP term)*
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

  /** Cuenta el número de parámetros de la función a partir de la tabla completa de símbolos local de una función **/
  countParameters = function(local_symbol_table) {
    var count = 0;
    for (var i in local_symbol_table) {
      if (local_symbol_table[i] === "parameter")
        count++;
    }
    return count;
  };

  // term → factor (MULOP factor)*
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

  // factor → arguments | NUM | ID | ID arguments | ID '(' ')'
  // Los dos últimos elementos diferencian una función con argumentos y sin argumentos
  factor = function() {
    var result;
    result = null;

    // Match con un número
    if (lookahead.type === "NUM") {
      result = {
        type: "NUM",
        value: lookahead.value
      };
      match("NUM");
    } else if (lookahead.type === "ID") {

      // Es el ID de una función
      if (lookahead2 && lookahead2.type === '(') {
        id = lookahead.value;

        // Evita que se llame a una función que no existe
        if (!function_table[id])
        throw "Syntax Error. Unkown function '" + id + "'";

        match("ID");

        // Diferencia entre una función sin y con argumentos
        if (lookahead2 && lookahead2.value === ")") {
          match("(");
          parameters = { values: []};
          match(")");
        } else
          parameters = arguments_();

        // Evita que una llamada a una función se produzca con un número erróneo de argumentos
        size1 = parameters.values.length;
        size2 = countParameters(function_table[id]["local_symbol_table"]);
        if (size1 != size2)
        throw "Syntax Error. Invalid number of arguments for function '" + id + "'. Expected " + size2 + " got " + size1;

        result = {
          type: "CALL",
          id: id,
          arguments: parameters
        };
      }
      // No es el ID de una función sino de una variable
      else {
        var key = lookahead.value;

        // Si no existe en la tabla de símbolos ni en la tabla de constantes, error
        if (!symbolTableForScope()[key] && (constant_table[key] === undefined))
          throw "Syntax Error. Unkown identifier '" + key + "'";

        // Si es una palabra reservada, error
        if (key.toUpperCase() in RESERVED_WORD)
          throw "Syntax Error. '" + key + "' is a reserved word";

        result = {
          type: "ID",
          value: lookahead.value
        };
        match("ID");
      }
    } else if (lookahead.type === "(") {
      // Para expresiones del tipo a = (1, 2, 3 * 3)
      result = arguments_();
    } else if (lookahead.type === "EXIT") {
      match("EXIT");
      result = { type: "EXIT" }
    } else if (lookahead.type === "RETURN") {
      if (scope_stack == 0)
        throw "Syntax Error. There is no function to return from.";
      match("RETURN");
      result = {
        type: "RETURN",
        value: (lookahead.type != ";") ? assing() : "null"
      }
    } else {
      throw "Syntax Error. Expected number or identifier or '(' but found " + (lookahead ? lookahead.value : "end of input") + " near '" + input.substr(lookahead.from) + "'";
    }
    return result;
  };

  // arguments → '(' comma ')'
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

  // Devuelve la tabla de símbolos para el scope actual
  symbolTableForScope = function() {
      if (scope_stack.length < 1)
        return symbol_table;
      else {
          last = scope_stack.length - 1;
          return function_table[scope_stack[last]].local_symbol_table;
      }
  }

  tree = sentences();

  if (lookahead != null) {
    throw "Syntax Error parsing statements. " + "Expected 'end of input' and found '" + input.substr(lookahead.from) + "'";
  }
  return {
    result: tree,
    symbolTable: symbol_table,
    functionTable: function_table,
    constantTable: constant_table
  };
};
