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
<td> <a href="">Heroku</a></td>
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

### Recursos

* [Apuntes: Programación Orientada a Objetos](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/oop/)
* [Apuntes: Pruebas. Mocha](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/mocha.html)
* [Apuntes: Pruebas. Should](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/mocha.html#shouldl)
* [Apuntes: Integración Contínua. Travis](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/travis.html)
* [node-sass-middleware](https://github.com/sass/node-sass-middleware/blob/master/README.md)
