const Message = $.import("sap.ino.xs.aof.lib","message");
const TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
const SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var getNewRegistrations = _.memoize(function(oHQ) {
    var sStatement =
            "select distinct registration.id as register_id " +
            "from \"sap.ino.db.campaign::t_registration\" as registration " +
            "inner join \"sap.ino.db.campaign::t_campaign\" as campaign on registration.CAMPAIGN_ID = campaign.ID " +
            "where registration.status = 'sap.ino.config.REGISTER_NEW' and campaign.is_register_auto_approve = 1";

    var aRegistration = oHQ.statement(sStatement).execute();
    if(aRegistration.length === 0) {
        return {};
    }
    
    return aRegistration;
}, function(oHQ) {
    
});

function approve (oHQ, oConn) {
    Message.createMessage(Message.MessageSeverity.Info, "MSG_BATCH_MAIL_STARTED");
    try {
        //get participants that shall be added
        var aRegistration = getNewRegistrations(oHQ);
        var oRegistration = AOF.getApplicationObject("sap.ino.xs.object.campaign.Registration");

        _.each(aRegistration, function(oRegister) {
            if (oRegister.REGISTER_ID) {
                oRegistration.update({
                    ID : oRegister.REGISTER_ID,
                    STATUS: 'sap.ino.config.REGISTER_APPROVED'
                }); 
            }
            
        });
        
        oConn.commit();
    } catch (e) {
        Message.createMessage(
                Message.MessageSeverity.Error, 
                "MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY",
                undefined, undefined, undefined, e.toString());
        oConn.rollback();
        throw e;
    }
}