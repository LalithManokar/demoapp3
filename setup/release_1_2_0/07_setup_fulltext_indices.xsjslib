const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");
const trace = $.import("sap.ino.xs.xslib", "trace");
    
const whoAmI = "sap.ino.setup.release_1.2.0.07_setup_fulltext_indices.xsjslib";
// all supported languages taken into account for automatic language detection - see table sap.ino.db.basis::t_language
const aSupportedLangs = ["EN", "DE", "ES", "FR", "JA", "PT", "RU", "ZH"];

// fulltext index objects
const aIndices = [
    {
        schema: "SAP_INO", table: "sap.ino.db.idea::t_idea", column: "NAME", index: "sap.ino.db.idea::i_idea_name",
        languages: aSupportedLangs, textanalysis: true,
        foreignKey: {
            column: "ID"
        }, overwrite: true
    },{
        schema: "SAP_INO", table: "sap.ino.db.idea::t_idea", column: "DESCRIPTION", index: "sap.ino.db.idea::i_idea_description",
        languages: aSupportedLangs, textanalysis: true,
        foreignKey: {
            column: "ID"
        }, overwrite: true
    },{
        schema: "SAP_INO", table: "sap.ino.db.campaign::t_campaign_t", column: "DESCRIPTION", index: "sap.ino.db.campaign::i_campaign_description",
        fastPreprocessOff: true, overwrite: true
    },{
        schema: "SAP_INO", table: "sap.ino.db.campaign::t_campaign_t", column: "NAME", index: "sap.ino.db.campaign::i_campaign_name",
        fastPreprocessOff: true, overwrite: true
    },{
        schema: "SAP_INO", table: "sap.ino.db.campaign::t_campaign_t", column: "SHORT_NAME", index: "sap.ino.db.campaign::i_campaign_short_name",
        fastPreprocessOff: true, overwrite: true
    },{
        schema: "SAP_INO", table: "sap.ino.db.campaign::t_campaign_t", column: "SHORT_NAME", index: "sap.ino.db.campaign::i_campaign_short_name",
        fastPreprocessOff: true, overwrite: true
    },
    {
        schema: "SAP_INO", table: "sap.ino.db.wall::t_wall", column: "NAME", index: "sap.ino.db.wall::i_wall_name",
        fastPreprocessOff: true, overwrite: true
    },{
        schema: "SAP_INO", table: "sap.ino.db.wall::t_wall_item", column: "NAME", index: "sap.ino.db.wall::i_wall_item_name",
        fastPreprocessOff: true, overwrite: true
    },{
        schema: "SAP_INO", table: "sap.ino.db.wall::t_wall_item", column: "DESCRIPTION", index: "sap.ino.db.wall::i_wall_item_description",
        fastPreprocessOff: true, overwrite: true
    }
], aDropIndices = [
    // deprecated: fuzzy works on identity names, usernames, ... without FT index
    { schema: "SAP_INO", index: "sap.ino.db.iam::i_identity_name" },
    { schema: "SAP_INO", index: "sap.ino.db.iam::i_identity_first_name" },
    { schema: "SAP_INO", index: "sap.ino.db.iam::i_identity_last_name" },
    // tag name doesn't need TM / FT-Index as well
    { schema: "SAP_INO", index: "sap.ino.db.idea::i_tag_name" },
    { schema: "SAP_INO", index: "sap.ino.db.tag::i_tag_name" }
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
    // remove unneeded indices
    _.each(aDropIndices, function(oIndexItem) {
        oHQ.procedure("SAP_INO","sap.ino.setup.db::p_drop_fulltext_index").execute(oIndexItem.schema, oIndexItem.index);
        info('Fulltext index "' + oIndexItem.schema + '"."' + oIndexItem.index + '" has been dropped (if it was existing)');
    });
    // (re)create (changed) indices
    _.each(aIndices, function(oIndexItem) {
        generateIndex(oHQ, oIndexItem);
        info('Fulltext index creation on table "' + oIndexItem.schema + '"."' + oIndexItem.table + '" on column "' + oIndexItem.column + '" succeeded');
    });
    return true;
}