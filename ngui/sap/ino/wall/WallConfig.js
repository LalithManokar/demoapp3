/*!
 * @copyright@
 */

jQuery.sap.declare("sap.ino.wall.WallConfig");

(function() {
    "use strict";

    sap.ino.wall.WallConfig = {};

    /* =========================================================== */
    /* wall static varables                                        */
    /* =========================================================== */

    // static variables for z-index calculation
    sap.ino.wall.WallConfig._MIN_DEPTH = 100;
    sap.ino.wall.WallConfig._MAX_DEPTH = 9999;
    sap.ino.wall.WallConfig._DEPTH_STEP = 1;
    sap.ino.wall.WallConfig._MULTI_OFFSET = 30;
    sap.ino.wall.WallConfig._MAX_STICKY_NOTE_CREATION_LENGTH = 80;

    sap.ino.wall.WallConfig._TOUCHMODE_MOVE = 0;
    sap.ino.wall.WallConfig._TOUCHMODE_SELECT = 1;

    sap.ino.wall.WallConfig._COLLISION_ALL = 0;
    sap.ino.wall.WallConfig._COLLISION_NEIGHBOURS = 1;
    sap.ino.wall.WallConfig._COLLISION_INTERSECTIONS = 2;

    sap.ino.wall.WallConfig._ADD_MODE_MANUAL = 0;
    sap.ino.wall.WallConfig._ADD_MODE_DROP = 1;
    sap.ino.wall.WallConfig._ADD_MODE_COPYPASTE = 2;
    sap.ino.wall.WallConfig._ADD_MODE_CLONE = 3;
    sap.ino.wall.WallConfig._ADD_MODE_DETACHCHILD = 4;
    sap.ino.wall.WallConfig._ADD_MODE_DETACHGROUPITEM = 5;
    // sap.ino.wall.WallConfig._ADD_MODE_MOVEFROMOTHERWALL = 6;

    /* =========================================================== */
    /* wallItem static varables                                    */
    /* =========================================================== */

    // touch modes
    sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE = 0;
    sap.ino.wall.WallConfig._ITEM_TOUCHMODE_RESIZE = 1;
    sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVECHILD = 2;
    sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVEGROUPITEM = 3;
    sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE_START = 4;
    sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE_END = 5;

    // static variables
    sap.ino.wall.WallConfig._ITEM_MIN_SIZE = 155;
    sap.ino.wall.WallConfig._ITEM_CHILD_ZOOM = 0.7;
    sap.ino.wall.WallConfig._ITEM_CHILD_UNSNAP_DISTANCE = 15;

})();