/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemText");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.util.Formatter");
    jQuery.sap.require("sap.ino.wall.TextEditor");
    jQuery.sap.require("sap.ino.wall.config.Config");
    jQuery.sap.require("sap.ino.wall.util.Helper");

    /**
     * Constructor for a new WallItemText.
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
     * @class Add your documentation for the newWallItemText
     * @extends sap.ino.wall.WallItemBase
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.WallItemText
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ino.wall.WallItemBase.extend("sap.ino.wall.WallItemText", {
        metadata : {
            properties : {
                "description" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : null
                }
            },
            aggregations : {
                "_scrollContainerDescription" : {
                    type : "sap.m.ScrollContainer",
                    multiple : false,
                    visibility : "hidden"
                },
                "_textAreaDescription" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    visibility : "hidden"
                }
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.WallItemText with name <code>sClassName</code> and enriches it
     * with the information contained in <code>oClassInfo</code>.
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
     * @name sap.ino.wall.WallItemText.extend
     * @function
     */

    /**
     * Getter for property <code>description</code>. A description text.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>description</code>
     * @public
     * @name sap.ino.wall.WallItemText#getDescription
     * @function
     */

    /**
     * Setter for property <code>description</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sDescription new value for property <code>description</code>
     * @return {sap.ino.wall.WallItemText} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemText#setDescription
     * @function
     */

    /**
     * Initializes the control
     * 
     * @private
     */
    sap.ino.wall.WallItemText.prototype.init = function() {
        sap.ino.wall.WallItemBase.prototype.init.call(this);

        this.setResizable(true);
    };

    /*******************************************************************************************************************
     * overloaded setters to supress rendering and update ui
     ******************************************************************************************************************/

    sap.ino.wall.WallItemText.prototype.setDescription = function(sDescription) {
        this.setProperty("description", sDescription, true);

        if (sap.ino.wall.config.Config.getEnableRichtTextEditing()) {
            this._getScrollContainerDescription().getContent()[0].setContent("<div class=\"sapMText\">" + sap.ino.wall.util.Helper.stripTags(sDescription, "<div><br><b><strong><u><i><em><ol><ul><li><font>") + "</div>");
        } else {
            this._getScrollContainerDescription().getContent()[0].setText(sDescription);
        }

        // inform wall that this item has changed a persistence property
        if (this.getParent()) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
    };

    /**
     * Hook called when the item has been resized by user interaction
     * 
     * @param {boolean}
     *            bSytemCall true when called by system call and not by user interaction
     * @oaram {float} fDeltaX the amount in px the item has been resized
     * @oaram {float} fDeltaY the amount in px the item has been resized
     * 
     * @protected
     */
    sap.ino.wall.WallItemText.prototype._onResize = function(bSystemCall, fDeltaX, fDeltaY) {
        var sSize = this._adjustTShirtSize();
        var oEditor = this._getTextareaDescription();

        if (oEditor instanceof sap.ino.wall.TextEditor) {
            oEditor.setControlDetails(sSize);
        }

        // workaround for no flex support & Safari & IE10
        // firefox has also troubles with the heigh calculations of the scrollContainer, we use the fallback here too
        if (!jQuery.support.hasFlexBoxSupport || sap.ui.Device.browser.firefox || sap.ui.Device.browser.safari || sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version === 10) {
            // front
            if (!this.getH()) {
                // fix when height is not set yet, we need to set a specific height otherwise it will be as long as the
                // text inside
                this.$().find(".front .sapMScrollCont").height("108px");
            } else {
                this.$().find(".front .sapMScrollCont").height("100%");
            }
            var iFixHeight = this.$().find(".front .sapInoWallWITitle").outerHeight();
            this.$().find(".front .sapInoWallWITDescription").height(this.$().find(".front").height() - iFixHeight - 10);
            // back
            iFixHeight = this.$().find(".back .sapInoWallWITitleEdit").outerHeight();
            this.$().find(".back .sapInoWallWITDescription").height(this.$().find(".back").height() - iFixHeight - 20);
            this.$().find(".back .sapInoWallWITDescription .sapInoWallTextEditorContent").height(this.$().find(".back").height() - iFixHeight - this.$().children(".flippable").find(".sapInoWallTextEditorControls").outerHeight() - 20);
        }

        this._adjustTShirtSize();
    };

    /**
     * Lazy initialization of the internal control
     * 
     * @private
     * @returns {sap.m/Input} the input
     */
    sap.ino.wall.WallItemText.prototype._getScrollContainerDescription = function() {
        var oControl = this.getAggregation("_scrollContainerDescription"), oText;

        if (!oControl) {
            // prepare text
            if (sap.ino.wall.config.Config.getEnableRichtTextEditing()) {
                oText = new sap.ui.core.HTML(this.getId() + "-desc", {
                    content : "<div class=\"sapMText\">" + sap.ino.wall.util.Helper.stripTags(sap.ino.wall.util.Formatter.escapeBindingCharacters(this.getDescription()), "<div><b><strong><u><i><em><ol><ul><li><font>") + "</div>",
                    sanitizeContent : true // Sanitizing is done with stripTags, escapeBindingCharacters
                });
            } else {
                oText = new sap.m.Text(this.getId() + "-desc", {
                    text : sap.ino.wall.util.Formatter.escapeBindingCharacters(this.getDescription())
                });
            }
            // create control
            oControl = new sap.m.ScrollContainer(this.getId() + "-sc", {
                height : "100%",
                horizontal : false,
                vertical : true,
                content : oText
            }).addStyleClass("sapInoWallScrollable");

            // set hidden aggregation without rerendering
            this.setAggregation("_scrollContainerDescription", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Input} the input
     */
    sap.ino.wall.WallItemText.prototype._getTextareaDescription = function() {
        var that = this, oControl = this.getAggregation("_textAreaDescription");

        if (!oControl) {
            // create control
            // TODO: remove when text editor is live & stable
            if (sap.ino.wall.config.Config.getEnableRichtTextEditing()) {
                oControl = new sap.ino.wall.TextEditor(this.getId() + "-textEditor", {
                    value : sap.ino.wall.util.Formatter.escapeBindingCharacters(this.getDescription()),
                    change : function(oEvent) {
                        that.setDescription(oEvent.getParameter("value"));
                    }
                }).addStyleClass("noflip").addStyleClass("sapInoWallWITDescriptionTA");
            } else {
                oControl = new sap.m.TextArea({
                    value : sap.ino.wall.util.Formatter.escapeBindingCharacters(this.getDescription()),
                    change : function(oEvent) {
                        that.setDescription(oEvent.getParameter("newValue"));
                    }
                }).addStyleClass("sapInoWallWITDescriptionTA");
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_textAreaDescription", oControl, true);
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
    sap.ino.wall.WallItemText.prototype.formatToJSON = function() {
        // call the base object's JSON method
        var oJSON = sap.ino.wall.WallItemBase.prototype.formatToJSON.call(this);
        // add properties of this control
        oJSON.description = this.getDescription();
        // return the final object
        return oJSON;
    };

})();