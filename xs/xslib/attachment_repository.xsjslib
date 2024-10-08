var HQ             = $.import("sap.ino.xs.xslib", "hQuery");
var Util           = $.import("sap.ino.xs.aof.config", "util");
var AttachmentUtil = $.import("sap.ino.xs.object.attachment", "AttachmentUtil");
var Message        = $.import("sap.ino.xs.aof.lib", "message");
var Repo           = $.import("sap.ino.xsdc.xslib", "repo");
var DBConnection   = $.import("sap.ino.xs.xslib", "dbConnection");
var _              = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

function prepareAttachment(oEntity) {
    var sFileName = oEntity.headers.get("~content_filename");
    sFileName = _.stripFilename(_.stripTags(sFileName));
    if(sFileName)
    {
        sFileName = sFileName.substring(sFileName.lastIndexOf("\\") + 1 );
    }
    var content = oEntity.body;
    if(content === undefined || content === null) {
        return undefined;
    }

    var oFile = {
        content: content.asArrayBuffer(),
        filename: sFileName,
        isBinary: true
    };
    
    oFile.size = oFile.content ? oFile.content.byteLength : 0;
    
    var p = oFile.filename.lastIndexOf(".");
    oFile.type = oFile.filename.substring(p + 1);
    oFile.name = oFile.filename.substring(0, p);
    
    return oFile;
}

function checkPackage(oFile, oDBConnection, addMessage) {
    if (!Repo.packageExistsSQLCC(oFile.package, oDBConnection)) {
        addMessage(Message.MessageSeverity.Error, "MSG_ATTACHMENT_PACKAGE_DOES_NOT_EXIST", oFile.package, "Root", "DATA", oFile.package);
        return;
    }
    if (!Repo.hasPackageReadAuthorizationSQLCC(oFile.package, oDBConnection)) {
        addMessage(Message.MessageSeverity.Error, "MSG_ATTACHMENT_USER_NOT_AUTHORIZED", oFile.package, "Root", "DATA", oFile.package);
        return;
    }
    if(Repo.fileExistsSQLCC(oFile.package, oFile.name, oFile.type, oDBConnection)) {
        addMessage(Message.MessageSeverity.Error, "MSG_ATTACHMENT_FILE_EXISTS", oFile.filename, "Root", "DATA", oFile.filename);
        return;
    }
}

function checkDeleteAllowed(oFile, oHQ, oDBConnection, addMessage) {
    var sFileExtSelect = "select package_id from \"sap.ino.db.attachment.ext::v_ext_repository_attachment\" where file_name = ? and media_type like ?";
    var aResult = oHQ.statement(sFileExtSelect).execute(oFile.name, oFile.mediatype);
    
    if (aResult && aResult.length > 0) {
        oFile.package = aResult[0].PACKAGE_ID;
    } else {
        addMessage(Message.MessageSeverity.Error, "MSG_ATTACHMENT_REPOSITORY_FILE_NOT_FOUND", oFile.name, "Root", "DATA", oFile.name);
        return;
    }

    var sConfigPackage = Util.getConfigPackage(oHQ).PACKAGE_ID;
    if (sConfigPackage === undefined || sConfigPackage === null || oFile.package !== (sConfigPackage + ".attachment")) {
        addMessage(Message.MessageSeverity.Error, "MSG_ATTACHMENT_REPOSITORY_DELETE_NOT_ALLOWED", oFile.package, "Root", "DATA", oFile.package);
        return;
    }
    if (!Repo.hasPackageReadAuthorizationSQLCC(oFile.package, oDBConnection)) {
        addMessage(Message.MessageSeverity.Error, "MSG_ATTACHMENT_REPOSITORY_USER_NOT_AUTHORIZED", oFile.package, "Root", "DATA", oFile.package);
    }

    return oFile;
}

function storeFile(oFile, oDBConnection, addMessage) {
    try {
        Repo.upsertFilesSQLCC([oFile], oDBConnection);
    } catch(oException) {
        addMessage(Message.MessageSeverity.Fatal, "MSG_ATTACHMENT_REPOSITORY_SAVE_FAILED", oFile.filename, "Root", "DATA", (oException || "").toString());
    }
}

function deleteFile(oFile, oDBConnection, addMessage) {
    try {
        Repo.deleteFileSQLCC(oFile.package, oFile.name, oFile.type, oDBConnection);
    } catch(oException) {
        addMessage(Message.MessageSeverity.Fatal, "MSG_ATTACHMENT_REPOSITORY_DELETE_FAILED", oFile.filename, "Root", "DATA", (oException || "").toString());
    }
}

function storeAttachment(aEntities) {
    if (aEntities && aEntities.length > 0) {
        var oMessageBuffer = Message.createMessageBuffer();

        var oConn = DBConnection.getConnection();
        var oHQ = HQ.hQuery(oConn);
        var oDBConnection = DBConnection.getDeprecatedConnection($.db.isolation.SERIALIZABLE, true);

        var oEntity = aEntities[0];
        var oFile = prepareAttachment(oEntity);
        
        if(oFile === undefined) {
            oMessageBuffer.addMessage(Message.MessageSeverity.Error, "MSG_ATTACHMENT_FILE_NOT_FOUND_IN_REQUEST", "", "Root", "DATA", "");
        }

        if(!oMessageBuffer.hasMessages()) {
            oFile.package = Util.getConfigPackage(oHQ).PACKAGE_ID;
            if(oFile.package === undefined) {
                oMessageBuffer.addMessage(Message.MessageSeverity.Error, "MSG_ATTACHMENT_CUSTOM_PACKAGE_NOT_MAINTAINED", "", "Root", "DATA", "");
            }
        }
        
        if(!oMessageBuffer.hasMessages()) {
            oFile.package = oFile.package + ".attachment";
            checkPackage(oFile, oDBConnection, oMessageBuffer.addMessage);
        }

        if(!oMessageBuffer.hasMessages()) {
            AttachmentUtil.determineFileSize(oFile.filename, oFile, oFile.content, "create", oMessageBuffer.addMessage);
        }
        if(!oMessageBuffer.hasMessages()) {
            AttachmentUtil.determineMediaType(oFile.filename, oFile, oFile.content, oFile.filename, oMessageBuffer.addMessage, oHQ, true);
        }
        if(!oMessageBuffer.hasMessages()) {
            AttachmentUtil.antiVirusCheck(oFile.filename, oFile.content, oFile.filename, oMessageBuffer.addMessage);
        }
        if(!oMessageBuffer.hasMessages()) {
            oDBConnection.setAutoCommit(false);
            storeFile(oFile, oDBConnection, oMessageBuffer.addMessage);
            oDBConnection.commit();
        }

        oDBConnection.close();

        return {
            FILE_NAME : oFile.name,
            MEDIA_TYPE : oFile.media_type,
            GENERATED_IDS : {"-1" : 0},
            PATH: oFile.package,
            MESSAGES : Message.mapMessagesToResult(oMessageBuffer.getMessages()),
            ERROR : oMessageBuffer.hasMessages()
        };
    }
}

function deleteAttachment(sFilename, sMediaType) {
    var oMessageBuffer = Message.createMessageBuffer();

    if(sFilename === undefined || sFilename === null) {
        oMessageBuffer.addMessage(Message.MessageSeverity.Fatal, "MSG_ATTACHMENT_REPOSITORY_FILENAME_MISSING", "", "Root", "DATA", "");
        return {
            MESSAGES : Message.mapMessagesToResult(oMessageBuffer.getMessages())
        };
    }
    if(sMediaType === undefined || sMediaType === null) {
        oMessageBuffer.addMessage(Message.MessageSeverity.Fatal, "MSG_ATTACHMENT_REPOSITORY_MEDIATYPE_MISSING", "", "Root", "DATA", "");
        return {
            MESSAGES : Message.mapMessagesToResult(oMessageBuffer.getMessages())
        };
    }

    var oConn = DBConnection.getConnection();
    var oHQ = HQ.hQuery(oConn);
    var oDBConnection = DBConnection.getDeprecatedConnection($.db.isolation.SERIALIZABLE, true);
    
    var oFile = {
        name: sFilename,
        mediatype: sMediaType,
        type: sMediaType.split("/")[1]
    };
    
    if(!oMessageBuffer.hasMessages()) {
        oFile = checkDeleteAllowed(oFile, oHQ, oDBConnection, oMessageBuffer.addMessage);
    }
    
    if(!oMessageBuffer.hasMessages()) {
        oDBConnection.setAutoCommit(false);
        deleteFile(oFile, oDBConnection, oMessageBuffer.addMessage);
        oDBConnection.commit();
    }
    
    return {
        MESSAGES : Message.mapMessagesToResult(oMessageBuffer.getMessages())
    };
}

function readAttachment(sPackage, sName, sType, oHQ) {
    if(!oHQ) {
        var oConn = DBConnection.getConnection();
        oHQ = HQ.hQuery(oConn);
    }
    //we do not need the mime type, but the suffix
    if(sType.search("/") > -1) {
        sType = sType.split("/")[1];
    }

    var oDBConnection = DBConnection.getDeprecatedConnection($.db.isolation.SERIALIZABLE, true);
    if (!Repo.hasPackageReadAuthorizationSQLCC(sPackage, oDBConnection)) {
        oDBConnection.close();
        throw "unauthorized";
    }

    var oBinaryData = Repo.readImageSQLCC(sPackage, sName, sType, oDBConnection);
    oDBConnection.close();
    
    return oBinaryData;
}