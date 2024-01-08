import assert       from 'assert';

import laws         from 'fantasy-laws';
import jsc          from 'jsverify';
import Identity     from 'sanctuary-identity';
import show         from 'sanctuary-show';
import Z            from 'sanctuary-type-classes';
import type         from 'sanctuary-type-identifiers';
import Useless      from 'sanctuary-useless';

import Constant     from '../index.js';


//    ConstantArb :: Monoid m => TypeRep m -> Arbitrary a -> Arbitrary (Constant a b)
const ConstantArb = M => arb => arb.smap (Constant (M), c => c.value, show);

//    IdentityArb :: Arbitrary a -> Arbitrary (Identity a)
const IdentityArb = arb => arb.smap (Identity, Z.extract, show);

//    NonEmpty :: Arbitrary a -> Arbitrary (NonEmpty a)
const NonEmpty = arb => jsc.suchthat (arb, x => not (empty (x)));

//    NumberArb :: Arbitrary Number
const NumberArb = jsc.oneof (
  jsc.constant (NaN),
  jsc.constant (-Infinity),
  jsc.constant (Number.MIN_SAFE_INTEGER),
  jsc.constant (-10000),
  jsc.constant (-9999),
  jsc.constant (-0.5),
  jsc.constant (-0),
  jsc.constant (0),
  jsc.constant (0.5),
  jsc.constant (9999),
  jsc.constant (10000),
  jsc.constant (Number.MAX_SAFE_INTEGER),
  jsc.constant (Infinity)
);

//    empty :: Monoid m => m -> Boolean
const empty = m => Z.equals (m, Z.empty (m.constructor));

//    not :: Boolean -> Boolean
const not = b => !b;

//    testLaws :: Object -> Object -> Undefined
const testLaws = laws => arbs => {
  (Object.keys (laws)).forEach (name => {
    eq (laws[name].length) (arbs[name].length);
    test (name.replace (/[A-Z]/g, c => ' ' + c.toLowerCase ()),
          laws[name] (...arbs[name]));
  });
};

//    eq :: a -> b -> Undefined !
function eq(actual) {
  assert.strictEqual (arguments.length, eq.length);
  return function eq$1(expected) {
    assert.strictEqual (arguments.length, eq$1.length);
    assert.strictEqual (show (actual), show (expected));
    assert.strictEqual (Z.equals (actual, expected), true);
  };
}


suite ('Constant', () => {

  test ('metadata', () => {
    eq (typeof Constant) ('function');
    eq (Constant.name) ('Constant');
    eq (Constant.length) (1);
  });

  test ('@@type', () => {
    eq (type (Constant (Number) (0))) ('sanctuary-constant/Constant@1');
    eq (type.parse (type (Constant (Number) (0))))
       ({namespace: 'sanctuary-constant', name: 'Constant', version: 1});
  });

  test ('@@show', () => {
    eq (show (Constant (Array) (['foo', 'bar', 'baz'])))
       ('Constant (Array) (["foo", "bar", "baz"])');
    eq (show (Constant (Constant (Constant (Number)))
                       (Constant (Constant (Number))
                                 (Constant (Number)
                                           (-0)))))
       ('Constant (Constant (Constant (Number)))' +
                ' (Constant (Constant (Number))' +
                          ' (Constant (Number)' +
                                    ' (-0)))');

    //    Foo :: String -> Foo
    function Foo(value) {
      return {
        'constructor': Foo,
        '@@show': function Foo$show() { return 'Foo (' + show (value) + ')'; },
      };
    }
    delete Foo.name;
    eq (show (Constant (Foo) (Foo ('foo'))))
       ('Constant (Foo) (Foo ("foo"))');

    //    Bar :: String -> Bar
    const Bar = value => ({
      'constructor': Bar,
      '@@show': function Bar$show() { return 'Bar (' + show (value) + ')'; },
    });
    delete Bar.name;
    eq (show (Constant (Bar) (Bar ('bar'))))
       ('Constant (' + String (Bar) + ') (Bar ("bar"))');
  });

});

suite ('type-class predicates', () => {

  test ('Setoid', () => {
    eq (Z.Setoid.test (Constant (Useless.constructor) (Useless))) (false);
    eq (Z.Setoid.test (Constant (RegExp) (/(?:)/))) (true);
  });

  test ('Ord', () => {
    eq (Z.Ord.test (Constant (Useless.constructor) (Useless))) (false);
    eq (Z.Ord.test (Constant (RegExp) (/(?:)/))) (false);
    eq (Z.Ord.test (Constant (Number) (0))) (true);
  });

  test ('Semigroupoid', () => {
    eq (Z.Semigroupoid.test (Constant (Array) ([]))) (false);
  });

  test ('Category', () => {
    eq (Z.Category.test (Constant (Array) ([]))) (false);
  });

  test ('Semigroup', () => {
    eq (Z.Semigroup.test (Constant (Useless.constructor) (Useless))) (false);
    eq (Z.Semigroup.test (Constant (Number) (0))) (false);
    eq (Z.Semigroup.test (Constant (Array) ([]))) (true);
  });

  test ('Monoid', () => {
    eq (Z.Monoid.test (Constant (Array) ([]))) (false);
  });

  test ('Group', () => {
    eq (Z.Group.test (Constant (Array) ([]))) (false);
  });

  test ('Filterable', () => {
    eq (Z.Filterable.test (Constant (Array) ([]))) (false);
  });

  test ('Functor', () => {
    eq (Z.Functor.test (Constant (Useless.constructor) (Useless))) (true);
  });

  test ('Bifunctor', () => {
    eq (Z.Bifunctor.test (Constant (Useless.constructor) (Useless))) (true);
  });

  test ('Profunctor', () => {
    eq (Z.Profunctor.test (Constant (Function) (Math.sqrt))) (false);
  });

  test ('Apply', () => {
    eq (Z.Apply.test (Constant (Useless.constructor) (Useless))) (false);
    eq (Z.Apply.test (Constant (Number) (0))) (false);
    eq (Z.Apply.test (Constant (Array) ([]))) (true);
  });

  test ('Applicative', () => {
    eq (Z.Applicative.test (Constant (Useless.constructor) (Useless))) (false);
    eq (Z.Applicative.test (Constant (Number) (0))) (false);
    eq (Z.Applicative.test (Constant (Array) ([]))) (true);
  });

  test ('Chain', () => {
    eq (Z.Chain.test (Constant (Array) ([]))) (false);
  });

  test ('ChainRec', () => {
    eq (Z.ChainRec.test (Constant (Array) ([]))) (false);
  });

  test ('Monad', () => {
    eq (Z.Monad.test (Constant (Array) ([]))) (false);
  });

  test ('Alt', () => {
    eq (Z.Alt.test (Constant (Array) ([]))) (false);
  });

  test ('Plus', () => {
    eq (Z.Plus.test (Constant (Array) ([]))) (false);
  });

  test ('Alternative', () => {
    eq (Z.Alternative.test (Constant (Array) ([]))) (false);
  });

  test ('Foldable', () => {
    eq (Z.Foldable.test (Constant (Useless.constructor) (Useless))) (true);
  });

  test ('Traversable', () => {
    eq (Z.Traversable.test (Constant (Useless.constructor) (Useless))) (true);
  });

  test ('Extend', () => {
    eq (Z.Extend.test (Constant (Array) ([]))) (false);
  });

  test ('Comonad', () => {
    eq (Z.Comonad.test (Constant (Array) ([]))) (false);
  });

  test ('Contravariant', () => {
    eq (Z.Contravariant.test (Constant (Function) (Math.sqrt))) (false);
  });

});

suite ('Setoid laws', () => {
  testLaws (laws.Setoid) ({
    reflexivity: [
      ConstantArb (Number) (NumberArb),
    ],
    symmetry: [
      ConstantArb (Number) (NumberArb),
      ConstantArb (Number) (NumberArb),
    ],
    transitivity: [
      ConstantArb (Number) (NumberArb),
      ConstantArb (Number) (NumberArb),
      ConstantArb (Number) (NumberArb),
    ],
  });
});

suite ('Ord laws', () => {
  testLaws (laws.Ord) ({
    totality: [
      ConstantArb (Number) (NumberArb),
      ConstantArb (Number) (NumberArb),
    ],
    antisymmetry: [
      ConstantArb (Number) (NumberArb),
      ConstantArb (Number) (NumberArb),
    ],
    transitivity: [
      ConstantArb (Number) (NumberArb),
      ConstantArb (Number) (NumberArb),
      ConstantArb (Number) (NumberArb),
    ],
  });
});

suite ('Semigroup laws', () => {
  testLaws (laws.Semigroup (Z.equals)) ({
    associativity: [
      ConstantArb (String) (jsc.string),
      ConstantArb (String) (jsc.string),
      ConstantArb (String) (jsc.string),
    ],
  });
});

suite ('Functor laws', () => {
  testLaws (laws.Functor (Z.equals)) ({
    identity: [
      ConstantArb (String) (jsc.string),
    ],
    composition: [
      ConstantArb (String) (jsc.string),
      jsc.constant (Math.sqrt),
      jsc.constant (Math.abs),
    ],
  });
});

suite ('Bifunctor laws', () => {
  testLaws (laws.Bifunctor (Z.equals)) ({
    identity: [
      ConstantArb (String) (jsc.string),
    ],
    composition: [
      ConstantArb (String) (jsc.string),
      jsc.constant (Math.sqrt),
      jsc.constant (s => s.length),
      jsc.constant (Math.sqrt),
      jsc.constant (Math.abs),
    ],
  });
});

suite ('Apply laws', () => {
  testLaws (laws.Apply (Z.equals)) ({
    composition: [
      ConstantArb (String) (jsc.string),
      ConstantArb (String) (jsc.string),
      ConstantArb (String) (jsc.string),
    ],
  });
});

suite ('Applicative laws', () => {
  testLaws (laws.Applicative (Z.equals, Constant (Array))) ({
    identity: [
      ConstantArb (Array) (jsc.array (jsc.number)),
    ],
    homomorphism: [
      jsc.constant (Math.abs),
      jsc.number,
    ],
    interchange: [
      ConstantArb (Array) (jsc.array (jsc.number)),
      jsc.string,
    ],
  });
});

suite ('Foldable laws', () => {
  testLaws (laws.Foldable (Z.equals)) ({
    associativity: [
      jsc.constant (s => x => s + s),
      jsc.string,
      ConstantArb (Number) (jsc.number),
    ],
  });
});

suite ('Traversable laws', () => {
  testLaws (laws.Traversable (Z.equals)) ({
    naturality: [
      jsc.constant (Array),
      jsc.constant (Identity),
      jsc.constant (xs => Identity (xs[0])),
      ConstantArb (Array) (NonEmpty (jsc.array (jsc.number))),
    ],
    identity: [
      jsc.constant (Array),
      ConstantArb (String) (jsc.string),
    ],
    composition: [
      jsc.constant (Array),
      jsc.constant (Identity),
      ConstantArb (Array) (jsc.array (IdentityArb (jsc.string))),
    ],
  });
});
