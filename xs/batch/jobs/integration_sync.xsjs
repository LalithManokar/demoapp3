const message = $.import("sap.ino.xs.aof.lib", "message");
const integrationSync = $.import("sap.ino.xs.xslib.integration", "integrationSync");

function execute() {
    integrationSync.execute();
}
