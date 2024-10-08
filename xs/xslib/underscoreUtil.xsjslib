// This library contains our underscore mixins
// and is implicitely added to underscore when the thirdparty/underscore.xsjslib is loaded
function init(_) {
	function cloneFiltered(o, fnFilter) {
		var r = {};
		_.each(o, function(v, k) {
			if (fnFilter(v, k)) {
				r[k] = v;
			}
		});
		return r;
	}

	function mapObjects(oObject, fnMap) {
		return _.reduce(oObject, function(oResult, vValue, vKey) {
			oResult[vKey] = fnMap(vValue, vKey);
			return oResult;
		}, {});
	}

	function mapObject(oSource, mMapping) {
		var oTarget = {};
		_.each(oSource, function(vValue, vKey) {
			var vMapping = mMapping[vKey];
			if (vMapping === undefined) {
				return;
			}

			// instead of an objectified mapping definition a simple string can be given
			var oMapping = (!_.isObject(vMapping)) ? {
				key: vMapping
			} : vMapping;

			// an optional copy function allows transformation
			// of the mapped values for the keys
			var fnCopy = oMapping.copy;
			var fnCheck = oMapping.check;
			if (defaultFunction(fnCheck, _.constant(true))(oSource[vKey])) {
				oTarget[oMapping.key] = defaultFunction(fnCopy, _.identity)(oSource[vKey]);
			}
		});
		return oTarget;
	}

	/**
	 * returns a function be used e.g. in _.map to map to constants
	 */
	function constant(vValue) {
		return function() {
			return vValue;
		};
	}

	function defaultFunction(fnTarget, fnDefault) {
		return _.isFunction(fnTarget) ? fnTarget : fnDefault;
	}

	function defaultValue(vValue, vDefault, fnPred) {
		if (fnPred(vValue)) {
			return vValue;
		} else {
			return vDefault;
		}
	}

	function exists(vValue) {
		return vValue !== null && vValue !== undefined;
	}

	function not(vValue) {
		if (vValue === undefined || vValue === null) {
			return vValue;
		} else {
			return !vValue;
		}
	}

	function isPlainObject(oObject) {
		if (!oObject) {
			return false;
		}
		return oObject.constructor === Object;
	}

	function isSet(vValue) {
		return !!vValue || vValue === 0;
	}

	function visitObjectTree(oTree, fnVisit, fnChildrenFilter) {
		fnChildrenFilter = fnChildrenFilter || _.identity;

		function visitTreeNode(oTreeNode, sKey, sParentKey, sContext) {
			if (isPlainObject(oTreeNode) || _.isArray(oTreeNode)) {
				var sCurrentContext = fnVisit(oTreeNode, sKey, sParentKey, sContext) || sContext;
				var sCurrentParentKey = sKey;

				_.each(fnChildrenFilter(oTreeNode), function(oTreeNode, sKey) {
					visitTreeNode(oTreeNode, sKey, sCurrentParentKey, sCurrentContext);
				});
			}
		}

		visitTreeNode(oTree, undefined, undefined, undefined);
	}

	function visitInstanceTree(oObject, fnHandler) {
		visitObjectTree(oObject, function(oObjectNode, sKey, sParentKey, oContext) {
			var bObjectInArray = false;
			if (_.isNumber(sKey)) {
				sKey = sParentKey;
				bObjectInArray = true;
			}
			return fnHandler(oObjectNode, sKey, bObjectInArray, oContext);
		});
	}

	function indexByOmit(aArray, sIndexKey) {
		return _.reduce(_.indexBy(aArray, sIndexKey), function(oResult, oObject, vKey) {
			oResult[vKey] = _.omit(oObject, sIndexKey);
			return oResult;
		}, {});
	}

	function toBool(sValue) {
		switch (sValue) {
			case false:
			case 'FALSE':
			case undefined:
			case 0:
			case '0':
				return false;
			case true:
			case 'TRUE':
			case 1:
			case '1':
				return true;
			default:
				return undefined;
		}
	}

	function isBool(sValue) {
		return _.toBool(sValue) !== undefined;
	}

	function toDBBool(bValue) {
		return bValue ? 1 : (bValue === null ? null : 0);
	}

	function raiseException(vException) {
		if (vException instanceof Error) {
			throw vException;
		}
		throw new Error(vException);
	}

	function getObjectPathValue(oObject, sPath) {
		var aPathComponents = sPath.split(".");
		var oObjectPart = oObject;
		_.each(aPathComponents, function(element, index, list) {
			if (oObjectPart && oObjectPart[element]) {
				oObjectPart = oObjectPart[element];
			} else {
				oObjectPart = null;
			}
		}, oObjectPart);
		return oObjectPart;
	}

	function copyDeep(oObject) {
		var oObjectCopy = {};
		visitObjectTree(oObject, function(oObjectNode, sPropertyName, sParentPropertyName, oParentObjectNodeCopy) {
			var oObjectNodeCopy;
			if (_.isArray(oObjectNode)) {
				oObjectNodeCopy = [];
				_.each(oObjectNode, function(oObjectNodeInstance) {
					if (!isPlainObject(oObjectNodeInstance) && !_.isArray(oObjectNodeInstance)) {
						oObjectNodeCopy.push(oObjectNodeInstance);
					}
				});
			} else {
				oObjectNodeCopy = _.cloneFiltered(oObjectNode, function(oObjectNodeProperty) {
					return !(isPlainObject(oObjectNodeProperty) || _.isArray(oObjectNodeProperty));
				});
			}
			if (sPropertyName === undefined) {
				oObjectCopy = oObjectNodeCopy;
			} else {
				if (!_.isArray(oParentObjectNodeCopy)) {
					oParentObjectNodeCopy[sPropertyName] = oObjectNodeCopy;
				} else {
					oParentObjectNodeCopy.push(oObjectNodeCopy);
				}
			}
			return oObjectNodeCopy;
		});
		return oObjectCopy;
	}

	function splitObjectPath(sObjectPath) {
		var iLastDot = sObjectPath.lastIndexOf('.');
		return {
			packageName: sObjectPath.substring(0, iLastDot),
			objectName: sObjectPath.substring(iLastDot + 1, sObjectPath.length)
		};
	}

	function isInteger(vValue) {
		return _.isFinite(vValue) && (Math.floor(vValue) === Math.ceil(vValue));
	}

	// checks if val is a valid CSS hex color 
	function isHexColor(val) {
		if (val) {
			return /(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(val);
		}
	}

	function saveUnion(a1, a2) {
		if (!a1 || !a2) {
			if (!a1 && !a2) {
				return [];
			} else if (!a1) {
				return a2;
			} else {
				return a1;
			}
		} else {
			return _.union(a1, a2);
		}
	}

	_.sortedIntersection = function(array) {
		var rest = Array.prototype.slice.call(arguments, 1);
		return _.filter(_.uniq(array), function(item) {
			return _.every(rest, function(other) {
				return _.indexOf(other, item, (other.length > 1)) >= 0;
			});
		});
	};

	/**
	 * chain (f1, ..., fn)
	 *
	 * @returns a function that executes f1 ... fn after each other
	 */
	function chain() {
		var aFn = _.toArray(arguments);
		return function() {
			var aArgs = _.toArray(arguments);
			_.each(aFn, function(fn) {
				if (fn && _.isFunction(fn)) {
					fn.apply(undefined, aArgs);
				}
			});
		};
	}

	/**
	 * chainRedcue (fnReduce, memo, v1, ..., vn)
	 *
	 * @returns a function that handles v1 ... vn after each other using fnReduce on the return values, if v is a function
	 *          it is executed with the arguments of the function
	 */
	function chainReduce(fnReduce, memo) {
		var aArgs = _.toArray(arguments);
		var aV = _.rest(aArgs, 2);
		return function() {
			var aArgs = _.toArray(arguments);
			return _.reduce(aV, function(memo, v) {
				if (v && _.isFunction(v)) {
					var ret = v.apply(undefined, aArgs);
					return fnReduce(memo, ret);
				} else {
					return fnReduce(memo, v);
				}
			}, memo);
		};
	}

	/**
	 * isEqualOmit (a, b, keys)
	 *
	 * @returns true of false depending on the equality of a and b by considering ommited object parts
	 */

	function isEqualOmit(a, b, keys) {
		a = copyDeep(a);
		b = copyDeep(b);
		if (_.isArray(a)) {
			_.each(a, function(vA, vIndex, vList) {
				vList[vIndex] = _.omit(vA, keys);
			});
		} else {
			a = _.omit(a, keys);
		}
		if (_.isArray(b)) {
			_.each(b, function(vB, vIndex, vList) {
				vList[vIndex] = _.omit(vB, keys);
			});
		} else {
			b = _.omit(b, keys);
		}
		return _.isEqual(a, b);
	}

	// Attention USC-2 encoding assumed
	function ab2str(buf) {
		return String.fromCharCode.apply(null, new Uint16Array(buf));
	}

	// Attention USC-2 encoding assumed
	function str2ab(str) {
		var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
		var bufView = new Uint16Array(buf);
		for (var i = 0, strLen = str.length; i < strLen; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	}

	function stripTags(sText) {
		sText = sText.replace(/<(.|\n)*?>/g, " ").replace(/\s+/g, " ").trim();
		sText = sText.replace(/&nbsp;/g, " ");
		sText = sText.replace(/  +/g, " ");
		sText = sText.replace(/[{}]/g, "");
		return sText;
	}

	function stripFilename(sName) {
		return sName.replace(/[|&:;$%@"<>()+,{}]/g, "");
	}

	function isASCII(sString) {
		return /^[\x00-\x7F]*$/.test(sString);
	}

	function mergeNodeIfNotExists(oObject, oMergeObject, sNodeName, sAttributeName, aMergeAttribute, vExclude, fnCallback) {
		_.each(oMergeObject[sNodeName], function(oMergeInstance) {
			if (!sAttributeName || (!_.find(oObject[sNodeName], function(oExistingInstance) {
				return oMergeInstance[sAttributeName] === oExistingInstance[sAttributeName];
			}) && (!vExclude || oMergeInstance[sAttributeName] != vExclude))) {
				var oNewInstance = {};
				_.each(aMergeAttribute, function(vMergeAttribute) {
					oNewInstance[vMergeAttribute] = oMergeInstance[vMergeAttribute];
				});
				if (fnCallback) {
					oNewInstance = fnCallback(oNewInstance);
				}
				oObject[sNodeName].push(oNewInstance);
			}
		});
	}
	
    /**
	 * Pattern to analyze MessageFormat strings.
	 *
	 * Group 1: captures doubled single quotes within the string
	 * Group 2: captures quoted fragments within the string.
	 *            Note that java.util.MessageFormat silently forgives a missing single quote at
	 *            the end of a pattern. This special case is handled by the RegEx as well.
	 * Group 3: captures placeholders
	 *            Checks only for numerical argument index, any remainder is ignored up to the next
	 *            closing curly brace. Nested placeholdes are not accepted!
	 * Group 4: captures any remaining curly braces and indicates syntax errors
	 *
	 *                    [-1] [----- quoted string -----] [------ placeholder ------] [--]
	 * @private
	 */
	function formatMessage(sPattern, aValues) {
		const rMessageFormat = /('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g;
		if (arguments.length > 2 || (aValues !== null && !_.isArray(aValues))) {
			aValues = Array.prototype.slice.call(arguments, 1);
		}
		aValues = aValues || [];
		return sPattern.replace(rMessageFormat, function($0, $1, $2, $3, offset) {
			if ($1) {
				// a doubled single quote in a normal string fragment
				//   --> emit a single quote
				return "'";
			} else if ($2) {
				// a quoted sequence of chars, potentially containing doubled single quotes again
				//   --> emit with doubled single quotes replaced by a single quote
				return $2.replace(/''/g, "'");
			} else if ($3) {
				// a welformed curly brace
				//   --> emit the argument but ignore other parameters
				return String(aValues[parseInt($3, 10)]);
			}
			// e.g. malformed curly braces
			//   --> throw Error
			throw new Error("formatMessage: pattern syntax error at pos. " + offset);
		});
	}

	_.mixin({
		cloneFiltered: cloneFiltered,
		mapObject: mapObject,
		mapObjects: mapObjects,
		indexByOmit: indexByOmit,
		constant: constant,
		defaultFunction: defaultFunction,
		defaultValue: defaultValue,
		exists: exists,
		not: not,
		isPlainObject: isPlainObject,
		isSet: isSet,
		isEqualOmit: isEqualOmit,
		visitObjectTree: visitObjectTree,
		visitInstanceTree: visitInstanceTree,
		toBool: toBool,
		toDBBool: toDBBool,
		isBool: isBool,
		isInteger: isInteger,
		isHexColor: isHexColor,
		raiseException: raiseException,
		getObjectPathValue: getObjectPathValue,
		copyDeep: copyDeep,
		splitObjectPath: splitObjectPath,
		saveUnion: saveUnion,
		chain: chain,
		chainReduce: chainReduce,
		ab2str: ab2str,
		str2ab: str2ab,
		stripTags: stripTags,
		stripFilename: stripFilename,
		isASCII: isASCII,
		mergeNodeIfNotExists: mergeNodeIfNotExists,
		formatMessage: formatMessage
	});
}