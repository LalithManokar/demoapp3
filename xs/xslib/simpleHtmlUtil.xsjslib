const htmlEntityDecode = $.import("sap.ino.xs.xslib", "htmlEntityDecode");
const entityRe = /&(#\d+|#x[0-9A-Fa-f]+|\w+);/g;

var lcase;
// The below may not be true on browsers in the Turkish locale.
if ('script' === 'SCRIPT'.toLowerCase()) {
	lcase = function(s) {
		return s.toLowerCase();
	};
} else {
	/**
	 * {\@updoc
	 * $ lcase('SCRIPT')
	 * # 'script'
	 * $ lcase('script')
	 * # 'script'
	 * }
	 */
	lcase = function(s) {
		return s.replace(
			/[A-Z]/g,
			function(ch) {
				return String.fromCharCode(ch.charCodeAt(0) | 32);
			});
	};
}

// The keys of this object must be 'quoted' or JSCompiler will mangle them!
var ENTITIES = {
	'lt': '<',
	'gt': '>',
	'amp': '&',
	'quot': '"',
	'apos': '\''
};

var decimalEscapeRe = /^#(\d+)$/;
var hexEscapeRe = /^#x([0-9A-Fa-f]+)$/;

/**
 * Decodes an HTML entity.
 *
 * {\@updoc
 * $ lookupEntity('lt')
 * # '<'
 * $ lookupEntity('GT')
 * # '>'
 * $ lookupEntity('amp')
 * # '&'
 * $ lookupEntity('nbsp')
 * # '\xA0'
 * $ lookupEntity('apos')
 * # "'"
 * $ lookupEntity('quot')
 * # '"'
 * $ lookupEntity('#xa')
 * # '\n'
 * $ lookupEntity('#10')
 * # '\n'
 * $ lookupEntity('#x0a')
 * # '\n'
 * $ lookupEntity('#010')
 * # '\n'
 * $ lookupEntity('#x00A')
 * # '\n'
 * $ lookupEntity('Pi')      // Known failure
 * # '\u03A0'
 * $ lookupEntity('pi')      // Known failure
 * # '\u03C0'
 * }
 *
 * @param {string} name the content between the '&' and the ';'.
 * @return {string} a single unicode code-point as a string.
 */
function lookupEntity(name) {
	name = lcase(name); // TODO: &pi; is different from &Pi;
	if (ENTITIES.hasOwnProperty(name)) {
		return ENTITIES[name];
	}
	var m = name.match(decimalEscapeRe);
	if (m) {
		return String.fromCharCode(parseInt(m[1], 10));
	} else if (!!(m = name.match(hexEscapeRe))) {
		return String.fromCharCode(parseInt(m[1], 16));
	}
	return '';
}

function decodeOneEntity(_, name) {
	return lookupEntity(name);
}

/**
 * The plain text of a chunk of HTML CDATA which possibly containing.
 *
 * {\@updoc
 * $ unescapeEntities('')
 * # ''
 * $ unescapeEntities('hello World!')
 * # 'hello World!'
 * $ unescapeEntities('1 &lt; 2 &amp;&AMP; 4 &gt; 3&#10;')
 * # '1 < 2 && 4 > 3\n'
 * $ unescapeEntities('&lt;&lt <- unfinished entity&gt;')
 * # '<&lt <- unfinished entity>'
 * $ unescapeEntities('/foo?bar=baz&copy=true')  // & often unescaped in URLS
 * # '/foo?bar=baz&copy=true'
 * $ unescapeEntities('pi=&pi;&#x3c0;, Pi=&Pi;\u03A0') // FIXME: known failure
 * # 'pi=\u03C0\u03c0, Pi=\u03A0\u03A0'
 * }
 *
 * @param {string} s a chunk of HTML CDATA.  It must not start or end inside
 *     an HTML entity.
 */
function unescapeEntities(s) {
	return s.replace(entityRe, decodeOneEntity);
}

function decode(sEncode) {
    if(!sEncode){
        return '';
    }
	var sString = htmlEntityDecode.decode(sEncode);
	return unescapeEntities(sString);
}