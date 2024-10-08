var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

// RFC 4180 compliant csv parser
function parse(input, separator) {
    separator = separator || ',';
    separator = separator.toString();

    if (separator.length > 1) {
        throw new Error('separator must not exceed 1 character');
    }
    if ('"\r\n'.indexOf(separator) != -1) {
        throw new Error('unsupported separator: ' + separator);
    }

    var result = []; // final result
    var row    = []; // current output row
    var field  = ''; // current parsed field

    function flushField() {
        row.push(field);
        field = '';
    }

    function flushFieldAndRow(state) {
        flushField();
        result.push(row);
        row = [];
    }

    function stateContent(c) {
        switch (c) {
        case separator: flushField(c);      return stateBeforeField;
        case '\r':      flushFieldAndRow(); return stateCarriageReturn;
        case '\n':      flushFieldAndRow(); return stateLineFeed;
        default:        field += c;         return stateContent;
        }
    }

    function stateQuotedContent(c) {
        switch (c) {
        case '"':             return statePotentialEscape;
        default:  field += c; return stateQuotedContent;
        }
    }

    function statePotentialEscape(c) {
        switch (c) {
        case '"':       field += '"';       return stateQuotedContent;
        case separator: flushField();       return stateBeforeField;
        case '\r':      flushFieldAndRow(); return stateCarriageReturn;
        case '\n':      flushFieldAndRow(); return stateLineFeed;
        // The default is an edge case which is not clearly defined in RFC 4180.
        // This is our best guess.
        default:                            return stateContent(c);
        }
    }

    function stateBeforeField(c) {
        field = '';
        switch (c) {
        case separator: flushField();       return stateBeforeField;
        case '\r':      flushFieldAndRow(); return stateCarriageReturn;
        case '\n':      flushFieldAndRow(); return stateLineFeed;
        case '"':                           return stateQuotedContent;
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
        case '\n': return stateLineFeed;
        default:   return stateStartRow(c);
        }
    }

    function stateLineFeed(c) {
        // Needed just to have a different state as startRow.
        // This has a different behaviour if the last character is parsed
        return stateStartRow(c);
    }

    var i=0;
    var state = stateStartRow;
    while(i < input.length) {
        state = state(input[i++]);
    }

    if (state != stateStartRow && state != stateCarriageReturn && state != stateLineFeed) {
        flushFieldAndRow();
    }

    return result;
}

// RFC 4180 compliant CSV generator
function generate(input, separator) {
    separator = separator || ',';
    separator = separator.toString();

    if (separator.length > 1) {
        throw new Error('separator must not exceed 1 character');
    }
    if ('"\r\n'.indexOf(separator) != -1) {
        throw new Error('unsupported separator: ' + separator);
    }
    
    var newline = '\n';
    
    var result = '';
    for (var row=0; row<input.length; ++row) {
        var currentRow = input[row];
        var currentRowFields = [];
        for (var col=0; col<currentRow.length; ++col) {
            var currentColValue = currentRow[col];
            if (currentColValue === undefined || currentColValue === null) {
                // Do not check for "falsy" values as 0 will be considered falsy!
                currentColValue = "";
            }

            currentRowFields.push('"'+currentColValue.toString().split('"').join('""')+'"');
        }
        result+= currentRowFields.join(separator)+newline;
    }
    
    return result;
}

// utility functions

// take first line of an array and match it to a column map
function inferMap(firstRow, defaultMap) {
    // default result if first row does not match the desired columns
    var result = {isFirstRowMap: false,
                  map          : defaultMap};
    
    var resultMap = [];
    
    if (firstRow !== undefined) {
        var columnByName = {};
        var col;
        for (col=0; col < defaultMap.length; ++col) {
            columnByName[defaultMap[col]] = null;
        }
        
        var mappedColumns = 0;
        for (col=0; col < firstRow.length; ++col) {
            var candidateColumnName = firstRow[col];
            if (columnByName.hasOwnProperty(candidateColumnName) &&
                columnByName[candidateColumnName] === null) {
                
                // detected mappable column
                resultMap.push(candidateColumnName);
                ++mappedColumns;
                
            } else
            if (columnByName[candidateColumnName] === undefined) {
                // detected not mappable column
                resultMap.push(null);

            } else {
                // detected duplicate column
                mappedColumns = null;
                break;
            }
        }
        
        if (mappedColumns === defaultMap.length){
            result.map           = resultMap;
            result.isFirstRowMap = true;
        }
    }

    return result;
}

// take *header* line of an array and match it to a map
// needed e.g. in configuration import
function inferHeaderMap(input, allColumns) {
    var resultMap = [];

    var firstRow = input[0];
    if (firstRow !== undefined) {
        var columnByName = {};
        var col;
        for (col = 0; col < allColumns.length; ++col) {
            columnByName[allColumns[col]] = null;
        }

        for (col = 0; col < firstRow.length; ++col) {
            var candidateColumnName = firstRow[col];
            if (columnByName.hasOwnProperty(candidateColumnName) && columnByName[candidateColumnName] === null) {
                // detected mappable column
                resultMap.push(candidateColumnName);
            } else if (columnByName[candidateColumnName] === undefined) {
                // detected not mappable column
                resultMap.push(null);
            } else {
                // detected duplicate column
                break;
            }
        }
    }

    return (_.without(resultMap, null).length === 0) ? undefined : resultMap;
}

// map is an array that contains the desired object attributes per column
function nestedArrayToObjectArray(input, map) {
    var result = [];
    
    for (var row=0; row<input.length; ++row) {
        var currentRow = input[row];
        var currentObject = {};
        for (var col=0; col<map.length; ++col) {
            if (map[col] !== null) {
                currentObject[map[col]] = currentRow[col];
            }
        }
        result.push(currentObject);
    }
    return result;
}

// map is an array that contains the desired object attributes per column
function objectArrayToNestedArray(input, map) {
    var result = [];

    for (var row=0; row<input.length; ++row) {
        var currentRow = input[row];
        var currentObject = [];
        for (var col=0; col<map.length; ++col) {
            currentObject[col] = currentRow[map[col]];
        }
        result.push(currentObject);
    }
    return result;
}
