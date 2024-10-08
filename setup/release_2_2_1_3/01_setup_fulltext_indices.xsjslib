const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");
const trace = $.import("sap.ino.xs.xslib", "trace");
    
const whoAmI = "sap.ino.setup.release_2.2.13.01_setup_fulltext_indices.xsjslib";
// all supported languages taken into account for automatic language detection - see table sap.ino.db.basis::t_language
const aSupportedLangs = ["EN", "DE", "ES", "FR", "JA", "PT", "RU", "ZH"];

// fulltext index objects
const aIndices = [{
        schema: "SAP_INO", table: "sap.ino.db.ideaform::t_field_value", column: "RICH_TEXT_VALUE", index: "sap.ino.db.ideaform::i_field_value_rich_text_value",
        languages: aSupportedLangs, textanalysis: true,
        foreignKey: {
            column: "ID"
        }, overwrite: true
    }
];

function error(line) {
    trace.error(whoAmI, line);
}

function info(line) {
    trace.info(whoAmI, line);
}

/**
 * creates a Fulltext index by calling the respective stored procedure
 */ 
function generateIndex(oHQ, oFTIndex) {
    oHQ.procedure("SAP_INO","sap.ino.setup.db::p_create_fulltext_index").execute(
        oFTIndex.schema,
        oFTIndex.index,
        oFTIndex.table,
        oFTIndex.column,
        oFTIndex.languageColumn || '',
        oFTIndex.languages && oFTIndex.languages.length > 0 ? "'" + oFTIndex.languages.join("', '") + "'" : '',
        oFTIndex.mimetypeColumn || '',
        oFTIndex.configuration || '',
        oFTIndex.separators || '',
        oFTIndex.fastPreprocessOff ? 1 : 0,
        oFTIndex.fuzzy ? 1 : 0,
        oFTIndex.textanalysis ? 1 : 0,
        oFTIndex.textmining ? 1 : 0,
        oFTIndex.foreignKey && oFTIndex.foreignKey.column ? oFTIndex.foreignKey.column : '',
        oFTIndex.foreignKey && oFTIndex.foreignKey.column ? 1 : 0,
        oFTIndex.overwrite ? 1 : 0
    );
}

/**
 * No action necessary, as source tables are guaranteed to exist
 * 
 * @returns {boolean}   Always true
 */
function check() {
    return true;
}

/**
 * No action necessary as recreating FT indices cares about removing them first
 *
 * @returns {boolean}   Always true
 */
function clean() {
    return true;
}

/**
 * re-index all listed fulltext indices with foreign key constraints and language autodetection
 */
function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
    // (re)create (changed) indices
    _.each(aIndices, function(oIndexItem) {
        generateIndex(oHQ, oIndexItem);
        info('Fulltext index creation on table "' + oIndexItem.schema + '"."' + oIndexItem.table + '" on column "' + oIndexItem.column + '" succeeded');
    });
    return true;
}