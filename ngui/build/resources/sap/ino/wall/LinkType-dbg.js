/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.LinkType");

(function() {
    "use strict";

    /**
     * @class Specifies a document type for layouting and structuring.
     * 
     * @static
     * @public
     */
    sap.ino.wall.LinkType = {

        /**
         * A general link without further specifications.
         * 
         * @public
         */
        MISC : "MISC",

        /**
         * A link to a collaboration group or post.
         * 
         * @public
         */
        COLLABORATE : "COLLABORATE",

        /**
         * A Wiki link
         * 
         * @public
         */
        WIKI : "WIKI", 

        /**
         * A private link.
         * 
         * @public
         */
        PRIVATE : "PRIVATE",

        /**
         * A wall link.
         * 
         * @public
         */
        WALL : "WALL",
            
        /**
         * A idea link.
         * 
         * @public
         */
        IDEA : "IDEA"
    };

})();