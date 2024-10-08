const HQ = $.import("sap.ino.xs.xslib", "hQuery");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
const configuration = $.import("sap.ino.xs.aof.config", "activation");
var msg = $.import("sap.ino.xs.aof.lib", "message");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_independent.97_setup_activate_configuration.xsjslib';
function error(line) { trace.error(whoAmI, line); }
function info(line) { trace.info(whoAmI, line); }

function check(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
    
    var aResult = oHQ.statement('SELECT * FROM "sap.ino.db.config::v_config_content_package"').execute();
    if(!aResult || aResult.length <= 0){
        error('Please init customization config package.');
        return false;
    }
    
    const oSecondaryConnection = dbConnection.getSecondaryConnection();
    const o2ndHQ = HQ.hQuery(oSecondaryConnection);
    var msgBuf = msg.createMessageBuffer();
    configuration.getFullScope(msgBuf, oHQ);

    if (msgBuf.getMinSeverity() <= msg.MessageSeverity.Error) {
        var aMessages = msgBuf.getMessages();
        _.each(aMessages, function(oMessage) {
            if (oMessage.severity <= msg.MessageSeverity.Error) {
                error(msg.getMessageText(oMessage, o2ndHQ));
            }
        });
        return false;
    } else {
        info('Configuration Activation possible.');
        return true;
    }
}

function run(oConnection, oLibraryMeta) {
    const oHQ = HQ.hQuery(oConnection);
    const oSecondaryConnection = dbConnection.getSecondaryConnection();
    const o2ndHQ = HQ.hQuery(oSecondaryConnection);

    var msgBuf = msg.createMessageBuffer();

    try {

        configuration.fullActivation(msgBuf, oHQ);

        var aMessages = msgBuf.getMessages();
        if (msgBuf.getMinSeverity() <= msg.MessageSeverity.Error) {
            configuration.writeActivationHistory("FAILURE", o2ndHQ);
            _.each(aMessages, function(oMessage) {
                if (oMessage.severity <= msg.MessageSeverity.Error) {
                    error(msg.getMessageText(oMessage, o2ndHQ));
                }
            });
            return false;
        } else {
            configuration.writeActivationHistory("SUCCESS", o2ndHQ);
            var aMessageText = msg.getMessageArrayText(aMessages, o2ndHQ);
            for (var ii = 0; ii < aMessageText.length; ++ii) {
                info(aMessageText[ii]);
            }
            return true;
        }
    } catch (err) {

        configuration.writeActivationHistory("FAILURE", o2ndHQ);

        var sBody;
        if (err instanceof msg.CancelProcessingException) {
            var aMessages = msgBuf.getMessages();
            var aMessageText = msg.getMessageArrayText(aMessages, o2ndHQ);
            for (var ii = 0; ii < aMessageText.length; ++ii) {
                error(aMessageText[ii]);
            }
        } else {
            error(JSON.stringify(err));
        }

        throw err;
        return false;
    }
}

function clean(oConnection) {
    //nothing to do
    return true;
}