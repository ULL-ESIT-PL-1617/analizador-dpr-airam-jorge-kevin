(function() {
  var assert;

  assert = chai.assert;

  suite('parser', function() {
    setup(function() {
    });
    test('Multiplications are parsed correctly', () => {
      var result = parse('4;');
      console.log(result);
      assert.deepEqual(result, {
        "result": [
          {
            "type": "NUM",
            "value": 4
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
  });
}).call(this);
