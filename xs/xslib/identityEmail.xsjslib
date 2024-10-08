const Message = $.import("sap.ino.xs.aof.lib","message");
const TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
const Mail = $.import("sap.ino.xs.xslib", "mail");
const SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

function sendIdentityMail(oHQ, oMail) {
    
    var sContent = "<html><body>" + oMail.CONTENT + "</html></body>";
    
    try {
        Mail.send(oMail.EMAILADDR, oMail.SUBJECT, sContent);
        oHQ.procedure("SAP_INO", "sap.ino.db.iam::p_identity_email_time_update").execute([{ID: oMail.ID}]);
    } catch(e) {
       // oSentFeeds.IV_STATUS = 'ERROR';
    } 

    oHQ.getConnection().commit();
}

function execute(oHQ, oConn) {
    Message.createMessage(Message.MessageSeverity.Info, "MSG_BATCH_MAIL_STARTED");

    try {
        //load Identity Mails that shall be sent
        var sSelectMail = 'select * from "sap.ino.db.iam::t_identity_mail" where mail_sent_at is null';
        var aMails = oHQ.statement(sSelectMail).execute();
    
        _.each(aMails, function(oMail) {
            var sSelectAddr = 'select email from "sap.ino.db.iam::t_identity" where id = ?';
			var result = oHQ.statement(sSelectAddr).execute(oMail.TO_IDENTITY);
			if (result && result.length > 0) {
				if (result[0].ERASED === 1) {
					oHQ.procedure("SAP_INO", "sap.ino.db.iam::p_identity_email_time_update").execute([{
						ID: oMail.ID
					}]);
				} else {
					var sEmailAddr = result[0].EMAIL;
                    oMail.EMAILADDR = sEmailAddr;
                    oMail.CONTENT = oMail.CONTENT.replace(/http(s)?:\/\/[^\s|<]*/igm,'<a href="$&">$&</a>').replace(/\n/g , '<br/>').replace(/\t/g , '&emsp;');
                    
                    sendIdentityMail(oHQ, oMail);
				}
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