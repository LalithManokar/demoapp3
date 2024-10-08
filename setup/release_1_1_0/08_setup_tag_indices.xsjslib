const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_1.0.0.08_setup_tag_indices.xsjslib';

function error(line) { trace.error(whoAmI, line); }
function info(line) { trace.info(whoAmI, line); }

const sSchemaName = 'SAP_INO';
var sOldIndexName = 'sap.ino.db.idea::i_tag_name';
var sNewIndexName = 'sap.ino.db.tag::i_tag_name';

function getIndexName(bOld) {
    
    var sIndexName = sNewIndexName;
    if(bOld){
        sIndexName = sOldIndexName;
    }
    
    var result = {
        fullName : '"'+sSchemaName + '"."' + sIndexName+'"',
        schemaName : sSchemaName,
        indexName : sIndexName,
    }
    
    return result;
}

function getCreateStatement(oIndexName){
    return 'create fulltext index '+oIndexName.fullName+' on "SAP_INO"."sap.ino.db.tag::t_tag"("NAME") text analysis on search only off text mining on';
}

function checkIndexExistence(oIndexName, hq) {
    var sCheckStatement = "select 'X' as exists from sys.objects where object_type = 'INDEX' and schema_name = ? and object_name = ?";
    var result = hq.statement(sCheckStatement).execute(oIndexName.schemaName, oIndexName.indexName);
    var bIndexExists = result.length == 1;
    info("checkIndexExistence(" + oIndexName.fullName + ") == " + bIndexExists);
    return bIndexExists;
}

function check(oConnection) {
    const hq = HQ.hQuery(oConnection);
    var oOldIndexName = getIndexName(true);
    var oNewIndexName = getIndexName(false);
    var bOldExists = checkIndexExistence(oOldIndexName, hq);
    var bNewExists = checkIndexExistence(oNewIndexName, hq);
   
    if(bOldExists) {
        info("old tag index exists");
    } else {
        info("old tag index does not exist");
    }
    if(bNewExists) {
        info("new tag index exists");
    } else {
        info("new tag index does not exist");
    }
    
    // no matter if we found an index or not we are able to run
    return true;
}

function createIndex(hq) {
    var oIndexName = getIndexName(false);
    var sCreateStatement = getCreateStatement(oIndexName);
    
    if (checkIndexExistence(oIndexName, hq)) {
        dropIndex(oIndexName, hq);
    }
    hq.statement(sCreateStatement).execute();
    info("createIndex('" + oIndexName.fullName + "') executed succesfully");
}

function run(oConnection) {
    const hq = HQ.hQuery(oConnection);
    //always drop old index
    var oOldIndexName = getIndexName(true);
    dropIndex(oOldIndexName, hq);
    
    //create new Index
    createIndex(hq);
    
    // no exception --> success
    return true;
}


function dropIndex(oIndexName, hq) {
    if (checkIndexExistence(oIndexName, hq)) {
        var sDropStatement = 'drop fulltext index ' + oIndexName.fullName;

        hq.statement(sDropStatement).execute();
        info(sDropStatement + " executed succesfully");
    } else {
        info(oIndexName.indexName + " does not exist - nothing to drop");
    }
}

function clean(oConnection) {
    const hq = HQ.hQuery(oConnection);
    var oOldIndexName = getIndexName(true);
    var oNewIndexName = getIndexName(false);
    
    dropIndex(oOldIndexName, hq);
    dropIndex(oNewIndexName, hq);
    
    // no exception --> success
    return true;
}