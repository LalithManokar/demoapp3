/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.ResponsiveOptionSelector");

(function() {
    "use strict";

    /**
     * Constructor for a new ResponsiveOptionSelector.
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
     * <li>{@link #getMode mode} : string (default: 'Large')</li>
     * <li>{@link #getEditable editable} : boolean (default: true)</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li>{@link #get_segmentedButton _segmentedButton} : sap.m.SegmentedButton</li>
     * <li>{@link #get_label _label} : sap.m.Label</li>
     * <li>{@link #get_select _select} : sap.m.Select</li>
     * <li>{@link #getOptions options} : sap.ui.core.Item[]</li>
     * </ul>
     * </li>
     * <li>Associations
     * <ul>
     * <li>{@link #getSelectedOption selectedOption} : string | sap.ui.core.Item</li>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * <li>{@link sap.ino.wall.ResponsiveOptionSelector#event:select select} : fnListenerFunction or
     * [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
     * </ul>
     * </li>
     * </ul>
     * 
     * 
     * @param {string}
     *            [sId] id for the new control, generated automatically if no id is given
     * @param {object}
     *            [mSettings] initial settings for the new control
     * 
     * @class Add your documentation for the new ResponsiveOptionSelector
     * @extends sap.ui.core.Control
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ui.core.Control.extend("sap.ino.wall.ResponsiveOptionSelector", {
        metadata : {
            properties : {
                "selectedOptionKey" : {
                    type : "string",
                    defaultValue : undefined
                },
                "mode" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : 'Large'
                },
                "editable" : {
                    type : "boolean",
                    group : "Misc",
                    defaultValue : true
                }
            },
            aggregations : {
                "_segmentedButton" : {
                    type : "sap.m.SegmentedButton",
                    multiple : false
                },
                "_label" : {
                    type : "sap.m.Label",
                    multiple : false
                },
                "_select" : {
                    type : "sap.m.Select",
                    multiple : false
                },
                "options" : {
                    type : "sap.ui.core.Item",
                    multiple : true,
                    singularName : "option"
                }
            },
            associations : {
                "selectedOption" : {
                    type : "sap.ui.core.Item",
                    multiple : false
                }
            },
            events : {
                "select" : {}
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.ResponsiveOptionSelector with name <code>sClassName</code> and
     * enriches it with the information contained in <code>oClassInfo</code>.
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
     * @name sap.ino.wall.ResponsiveOptionSelector.extend
     * @function
     */

    sap.ino.wall.ResponsiveOptionSelector.M_EVENTS = {
        'select' : 'select'
    };

    /**
     * Getter for property <code>mode</code>. TODO
     * 
     * Default value is <code>Large</code>
     * 
     * @return {string} the value of property <code>mode</code>
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#getMode
     * @function
     */

    /**
     * Setter for property <code>mode</code>.
     * 
     * Default value is <code>Large</code>
     * 
     * @param {string}
     *            sMode new value for property <code>mode</code>
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#setMode
     * @function
     */

    /**
     * Getter for property <code>editable</code>.
     * 
     * Default value is <code>true</code>
     * 
     * @return {boolean} the value of property <code>editable</code>
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#getEditable
     * @function
     */

    /**
     * Setter for property <code>editable</code>.
     * 
     * Default value is <code>true</code>
     * 
     * @param {boolean}
     *            bEditable new value for property <code>editable</code>
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#setEditable
     * @function
     */

    /**
     * Getter for aggregation <code>_segmentedButton</code>.<br/> TODO
     * 
     * @return {sap.m.SegmentedButton}
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#get_segmentedButton
     * @function
     */

    /**
     * Setter for the aggregated <code>_segmentedButton</code>.
     * 
     * @param {sap.m.SegmentedButton}
     *            o_segmentedButton
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#set_segmentedButton
     * @function
     */

    /**
     * Destroys the _segmentedButton in the aggregation named <code>_segmentedButton</code>.
     * 
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#destroy_segmentedButton
     * @function
     */

    /**
     * Getter for aggregation <code>_label</code>.<br/> TODO
     * 
     * @return {sap.m.Label}
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#get_label
     * @function
     */

    /**
     * Setter for the aggregated <code>_label</code>.
     * 
     * @param {sap.m.Label}
     *            o_label
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#set_label
     * @function
     */

    /**
     * Destroys the _label in the aggregation named <code>_label</code>.
     * 
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#destroy_label
     * @function
     */

    /**
     * Getter for aggregation <code>_select</code>.<br/> TODO
     * 
     * @return {sap.m.Select}
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#get_select
     * @function
     */

    /**
     * Setter for the aggregated <code>_select</code>.
     * 
     * @param {sap.m.Select}
     *            o_select
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#set_select
     * @function
     */

    /**
     * Destroys the _select in the aggregation named <code>_select</code>.
     * 
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#destroy_select
     * @function
     */

    /**
     * Getter for aggregation <code>options</code>.<br/> The options to be set by this control
     * 
     * @return {sap.ui.core.Item[]}
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#getOptions
     * @function
     */

    /**
     * Inserts a option into the aggregation named <code>options</code>.
     * 
     * @param {sap.ui.core.Item}
     *            oOption the option to insert; if empty, nothing is inserted
     * @param {int}
     *            iIndex the <code>0</code>-based index the option should be inserted at; for a negative value of
     *            <code>iIndex</code>, the option is inserted at position 0; for a value greater than the current
     *            size of the aggregation, the option is inserted at the last position
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#insertOption
     * @function
     */

    /**
     * Adds some option <code>oOption</code> to the aggregation named <code>options</code>.
     * 
     * @param {sap.ui.core.Item}
     *            oOption the option to add; if empty, nothing is inserted
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#addOption
     * @function
     */

    /**
     * Removes an option from the aggregation named <code>options</code>.
     * 
     * @param {int |
     *            string | sap.ui.core.Item} vOption the option to remove or its index or id
     * @return {sap.ui.core.Item} the removed option or null
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#removeOption
     * @function
     */

    /**
     * Removes all the controls in the aggregation named <code>options</code>.<br/> Additionally unregisters them
     * from the hosting UIArea.
     * 
     * @return {sap.ui.core.Item[]} an array of the removed elements (might be empty)
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#removeAllOptions
     * @function
     */

    /**
     * Checks for the provided <code>sap.ui.core.Item</code> in the aggregation named <code>options</code> and
     * returns its index if found or -1 otherwise.
     * 
     * @param {sap.ui.core.Item}
     *            oOption the option whose index is looked for.
     * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#indexOfOption
     * @function
     */

    /**
     * Destroys all the options in the aggregation named <code>options</code>.
     * 
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#destroyOptions
     * @function
     */

    /**
     * TODO
     * 
     * @return {string} Id of the element which is the current target of the <code>selectedOption</code> association,
     *         or null
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#getSelectedOption
     * @function
     */

    /**
     * TODO
     * 
     * @param {string |
     *            sap.ui.core.Item} vSelectedOption Id of an element which becomes the new target of this
     *            <code>selectedOption</code> association. Alternatively, an element instance may be given.
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#setSelectedOption
     * @function
     */

    /**
     * TODO
     * 
     * @name sap.ino.wall.ResponsiveOptionSelector#select
     * @event
     * @param {sap.ui.base.Event}
     *            oControlEvent
     * @param {sap.ui.base.EventProvider}
     *            oControlEvent.getSource
     * @param {object}
     *            oControlEvent.getParameters
     * @param {sap.ui.core.Item}
     *            oControlEvent.getParameters.option The authorization that has been selected
     * @public
     */

    /**
     * Attach event handler <code>fnFunction</code> to the 'select' event of this
     * <code>sap.ino.wall.ResponsiveOptionSelector</code>.<br/>. When called, the context of the event handler (its
     * <code>this</code>) will be bound to <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.ResponsiveOptionSelector</code>.<br/> itself. 
     *  
     * TODO
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.ResponsiveOptionSelector</code>.<br/> itself.
     *
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#attachSelect
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'select' event of this
     * <code>sap.ino.wall.ResponsiveOptionSelector</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ResponsiveOptionSelector#detachSelect
     * @function
     */

    /**
     * Fire event select to attached listeners.
     * 
     * Expects following event parameters:
     * <ul>
     * <li>'option' of type <code>sap.ui.core.Item</code> The authorization that has been selected</li>
     * </ul>
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.ResponsiveOptionSelector} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.ResponsiveOptionSelector#fireSelect
     * @function
     */

    sap.ino.wall.ResponsiveOptionSelector.prototype._getLabel = function() {
        var oLabel = this.getAggregation("_label");

        if (!oLabel) {
            oLabel = new sap.m.Label({
                text : sap.ui.getCore().byId(this.getSelectedOption()).getText()
            });
            this.setAggregation("_label", oLabel);
            this._updateLabel();
        }

        return oLabel;
    };

    sap.ino.wall.ResponsiveOptionSelector.prototype._getSegmentedButton = function() {
        var that = this, oSegmentedButton = this.getAggregation("_segmentedButton"), aOptions, i = 0;

        if (!oSegmentedButton) {
            oSegmentedButton = new sap.m.SegmentedButton({
                width : "210px",
                select : function(oEvent) {
                    that._handleSegmentedButtonSelect(oEvent);
                }
            }).addStyleClass("sapInoWallROSSegmentedButton");

            // create buttons based on the options aggregation
            aOptions = this.getOptions();
            for (; i < aOptions.length; i++) {
                oSegmentedButton.addButton(new sap.m.Button({
                    text : aOptions[i].getText(),
                    customData : new sap.ui.core.CustomData({
                        key : "item",
                        value : aOptions[i]
                    })
                }));
            }
            this.setAggregation("_segmentedButton", oSegmentedButton);
            this._updateSegmentedButton();
        }

        return oSegmentedButton;
    };

    sap.ino.wall.ResponsiveOptionSelector.prototype._getSelect = function() {
        var that = this, oSelect = this.getAggregation("_select"), aOptions, i = 0;

        if (!oSelect) {
            oSelect = new sap.m.Select({
                change : function(oEvent) {
                    that._handleSelectChange(oEvent);
                }
            });
            // create buttons based on the options aggregation
            aOptions = this.getOptions();
            for (; i < aOptions.length; i++) {
                oSelect.addItem(aOptions[i]);
            }
            this.setAggregation("_select", oSelect);
            this._updateSelect();
        }

        return oSelect;
    };

    sap.ino.wall.ResponsiveOptionSelector.prototype.setSelectedOptionKey = function(sKey) {
        var aOptions = this.getOptions();
        for (var i=0; i < aOptions.length; i++) {
            if (aOptions[i].getKey() === sKey) {
                this.setSelectedOption(aOptions[i]);
                break;
            }
        }
    };    
    
    sap.ino.wall.ResponsiveOptionSelector.prototype.setSelectedOption = function(oItem) {
        var aOptions, i = 0;

        // convenience, also allow strings
        if (typeof oItem === "string") {
            aOptions = this.getOptions();
            // find item with this id
            for (; i < aOptions.length; i++) {
                if (aOptions[i].getKey() === oItem) {
                    oItem = aOptions[i];
                    break;
                }
            }
        }

        this.setAssociation("selectedOption", oItem, true);
        this.setProperty("selectedOptionKey", oItem.getKey(), true);
        this._updateInnerControls();
    };

    sap.ino.wall.ResponsiveOptionSelector.prototype.getSelectedOption = function() {
        var oSelectedOption = this.getAssociation("selectedOption");
        if (!oSelectedOption) { // default: first item is selected
            this.setAssociation("selectedOption", this.getOptions()[0], true);
            oSelectedOption = this.getAssociation("selectedOption");
        }
        return oSelectedOption;
    };

    sap.ino.wall.ResponsiveOptionSelector.prototype.setEditable = function(bEditable) {
        this.setProperty("editable", bEditable, false);
        this._updateInnerControls();
    };

    sap.ino.wall.ResponsiveOptionSelector.prototype.setMode = function(sMode) {
        this.setProperty("mode", sMode, false);
        this._updateInnerControls();
    };

    sap.ino.wall.ResponsiveOptionSelector.prototype._updateInnerControls = function() {
        var sMode = this.getMode(), bEditable = this.getEditable();

        if (bEditable) {
            switch (sMode) {
                case "Large" :
                    this._updateSegmentedButton();
                    break;
                case "Small" :
                    this._updateSelect();
                    break;
                default:
                    break;
            }
        } else {
            this._updateLabel();
        }
    };

    /**
     * Checks if the control is already written to the DOM to allow for layout changes
     * 
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.ResponsiveOptionSelector.prototype._isRendered = function() {
        if (this._bIsInDOM === undefined || this._bIsInDOM === 0) {
            this._bIsInDOM = jQuery.sap.byId(this.getId()).length;
        }

        return this._bIsInDOM;
    };

    // TODO: comment this! update segmentedButton selection
    sap.ino.wall.ResponsiveOptionSelector.prototype._updateSegmentedButton = function() {
        var oSegmentedButton = this._getSegmentedButton(), oButtons = oSegmentedButton.getButtons(), oSelectedOption = sap.ui.getCore().byId(this.getSelectedOption()), i = 0;

        for (; i < oButtons.length; i++) {
            if (oButtons[i].getCustomData()[0].getValue() === oSelectedOption) {
                // oSegmentedButton.setSelectedButton(oButtons[i]);
                oSegmentedButton.setAssociation("selectedButton", oButtons[i]);
                if (this._isRendered()) {
                    oSegmentedButton.rerender();
                }
                break;
            }
        }
    };

    // TODO: comment this! update segmentedButton selection
    sap.ino.wall.ResponsiveOptionSelector.prototype._updateSelect = function() {
        var oSelect = this._getSelect();

        oSelect.setSelectedItem(sap.ui.getCore().byId(this.getSelectedOption()));
    };

    // TODO: comment this! update segmentedButton selection
    sap.ino.wall.ResponsiveOptionSelector.prototype._updateLabel = function() {
        var oLabel = this._getLabel(), oSelectedOption = sap.ui.getCore().byId(this.getSelectedOption());

        oLabel.setText(oSelectedOption.getText());
    };

    // Event handler for SegmentedButton
    sap.ino.wall.ResponsiveOptionSelector.prototype._handleSegmentedButtonSelect = function(oEvent) {
        var oSelectedOption = oEvent.getParameter("button").getCustomData()[0].getValue();
        this.setAssociation("selectedOption", oSelectedOption, true);
        this.setProperty("selectedOptionKey", oSelectedOption.getKey(), true);
        this.fireSelect({
            option : oSelectedOption
        });
    };

    // Event handler for Select
    sap.ino.wall.ResponsiveOptionSelector.prototype._handleSelectChange = function(oEvent) {
        var oSelectedOption = oEvent.getParameter("selectedItem");
        this.setAssociation("selectedOption", oSelectedOption, true);
        this.setProperty("selectedOptionKey", oSelectedOption.getKey(), true);
        this.fireSelect({
            option : oSelectedOption
        });
    };

})();