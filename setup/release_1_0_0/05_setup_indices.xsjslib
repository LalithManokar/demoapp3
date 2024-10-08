const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_1.0.0.05_setup_indices.xsjslib';
function error(line) { trace.error(whoAmI, line); }
function info(line) { trace.info(whoAmI, line); }


var aIndices = [
    'create fulltext index "SAP_INO"."sap.ino.db.campaign::i_campaign_description" on "SAP_INO"."sap.ino.db.campaign::t_campaign_t"("DESCRIPTION") text analysis on search only off',
    'create fulltext index "SAP_INO"."sap.ino.db.campaign::i_campaign_name"        on "SAP_INO"."sap.ino.db.campaign::t_campaign_t"("NAME")        text analysis on search only off',
    'create fulltext index "SAP_INO"."sap.ino.db.campaign::i_campaign_short_name"  on "SAP_INO"."sap.ino.db.campaign::t_campaign_t"("SHORT_NAME")  text analysis on search only off',
    'create fulltext index "SAP_INO"."sap.ino.db.iam::i_identity_name"             on "SAP_INO"."sap.ino.db.iam::t_identity"("NAME")               text analysis on',
    'create fulltext index "SAP_INO"."sap.ino.db.iam::i_identity_first_name"       on "SAP_INO"."sap.ino.db.iam::t_identity"("FIRST_NAME")         text analysis on',
    'create fulltext index "SAP_INO"."sap.ino.db.iam::i_identity_last_name"        on "SAP_INO"."sap.ino.db.iam::t_identity"("LAST_NAME")          text analysis on',
    'create fulltext index "SAP_INO"."sap.ino.db.idea::i_tag_name"                 on "SAP_INO"."sap.ino.db.idea::t_tag"("NAME")                   text analysis on search only off text mining on',
    'create fulltext index "SAP_INO"."sap.ino.db.idea::i_idea_name"                on "SAP_INO"."sap.ino.db.idea::t_idea"("NAME")                  text analysis on search only off text mining on',
    'create fulltext index "SAP_INO"."sap.ino.db.idea::i_idea_description"         on "SAP_INO"."sap.ino.db.idea::t_idea"("DESCRIPTION") mime type column "DESCRIPTION_MIME_TYPE" text analysis on search only off text mining on'
];

function extractIndexName(sCreateStatement) {
    
    var result = {
        schemaName : sCreateStatement.split('"')[1],
        indexName : sCreateStatement.split('"')[3]
    }
    result.fullName = '"' + result.schemaName + '"."' + result.indexName + '"';
    return result;
}


function checkIndexExistence(sCreateStatement, hq) {
    var oIndexName = extractIndexName(sCreateStatement);
    var sCheckStatement = "select 'X' as exists from sys.objects where object_type = 'INDEX' and schema_name = ? and object_name = ?";
    var result = hq.statement(sCheckStatement).execute(oIndexName.schemaName, oIndexName.indexName);
    var bIndexExists = result.length == 1;
    info("checkIndexExistence(" + oIndexName.fullName + ") == " + bIndexExists);
    return bIndexExists;
}

function check(oConnection) {
    const hq = HQ.hQuery(oConnection);
    var aCheckResults = _.map(aIndices, function(sCreateStatement) {
        return checkIndexExistence(sCreateStatement, hq);
    });
    if (!_.some(aCheckResults)) {
        info("no index found");
    } else if (_.every(aCheckResults)) {
        info("all indices found");
    } else {
        info("some but not all indices found");
    }
    
    // no matter if we found an index or not we are able to run
    return true;
}


function createIndex(sCreateStatement, hq) {
    var sIndexName = extractIndexName(sCreateStatement);
    
    if (checkIndexExistence(sCreateStatement, hq)) {
        dropIndex(sCreateStatement, hq);
    }
    hq.statement(sCreateStatement).execute();
    info("createIndex('" + sIndexName + "') executed succesfully");
}

function run(oConnection) {
    const hq = HQ.hQuery(oConnection);
    _.each(aIndices, function(sCreateStatement) {
        createIndex(sCreateStatement, hq);
    });
    
    // no exception --> success
    return true;
}


function dropIndex(sCreateStatement, hq) {
    var sIndexFullName = extractIndexName(sCreateStatement).fullName;
    
    if (checkIndexExistence(sCreateStatement, hq)) {
        var sDropStatement = 'drop fulltext index ' + sIndexFullName;

        hq.statement(sDropStatement).execute();
        info(sDropStatement + " executed succesfully");
    } else {
        info(sIndexName + " does not exist - nothing to drop");
    }
}

function clean(oConnection) {
    const hq = HQ.hQuery(oConnection);
    _.each(aIndices, function(sCreateStatement) {
        dropIndex(sDropIndex, hq);
    });
    
    // no exception --> success
    return true;
}