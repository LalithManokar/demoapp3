const textbundle = $.import("sap.ino.xs.xslib", "textBundle");
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const message = $.import("sap.ino.xs.aof.lib", "message");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var whoAmI = 'sap.ino.xs.xslib.mail.xsjs';

function send(sEmailAddress, sSubjectTemplate, sBodyTemplate, aTemplateParameter, aImages) {
    try {
        var sBody = "";
        var sSubject = "";

        if(aTemplateParameter !== undefined) {
            sBody    = textbundle.substitutePlaceholders(sBodyTemplate, aTemplateParameter);
            sSubject = textbundle.substitutePlaceholders(sSubjectTemplate, aTemplateParameter);
        } else {
            sBody = sBodyTemplate;
            sSubject = sSubjectTemplate;
        }

        message.createMessage(
            message.MessageSeverity.Info,
            "MSG_MAIL_SEND",
            undefined, undefined, undefined,
            sEmailAddress,
            sSubject);

        var sSender = systemSettings.getIniValue("email_sender");

        var mail = new $.net.Mail({
            sender: sSender,
            to: [sEmailAddress],
            subject: sSubject,
            subjectEncoding: "UTF-8",
            parts: [ new $.net.Mail.Part({
                type: $.net.Mail.Part.TYPE_TEXT,
                text: sBody,
                contentType: "text/html",
                encoding: "UTF-8"
            })]
        });

        _.each(aImages, function(oImage) {
            if(oImage.DATA === undefined || oImage.DATA === null) {
                return;
            }
            var sFileName = oImage.FILE_NAME;
            if (sFileName.indexOf(".") === -1) {
                sFileName = sFileName + "." + oImage.MEDIA_TYPE.split("/")[1];
            }
            
            if(_.contains([Array, String, ArrayBuffer], oImage.DATA.constructor)) {
                mail.parts.push(
                    new $.net.Mail.Part({
                        type: $.net.Mail.Part.TYPE_INLINE,
                        data: oImage.DATA,
                        contentType: oImage.MEDIA_TYPE,
                        contentId: oImage.CID,
                        fileName: sFileName,
                        fileNameEncoding: "UTF-8"
                    })
                );
            }
        });

        return mail.send();
    } catch (e) {
        message.createMessage(
            message.MessageSeverity.Error,
            "MSG_MAIL_SEND_FAIL",
            undefined, undefined, undefined,
            sEmailAddress,
            e.toString());
            
	    TraceWrapper.fatal("EMAIL:"+sEmailAddress+"--\r\nsSubject:"+sSubject+"--\r\nsBody:"+sBody);
	    TraceWrapper.log_exception(e);
        throw e;
    }
}