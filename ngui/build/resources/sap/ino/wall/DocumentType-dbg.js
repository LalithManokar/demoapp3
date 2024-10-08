/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.DocumentType");

(function() {
    "use strict";
    
    /**
     * @class Specifies a document type for layouting and structuring.
     * 
     * @version 1.16.4
     * @static
     * @public
     * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ino.wall.DocumentType = {

        /**
         * A general link without further specifications.
         * 
         * @public
         */
        Misc : "Misc",

        /**
         * A Word document
         * 
         * @public
         */
        Word : "Word",

        /**
         * An Excel document
         * 
         * @public
         */
        Excel : "Excel",

        /**
         * A PowerPoint document
         * 
         * @public
         */
        PowerPoint : "PowerPoint",

        /**
         * A PDF document
         * 
         * @public
         */
        PDF : "PDF",

        /**
         * A Text document
         * 
         * @public
         */
        Text : "Text",

        /**
         * zip file
         * 
         * @public
         */
        Zip : "Zip",

        /**
         * video file
         * 
         * @public
         */
        Video : "Video"

    };
})();