const trace = $.import("sap.ino.xs.xslib", "trace");
const whoAmI = "sap.ino.xs.xslib.csvStreamParser.xsjslib";
const debug = function debug(line) {
    trace.debug(whoAmI, line);
};

const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const arrayParser = $.import("sap.ino.xs.xslib", "csvParser");

const iter = $.import("sap.ino.xs.xslib", "iterable");

// RFC 4180 compliant csv parser

/**
 * Reads a string and produces an iterable
 * that produces the rows of the input CSV as arrays.
 * 
 * @param {string} input
 * @param {string} separator 1 character to act as a separator, typically "," or ";"
 * @returns {Iterator}
 */
function parseString(input, separator) {
    separator = separator || ",";
    separator = separator.toString();

    if (separator.length > 1) {
        throw new Error("separator must not exceed 1 character");
    }
    if ("\r\n\"".indexOf(separator) !== -1) {
        throw new Error("unsupported separator: " + separator);
    }

    var value;        // the iterator output value
    var valueReady = false; // indicator if next value is ready
    var row    = [];  // current output row
    var field  = "";  // current parsed field

    function flushField() {
        row.push(field);
        field = "";
    }

    function flushFieldAndRow() {
        flushField();
        value = row;
        valueReady = true;
        row = [];
    }

    function stateContent(c) {
        switch (c) {
        case separator: flushField(c);      return stateBeforeField;
        case "\r":      flushFieldAndRow(); return stateCarriageReturn;
        case "\n":      flushFieldAndRow(); return stateLineFeed;
        default:        field += c;         return stateContent;
        }
    }

    function stateQuotedContent(c) {
        switch (c) {
        case "\"":            return statePotentialEscape;
        default:  field += c; return stateQuotedContent;
        }
    }

    function statePotentialEscape(c) {
        switch (c) {
        case "\"":      field += "\"";      return stateQuotedContent;
        case separator: flushField();       return stateBeforeField;
        case "\r":      flushFieldAndRow(); return stateCarriageReturn;
        case "\n":      flushFieldAndRow(); return stateLineFeed;
        // The default is an edge case which is not clearly defined in RFC 4180.
        // This is our best guess.
        default:                            return stateContent(c);
        }
    }

    function stateBeforeField(c) {
        field = "";
        switch (c) {
        case separator: flushField();       return stateBeforeField;
        case "\r":      flushFieldAndRow(); return stateCarriageReturn;
        case "\n":      flushFieldAndRow(); return stateLineFeed;
        case "\"":                          return stateQuotedContent;
        default:                            return stateContent(c);
        }
    }

    function stateStartRow(c) {
        // needed as a separate state because of different handling
        // after parsing has finished
        return stateBeforeField(c);
    }

    function stateCarriageReturn(c) {
        switch(c) {
        case "\n": return stateLineFeed;
        default:   return stateStartRow(c);
        }
    }

    function stateLineFeed(c) {
        // Needed just to have a different state as startRow.
        // This has a different behaviour if the last character is parsed
        return stateStartRow(c);
    }

    var state = stateStartRow;
    var i = 0;

    const result = new iter.Iterator();
    result.next = function () {
        valueReady = false;
        while (i < input.length && !valueReady) {
            state = state(input[i++]);
        }
        if (valueReady) {
            return true;
        }
        
        if (i++ === input.length &&
            state !== stateStartRow && state !== stateCarriageReturn && state !== stateLineFeed) {
            flushFieldAndRow();
            return true;
        }
        return false;
    };
    result.value = function() {
        return value;
    };
    
    return result;
}

this.inferMap = arrayParser.inferMap;

/**
 * Processes an iterable that provides arrays to an iterator
 * that produces objects.
 *
 * @param {iterable} input
 * @param {array} map - contains the desired object attributes
 *                      each row describes the desired attribute for the
 *                      column of the corresponding index
 * @returns {Iterator} result - Iterator that will produce objects
 */
function mapArraysToObjects(iterable, map) {
    return iter.map(iterable,
        function (aInput) {
            var oResult = {};
            for (var col = 0; col < map.length; ++col) {
                if (map[col] !== null) {
                    oResult[map[col]] = aInput[col];
                }
            }
            return oResult;
        });
}

/**
 * Processes an iterable that provides objects to an iterator
 * that produces arrays.
 *
 * @param {iterable} input
 * @param {array} map - contains the desired object attributes
 *                      each row describes the desired attribute for the
 *                      column of the corresponding index
 * @returns {Iterator} result - Iterator that will produce arrays
 */
function mapObjectsToArrays(iterable, map) {
    return iter.map(iterable, 
        function (oInput) {
            var aResult = [];
            for (var col = 0; col < map.length; ++col) {
                aResult[col] = oInput[map[col]];
            }
            return aResult;
        });
}
