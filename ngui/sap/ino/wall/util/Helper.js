/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.util.Helper");

(function() {
    "use strict";
 
    sap.ino.wall.util.Helper = {

        /**
         * fetches URL parameter from the Query String
         * 
         * @param {string}
         *            sName the name of the parameter
         * @returns {mixed} null or the string value of the parameter
         * @public
         */
        getURLParameter : function(sName, sStatus, sErrorThrown) {
            sName = sName.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regex = new RegExp("[\\?&]" + sName + "=([^&#]*)"), results = regex.exec(location.search);

            return (results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " ")));
        },

        /**
         * fetches error message from database (parses the internal server error page response)
         * 
         * @param {object}
         *            jqXHR the server response object
         * @param {string}
         *            sStatus the error status
         * @param {string}
         *            sErrorThrown the error type
         * @returns {string} the constructed error message (translated or technical as fallback)
         * @public
         */
        getErrorCodeFromServerResponse : function(jqXHR, sStatus, sErrorThrown) {
            var aTemp = /<h1>([^<]*)<\/h1>/.exec(jqXHR.responseText), // get text in <h1> tag
            sErrorCode;

            if (aTemp && aTemp[1]) {
                // extract the error code
                sErrorCode = aTemp[1].split(" - ")[1];
                return sErrorCode;
            }
        },

        /**
         * fetches error message from database (parses the internal server error page response)
         * 
         * @param {object}
         *            jqXHR the server response object
         * @param {string}
         *            sStatus the error status
         * @param {string}
         *            sErrorThrown the error type
         * @returns {string} the constructed error message (translated or technical as fallback)
         * @public
         */
        extractErrorCodeFromServerResponse : function(jqXHR, sStatus, sErrorThrown) {
            var sErrorCode = this.getErrorCodeFromServerResponse(jqXHR, sStatus, sErrorThrown), sErrorMessage = "";

            if (/^[A-Z0-9\d_]+$/.test(sErrorCode)) {
                // seems to be an error code for translation (only uppercase letters and _)
                var oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.wall");
                sErrorMessage = oRB.getText("WALL_APP_ERROR_" + sErrorCode);
            } else if (sErrorCode) {
                // is another technical string, just add it to the infos that we have
                sErrorThrown += " (" + sErrorCode + ")";
            }

            if (!sErrorMessage) {
                // fallback: construct an error string from status and response type
                sErrorMessage = sStatus.toUpperCase() + ": " + sErrorThrown;
            }

            return sErrorMessage;
        },

        /**
         * returns a random integer value in the range of the given parameters
         * 
         * @param {int}
         *            iMin the lower boundary
         * @param {int}
         *            iMax the upper boundary
         * @returns {int} random number
         * @public
         */
        randomMinMax : function(iMin, iMax) {
            return Math.floor(Math.random() * (iMax - iMin + 1) + iMin);
        },

        /**
         * returns a random entry from an array
         * 
         * @param {array}
         *            aAray the array
         * @returns {mixed} random array entry
         * @public
         */
        randomFromArray : function(aArray) {
            if (aArray.length) {
                return aArray[sap.ino.wall.util.Helper.randomMinMax(0, aArray.length - 1)];
            }
            return null;
        },

        /**
         * replaces variables {0}, {1}, {2} with arguments
         * 
         * @param {array}
         *            aAray the array
         * @returns {mixed} random array entry
         * @public
         */
        stringFormat : function(sString) {
            var aArgs = Array.prototype.slice.call(arguments, 1), rSprintfRegex = /\{(\d+)\}/g, fnSprintf = function(match, number) {
                return number in aArgs ? aArgs[number] : match;
            };

            return sString.replace(rSprintfRegex, fnSprintf);
        },

        /**
         * returns the current text selection
         * 
         * @public
         */
        getTextSelection : function() {
            var text = "";

            if (window.getSelection) {
                text = window.getSelection().toString();
            } else if (document.selection && document.selection.type != "Control") {
                text = document.selection.createRange().text;
            }
            return text;
        },

        /**
         * returns the node of the current text selection
         * 
         * @public
         */
        getTextSelectionNode : function() {
            if (document.selection) {
                return document.selection.createRange().parentElement();
            } else {
                var selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    return selection.getRangeAt(0).startContainer.parentNode;
                }
            }
        },

        /**
         * deselect all text selections on the whole document
         * 
         * @public
         */
        deselectAllText : function() {
            var oSelection = (window.getSelection ? window.getSelection() : document.selection);

            if (oSelection) {
                if (oSelection.removeAllRanges) {
                    oSelection.removeAllRanges();
                } else if (oSelection.empty) {
                    oSelection.empty();
                }
            }
        },

        /**
         * select all text on the current DOM element
         * 
         * @public
         */
        selectAllText : function(oElement) {
            var oRange, oSelection;

            if (document.body.createTextRange) {
                oRange = document.body.createTextRange();
                oRange.moveToElementText(oElement);
                oRange.select();
            } else if (window.getSelection) {
                oSelection = window.getSelection();
                oRange = document.createRange();
                oRange.selectNodeContents(oElement);
                oSelection.removeAllRanges();
                oSelection.addRange(oRange);
            }
        },

        /**
         * checks if a DOM element is in the visible area of the user's screen
         * 
         * @param {jQueryObject}
         *            $elem the jQuery element
         * @returns {boolean} true=visible, false=invisible
         * @public
         */
        isScrolledIntoView : function($elem) {
            var docViewTop = jQuery(window).scrollTop(), docViewBottom = docViewTop + jQuery(window).height(), elemTop = $elem.offset().top, elemBottom = elemTop + $elem.height();

            return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
        },

        /**
         * Displays an error dialog with the given message and an OK button. If a callback is given, it is called after
         * the alert dialog has been closed
         * 
         * @param {string}
         *            sMessage Message to be displayed in the dialog
         * @param {function}
         *            fnCallback callback function to be called when the user closes the dialog
         * @param {boolean}
         *            bReportThis if true, a "report a bug" link is displayed
         * @public
         */
        showError : function(sMessage, fnCallback, bReportThis) {
            sap.ino.wall.util.Helper._showErrorByType(sMessage, fnCallback, "Error", bReportThis);
        },

        /**
         * Displays an unexpected error dialog with the given message and an OK button. If a callback is given, it is
         * called after the alert dialog has been closed
         * 
         * @param {string}
         *            sMessage Message to be displayed in the dialog
         * @param {function}
         *            fnCallback callback function to be called when the user closes the dialog
         * @param {boolean}
         *            bReportThis if true, a "report a bug" link is displayed
         * @public
         */
        showErrorUnexpected : function(sMessage, fnCallback, bReportThis) {
            sap.ino.wall.util.Helper._showErrorByType(sMessage, fnCallback, "ErrorUnexpected", bReportThis);
        },

        /**
         * Displays a fatal error dialog with the given message and an OK button. If a callback is given, it is called
         * after the alert dialog has been closed
         * 
         * @param {string}
         *            sMessage Message to be displayed in the dialog
         * @param {function}
         *            fnCallback callback function to be called when the user closes the dialog
         * @param {boolean}
         *            bReportThis if true, a "report a bug" link is displayed
         * @public
         */
        showFatal : function(sMessage, fnCallback, bReportThis) {
            sap.ino.wall.util.Helper._showErrorByType(sMessage, fnCallback, "Fatal", bReportThis);
        },

        /**
         * Displays an unexpected fatal error dialog with the given message and an OK button. If a callback is given, it
         * is called after the alert dialog has been closed
         * 
         * @param {string}
         *            sMessage Message to be displayed in the dialog
         * @param {function}
         *            fnCallback callback function to be called when the user closes the dialog
         * @param {boolean}
         *            bReportThis if true, a "report a bug" link is displayed
         * @public
         */
        showFatalUnexpected : function(sMessage, fnCallback, bReportThis) {
            sap.ino.wall.util.Helper._showErrorByType(sMessage, fnCallback, "FatalUnexpected", bReportThis);
        },

        /**
         * Displays a fatal dialog with the given message and an OK button. If a callback is given, it is called after
         * the alert dialog has been closed
         * 
         * @param {string}
         *            sMessage Message to be displayed in the dialog
         * @param {function}
         *            fnCallback callback function to be called when the user closes the dialog
         * @param {string}
         *            sType error Type that defines the title and the icon of the dialog
         * @public
         */
        _showErrorByType : function(sMessage, fnCallback, sType, bReportThis) {
            var sTypeTitle = "", sIconUri = sap.m.MessageBox.Icon.ERROR;

            var oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.wall");
            
            // TODO: bReportThis is not implemented yet
            if (sType === undefined) {
                sTypeTitle = oRB.getText("WALL_APP_ERROR_EXPECTED");
                sIconUri = sap.ui.core.IconPool.getIconURI("alert");
            } else {
                switch (sType) {
                    case "Error" :
                        sTypeTitle = oRB.getText("WALL_APP_ERROR_EXPECTED");
                        sIconUri = sap.ui.core.IconPool.getIconURI("error");
                        break;
                    case "ErrorUnexpected" :
                        sTypeTitle = oRB.getText("WALL_APP_ERROR_UNEXPECTED");
                        sIconUri = sap.ui.core.IconPool.getIconURI("error");
                        break;
                    case "Fatal" :
                    case "FatalUnexpected" :
                        sTypeTitle = oRB.getText("WALL_APP_FATAL_UNEXPECTED");
                        sIconUri = sap.ui.core.IconPool.getIconURI("flag");
                        break;
                    default:
                        break;
                }
            }

            return sap.m.MessageBox.show(sMessage, {
                icon : sIconUri,
                title : sTypeTitle,
                onClose : fnCallback
            });
        },

        /**
         * Renders and flushes a control item into the DOM
         * 
         * @returns {this} this pointer for chaining
         * @public
         */
        renderItemIntoContainer : function(oDomRef, oItem, bDoNotPreserve, vInsert) {
            var oRM;

            if (oDomRef) {
                oRM = sap.ui.getCore().createRenderManager();
                oRM.renderControl(oItem);
                oRM.flush(oDomRef, bDoNotPreserve, vInsert);
                oRM.destroy();
            }

            return this;
        },

        /**
         * Creates a random hex color in format #123456
         * 
         * @returns {string} a hex color value in string format
         * @public
         */
        createRandomHexColor : function() {
            var sColor = Math.floor(Math.random() * 16777215).toString(16);

            // fill prepending 0s
            while (sColor.length < 6) {
                sColor = "0" + sColor;
            }

            return "#" + sColor;
        },

        /**
         * Darkens/Lightens a hex color by the given amount
         * 
         * @param {string}
         *            sHexColor the hex color prefixed with "#"
         * @param {integer}
         *            iPercent the percentage value (negative = darken, positive = lighten)
         * @returns {string} the shaded hex color value
         * @public
         */
        shadeColor : function(sHexColor, iPercent) {
            if (!sHexColor) {
                return;
            }
            if (sHexColor.charAt("0") != "#") {
                sHexColor = "#" + sHexColor;
            }
            // short hex format: rewrite to be able to process it (#fff -> #ffffff)
            if (sHexColor.length === 4) {
                sHexColor = sHexColor[0] + sHexColor[1] + sHexColor[1] + sHexColor[2] + sHexColor[2] + sHexColor[3] + sHexColor[3];
            }
            var num = parseInt(sHexColor.slice(1), 16), amt = Math.round(2.55 * iPercent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;

            return "#" + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1);
        },

        /**
         * calculates the color luminance from a hex color value using farbtastic
         * 
         * @param {string}
         *            sHexColor the hex color prefixed with "#"
         * @returns {float} the luminance value of the color
         * @public
         */
        getColorLuminance : function(sHexColor) {
            if (!sHexColor) {
                return;
            }
            if (sHexColor.charAt("0") != "#") {
                sHexColor = "#" + sHexColor;
            }
            var aRGB, fLuminance = 0.0, fnUnpack, fnRGBToHSL;
            fnUnpack = function(sColor) {
                if (sColor.length === 7) {
                    return [parseInt('0x' + sColor.substring(1, 3), 16) / 255, parseInt('0x' + sColor.substring(3, 5), 16) / 255, parseInt('0x' + sColor.substring(5, 7), 16) / 255];
                } else if (sColor.length === 4) {
                    return [parseInt('0x' + sColor.substring(1, 2), 16) / 15, parseInt('0x' + sColor.substring(2, 3), 16) / 15, parseInt('0x' + sColor.substring(3, 4), 16) / 15];
                }
            };

            fnRGBToHSL = function(aRGB) {
                var min, max, delta, h, s, l, r = aRGB[0], g = aRGB[1], b = aRGB[2];

                min = Math.min(r, Math.min(g, b));
                max = Math.max(r, Math.max(g, b));
                delta = max - min;
                l = (min + max) / 2;
                s = 0;
                if (l > 0 && l < 1) {
                    s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
                }
                h = 0;
                if (delta > 0) {
                    if (max === r && max !== g) {
                        h += (g - b) / delta;
                    }
                    if (max === g && max !== b) {
                        h += (2 + (b - r) / delta);
                    }
                    if (max === b && max !== r) {
                        h += (4 + (r - g) / delta);
                    }
                    h /= 6;
                }
                return [h, s, l];
            };

            aRGB = fnUnpack(sHexColor);
            if (aRGB && aRGB.length) {
                fLuminance = fnRGBToHSL(aRGB)[2];
            }

            return fLuminance;
        },

        /**
         * adds transparency to the color value
         * 
         * @param {string}
         *            sHexColor the hex color prefixed with "#"
         * @param {integer}
         *            iOpacity the percentage value for the opacity
         * @returns {string} the shaded hex color value
         * @public
         */
        transparentColor : function(sHexColor, iOpacity) {
            var iR, iG, iB;
            if (!sHexColor) {
                return;
            }
            sHexColor = sHexColor.replace('#', '');
            iR = parseInt(sHexColor.substring(0, 2), 16);
            iG = parseInt(sHexColor.substring(2, 4), 16);
            iB = parseInt(sHexColor.substring(4, 6), 16);
            return 'rgba(' + iR + ',' + iG + ',' + iB + ',' + (iOpacity / 100) + ')';
        },

        /**
         * adds a browser prefix to the given style value using the device API
         * 
         * @param {string}
         *            sStyle the style string
         * @returns {string} the prefixed style string
         * @public
         */
        addBrowserPrefix : function(sStyle) {
            if (sap.ui.Device.browser.webkit) {
                return "-webkit-" + sStyle;
            } else if (sap.ui.Device.browser.firefox) {
                return "-moz-" + sStyle;
            } else if (sap.ui.Device.browser.internet_explorer) {
                return "-ms-" + sStyle;
            }
        },

        /**
         * removes unwanted HTML tags from a string
         * 
         * @param {string}
         *            sStyle the style string
         * @returns {string} the prefixed style string
         * @public
         */
        stripTags : function(sInput, sAllowed, bKeepParagraphs) {
            var sTags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, sComments = /<!--[\s\S]*?-->/gi;
            sAllowed = (((sAllowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
            if (!bKeepParagraphs) {
                sInput = sInput.replace(/<p>/g, "<div>");
                sInput = sInput.replace(/<\/p>/g, "</div>");
            }
            return sInput.replace(sComments, '').replace(sTags, function($0, $1) {
                return sAllowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
            });
        },
        
        /**
         * returns correct X pos of an event for the different devices
         * 
         * @param {event}
         *            the event 
         * @returns {int} the X pos of the event or undefined
         * @public
         */
        getEventX : function(oEvent) {
            return oEvent.originalEvent.pageX || 
                ((oEvent.touches && oEvent.touches.length > 0) ? oEvent.touches[0].pageX : undefined) || 
                ((oEvent.changedTouches && oEvent.changedTouches.length > 0) ?  oEvent.changedTouches[0].pageX : undefined);
        },
    
        /**
         * returns correct Y pos of an event for the different devices
         * 
         * @param {event}
         *            the event 
         * @returns {int} the Y pos of the event or undefined
         * @public
         */
        getEventY : function(oEvent) {
            return oEvent.originalEvent.pageY || 
                ((oEvent.touches && oEvent.touches.length > 0) ? oEvent.touches[0].pageY : undefined) || 
                ((oEvent.changedTouches && oEvent.changedTouches.length > 0) ?  oEvent.changedTouches[0].pageY : undefined);
        },
        
        getStandardImages : function () {
            var oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.wall");
            var standardImages = [{
                file : "basket.jpg",
                preview : "basket_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_BASKET")
            }, {
                file : "brick.jpg",
                preview : "brick_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_BRICK")
            }, {
                file : "carpet.jpg",
                preview : "carpet_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_CARPET")
            }, {
                file : "cork.jpg",
                preview : "cork_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_CORK")
            }, {
                file : "dots_grey.jpg",
                preview : "dots_grey_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_DOTS_GREY")
            }, {
                file : "dots_red.jpg",
                preview : "dots_red_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_DOTS_RED")
            }, {
                file : "felt.jpg",
                preview : "felt_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_FELT")
            }, {
                file : "flowers.jpg",
                preview : "flowers_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_FLOWERS")
            }, {
                file : "gaze.jpg",
                preview : "gaze_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_GAZE")
            }, {
                file : "graphpaper.jpg",
                preview : "graphpaper_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_GRAPHPAPER")
            }, {
                file : "grass.jpg",
                preview : "grass_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_GRASS")
            }, {
                file : "lined_paper.jpg",
                preview : "lined_paper_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_LINED_PAPER")
            }, {
                file : "linen.jpg",
                preview : "linen_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_LINEN")
            }, {
                file : "paper.jpg",
                preview : "paper_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_PAPER")
            }, {
                file : "patchwork.jpg",
                preview : "patchwork_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_PATCHWORK")
            }, {
                file : "squared_paper.jpg",
                preview : "squared_paper_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_SQUARED_PAPER")
            }, {
                file : "stone.jpg",
                preview : "stone_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_STONE")
            }, {
                file : "yellow_patchwork.jpg",
                preview : "yellow_patchwork_preview.jpg",
                name : oRB.getText("WALL_SETTING_BACKGROUND_STANDARD_IMG_YELLOW_PATCHWORK")
            }];
            return standardImages;
        }

    };
})();