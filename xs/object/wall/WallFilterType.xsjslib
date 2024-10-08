var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.SystemConfiguration,
    Root : {
        table : "sap.ino.db.wall::t_wall_filter_type"
    }
};