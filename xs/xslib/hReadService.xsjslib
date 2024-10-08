const hq           = $.import("sap.ino.xs.xslib", "hQuery").hQuery;
const trace        = $.import("sap.ino.xs.xslib", "trace");
const traceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");

const whoAmI = 'sap.ino.xs.xslib.hReadService';
function fatal(line) { trace.fatal(whoAmI, line); }
function error(line) { trace.error(whoAmI, line); }
function debug(line) { trace.debug(whoAmI, line); }


function mapOutputParameters(outputParameterMap, result) {
    if (outputParameterMap) {
        var mappedResult = {};

        var parameter = "";
        var tableName;
        var scalarName;
        for (parameter in outputParameterMap) {
            tableName = outputParameterMap[parameter].tableName;
            if (tableName) {
                mappedResult[parameter] = result[tableName];
            }
            scalarName = outputParameterMap[parameter].scalarName;
            if (scalarName) {
                mappedResult[parameter] = result[scalarName];
            }
        }
        return mappedResult;
    } else {
        // no mapping --> just return the result
        // this execution path is mostly relevant for procedures without any results
        return result;
    }
}

function mapInputParameters(inputParameterMap, parameters) {
    var result = {};
    
    // Preset Parameters "empty" in order to ensure that
    // all parameters will be present. This is required
    // because hQuery will not set missing parameters which
    // in turn will make the stored procedures fail.
    var parameter = "";
    var tableName;
    var scalarName;
    for (parameter in inputParameterMap) {
        tableName = inputParameterMap[parameter].tableName;
        if (tableName) {
            result[tableName] = [];
        }
        scalarName = inputParameterMap[parameter].scalarName;
        if (scalarName) {
            if ("defaultValue" in inputParameterMap[parameter]) {
                result[scalarName] = inputParameterMap[parameter].defaultValue; 
            } else {
                result[scalarName] = "";
            }
        }
    }
    
    if (parameters) {
        var nameValuePair = {};
        var value = {};
        var index = "";
        var mapping = {};
        for (index in parameters) {
            nameValuePair = parameters[index];
            if (inputParameterMap.hasOwnProperty(nameValuePair.name)) {
                mapping = inputParameterMap[nameValuePair.name];
                if (mapping.hasOwnProperty("tableName")) {
                    value = {};
                    value[mapping.columnName] = nameValuePair.value;
                    result[mapping.tableName].push(value);
                } else if (mapping.hasOwnProperty("scalarName")) {
                    result[mapping.scalarName] = nameValuePair.value;
                } else {
                    error("Configuration Error for " + nameValuePair.name);
                }
            }
        }
    }
    
    return result;
}

function readTraceParameter(parameters) {
    if (parameters) {
        var nameValuePair = {};
        var index = "";
        for (index in parameters) {
            nameValuePair = parameters[index];
            if (nameValuePair.name == '$trace') {
                return nameValuePair.value;
            }
        }
    }
    return undefined;
}

function handleRequest(configuration, request, response) {
    const requestConfiguration = configuration[request.method];
    
    const inputParameters = mapInputParameters(requestConfiguration.inputParameterMap, request.parameters);
    debug("handleRequest in: " + JSON.stringify(inputParameters));

    const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
    const procedure = hq(conn).setSchema("SAP_INO_EXT").procedure(requestConfiguration.procedureName);

    const result = procedure.execute(inputParameters);
    const mappedResult = mapOutputParameters(requestConfiguration.outputParameterMap, result);

    if (readTraceParameter(request.parameters)) {
        mappedResult.$trace = traceWrapper.has_debug_authorization()? $.sap.ino.xs.xslib.hQuery.getTrace()
                                                                    : 'MISSING DEBUG PRIVILEGE';
    }

    response.contentType = "application/json";
    response.setBody(JSON.stringify(mappedResult));
    response.status = $.net.http.OK;

    
    return mappedResult;
}

function process(configuration, request, response,outputArray) {
   outputArray =  traceWrapper.wrap_request_handler(
        function() {
            return  handleRequest(configuration, request, response); 
        }
    );
    return outputArray;
}