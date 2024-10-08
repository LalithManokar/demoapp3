/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.util.Formatter");

(function() {
    "use strict";

    sap.ino.wall.util.Formatter = {

        /**
         * Format first and last name
         * 
         * @param {string}
         *            sFirst first name
         * @param {string}
         *            sLast last name
         * @returns {string} first and last name combined
         * @public
         */
        fullName : function(sFirst, sLast) {
            return sFirst + " " + sLast;
        },

        /**
         * Capitalizes first letter of a string
         * 
         * @param {sString}
         *            the string to be modified
         * @returns {string} string with first letter capitalized
         * @public
         */
        capitalizeFirstLetter : function(sString) {
            if (sString) {
                return sString.charAt(0).toUpperCase() + sString.slice(1);
            }
            return sString;
        },

        /**
         * Escapes { and } characters with a single quote so that they are not parsed as binding properties
         * 
         * @param {sString}
         *            the string to be modified
         * @returns {string} string with escaped curly brackets
         * @public
         */
        escapeBindingCharacters : function(sString) {
            if (typeof sString === "string") {
                return sString.replace(/\{/g, "\\{").replace(/\}/g, "\\}");
            }
            return sString;
        },

        /**
         * Escapes \\ characters with an additional backslash so that the UI5 controls contain the right properties
         * (constructor will interpret the string)
         * 
         * @param {sString}
         *            the string to be modified
         * @returns {string} string with escaped backslashes
         * @public
         */
        escapeNetworkPaths : function(sString) {
            if (typeof sString === "string") {
                return sString.replace(/\\/g, "\\\\");
            }
            return sString;
        },

        /**
         * Returns the date in DD.MM.YYYY when the timestamp is older than 24h otherwise, XXh XXm XXs ago to have a
         * readable representation of an edit date
         * 
         * @param {any}
         *            vDate either a date string or a date object
         * @returns {string} the formatted date
         * @public
         */
        readableDateDelta : function(vDate) {
            var oDate = (vDate instanceof Date ? vDate : new Date(vDate)), iDeltaSeconds, sShort = "", temp;

            // TODO: remove this!
            // Workaround for local derby db server timestamp format
            if (oDate == "Invalid Date" && typeof vDate === "string") {
                temp = vDate.split(" ");
                oDate = new Date(temp[0] + " " + temp[1] + " " + temp[2] + " " + temp[5] + " " + temp[3]);
            }

            if (oDate == "Invalid Date") { // == is on purpose here
                return null;
            } else {
                iDeltaSeconds = (new Date() - oDate) / 1000;
                if (iDeltaSeconds < 86400) {
                    // for the last 24h we write a shorter notation without date
                    if (Math.floor(iDeltaSeconds / 3600) > 0) {
                        // h m ago
                        sShort = Math.floor(iDeltaSeconds / 3600) + "h " + Math.floor(iDeltaSeconds % 3600 / 60) + "m";// ago";
                    } else if (Math.floor(iDeltaSeconds / 60) > 0) {
                        // m s ago
                        sShort = Math.floor(iDeltaSeconds / 60) + "m " + Math.floor(iDeltaSeconds % 60) + "s";// ago";
                    } else {
                        // s ago
                        sShort = Math.floor(iDeltaSeconds) + "s ago";
                    }
                    return sShort;
                } else {
                    // > 2h: write date in format dd.mm.yyyy
                    return oDate.getDate() + "." + (oDate.getMonth() + 1) + "." + oDate.getFullYear();
                }
            }
        },

        /**
         * Formats the number in a short formal 1.123 = 1.1k, 1.234.567 = 1.12m, 1.234.567.890 = 1.23b etc
         * 
         * @returns {string} the formatted string
         */
        readableLargeNumber : function(vNumber) {
            if (vNumber >= 1000) {
                vNumber = Math.floor(vNumber / 100) / 10;
                vNumber = vNumber + "K";
            } else if (vNumber >= 1000000) {
                vNumber = Math.floor(vNumber / 10000) / 100;
                vNumber = vNumber + "M";
            } else if (vNumber >= 1000000000) {
                vNumber = Math.floor(vNumber) / 1000;
                vNumber = vNumber + "B";
            }
            return vNumber;
        },

        /**
         * replaces all line breaks with <br/> tags for HTML display
         * 
         * @param {string}
         *            sString the string
         * @returns {string} the result string
         * @public
         */
        nl2br : function(sString) {
            if (sString) {
                return sString.replace(/([\r\n|\n\r|\r|\n]|&#xa;)/g, "<br/>");
            }
            return sString;
        },

        /**
         * removes the namespace from a UI5 className string (used for CSV export)
         * 
         * @param {string}
         *            sString the string
         * @returns {string} the result string
         * @public
         */
        formatClassName : function(sString) {
            if (sString) {
                return sString.split('.').pop();
            }
            return sString;
        },

        /**
         * removes trailing spaces and ands quotes at the front and back (used for CSV export)
         * 
         * @param {string}
         *            sString the string
         * @returns {string} the result string
         * @public
         */
        trimAndQuoteForCSV : function(sString) {
            if (sString) {
                return '"' + sString.trim().replace(/"/g, '""') + '"';
            }
            return sString;
        },

        /**
         * returns first filled argument (used for CSV export)
         * 
         * @param {any}
         *            aArguments an arbitrary amount of arguments
         * @returns {string} the result string
         * @public
         */
        chooseFirst : function() {
            var i = 0;

            for (; i < arguments.length; i++) {
                if (arguments[i] !== null && arguments[i] !== undefined) {
                    return arguments[i];
                }
            }
        },
        
        mapNullToInitialValues : function(oJSON) {
            if (oJSON.backgroundColor === null) {
                oJSON.backgroundColor = "";
            }
            if (oJSON.backgroundImage === null) {
                oJSON.backgroundImage = "";
            }
        }
        
    };
})();