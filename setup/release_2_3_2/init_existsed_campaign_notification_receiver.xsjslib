const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_2_3_2.init_existsed_campaign_notification_receiver.xsjslib';

function error(line) {
    trace.error(whoAmI, line);
}
function info(line) {
    trace.info(whoAmI, line);
}

function check(oConnection) {
    return true;
}

function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
	var sSelect = `
	SELECT COUNT(1) AS C
FROM "sap.ino.db.newnotification::t_notification_campaign_setting_receiver"
WHERE ROLE_CODE = 'COMMENTER'
	`;
	var aResult = oHQ.statement(sSelect).execute();
    if(aResult && aResult.length > 0 && aResult[0].C > 0){
        return true;
    };  
    oHQ
	.procedure("SAP_INO", "sap.ino.db.newnotification::p_notification_init_exists_campaign_receiver")
	.execute();
	oHQ.getConnection().commit();
    return true;
}

function clean(oConnection) {
    return true;
}