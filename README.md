# Solución a la Práctica Evaluar Analizador Descendente Predictivo Recursivo

* [Campus PL1617: Práctica: Evaluar Analizador Descendente Predictivo Recursivo](https://campusvirtual.ull.es/1617/mod/assign/view.php?id=195888)
* [Descripción de la Práctica: Analizador Descendente Predictivo Recursivo](http://crguezl.github.io/pl-html/node26.html)
* [Analizadores Descendentes Recursivos](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/parsing/recursivodescendente/)

## Definición de la Práctica

### Forma de trabajo

* Use su portátil o su cuenta en c9 para llevar a cabo los objetivos planteados.
* Esta práctica se divide en objetivos o hitos:  indique al profesor  cuando ha terminado y suba los enlaces a los repos y despliegues.

### Descripción del Código de la Práctica

1. [Eloquent JS: The Secret Life of Objects. Lying Out a Table](http://eloquentjavascript.net/06_object.html##h_36C2FHHi44)
2. [Repo original de esta práctica](https://github.com/ULL-ESIT-DSI-1617/oop-eloquentjs-example)

### Descripción del Lenguaje

1.  Σ = { ADDOP, MULOP, '(', ')', NUM, ',', ID, '=' },
2.  V = {  comma, expression, term, factor }
3.  Productions:
    1.  sentences       → ((assing ';') | function | statement)*
    2.  function        → FUNCTION ID '(' ID (',' ID)* ')' '{' sentences '}'
    3.  statements      → if_statement | loop_statement

    4. if_statement     → if condition then sentences (else sentences)? end
    5. loop_statement   → loop '(' assing ';' condition ')' then sentences end

    6.  comma           → assing (',' assing)*
    7.  assing          → const? ID '=' assing | condition
    8.  condition       → expression (COMPARISON expression)?
    9.  expression      → term ( ADDOP term)* | ID arguments
    10. term            → factor (MULOP factor)*
    11. factor          → arguments | NUM | ID
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
