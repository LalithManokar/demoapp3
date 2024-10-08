const trace = $.import("sap.ino.xs.xslib", "trace");
const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

const whoAmI = 'sap.ino.xs.xslib.traceWrapper';

function fatal(line) {
	trace.fatal(whoAmI, line);
}

function debug(line) {
	trace.debug(whoAmI, line);
}

$.import("sap.ino.xs.xslib", "exceptions");
const ClientException = $.sap.ino.xs.xslib.exceptions.ClientException;

function filter_dberr_info(ex) {
	if (ex.code && ex.message) {
		var aString = ex.message.split(ex.code);
		return aString[aString.length - 1].replace(/^\W+/, "");
	}
	return ex.toString();
}

function stringify_exception(ex) {
	var eString = "";
	if (ex.constructor === Array) {
		_.each(ex, function(ex_it) {
			eString += "Exception:\n" + filter_dberr_info(ex_it) + "\n";
		});
	} else {
		eString = "Exception:\n" + filter_dberr_info(ex) + "\n";
	}

	var prop = "";
	for (prop in ex) {
		if (['fileName', 'lineNumber', 'stack'].indexOf(prop) < 0) {
			eString += prop + ": " + ex[prop] + "\n";
		}
	}
	if (ex.stack !== undefined) {
		eString += '\nException.stack.toString():\n';
		eString += ex.stack.toString();
	}
	return eString;
}

function log_exception(ex) {
	fatal(stringify_exception(ex));
}

function has_debug_authorization() {
	var conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	var aDebug = conn.executeQuery('select * from "sap.ino.db.iam.ext::v_ext_has_debug_privilege"');
	return aDebug && aDebug.length > 0;
}

function wrap_request_handler(request_handler) {
	// This will wrap a request handler for tracing.

	// It is assumed that the request handler is "basically parameterless".
	// If parameters are needed a suitable closure must be used.

	// Unfortunately this is not completely trivial. The issue is that
	// results of a request are usually delivered as a side effect.
	// during tracing the result shall be returned by the request
	// handler instead.
	// In order to achieve this the wrapper will pass the debug flag
	// as the first argument to the request handler. The contract
	// is that the request handler must NOT set the HTTP response if the
	// trace flag is set to true. In this case it must return
	// its response in a string in "developer readable form". 
	// The trace wrapper will then write this into the log AND provide
	// a suitable http $.response.
	// If the flag is set to false the handler is assumed to take
	// complete control of the http $.response.

	// Determine if trace should be activated by looking at the suffix of the caller URL,
	// that is by testing if its path ends with "trace"
	// For example 
	//    http://whatever.com/whatever_path/trace?foo=bar
	// would be always traced.
	var queryPath = $.request.queryPath;
	var splitPath = queryPath.split("/");
	var pathTail = splitPath.pop();
	var traceActive = (pathTail.indexOf("trace") === 0);

	if (traceActive) {
		if (has_debug_authorization()) {
			var mode = $.request.queryPath["trace".length];
			if ("fewid".indexOf(mode) < 0) {
				mode = "d";
			}
			trace.setTransientMode(mode);
		} else {
			// not authorized
			$.response.status = $.net.http.UNAUTHORIZED;
			return null;
		}
	}

	var result = null;
	var start;

	try {
		start = parseInt(new Date().getTime(), 10);

		// call the request handler
		result = request_handler(traceActive);

		if (!traceActive) {
			// Do nothing as the request handler has already
			// handled the request.
			return result;
		}

		// trace active --> write the result into the log
		debug('result: ' + JSON.stringify(result));

	} catch (e) {
		log_exception(e);

		if (e instanceof ClientException) {
			$.response.status = $.net.http.BAD_REQUEST;
			$.response.contentType = "plain/text";
			$.response.setBody(e.toString());
			return result;
		}  
		
		if (e.code && e.code === 258 && !traceActive) {
			$.response.status = $.net.http.UNAUTHORIZED;
			$.response.contentType = "plain/text";
			$.response.setBody('');
			return result;
		} 

		if (!traceActive) {
			$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
			$.response.contentType = "plain/text";
			$.response.setBody("Exception occurred, please kindly contact administrator to find more detail");
			return result;
		}
	}

	if (traceActive) {
		var cookies = "Cookies: " + JSON.stringify($.request.cookies) + "\n\n";
		var current = parseInt(new Date().getTime(), 10);
		var elapsed = "Total Execution Time: " + (current - start) + ' ms\n\n';
		debug('result: ' + elapsed + cookies + trace.getTransientTrace() +
			'\n' + JSON.stringify($.sap.ino.xs.xslib.hQuery.getTrace()));
		
		$.response.contentType = "text/plain";
		$.response.status = $.net.http.OK;
		$.response.setBody("Please kindly contact administrator to find more detail");
		return result;
	}

	// Last resort error handling, 
	// this should never be reached.
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.contentType = "plain/text";
	$.response.setBody("corrupted trace handler");
	return result;
}