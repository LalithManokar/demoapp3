/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.controls.Repeater");
jQuery.sap.require("sap.ui.ino.controls.AriaLivePriority");

(function() {
    "use strict";

    /**
     * The repeater is a flexible (in contrast to the sap.ui.commons.RowRepeater) to iterate over collections.
     * <ul>
     * <li>Properties
     * <ul>
     * <li>visible: Boolean indicator whether the control is visible or not</li>
     * <li>showMoreSteps: Number of rows until the showMore Control is displayed</li>
     * <li>waitingText: Text while data of repeater is loaded</li>
     * <li>floatHorizontal: Boolean indicator whether the rows should be repeated horizontally (try) or vertically</li>
     * <li>sortFunction: Function for sorting entries in the repeater</li>
     * <li>rowContainerStyle: optional style class for rows</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li>header: Control rendered as header before rows</li>
     * <li>rows: rows of the Repeater</li>
     * <li>footer: Control rendered as footer after rows</li>
     * <li>showMoreButton: Control which should be displayed to trigger reloading of more rows</li>
     * <li>floatHorizontalSeparatorControl: Separator control to be placed when rows are repeated horizontally</li>
     * <li>noData: Control which should be displayed when no data is available</li>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * <li>totalCountUpdated: Triggered, when the total count of the items was updated</li>
     * </ul>
     * </li>
     * </ul>
     * 
     */
    sap.ui.core.Control.extend("sap.ui.ino.controls.Repeater", {
        metadata : {

            properties : {
                "visible" : "boolean",
                "showMoreSteps" : "int",
                "waitingText" : "string",
                "floatHorizontal" : "boolean",
                "sortFunction" : "object",
                "rowContainerStyle" : "string",
                "activityIndicatorSrc" : "string",
                ariaLivePriority : {
                    type : "sap.ui.ino.controls.AriaLivePriority",
                    defaultValue : sap.ui.ino.controls.AriaLivePriority.none
                },
                fadeIn : {
                    type : "int",
                    defaultValue : 0
                },
                role : "string"
            },

            aggregations : {
                "header" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    bindable : "bindable"
                },
                "rows" : {
                    type : "sap.ui.core.Control",
                    multiple : true,
                    singularName : "row",
                    bindable : "bindable"
                },
                "footer" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    bindable : "bindable"
                },
                "showMoreButton" : {
                    type : "sap.ui.core.Control",
                    multiple : false
                },
                "floatHorizontalSeparatorControl" : {
                    type : "sap.ui.core.Control",
                    multiple : false
                },
                "noData" : {
                    type : "sap.ui.core.Control",
                    multiple : false
                }
            },
            events : {
                "totalCountUpdated" : {}
            }
        },

        constructor : function() {
            sap.ui.core.Control.prototype.constructor.apply(this, arguments);

            this.initialize();

            // Number of indicator controls is needed by
            // DOM append in order to append before those
            this.iNumberIndicatorControls = 0;
            if (this.getWaitingText()) {
                this.iNumberIndicatorControls++;
            }

            if (this.getShowMoreButton()) {
                this.iNumberIndicatorControls++;
            }

            if (this.getNoData()) {
                this.iNumberIndicatorControls++;
            }

            if (this.getShowMoreButton()) {
                this.getShowMoreButton().attachPress(this.onMoreButtonClicked, this);
            }

        },

        initialize : function() {
            this.iRowCount = 0;
            this.bAllDataRead = false;
            this.bEmpty = false;
            this.bWaiting = false;
            this.bMoreRowsRequested = true;
            this.iRecordsToRead = null;
        },

        exit : function() {
            var oBinding = this.getBinding("rows");
            if (oBinding) {
                var oModel = oBinding.getModel();
                oModel.detachRequestSent(this._onModelRequestSent, this);
                oModel.detachRequestCompleted(this._onModelRequestDone, this);
                oModel.detachRequestFailed(this._onModelRequestDone, this);
            }

            this.initialize();
        },

        destroy : function() {
            sap.ui.core.Control.prototype.destroy.apply(this, arguments);
        },

        bindAggregation : function(sName) {
            if (sName === 'rows') {
                // reset all internal flags for new binding
                // it has to happen before the "super" call as this will trigger updateRows
                // which already sets some flags we'd change by initializing
                this.initialize();
            }
            sap.ui.core.Control.prototype.bindAggregation.apply(this, arguments);
            if (sName === 'rows') {
                // This only covers direct binding, model changes are currently not reflected

                // Only OData model supports bLength Final
                // for JSON/XML model we emulate this flag by registering
                // on the model events. This only works because the JSON/XML model
                // are not loaded partially per binding context
                var oBinding = this.getBinding("rows");

                // The default value is true as the model might already have
                // been loaded completely already
                if (oBinding && (oBinding.bLengthFinal === undefined)) {
                    var oModel = oBinding.getModel();
                    oBinding.bLengthFinal = true;
                    oModel.attachRequestSent(this._onModelRequestSent, this);
                    oModel.attachRequestCompleted(this._onModelRequestDone, this);
                    oModel.attachRequestFailed(this._onModelRequestDone, this);
                }
            }
        },

        _onModelRequestSent : function(oEvent) {
            var oBinding = this.getBinding("rows");
            if (oBinding) {
                oBinding.bLengthFinal = false;
            }
        },

        _onModelRequestDone : function(oEvent) {
            var oBinding = this.getBinding("rows");
            if (oBinding) {
                oBinding.bLengthFinal = true;
                this.updateRows();
            }
        },

        unbindAggregation : function(sName) {
            if (sName === 'rows') {
                sap.ui.base.ManagedObject.prototype.unbindAggregation.apply(this, arguments);
                this.initialize();
                this.destroyAggregation(sName);
            }
        },

        cancel : function(oMessage) {
            this.bWaiting = false;

            if (oMessage) {
                this.setNoData(oMessage);
            }

            this.setShowMoreButton(false);

            this.bEmpty = true;
            this.updateIndicatorControls();
        },

        onMoreButtonClicked : function() {
            this._iSetFocusAfter = this.getRows().length;

            this.addMoreRows();
        },

        addMoreRows : function() {
            this.bMoreRowsRequested = true;
            this.updateRows();
        },

        updateRows : function() {

            // Use default logic
            if (!this.getShowMoreSteps()) {
                sap.ui.base.ManagedObject.prototype.updateAggregation.apply(this, ["rows"]);
                var oBinding = this.getBindingInfo("rows").binding;
                if (oBinding.bLengthFinal || oBinding.bLengthFinal === undefined) {
                    this.bWaiting = false;
                    this.bEmpty = (oBinding.getLength() == 0);
                    this.fireTotalCountUpdated({
                        count : oBinding.getLength()
                    });
                } else {
                    this.bWaiting = true;
                }
                this.updateIndicatorControls();
                this.rerender();
                return;
            }

            var oBindingInfo = this.getBindingInfo("rows");
            var fnFactory = oBindingInfo.factory;
            var oBinding = oBindingInfo.binding;
            var iTotalCount = oBinding.getLength();

            if (oBinding.bLengthFinal === undefined) {
                var oModel = oBinding.getModel();
                if (oModel && !jQuery.sap.equal(oModel.getProperty("/"), {})) {
                    oBinding.bLengthFinal = true;
                }
            }

            if (!oBinding.bLengthFinal) {
                iTotalCount = -1;
            } else if (oBinding.iLastStartIndex !== oBinding.getLength()) {
                this.fireTotalCountUpdated({
                    count : iTotalCount
                });
            }

            // reset row count
            if (oBinding.getLength() === 0 && oBinding.iLastStartIndex === 0) {
                this.iRowCount = 0;
            }

            var iRecordsToRead = this.getShowMoreSteps();
            if (this.iRecordsToRead) {
                iRecordsToRead = this.iRecordsToRead;
                this.iRecordsToRead = null;
            }

            // read data
            var aContexts = oBinding ? oBinding.getContexts(this.iRowCount, iRecordsToRead) : [];

            if (aContexts.length !== 0) {
                if (this.bMoreRowsRequested) {
                    this.bMoreRowsRequested = false;

                    var iFromIndex = this.iRowCount;
                    this.bWaiting = false;
                    this.iRowCount = this.iRowCount + aContexts.length;

                    var aNewControls = [];
                    var that = this;

                    jQuery.each(aContexts, function(key, oContext) {
                        var sId = that.getId() + "-" + (key + iFromIndex);
                        var oClone = fnFactory(sId, oContext);
                        oClone.setBindingContext(oContext);
                        // When rendering the very first time we want
                        // the render method to be called to have a hook
                        // for appending to the DOM
                        that.addAggregation("rows", oClone, true);
                        aNewControls.push(oClone);
                    });

                    this.appendNewControls(aNewControls);
                }

            } else {
                if (iTotalCount === 0) {
                    this.bWaiting = false;
                    this.bMoreRowsRequested = false;
                } else {
                    this.bWaiting = true;
                }
            }

            this.bEmpty = (oBinding.getLength() + oBinding.iLastStartIndex === 0);
            this.bAllDataRead = (this.iRowCount === iTotalCount);

            this.bWaiting = !oBinding.bLengthFinal;

            // Newer version of OData binding has this flag -> no need to interpret
            if (oBinding.bPendingRequest !== undefined) {
                this.bWaiting = oBinding.bPendingRequest;
            }

            this.updateIndicatorControls();

        },

        updateIndicatorControls : function() {

            var oNoDataControl = this.getNoData();
            if (oNoDataControl) {
                this._toggleDomById(this.getId() + "-nodata", this.bEmpty && !this.bWaiting, false);
            }

            var oShowMoreButton = this.getShowMoreButton();
            if (oShowMoreButton) {
                this._toggleDomById(this.getId() + "-showmore", !this.bAllDataRead && !this.bWaiting, true);
            }

            if (this.getWaitingText()) {
                this._toggleDomById(this.getId() + "-waitingindicator", this.bWaiting, false);
            }

            if (this.bWaiting) {
                jQuery("#" + this.getId()).attr("aria-busy", "true");
            } else {
                jQuery("#" + this.getId()).attr("aria-busy", "false");
            }

        },

        _toggleDomById : function(sDomId, bShowCondition, bConsiderTabindex) {
            var oElement = jQuery("#" + sDomId);
            if (bShowCondition) {
                oElement.show();
                if (bConsiderTabindex) {
                    jQuery(oElement.children()[0]).attr("tabindex", 0);
                }
            } else {
                oElement.hide();
                if (bConsiderTabindex) {
                    jQuery(oElement.children()[0]).attr("tabindex", -1);
                }
            }
        },

        renderRow : function(oRm, oControl, iControlIndex) {
            oRm.write("<li");
            oRm.writeAttribute("tabindex", -1);
            oRm.addClass("sapUiInoRepeaterItem");
            
            var sId = undefined;
            
            if (this.getFadeIn() > 0) {
                oRm.writeAttribute("style", "display: none;");
                sId = oControl.getId() + "-item" + iControlIndex;
                oRm.writeAttribute("id", sId);
            }

            if (this.getFloatHorizontal()) {
                oRm.addClass("sapUiInoRepeaterHorizontalFloat");
                if (iControlIndex === 0) {
                    oRm.addClass("sapUiInoRepeaterHorizontalFloatFirst");
                }
                if (this.getRowContainerStyle()) {
                    oRm.addClass(this.getRowContainerStyle());
                }
            }
            oRm.writeAttribute("data-sap-ui-ino-controls-repeater-index", iControlIndex);
            oRm.writeClasses();
            oRm.write(">");

            oRm.renderControl(oControl);

            // All entries besides the last one get the separator appended
            if (this.getFloatHorizontal() && this.getFloatHorizontalSeparatorControl() && (iControlIndex < this.getRows().length - 1)) {
                oRm.renderControl(this.getFloatHorizontalSeparatorControl());
            }

            oRm.write("</li>");
            
            if (this.getFadeIn() > 0) {
                setTimeout(function() {
                    jQuery('#' + sId).fadeIn(200);                
                }, this.getFadeIn() * this._renderIdx++);
            }
        },

        renderer : function(oRm, oRepeater) {
            oRepeater._renderIdx = 0;
            
            if (oRepeater.getVisible() === false) {
                return;
            }

            oRm.write("<ul");
            oRm.writeControlData(oRepeater);

            if (oRepeater.getAriaLivePriority()) {
                oRm.writeAttribute("aria-live", oRepeater.getAriaLivePriority());
            }
            
            if (oRepeater.getRole()) {
                oRm.writeAttributeEscaped("role", oRepeater.getRole());
            }

            oRm.addClass("sapUiInoRepeater");
            oRm.writeClasses();
            oRm.write(">");

            var oRows = oRepeater.getRows();

            // will be used if the UI is rerendered
            if (oRepeater.getSortFunction()) {
                oRows.sort(oRepeater.getSortFunction());
            }

            if (oRows.length > 0 && oRepeater.getHeader()) {
                oRm.renderControl(oRepeater.getHeader());
            }

            for (var i = 0; i < oRows.length; i++) {
                jQuery.sap.log.info("Rendering row " + oRows[i].getId() + " in render function", null, "sap.ui.ino.controls.Repeater");
                oRepeater.renderRow(oRm, oRows[i], i);
            }

            if (oRepeater.getWaitingText()) {
                oRm.write("<div");
                oRm.writeAttribute("id", oRepeater.getId() + "-waitingindicator");
                oRm.addClass("sapUiInoRepeaterWaiting");
                oRm.writeClasses();
                if (oRepeater.getActivityIndicatorSrc()) {
                    oRm.addStyle("background-image", "url(" + oRepeater.getActivityIndicatorSrc() + ")");
                    oRm.writeStyles();
                }
                oRm.write(">");
                oRm.write(oRepeater.getWaitingText());
                oRm.write("</div>");
            }

            if (oRepeater.getNoData()) {
                oRm.write("<div");
                oRm.writeAttribute("id", oRepeater.getId() + "-nodata");
                oRm.write(">");
                oRm.renderControl(oRepeater.getNoData());
                oRm.write("</div>");
            }

            if (oRows.length > 0 && oRepeater.getFooter()) {
                oRm.renderControl(oRepeater.getFooter());
            }

            oRm.write("</ul>");

            if (oRepeater.getShowMoreButton()) {
                oRm.write("<div");
                oRm.writeAttribute("id", oRepeater.getId() + "-showmore");
                oRm.write(">");
                oRm.renderControl(oRepeater.getShowMoreButton());
                oRm.write("</div>");
            };
        },

        // Aggregated controls are appended to the DOM
        appendNewControls : function(aNewControls) {
            this._renderIdx = 0;
            
            var oControlDOM = this.getDomRef();
            if (!oControlDOM) {
                // This means data is there before the rendering happened
                // No problem: just return and the renderer will render everything from scratch
                return;
            }

            var oRm = new sap.ui.core.RenderManager();

            for (var i = 0; i < aNewControls.length; i++) {
                jQuery.sap.log.info("Rendering row " + aNewControls[i].getId() + " in append function", null, "sap.ui.ino.controls.Repeater");
                this.renderRow(oRm, aNewControls[i], i + this.getRows().length);
            }

            oRm.flush(oControlDOM, false, jQuery(oControlDOM).children().length - this.iNumberIndicatorControls);
            oRm.destroy();

            this._updateFocusOnMoreRows();
        },

        onAfterRendering : function() {
            this.updateIndicatorControls();
        },

        _updateFocusOnMoreRows : function() {
            // try to set the focus to the next row
            // else set the focus to the first focusable row we can find BEFORE the button we just pressed
            var oControl = this;

            if (oControl._iSetFocusAfter) {
                setTimeout(function() {
                    var aRows = oControl.getRows();
                    if (aRows.length > oControl._iSetFocusAfter) {
                        var oRow = jQuery.sap.byId(aRows[oControl._iSetFocusAfter].getId()).parent()[0];
                        oRow.focus();
                    } else if (aRows.length > 0) {
                        var oRow = jQuery.sap.byId(aRows[aRows.length - 1].getId()).parent()[0];
                        oRow.focus();
                    }

                    oControl._iSetFocusAfter = undefined;
                }, 1);
            }
        }

    });

})();