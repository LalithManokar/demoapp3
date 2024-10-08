const ohQuery = $.import("sap.ino.xs.xslib", "hQuery");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = ohQuery.hQuery(oConn).setSchema("SAP_INO");

function getPublicUserGroup(){
    var publicGroupScript = 'SELECT * FROM "sap.ino.db.iam.ext::v_ext_group_public_to_community"';
    var publicGroupSource = oHQ.statement(publicGroupScript).execute();
    var findNormalGroup = _.filter(publicGroupSource, function(item){
        return item.GROUP_NAME !== 'None';
    });
    var findNoneGroup = _.filter(publicGroupSource, function(item){
        return item.GROUP_NAME === 'None';
    });

    return { status: $.net.http.OK, body: {
        groups: findNormalGroup,
        noneGroupID: findNoneGroup,
        hasNoneGroup: findNoneGroup.length,
        total: findNormalGroup.length
    } };
}