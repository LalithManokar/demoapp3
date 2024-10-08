/**
 * An Iterable is an object with two methods
 * 
 * next()  @returns {boolean} indicates if there are more values available.
 * value() @returns {any|undefined} any value if next()==true, undefined otherwise.
 * 
 * An Iterator will provide additional service methods as implemented below.
 * E.g.: map, reduce, filter, reject, each, every, any, all, some, find
 */

const iter = this;

/**
 * Checks if an object appears to be iterable.
 * 
 * @param {object} testee
 * @returns {boolean}
 */
function isIterable(testee) {
    function isFunction(o) { return typeof(o) === "function"; }
    return !!(testee  && testee.value  && testee.next && 
              isFunction(testee.value) && isFunction(testee.next));
}

/**
 * Creates a new iterator out of an existing iterable.
 * Also doubles as a constructor. It is recommended to
 * prefer the factory style calls instead of calling the
 * constructor directly.
 * 
 * @constructor
 * @param {Iterator} iterable The iterable to be used.
 * @returns {iterator} The new iterator.
 * 
 * Iterating the new iterator will consume the underlying iterator.
 */
function Iterator(iterable) {
    if (!(this instanceof Iterator)) {
        // we are not called as a constructor, so we behave like a factory.
        return new Iterator(iterable);
    }

	this.iterable = iterable;
	return undefined;
}

const proto = Iterator.prototype;
proto.constructor = Iterator;
/**
 * @returns {boolean} The result of the next() function of the delegated iterable.
 */
proto.next = function()  { 
    return this.iterable.next();  
};

/**
 * @returns {value} The result of the value() function of the delegated iterable.
 */
proto.value = function() {
    return this.iterable.value();
};


/**
 * Factory function to construct an Iterator out of an iterable.
 * 
 * @param {iterable} iterable The iterable to be used.
 * @returns {iterator} The new iterator
 */
function fromIterable(iterable) {
    return new Iterator(iterable);
}

/**
 * Factory function to construct an Iterator out of something that
 * at least remotely resembles an array.
 * 
 * @param {array} a The array to be used.
 * @returns {iterator} The new iterator
 */
function fromArray(a) {
    const length = a.length;
    if (length === +length) {
        var index = -1;
        return new Iterator({
            next: function() { return ++index < a.length; },
            value: function() { return a[index]; }
        });
    } else {
        return undefined;
    }
}

/**
 * Private helper function.
 * It will expose the passed function as a function of this include.
 * It will also expose the function at the Iterator.prototype.
 * Thus the same function can be called with two different styles:
 *     iterable.f(args) 
 *     f(iterable, args)
 * 
 * @param {f}
 */
const declare = function (f) {
    iter[f.name] = f;
    proto[f.name] = 
        (function () {
           switch (f.length) {
                case 0: return function()     { return iter[f.name](); };
                case 1: return function()     { return iter[f.name](this); };
                case 2: return function(a)    { return iter[f.name](this, a); };
                case 3: return function(a, b) { return iter[f.name](this, a, b); };
            }
            return function() { return iter[f.name].apply(iter, [this].concat([].splice.call(arguments, 0))); };
        })();
};

/**
 * Private helper function.
 * It will provide alias names for a declared function
 * 
 * @param {string} name
 * @param {string} alias
 */
const alias = function(name, alias) {
    iter[alias] = iter[name];
    proto[alias] = proto[name];
};


/**
 * Produces a new Iterator by processing each value of Iterator
 * through the iteratee. The result will be the original value.
 * This is mainly useful for debug purposes
 * 
 * @param {iterable}
 * @param {function} iteratee
 * @returns {Iterator}
*/
declare(function tap(iterable, iteratee) {
    const result = new Iterator(iterable);
    result.value = function() {
        const value = iterable.value();
        iteratee.call(iterable, value);
        return value;
    };
    return result;
});

/**
 * Produces a new Iterator by mapping each value of Iterator
 * through the transformation function (iteratee).
 * 
 * @param {iterable}
 * @param {function} iteratee
 * @returns {Iterator}
 */
declare(function map(iterable, iteratee) {
    const result = new Iterator(iterable);
    result.value = function() {
        return iteratee.call(iterable, iterable.value());
    };
    return result;
});


/**
 * Invokes iteratee on each value of the Iterator.
 * @param {iterable} 
 * @returns {undefined}
 */
declare(function each(iterable, iteratee) {
    while (iterable.next()) { iteratee(iterable.value()); }
});

/**
 * Tests each value of the iterable,
 * returning the first one that passes the test (predicate),
 * or undefined if no value passes the test.
 * The function returns as soon as it finds an acceptable element, 
 * without traversing the entire Iterator. 
 * 
 * @param {iterable} 
 * @predicate {function}
 * @returns {any}
 */
declare(function find(iterable, predicate) {
    while (iterable.next()) {
        const value = iterable.value();
        if (predicate.call(iterable, value)) {
            return value;
        }
    }
    return undefined;
});

/** 
 * Returns true if all of the values of the Iterator pass the
 * predicate truth test
 * 
 * @param {iterable} 
 * @param {function} predicate
 * @returns {boolean}
 */
declare(function every(iterable, predicate) {
    while (iterable.next()) {
        if (!predicate.call(iterable, iterable.value())) {
            return false;
        }
    }
    return true;
});
alias("every", "all");


/** 
 * Returns true if some of the values of the Iterator pass the
 * predicate truth test
 * 
 * @param {iterable} 
 * @param {function} predicate
 * @returns {boolean}
 */
declare(function some(iterable, predicate) {
    while (iterable.next()) {
        if (predicate.call(iterable, iterable.value())) {
            return true;
        }
    }
    return false;
});
alias("some", "any");

/** 
 * Produces a new Iterator that will only contain values
 * that pass the predicate truth test.
 * 
 * @param {iterable} 
 * @param {function} predicate
 * @returns {Iterator}
 */
declare(function filter(iterable, predicate) {
	const result = new Iterator(iterable);
	
	var value;
	
	result.next = function findAdmissible() {
		while (iterable.next()) {
            value = iterable.value();
			if (predicate.call(iterable, value)) {
				return true;
			} 
		}
		return false;
	};
	result.value = function() { return value; };
	return result;
});

/** 
 * Produces a new Iterator that will only contain values
 * that fail the predicate truth test.
 * 
 * @param {iterable} 
 * @param {function} predicate
 * @returns {Iterator}
 */
declare(function reject(iterable, predicate) {
	const result = new Iterator(iterable);
	
	var value;
	
	result.next = function findAdmissible() {
		while (iterable.next()) {
            value = iterable.value();
			if (!predicate.call(iterable, value)) {
				return true;
			} 
		}
		return false;
	};
	result.value = function() { return value; };
	return result;
});

/**
 * Boils down an iterator into a single value.
 * Memo is the initial state of the reduction, 
 * and each successive step of it should be returned by iteratee. 
 * The iteratee is passed two arguments: the memo and the current value.
 * 
 * If no memo is passed then the first value is consumed and passed as the memo
 * in the invocation of the (remaining) iteratee.
 * 
 * @param {iterable} iterable
 * @param {function} iteratee
 * @param {any} memo (optional)
 * @returns {any}
 */
declare(function reduce(iterable, iteratee, memo) {
    var lmemo = (memo === undefined) ? iterable.next() ? iterable.value()
                                                       : undefined
                                     : memo;
    while (iterable.next()) {
        lmemo = iteratee(lmemo, iterable.value());
    }
    return lmemo;
});

/**
 * Pushes all iterator values into an array.
 * 
 * @param {iterable} iterable
 * @returns {Array}
 */
declare(function toArray(iterable) {
    const result = [];
	while (iterable.next()) {
		result.push(iterable.value());
	}
	return result;
});

/**
 * Like [].join but for iterables
 * 
 * @param {iterable} iterable
 * @param {string} separator
 * @returns {string}
 */
declare(function join(iterable, separator) {
	var result = "";
    if (!iterable.next()) {
        return result;
    }
    result += iterable.value();
	while (iterable.next()) {
        result += separator + iterable.value();
	}
	return result;
});
