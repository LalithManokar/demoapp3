var check = $.import("sap.ino.xs.aof.lib", "check");

this.ObjectType = {
    Campaign : "CAMPAIGN",
    Idea : "IDEA"
};

function node(sObjectType) {
    return {
        table : "sap.ino.db.basis::t_extension",
        sequence : "sap.ino.db.basis::s_extension",
        parentKey : "_OBJECT_ID",
        consistencyChecks : [check.cardinalityOneCheck()],
        explicitAttributeDefinition : true,
        attributes : {
            _OBJECT_TYPE_CODE : {
                constantKey : sObjectType
            }
        }
    };
}