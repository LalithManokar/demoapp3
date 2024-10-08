var traceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var trace = $.import("sap.ino.xs.xslib", "trace");

var whoAmI = "sap.ino.xs.rest.admin.upload.dispatcher";
var debug = function debug(line) {
    trace.debug(whoAmI, line);
};

function dispatch(functionPath) {
    traceWrapper.wrap_request_handler(function(traceActive) {
        var request  = $.request;
        var response = $.response;
        var http     = $.net.http;

        function setResponse(status, contentType, body) {
            response.status = status;
            response.contentType = contentType;
            response.setBody(body);
            return body;
        }

        // determine the function that shall be processed
        debug('going to call ' + functionPath);
        var pathComponents = functionPath.split('.');
        var functionName = pathComponents.pop();
        var libraryName  = pathComponents.pop();

        const library = $.import(pathComponents.join('.'), libraryName);
        var process = library[functionName];

        // http specific stuff
        switch (request.method) {
            case $.net.http.PUT:
            case $.net.http.POST:
                response.cacheControl = "max-age";
                response.headers.set("Last-Modified", "Mon, 01 Jan 1979 00:00:00 GMT");
                response.headers.set('Content-Disposition',
                                     'Content-Disposition: attachment; filename="result.csv"');
                response.headers.set("repo-filename", "result");
                var bodyAsString = request.body? request.body.asString(): "";

                // execute the requested function
                debug('call ' + libraryName + '.' + functionName);


                var sResponse = setResponse(http.OK, "text/csv", process(bodyAsString));
                $.import("sap.ino.xs.aof.core", "framework").getTransaction().commit();
                return sResponse;

            default:
                return setResponse(http.METHOD_NOT_ALLOWED, "plain/text", "Unsupported method");
            }
    });
}
