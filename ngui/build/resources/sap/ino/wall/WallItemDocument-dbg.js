/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallItemDocument");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.util.Formatter");
    jQuery.sap.require("sap.ino.wall.DocumentType");

    /**
     * Constructor for a new WallItemDocument.
     * 
     * Accepts an object literal <code>mSettings</code> that defines initial property values, aggregated and
     * associated objects as well as event handlers.
     * 
     * If the name of a setting is ambiguous (e.g. a property has the same name as an event), then the framework assumes
     * property, aggregation, association, event in that order. To override this automatic resolution, one of the
     * prefixes "aggregation:", "association:" or "event:" can be added to the name of the setting (such a prefixed name
     * must be enclosed in single or double quotes).
     * 
     * The supported settings are:
     * <ul>
     * <li>Properties
     * <ul>
     * <li>{@link #getType type} : sap.ino.wall.DocumentType (default: sap.ino.wall.DocumentType.Misc)</li>
     * <li>{@link #getDescription description} : string</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * </ul>
     * </li>
     * <li>Associations
     * <ul>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * </ul>
     * </li>
     * </ul>
     * 
     * 
     * In addition, all settings applicable to the base type
     * {@link sap.ino.wall.WallItemBase#constructor sap.ino.wall.WallItemBase} can be used as well.
     * 
     * @param {string}
     *            [sId] id for the new control, generated automatically if no id is given
     * @param {object}
     *            [mSettings] initial settings for the new control
     * 
     * @class Add your documentation for the WallItemDocument
     * @extends sap.ino.wall.WallItemBase
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.WallItemDocument
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ino.wall.WallItemBase.extend("sap.ino.wall.WallItemDocument", {
        metadata : {
            properties : {
                "type" : {
                    type : "sap.ino.wall.DocumentType",
                    group : "Misc",
                    defaultValue : sap.ino.wall.DocumentType.Misc
                },
                "description" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : null
                }
            },
            aggregations : {
                "_icon" : {
                    type : "sap.ui.core.Icon",
                    multiple : false,
                    visibility : "hidden"
                },
                "_textAreaDescription" : {
                    type : "sap.m.TextArea",
                    multiple : false,
                    visibility : "hidden"
                },
                "_selectType" : {
                    type : "sap.m.Select",
                    multiple : false,
                    visibility : "hidden"
                },
                "_inputLink" : {
                    type : "sap.m.Input",
                    multiple : false,
                    visibility : "hidden"
                }
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.WallItemDocument with name <code>sClassName</code> and enriches
     * it with the information contained in <code>oClassInfo</code>.
     * 
     * <code>oClassInfo</code> might contain the same kind of informations as described in
     * {@link sap.ui.core.Element.extend Element.extend}.
     * 
     * @param {string}
     *            sClassName name of the class to be created
     * @param {object}
     *            [oClassInfo] object literal with informations about the class
     * @param {function}
     *            [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to
     *            sap.ui.core.ElementMetadata.
     * @return {function} the created class / constructor function
     * @public
     * @static
     * @name sap.ino.wall.WallItemDocument.extend
     * @function
     */

    /**
     * Getter for property <code>type</code>. The type of the link. See type definitions for more details.
     * 
     * Default value is <code>Misc</code>
     * 
     * @return {sap.ino.wall.DocumentType} the value of property <code>type</code>
     * @public
     * @name sap.ino.wall.WallItemDocument#getType
     * @function
     */

    /**
     * Setter for property <code>type</code>.
     * 
     * Default value is <code>Misc</code>
     * 
     * @param {sap.ino.wall.DocumentType}
     *            oType new value for property <code>type</code>
     * @return {sap.ino.wall.WallItemDocument} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemDocument#setType
     * @function
     */

    /**
     * Getter for property <code>description</code>. A description text.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>description</code>
     * @public
     * @name sap.ino.wall.WallItemDocument#getDescription
     * @function
     */

    /**
     * Setter for property <code>description</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sDescription new value for property <code>description</code>
     * @return {sap.ino.wall.WallItemDocument} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemDocument#setDescription
     * @function
     */

    sap.ino.wall.WallItemDocument.prototype._getIcon = function() {
        var that = this, oIcon = this.getAggregation("_icon"), sIconURI, sSize, sColor, sActiveColor;

        switch (this.getType()) {
            // TODO: add other types and simplify creation of icons here
            case sap.ino.wall.DocumentType.Word :
                sSize = "85px";
                sIconURI = sap.ui.core.IconPool.getIconURI("doc-attachment");
                sColor = "#1067C1";
                sActiveColor = "#1376D8";
                break;
            case sap.ino.wall.DocumentType.Excel :
                sSize = "85px";
                sIconURI = sap.ui.core.IconPool.getIconURI("excel-attachment");
                sColor = "#52A039";
                sActiveColor = "#5FB742";
                break;
            case sap.ino.wall.DocumentType.PowerPoint :
                sSize = "95px";
                sIconURI = sap.ui.core.IconPool.getIconURI("ppt-attachment");
                sColor = "#EB671B";
                sActiveColor = "#FF6D1E";
                break;
            case sap.ino.wall.DocumentType.PDF :
                sSize = "85px";
                sIconURI = sap.ui.core.IconPool.getIconURI("pdf-attachment");
                sColor = "#DC1414";
                sActiveColor = "#F41818";
                break;
            case sap.ino.wall.DocumentType.Zip :
                sSize = "85px";
                sIconURI = sap.ui.core.IconPool.getIconURI("attachment-zip-file");
                sColor = "#FBC121";
                sActiveColor = "#FFBD0A";
                break;
            case sap.ino.wall.DocumentType.Video :
                sSize = "85px";
                sIconURI = sap.ui.core.IconPool.getIconURI("attachment-video");
                sColor = "#8200E5";
                sActiveColor = "#9400FF";
                break;

            case sap.ino.wall.DocumentType.Text :
                sSize = "85px";
                sIconURI = sap.ui.core.IconPool.getIconURI("attachment-text-file");
                sColor = "#4CBDFF";
                sActiveColor = "#32B4FF";
                break;
            case sap.ino.wall.DocumentType.Misc :
                /* falls through */
            default :
                sSize = "85px";
                sIconURI = sap.ui.core.IconPool.getIconURI("document");
                sColor = "#bbbbbb";
                sActiveColor = "#cccccc";
        }
        if (sap.ui.Device.system.tablet) {
            sSize = (parseInt(sSize, 10) * 1.7) + "px";
        }

        // create new icon
        if (!oIcon) {
            oIcon = new sap.ui.core.Icon({
                press : function() {
                    var sDescription = this.getDescription();
                    if (!this._bMoving && sDescription) {
                        if (sDescription && sDescription !== "http://" && sDescription !== "https://" && sDescription !== "file://") {
                            var oWin = window.open(sDescription, '_blank');
                            oWin.opener = null;
                        } else {
                            this.setFlipped(true);
                        }
                    }
                }.bind(this)
            });

            // add custom styles
            oIcon.addStyleClass("sapInoWallWIDIcon").addStyleClass("noflip");

            // set hidden aggregation
            this.setAggregation("_icon", oIcon, true);
        }
        // update icon
        if (oIcon.getSrc() !== sIconURI) {
            oIcon.setSrc(sIconURI);
            oIcon.setSize(sSize);
            oIcon.setColor(sColor);
            oIcon.setActiveColor(sActiveColor);
        }
        // update icon
        if (oIcon.getSrc() !== sIconURI) {
            oIcon.setSrc(sIconURI);
            oIcon.setSize(sSize);
            oIcon.setColor(sColor);
            oIcon.setActiveColor(sActiveColor);
        }

        return oIcon;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Select} the select
     */
    sap.ino.wall.WallItemDocument.prototype._getSelectType = function() {
        var that = this, oControl = this.getAggregation("_selectType"), sSelectedItemId = null, oItem, aItems, sType = this.getType(), sKey = null, i = 0;

        if (!oControl) {
            // create select control
            oControl = new sap.m.Select(this.getId() + "-type", {
                width : "100%",
                change : function(oEvent) {
                    that.setType(oEvent.getParameter("selectedItem").getText());
                }
            }).addStyleClass("sapInoWallWIBSelect").addStyleClass("noflip").addEventDelegate({
                onsapenter : function(oEvent) {
                    oEvent.preventDefault();
                    oEvent.stopPropagation();
                }
            });

            // add all link types
            for (sKey in sap.ino.wall.DocumentType) {
                if (sap.ino.wall.DocumentType.hasOwnProperty(sKey)) {
                    oItem = new sap.ui.core.Item({
                        key : sKey,
                        text : sKey
                    });
                    oControl.addItem(oItem);
                    // in the same step, define the selected item
                    if (sType === sKey && !sSelectedItemId) {
                        sSelectedItemId = oItem.getId();
                    }
                }
            }

            // set selected item
            oControl.setSelectedItem(sSelectedItemId);

            // set hidden aggregation
            this.setAggregation("_selectType", oControl, true);
        } else {
            // just set the selected item to the current state
            aItems = oControl.getItems();
            for (; i < aItems.length; i++) {
                if (aItems[i].getKey() === sType) {
                    oControl.setSelectedItem(aItems[i]);
                    break;
                }
            }
        }

        return oControl;
    };

    /*******************************************************************************************************************
     * overloaded setters to supress rendering and update ui
     ******************************************************************************************************************/

    sap.ino.wall.WallItemDocument.prototype.setDescription = function(sText, bSkipTypeUpdate) {
        var aMatches, sFileExtension = "";

        this.setProperty("description", sText, true);
        sText = this.getDescription();

        // detect link type by scanning the text
        if (!bSkipTypeUpdate) {
            // match file extension (followed by hash or query parameters ?foo=1 #hash)
            aMatches = /\.([0-9a-z]+)(?:[\?#]|$)/i.exec(sText);
            if (aMatches && aMatches.length > 1) {
                sFileExtension = aMatches[1].toLowerCase();
            } else {
                this.setType(sap.ino.wall.DocumentType.Misc);
            }

            // TODO: only do this when the URL is changes, it is currently done every time the item is loaded
            // set type based on extensions
            switch (sFileExtension) {
                case "doc" :
                case "docx" :
                case "docm" :
                case "dotx" :
                case "dotm" :
                    this.setType(sap.ino.wall.DocumentType.Word);
                    break;
                case "xls" :
                case "xlsx" :
                case "xlsm" :
                case "xlsb" :
                case "xltx" :
                case "xltm" :
                    this.setType(sap.ino.wall.DocumentType.Excel);
                    break;
                case "ppt" :
                case "pptx" :
                case "pptm" :
                case "pot" :
                case "potx" :
                case "potm" :
                    this.setType(sap.ino.wall.DocumentType.PowerPoint);
                    break;
                case "pdf" :
                    this.setType(sap.ino.wall.DocumentType.PDF);
                    break;
                case "txt" :
                    this.setType(sap.ino.wall.DocumentType.Text);
                    break;
                case "zip" :
                case "7z" :
                case "rar" :
                case "gz" :
                case "tar" :
                    this.setType(sap.ino.wall.DocumentType.Zip);
                    break;
                case "avi" :
                case "mp4" :
                case "mpg" :
                case "mov" :
                case "wmv" :
                    this.setType(sap.ino.wall.DocumentType.Video);
                    break;
                default :
                    this.setType(sap.ino.wall.DocumentType.Misc);
            }
        }

        // inform wall that this item has changed a persistence property
        if (this.getParent()) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
    };

    /**
     * Changes the document type without re-rendering
     * 
     * @override
     * @param (string)
     *            sType the new value
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemDocument.prototype.setType = function(sType) {
        // TODO: does not work yet with this version of UI5, replace with $("icon") later
        // var oDomRef = this.$("icon"),
        var oDomRef = jQuery.sap.domById(this.getId() + "-icon"), oIcon, sOldType = this.getType(), oRm;

        this.setProperty("type", sType, true);

        // render new icon into DOM without re-rendering
        if (sType !== sOldType && oDomRef) {
            oIcon = this._getIcon();
            oRm = sap.ui.getCore().createRenderManager();
            oRm.renderControl(oIcon);

            // flush & replace
            oRm.flush(oDomRef, true, false);
            oRm.destroy();
        }

        // inform wall that this item has changed a persistence property
        if (this.getParent()) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Input} the input
     */
    sap.ino.wall.WallItemDocument.prototype._getInputLink = function() {
        var that = this, oControl = this.getAggregation("_inputLink");

        if (!oControl) {
            // create control
            oControl = new sap.m.Input({
                value : sap.ino.wall.util.Formatter.escapeBindingCharacters(sap.ino.wall.util.Formatter.escapeNetworkPaths(this.getDescription())),
                placeholder : this._oRB.getText("WALL_ITEMDOCUMENT_PLACEHOLDER_LINK"),
                change : function(oEvent) {
                    that.setDescription(oEvent.getParameter("newValue"));
                }
            }).addStyleClass("sapInoWallWIDLinkEdit");

            // set hidden aggregation without rerendering
            this.setAggregation("_inputLink", oControl, true);
        }

        return oControl;
    };

    /**
     * creates a minimalic JSON representation of the item to be stored in the db
     * 
     * @param {string}
     *            sColor color identifier
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemDocument.prototype.formatToJSON = function() {
        // call the base object's JSON method
        var oJSON = sap.ino.wall.WallItemBase.prototype.formatToJSON.call(this);
        // add properties of this control
        oJSON.type = this.getType();
        oJSON.description = this.getDescription();
        // return the final object
        return oJSON;
    };

})();