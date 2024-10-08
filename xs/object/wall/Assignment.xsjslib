var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var check = $.import("sap.ino.xs.aof.lib", "check");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var WallMessage = $.import("sap.ino.xs.object.wall", "message");

var ObjectType = this.ObjectType = {
    Idea : "IDEA",
};

var RoleTypeCode = this.RoleTypeCode = {
    Wall : "WALL"
};

var FilterTypeCode = this.FilterTypeCode = {
    Frontoffice : "FRONTOFFICE",
    Backoffice : "BACKOFFICE"
};

function node(sObjectType, sFilterType, sRoleType) {
    return {
        table : "sap.ino.db.wall::t_wall_assignment",
        historyTable : "sap.ino.db.wall::t_wall_assignment_h",
        sequence : "sap.ino.db.wall::s_wall_assignment",
        parentKey : "OWNER_ID",
        consistencyChecks : [check.duplicateCheck("WALL_ID", WallMessage.WALL_DUPLICATE_ASSIGNMENT)],
        attributes : {
            WALL_ID : {
                foreignKeyTo : "sap.ino.xs.object.wall.Wall.Root"
            },
            OWNER_TYPE_CODE : {
                constantKey : sObjectType
            },
            ROLE_TYPE_CODE : {
                foreignKeyTo : "sap.ino.xs.object.wall.WallRoleType.Root",
                constantKey : sRoleType
            },
            FILTER_TYPE_CODE : {
                foreignKeyTo : "sap.ino.xs.object.wall.WallFilterType.Root",
                constantKey : sFilterType
            }
        }
    };
}