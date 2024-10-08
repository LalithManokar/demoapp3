$.import("sap.ino.xs.xslib", "traceWrapper")

.wrap_request_handler(function() {
    const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
    const hq = $.import("sap.ino.xs.xslib", "hQuery").hQuery(conn);
    const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
    const mail = $.import("sap.ino.xs.xslib", "mail");
    
    const sMailServerSelect = 
        "select top 1 ic.value " +
        "from sys.m_inifile_contents as ic " +
        "cross join ( " +
            "select 'HOST' as layer, 0 as ord from dummy " +
            "union all " +
            "select 'SYSTEM' as layer, 1 as ord from dummy " +
            "union all " +
            "select 'DEFAULT' as layer, 2 as ord from dummy " +
        ") as o " +
        "where ic.file_name = 'xsengine.ini' " +
        "and ic.section = ? " +
        "and ic.key = ? " +
        "order by o.ord";
    
    var oServerHostResult = hq.statement(sMailServerSelect).execute("smtp","server_host");
    var oServerPortResult = hq.statement(sMailServerSelect).execute("smtp","server_port");
    
    hq.setSchema('HANA_XS_BASE');
    const sBatchJobSelect =
        "select status " +
        "from \"sap.hana.xs.admin.jobs.server.db::SCHEDULES\" " +
        "where job_name = 'sap.ino.xs.batch::notification'";
    
    var oBatchJobResult = hq.statement(sBatchJobSelect).execute();
    
    var sSender = systemSettings.getIniValue("email_sender");
    
    var bSetupComplete = true;
    var sResponse = "";

    if(oServerHostResult.length === 1 && oServerPortResult.length === 1) {
        sResponse = "Mail Server: " + oServerHostResult[0].VALUE + ":" + oServerPortResult[0].VALUE + ";";
    } else {
        sResponse = "Mail Server: MISSING!";
        bSetupComplete = false;
    }
    if(oBatchJobResult[0].STATUS !== "ACTIVE") {
        bSetupComplete = false;
    }
    sResponse += " Batch Job: " + oBatchJobResult[0].STATUS + ";";
    if(sSender === undefined || sSender === null || sSender === "") {
        sResponse += " Sender Address: MISSING!";
        bSetupComplete = false;
    } else {
        sResponse += " Sender Address: " + sSender;
    }

    if (!bSetupComplete) {
        $.response.contentType = "text/plain";
        $.response.setBody(sResponse);
        $.response.status = $.net.http.BAD_REQUEST;
        return;
    }
    
    if ($.request.method === $.net.http.POST || $.request.method === $.net.http.PUT) {
        hq.setSchema('SAP_INO');

        var oUser;
        var aUser = hq.statement('select * from "sap.ino.db.iam.ext::v_ext_logon_user"').execute();
        if (aUser && aUser.length === 1) {
            oUser = aUser[0];
        }

        try {
            mail.send(oUser.EMAIL, 
                  "SAP Innovation Management", 
                  "Synchronous Mail-Processing has been setup successfully ");
            sResponse += " || Mail has been sent successfully"; 
        } catch (e) {
            sResponse += " || " + e.toString();
        }
        
        //insert into t_notification, t_notification_status
        var iNotificationId = -1;
        var aNotificationId = hq.statement("select \"sap.ino.db.notification::s_notification\".nextval as id from dummy").execute();
        if (aNotificationId) {
            iNotificationId = aNotificationId[0].ID;
        }

        var sCreateNotification = 
            "insert into \"sap.ino.db.notification::t_notification\" " +
            "(id, object_type_code, object_id, event_at, notification_code, actor_id, owner_id, object_text, sub_text, involved_id, status_code) " +
            "values (" + iNotificationId + ", 'MAIL', '0', current_utctimestamp, 'MAIL_SETUP', " +
            oUser.USER_ID + ", " + oUser.USER_ID + ", 'Batch Mail-Processing has been setup successfully', 'test', " + oUser.USER_ID + ", 'ACTIVE')";
        
        hq.statement(sCreateNotification).execute();
        
        var sCreateNotificationStatus = 
            "insert into \"sap.ino.db.notification::t_notification_status\" " +
            "(id, notification_id, user_id, role_code, status_code, mail_status_code) " +
            "select \"sap.ino.db.notification::s_notification_status\".nextval as id, " + iNotificationId + " as notfication_id, " + 
            oUser.USER_ID + " as user_id, 'MAIL_SETUP_TESTER' as role_code, 'READ' as status_code, 'UNSENT' as mail_status_code from dummy";
        
        hq.statement(sCreateNotificationStatus).execute();
        
        const notificationMail = $.import("sap.ino.xs.xslib", "scheduledNotificationEmail");

        try {    
            notificationMail.execute(hq, conn);
        } catch(e) {
            sResponse = e.toString();
        }

        conn.commit();
    }

    $.response.contentType = "text/plain";
    $.response.setBody(sResponse);
    $.response.status = $.net.http.OK;
});