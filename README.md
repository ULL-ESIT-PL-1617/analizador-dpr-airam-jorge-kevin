# Creación de un Lenguaje

#### Autores

<table>
<tr>
<td> Airam Manuel Navas Simón </td>
<td> <a href="https://github.com/AiramNavas">GitHub</a> </td>
<td> <a href="https://airamnavas.github.io/">Página personal</a> </td>
<td> <a href="https://analizadordpr-airamnavas.herokuapp.com/">Heroku</a> </td>
</tr>
<tr>
<td> Kevin Días Marrero </td>
<td> <a href="https://github.com/alu0100880625">GitHub</a> </td>
<td> <a href="https://alu0100880625.github.io/">Página personal</a></td>
<td> <a href="https://analizador-dpr-alu0100896282.herokuapp.com/">Heroku</a></td>
</tr>
<tr>
<td> Jorge Sierra Acosta </td>
<td> <a href="https://github.com/Ediolot">GitHub</a> </td>
<td> <a href="https://ediolot.github.io/">Página personal</a> </td>
<td> <a href="https://analizador-dpr-alu0100896282.herokuapp.com/">Heroku</a> </td>
</tr>
</table>

### Descripción del Lenguaje

    1.  Σ = { ADDOP, MULOP, NUM, ID, COMPARISON, CONST, LOOP, THEN, IF, ELSE, END,
              FUNCTION, '(', ')', '{', '}', ';', ',', '=' }

    2.  V = {  sentences, functions, statements, if_statement, loop_statement, comma,
               expression, assing, condition, expression, term, factor, arguments }

    3.  Productions:
        1.  sentences       → ((assing ';') | function | statement)*
        2.  functions       → FUNCTION ID '(' ID? (',' ID)* ')' '{' sentences '}'
        3.  statements      → if_statement | loop_statement

        4. if_statement     → IF condition THEN sentences (ELSE sentences)? END
        5. loop_statement   → LOOP '(' assing ';' condition ')' THEN sentences END

        6.  comma           → assing (',' assing)*
        7.  assing          → CONST? ID '=' assing | condition
        8.  condition       → expression (COMPARISON expression)?
        9.  expression      → term (ADDOP term)*
        10. term            → factor (MULOP factor)*
        11. factor          → arguments | NUM | ID | ID arguments | ID '(' ')'
        12. arguments       → '(' comma ')'

### Descripción de uso del Lenguaje

1. Las sentencias pueden ser asignaciones, funciones o declaraciones.
2. Las funciones se declaran de la siguiente forma. Pueden ser declaradas en cualquier momento y accedidas globalmente:

       FUNCTION ID (ID, ID, ...) {
         sentencias ...
       }

   Por ejemplo:

        FUNCTION test (x){
         x = 3;
        }

4. Condicionales:

        IF condicion THEN
        sentencias . . .
        [ELSE
        sentencias . . .]
        END

5. Bucles:

        LOOP (#1 ; #2) THEN
         ...
        END
        #1 => Sentencia que se ejecuta cada vez que se itera sobre el bucle.
        #2 => Condición que se debe cumplir para que continue el bucle.

   Por ejemplo:

        i = 0
        LOOP ( i = i + 1; i < 3) THEN
         ...
        END

7. La asignación puede se puede realizar a cualquier tipo de expresión
   Dichas asignaciones se declaran de la siguiente forma:

        CONST y = 5;
        x = 3 * 2;
        z = foo( 3 * 4);
        h = 1 > 2;

8. Las condiciones toman valor true o false.
   Por ejemplo:

        true
        i < 5

9. Las expresiones son términos que representan operaciones básicas.
   Por ejemplo:

        5 + 7
        9 - 7
        7

   Ó también pueden ser llamdas a funciones.
   Por ejemplo:

        funcionTest(5);
        funcionTest();
        4 * funcionTest(7 * 2);

### Árbol sintáctico

El árbol sintáctico generado contendrá los siguientes atributos.
 - result: Contiene el código
 - symbolTable: Contiene información sobre los símbolos globales de variables del programa.
 - functionTable: Contiene información sobre los símbolos que representan funciones y su propia tabla de símbolos locales.
 - constantTable: Contiene información sobre las constantes y sus valores (true & false).
Algunos ejemplos del árbol sintáctico generado:

1. Código simple con tres instrucciones:

        x = 1;
        y = 2;
        z = (x + 4) * y;

    Árbol resultado:

        {
          "result": [
            { // Primera asignación
              "type": "=",
              "left": "x",
              "right": {
                "type": "NUM",
                "value": 1
              }
            },
            { // Segunda asignación
              "type": "=",
              "left": "y",
              "right": {
                "type": "NUM",
                "value": 2
              }
            },
            { // Tercera asignación
              "type": "=",
              "left": "z",
              "right": { // La parte derecha de la asignación contiene una expresión.
                "type": "*",
                "left": { // Paréntesis izquierdo de la multiplicación
                  "type": "COMMA",
                  "values": [
                    { // El paréntesis contiene una suma de un ID y un valor
                      "type": "+",
                      "left": {
                        "type": "ID",
                        "value": "x"
                      },
                      "right": {
                        "type": "NUM",
                        "value": 4
                      }
                    }
                  ]
                },
                "right": { // ID a la derecha de la multiplicación
                  "type": "ID",
                  "value": "y"
                }
              }
            }
          ],
          "symbolTable": { // Tabla de símbolos globales. Ninguno es constante
            "x": "volatile",
            "y": "volatile",
            "z": "volatile"
          },
          "functionTable": {},
          "constantTable": {
            "true": 1,
            "false": 0
          }
        }

2. Utilizando una función

        FUNCTION add(x, y) {
            z = x + y;
        }

        add(1, 3);

    Árbol resultado:

        {
          "result": [
            { // Declaración de la función
              "type": "FUNCTION",
              "id": "add",
              "parameters": { // Variables locales a la función
                "x": "parameter",
                "y": "parameter",
                "z": "volatile"
              },
              "code": [ // Código de la función
                {
                  "type": "=",
                  "left": "z",
                  "right": {
                    "type": "+",
                    "left": {
                      "type": "ID",
                      "value": "x"
                    },
                    "right": {
                      "type": "ID",
                      "value": "y"
                    }
                  }
                }
              ]
            },
            { // Llamada a la función
              "type": "CALL",
              "id": "add",
              "arguments": {
                "type": "COMMA",
                "values": [ // Argumentos de la función
                  {
                    "type": "NUM",
                    "value": 1
                  },
                  {
                    "type": "NUM",
                    "value": 3
                  }
                ]
              }
            }
          ],
          "symbolTable": {},
          "functionTable": {
            "add": {
              "local_symbol_table": {
                "x": "parameter",
                "y": "parameter",
                "z": "volatile"
              }
            }
          },
          "constantTable": {
            "true": 1,
            "false": 0
          }
        }

3. Utilizando una sentencia IF

        IF 2 > 3 THEN
            c = 4;
        ELSE
            c = 5;
        END

    Árbol resultado:

        {
          "result": [
            {
              "type": "IF",
              "if_condition": { // Condición del IF
                "type": ">",
                "left": {
                  "type": "NUM",
                  "value": 2
                },
                "right": {
                  "type": "NUM",
                  "value": 3
                }
              },
              "if_sentence": [ // Código si la condición se cumple
                {
                  "type": "=",
                  "left": "c",
                  "right": {
                    "type": "NUM",
                    "value": 4
                  }
                }
              ],
              "else_sentece": [ // Código si la condición no se cumple
                {
                  "type": "=",
                  "left": "c",
                  "right": {
                    "type": "NUM",
                    "value": 5
                  }
                }
              ]
            }
          ],
          "symbolTable": {
            "c": "volatile"
          },
          "functionTable": {},
          "constantTable": {
            "true": 1,
            "false": 0
          }
        }

### Recursos

* [Apuntes: Programación Orientada a Objetos](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/oop/)
* [Apuntes: Pruebas. Mocha](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/mocha.html)
* [Apuntes: Pruebas. Should](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/mocha.html#shouldl)
* [Apuntes: Integración Contínua. Travis](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/travis.html)
* [node-sass-middleware](https://github.com/sass/node-sass-middleware/blob/master/README.md)
