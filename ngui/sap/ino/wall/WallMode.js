/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallMode");

(function() {
    "use strict";

    /**
     * @class Defines the interaction mode for the wall.
     * 
     * @static
     * @public
     */
    sap.ino.wall.WallMode = {

        /**
         * Items are locked, new items cannot be added
         * 
         * @public
         */
        Readonly : "Readonly",

        /**
         * Standard mode, items can be added and moved
         * 
         * @public
         */
        Write : "Write"

    };

})();