/*   _____   _____   _____   _____   ______   _____   _____   ______   */
/*  |     | |     | |     | |     | |      | |     | |     | |      |  */
/*  |  |__| |  |  | |  |  | |  |__| '-,  ,-' |  |  | |  |  | '-,  ,-'  */
/*  |  |__  |  |  | |  |  | |__   |   |  |   |     | |  |  |   |  |    */
/*  |  |  | |  |  | |  |  | |  |  |   |  |   |  |  | |  |  |   |  |    */
/*  |_____| |_____| |__|__| |_____|   |__|   |__|__| |__|__|   |__|    */

//. <a href="https://github.com/fantasyland/fantasy-land"><img alt="Fantasy Land" src="https://raw.githubusercontent.com/fantasyland/fantasy-land/master/logo.png" width="75" height="75" align="left"></a>
//.
//. # sanctuary-constant
//.
//. A value of type `Constant a b` always contains exactly one value,
//. of type `a`. Mapping over a `Constant a b` has no effect because
//. the `b -> c` function is never applied.

(function(f) {

  'use strict';

  var util = {inspect: {}};

  /* istanbul ignore else */
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = f (require ('util'),
                        require ('sanctuary-show'),
                        require ('sanctuary-type-classes'));
  } else if (typeof define === 'function' && define.amd != null) {
    define (['sanctuary-show', 'sanctuary-type-classes'], function(show, Z) {
      return f (util, show, Z);
    });
  } else {
    self.sanctuaryConstant = f (util,
                                self.sanctuaryShow,
                                self.sanctuaryTypeClasses);
  }

} (function(util, show, Z) {

  'use strict';

  /* istanbul ignore if */
  if (typeof __doctest !== 'undefined') {
    var $ = __doctest.require ('sanctuary-def');
    var type = __doctest.require ('sanctuary-type-identifiers');
    var S = (function() {
      var S = __doctest.require ('sanctuary');
      var ConstantType = $.BinaryType
        ('Constant')
        ('')
        ([])
        (function(x) { return type (x) === constantTypeIdent; })
        (function(c) { return [c.value]; })
        (function(c) { return []; });
      var env = Z.concat (S.env, [ConstantType ($.Unknown) ($.Unknown)]);
      return S.create ({checkTypes: false, env: env});
    } ());
  }

  var constantTypeIdent = 'sanctuary-constant/Constant@1';

  //. `Constant a b` satisfies the following [Fantasy Land][] specifications:
  //.
  //. ```javascript
  //. > const Useless = require ('sanctuary-useless')
  //.
  //. > S.map (k =>
  //. .   k + ' '.repeat (16 - k.length) +
  //. .   (Z[k].test (Constant (Useless.constructor) (Useless)) ? '\u2705   ' :
  //. .    Z[k].test (Constant (Array) (['foo', 'bar', 'baz'])) ? '\u2705 * ' :
  //. .    /* otherwise */                                        '\u274C   ')
  //. . ) (S.filter (S.test (/^(?=[A-Z])(?!TypeClass$)/)) (Object.keys (Z)))
  //. [ 'Setoid          ✅ * ',  // if ‘a’ satisfies Setoid
  //. . 'Ord             ✅ * ',  // if ‘a’ satisfies Ord
  //. . 'Semigroupoid    ❌   ',
  //. . 'Category        ❌   ',
  //. . 'Semigroup       ✅ * ',  // if ‘a’ satisfies Semigroup
  //. . 'Monoid          ❌   ',
  //. . 'Group           ❌   ',
  //. . 'Filterable      ❌   ',
  //. . 'Functor         ✅   ',
  //. . 'Bifunctor       ✅   ',
  //. . 'Profunctor      ❌   ',
  //. . 'Apply           ✅ * ',  // if ‘a’ satisfies Semigroup
  //. . 'Applicative     ✅ * ',  // if ‘a’ satisfies Monoid
  //. . 'Chain           ❌   ',
  //. . 'ChainRec        ❌   ',
  //. . 'Monad           ❌   ',
  //. . 'Alt             ❌   ',
  //. . 'Plus            ❌   ',
  //. . 'Alternative     ❌   ',
  //. . 'Foldable        ✅   ',
  //. . 'Traversable     ✅   ',
  //. . 'Extend          ❌   ',
  //. . 'Comonad         ❌   ',
  //. . 'Contravariant   ❌   ' ]
  //. ```

  //# Constant :: TypeRep a -> a -> Constant a b
  //.
  //. Constant's sole data constructor. The [type representative][] makes
  //. `Constant (M)` an [Applicative][]-compatible type representative if
  //. `M` represents some monoidal type.
  //.
  //. ```javascript
  //. > Constant (String) ('abc')
  //. Constant (String) ('abc')
  //.
  //. > Constant (Number) (123)
  //. Constant (Number) (123)
  //. ```
  function Constant(A) {
    var prototype = {
      /* eslint-disable key-spacing */
      'constructor':            Constant$bound,
      '@@show':                 Constant$prototype$show,
      'fantasy-land/map':       Constant$prototype$map,
      'fantasy-land/bimap':     Constant$prototype$bimap,
      'fantasy-land/reduce':    Constant$prototype$reduce,
      'fantasy-land/traverse':  Constant$prototype$traverse
      /* eslint-enable key-spacing */
    };

    var custom = util.inspect.custom;
    /* istanbul ignore else */
    if (typeof custom === 'symbol') {
      prototype[custom] = Constant$prototype$show;
    } else {
      prototype.inspect = Constant$prototype$show;
    }

    function Constant$bound(value) {
      var identity = Object.create (prototype);
      if (Z.Setoid.test (value)) {
        identity['fantasy-land/equals'] = Constant$prototype$equals;
        if (Z.Ord.test (value)) {
          identity['fantasy-land/lte'] = Constant$prototype$lte;
        }
      }
      if (Z.Semigroup.test (value)) {
        identity['fantasy-land/concat'] = Constant$prototype$concat;
        identity['fantasy-land/ap'] = Constant$prototype$ap;
      }
      identity.value = value;
      return identity;
    }

    Constant$bound.toString = function() {
      if (A['@@type'] === Constant$bound['@@type']) {
        return 'Constant (' + show (A) + ')';
      } else if (Object.prototype.hasOwnProperty.call (A, 'name')) {
        return 'Constant (' + A.name + ')';
      } else {
        var source = String (A);
        var match = /^\s*function ([$_A-Za-z][$_A-Za-z0-9]*)/.exec (source);
        return 'Constant (' + (match == null ? source : match[1]) + ')';
      }
    };

    Constant$bound['@@type'] = constantTypeIdent;

    //# Constant.fantasy-land/of :: Monoid m => a -> Constant m a
    //.
    //. `of (Constant (M)) (x)` is equivalent to `Constant (M) (empty (M))`.
    //.
    //. ```javascript
    //. > S.of (Constant (Array)) (42)
    //. Constant (Array) ([])
    //.
    //. > S.of (Constant (String)) (42)
    //. Constant (String) ('')
    //. ```
    (function() {
      var empty;
      try { empty = Z.empty (A); } catch (err) { return; }
      Constant$bound['fantasy-land/of'] = function Constant$of(x) {
        return Constant$bound (empty);
      };
    } ());

    //# Constant#@@show :: Showable a => Constant a b ~> () -> String
    //.
    //. `show (Constant (A) (x))` is equivalent to
    //. `'Constant (' + A.name + ') (' + show (x) + ')'`.
    //.
    //. ```javascript
    //. > show (Constant (Array) (['foo', 'bar', 'baz']))
    //. 'Constant (Array) (["foo", "bar", "baz"])'
    //. ```
    function Constant$prototype$show() {
      return String (Constant$bound) + ' (' + show (this.value) + ')';
    }

    //# Constant#fantasy-land/equals :: Setoid a => Constant a b ~> Constant a b -> Boolean
    //.
    //. `Constant (A) (x)` is equal to `Constant (A) (y)` [iff][] `x` is
    //. equal to `y` according to [`Z.equals`][].
    //.
    //. ```javascript
    //. > S.equals (Constant (Array) ([1, 2, 3]))
    //. .          (Constant (Array) ([1, 2, 3]))
    //. true
    //.
    //. > S.equals (Constant (Array) ([1, 2, 3]))
    //. .          (Constant (Array) ([3, 2, 1]))
    //. false
    //. ```
    function Constant$prototype$equals(other) {
      return Z.equals (this.value, other.value);
    }

    //# Constant#fantasy-land/lte :: Ord a => Constant a b ~> Constant a b -> Boolean
    //.
    //. `Constant (A) (x)` is less than or equal to `Constant (A) (y)` [iff][]
    //. `x` is less than or equal to `y` according to [`Z.lte`][].
    //.
    //. ```javascript
    //. > S.filter (S.lte (Constant (Number) (1)))
    //. .          ([Constant (Number) (0),
    //. .            Constant (Number) (1),
    //. .            Constant (Number) (2)])
    //. [Constant (Number) (0), Constant (Number) (1)]
    //. ```
    function Constant$prototype$lte(other) {
      return Z.lte (this.value, other.value);
    }

    //# Constant#fantasy-land/concat :: Semigroup a => Constant a b ~> Constant a b -> Constant a b
    //.
    //. `concat (Constant (A) (x)) (Constant (A) (y))` is equivalent to
    //. `Constant (A) (concat (x) (y))`.
    //.
    //. ```javascript
    //. > S.concat (Constant (Array) ([1, 2, 3]))
    //. .          (Constant (Array) ([4, 5, 6]))
    //. Constant (Array) ([1, 2, 3, 4, 5, 6])
    //. ```
    function Constant$prototype$concat(other) {
      return Constant$bound (Z.concat (this.value, other.value));
    }

    //# Constant#fantasy-land/map :: Constant a b ~> (b -> c) -> Constant a c
    //.
    //. `map (f) (Constant (A) (x))` is equivalent to `Constant (A) (x)`.
    //.
    //. ```javascript
    //. > S.map (Math.sqrt) (Constant (Number) (64))
    //. Constant (Number) (64)
    //. ```
    function Constant$prototype$map(f) {
      return this;
    }

    //# Constant#fantasy-land/bimap :: Constant a c ~> (a -> b, c -> d) -> Constant b d
    //.
    //. `bimap (f) (g) (Constant (A) (x))` is equivalent to
    //. `Constant (A) (f (x))`.
    //.
    //. ```javascript
    //. > S.bimap (s => s.length) (Math.sqrt) (Constant (String) ('abc'))
    //. Constant (Number) (3)
    //. ```
    function Constant$prototype$bimap(f, g) {
      var x = f (this.value);
      return Constant (x.constructor) (x);
    }

    //# Constant#fantasy-land/ap :: Semigroup a => Constant a b ~> Constant a (b -> c) -> Constant a c
    //.
    //. `ap (Constant (A) (x)) (Constant (A) (y))` is equivalent to
    //. `concat (Constant (A) (x)) (Constant (A) (y))`.
    //.
    //. ```javascript
    //. > S.ap (Constant (Array) ([1, 2, 3])) (Constant (Array) ([4, 5, 6]))
    //. Constant (Array) ([1, 2, 3, 4, 5, 6])
    //. ```
    function Constant$prototype$ap(other) {
      return Z.concat (other, this);
    }

    //# Constant#fantasy-land/reduce :: Constant a b ~> ((c, b) -> c, c) -> c
    //.
    //. `reduce (f) (x) (Constant (A) (y))` is equivalent to `x`.
    //.
    //. ```javascript
    //. > S.reduce (S.add) (100) (Constant (Number) (42))
    //. 100
    //. ```
    function Constant$prototype$reduce(f, x) {
      return x;
    }

    //# Constant#fantasy-land/traverse :: Applicative f => Constant a b ~> (TypeRep f, b -> f c) -> f (Constant a c)
    //.
    //. `traverse (A) (f) (Constant (X) (x))` is equivalent to
    //. `of (A) (Constant (X) (x))`.
    //.
    //. ```javascript
    //. > S.traverse (Array) (Math.sqrt) (Constant (Number) (64))
    //. [Constant (Number) (64)]
    //. ```
    function Constant$prototype$traverse(typeRep, f) {
      return Z.of (typeRep, this);
    }

    return Constant$bound;
  }

  return Constant;

}));

//. [Applicative]:              v:fantasyland/fantasy-land#Applicative
//. [Fantasy Land]:             v:fantasyland/fantasy-land
//. [`Z.equals`]:               v:sanctuary-js/sanctuary-type-classes#equals
//. [`Z.lte`]:                  v:sanctuary-js/sanctuary-type-classes#lte
//. [iff]:                      https://en.wikipedia.org/wiki/If_and_only_if
//. [type representative]:      v:fantasyland/fantasy-land#type-representatives
