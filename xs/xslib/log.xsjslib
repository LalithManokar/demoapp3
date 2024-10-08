const trace = $.import("sap.ino.xs.xslib", "trace");

function log(message) {
    trace.trace(message.severity, 
                "sap.ino.xs.xslib.log",
                "["+ $.session.getInvocationCount() +"] "+
                JSON.stringify(message));
    return message;
}