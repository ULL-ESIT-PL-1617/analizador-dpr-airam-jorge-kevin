(function() {
  var assert;

  assert = chai.assert;

  suite('parser', function() {
    setup(function() {
    });
    test('Multiplications are parsed correctly', () => {
      var result = parse('3 * 4;');
      console.log(result);
      assert.deepEqual(result, {
          "result": [
            {
              "type": "*",
              "left": {
                "type": "NUM",
                "value": 3
              },
              "right": {
                "type": "NUM",
                "value": 4
              }
            }
          ],
          "symbolTable": {},
          "functionTable": {},
          "constantTable": {
            "true": 1,
            "false": 0
          }
        });
    });
    test('Bad expressions throw exceptions', () => {
      assert.throws(() => parse('3 + (4+2))'), /Syntax\s+Error/i);
    });
    test('Divisions are parsed correctly', () => {
      var result = parse('10 / 2;');
      console.log(result);
      assert.deepEqual(result, {
          "result": [
            {
              "type": "/",
              "left": {
                "type": "NUM",
                "value": 10
              },
              "right": {
                "type": "NUM",
                "value": 2
              }
            }
          ],
          "symbolTable": {},
          "functionTable": {},
          "constantTable": {
            "true": 1,
            "false": 0
          }
        });
    });
    test('Functions are parsed correctly', () => {
      var result = parse('FUNCTION test (x){ x = 3; }');
      console.log(result);
      assert.deepEqual(result, {
          "result": [
            {
              "type": "FUNCTION",
              "id": "test",
              "parameters": {
                "x": "volatile"
              },
              "code": [
                {
                  "type": "=",
                  "left": "x",
                  "right": {
                    "type": "NUM",
                    "value": 3
                  }
                }
              ]
            }
          ],
          "symbolTable": {},
          "functionTable": {
            "test": {
              "local_symbol_table": {
                "x": "volatile"
              }
            }
          },
          "constantTable": {
            "true": 1,
            "false": 0
          }
        });
    });
    test('Condition are parsed correctly', () => {
      var result = parse('x = 2; IF x == 5 THEN x = 0; ELSE x = 1; END');
      console.log(result);
      assert.deepEqual(result, {
          "result": [
            {
              "type": "=",
              "left": "x",
              "right": {
                "type": "NUM",
                "value": 2
              }
            },
            {
              "type": "IF",
              "if_condition": {
                "type": "==",
                "left": {
                  "type": "ID",
                  "value": "x"
                },
                "right": {
                  "type": "NUM",
                  "value": 5
                }
              },
              "if_sentence": [
                {
                  "type": "=",
                  "left": "x",
                  "right": {
                    "type": "NUM",
                    "value": 0
                  }
                }
              ],
              "else_sentece": [
                {
                  "type": "=",
                  "left": "x",
                  "right": {
                    "type": "NUM",
                    "value": 1
                  }
                }
              ]
            }
          ],
          "symbolTable": {
            "x": "volatile"
          },
          "functionTable": {},
          "constantTable": {
            "true": 1,
            "false": 0
          }
        });
    });
    test('Loops are parsed correctly', () => {
      var result = parse('x = 0; y = 0; LOOP (x = x + 1; x < 4) THEN y = y + 1; END');
      console.log(result);
      assert.deepEqual(result, {
          "result": [
            {
              "type": "=",
              "left": "x",
              "right": {
                "type": "NUM",
                "value": 0
              }
            },
            {
              "type": "=",
              "left": "y",
              "right": {
                "type": "NUM",
                "value": 0
              }
            },
            {
              "type": "LOOP",
              "repeat": {
                "type": "=",
                "left": "x",
                "right": {
                  "type": "+",
                  "left": {
                    "type": "ID",
                    "value": "x"
                  },
                  "right": {
                    "type": "NUM",
                    "value": 1
                  }
                }
              },
              "loop_condition": {
                "type": "<",
                "left": {
                  "type": "ID",
                  "value": "x"
                },
                "right": {
                  "type": "NUM",
                  "value": 4
                }
              },
              "code": [
                {
                  "type": "=",
                  "left": "y",
                  "right": {
                    "type": "+",
                    "left": {
                      "type": "ID",
                      "value": "y"
                    },
                    "right": {
                      "type": "NUM",
                      "value": 1
                    }
                  }
                }
              ]
            }
          ],
          "symbolTable": {
            "x": "volatile",
            "y": "volatile"
          },
          "functionTable": {},
          "constantTable": {
            "true": 1,
            "false": 0
          }
        });
    });
    test('The assignments are parsed correctly', () => {
      var result = parse('FUNCTION foo(x){} CONST y = 5; x = 3 * 2; z = foo(3 * 4); h = 1 > 2;');
      console.log(result);
      assert.deepEqual(result, {
          "result": [
            {
              "type": "FUNCTION",
              "id": "foo",
              "parameters": {
                "x": "volatile"
              },
              "code": []
            },
            {
              "type": "=",
              "left": "y",
              "right": {
                "type": "NUM",
                "value": 5
              }
            },
            {
              "type": "=",
              "left": "x",
              "right": {
                "type": "*",
                "left": {
                  "type": "NUM",
                  "value": 3
                },
                "right": {
                  "type": "NUM",
                  "value": 2
                }
              }
            },
            {
              "type": "=",
              "left": "z",
              "right": {
                "type": "CALL",
                "id": "foo",
                "arguments": {
                  "type": "COMMA",
                  "values": [
                    {
                      "type": "*",
                      "left": {
                        "type": "NUM",
                        "value": 3
                      },
                      "right": {
                        "type": "NUM",
                        "value": 4
                      }
                    }
                  ]
                }
              }
            },
            {
              "type": "=",
              "left": "h",
              "right": {
                "type": ">",
                "left": {
                  "type": "NUM",
                  "value": 1
                },
                "right": {
                  "type": "NUM",
                  "value": 2
                }
              }
            }
          ],
          "symbolTable": {
            "y": "const",
            "x": "volatile",
            "z": "volatile",
            "h": "volatile"
          },
          "functionTable": {
            "foo": {
              "local_symbol_table": {
                "x": "volatile"
              }
            }
          },
          "constantTable": {
            "true": 1,
            "false": 0
          }
        });
    });
    test('The conditions are parsed correctly', () => {
      var result = parse('false; i = 2; i < 5;');
      console.log(result);
      assert.deepEqual(result, {
          "result": [
            {
              "type": "ID",
              "value": "false"
            },
            {
              "type": "=",
              "left": "i",
              "right": {
                "type": "NUM",
                "value": 2
              }
            },
            {
              "type": "<",
              "left": {
                "type": "ID",
                "value": "i"
              },
              "right": {
                "type": "NUM",
                "value": 5
              }
            }
          ],
          "symbolTable": {
            "i": "volatile"
          },
          "functionTable": {},
          "constantTable": {
            "true": 1,
            "false": 0
          }
        });
    });
    test('The expressions are parsed correctly', () => {
      var result = parse('5 + 7; 9 - 7; 7;');
      console.log(result);
      assert.deepEqual(result, {
          "result": [
            {
              "type": "+",
              "left": {
                "type": "NUM",
                "value": 5
              },
              "right": {
                "type": "NUM",
                "value": 7
              }
            },
            {
              "type": "-",
              "left": {
                "type": "NUM",
                "value": 9
              },
              "right": {
                "type": "NUM",
                "value": 7
              }
            },
            {
              "type": "NUM",
              "value": 7
            }
          ],
          "symbolTable": {},
          "functionTable": {},
          "constantTable": {
            "true": 1,
            "false": 0
          }
        });
    });
    // test('Function calls are parsed correctly', () => {
    //   var result = parse(''/*AQUÍ la sentencia*/);
    //   console.log(result);
    //   assert.deepEqual(result, /*AQUÍ la solución*/);

  });
}).call(this);
