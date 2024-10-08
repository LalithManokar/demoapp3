var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.Stage,
    Root : {
        table : "sap.ino.db.attachment::t_attachment_allowed_file_stage",
        sequence : "sap.ino.db.attachment::s_attachment_allowed_file",
        customProperties : {
            fileName : "t_attachment_allowed_file",
            contentOnlyInRepository : true
        },
        attributes : {
            ID : {
                isPrimaryKey : true
            }
        }
    }
};