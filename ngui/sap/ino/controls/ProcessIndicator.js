/*!
 * @copyright@
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/FlexBox",
    "sap/ui/core/Icon",
	"sap/base/security/sanitizeHTML"
], function(Control,
	Label,
	Text,
	FlexBox,
	Icon, sanitizeHTML) {
	"use strict";

	/**
	 *
	 * Control displaying the current status of a process.
	 *
	 * <ul>
	 * <li>Properties
	 * <ul>
	 * <li>currentStep: Currently active process step</li>
	 * <li>isDraft: </li>
	 * <li>phase: The name of the current process phase</li>
	 * <li>processSteps: Total number of process steps</li>
	 * <li>processStopped: If false, the displayed process is active and running</li>
	 * <li>status: The name of the current process status</li>
	 * <li>width: Desired width of the control in pixels</li>
	 * </ul>
	 * </ul>
	 */
	var ProcessIndicator = Control.extend("sap.ino.controls.ProcessIndicator", {

		metadata: {
			properties: {
				currentStep: {
					type: "int",
					defaultValue: 0
				},
				isDraft: {
					type: "boolean",
					defaultValue: false
				},
				phase: {
					type: "string"
				},
				processSteps: {
					type: "int",
					defaultValue: 6
				},
				processStopped: {
					type: "boolean",
					defaultValue: false
				},
				renderProcessFirst: {
					type: "boolean",
					defaultValue: false
				},
				status: {
					type: "string"
				},
				statusColor: {
					type: "string"
				},
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "160px"
				},
				displaySvg: {
					type: "boolean",
					defaultValue: true
				},
				displayStatus: {
					type: "boolean",
					defaultValue: true
				},
				visibleNewFlag:{
				    type: "boolean",
					defaultValue: false 
				}
			},
			aggregations: {
				"_status": {
					type: "sap.m.FlexBox",
					multiple: false,
					visibility: "hidden"
				},
				"_phase": {
					type: "sap.m.FlexBox",
					multiple: false,
					visibility: "hidden"
				}
			}
		},

		init: function() {
			this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
			if (sap.ui.core.Control.prototype.init) {
				sap.ui.core.Control.prototype.init.apply(this, arguments);
			}
		},

		_getPhase: function() {
			var oPhase = this.getAggregation("_phase");
			if (!oPhase) {
				oPhase = new FlexBox({
					items: [this._getPhaseLabel(), this._getPhaseText()],
					alignItems: "Start",
					justifyContent: "Start",
					alignContent: "Start"
				}).addStyleClass("sapInoProcessIndicatorPhase");
				this.setAggregation("_phase", oPhase);
			}
			return oPhase;
		},

		_getStatus: function() {
			var oStatus = this.getAggregation("_status");
			if (!oStatus) {
				oStatus = new FlexBox({
					items: [this._getStatusLabel(), this._getStatusText(),this._getStatusNewIcon()],
					alignItems: "Start",
					justifyContent: "Start",
					alignContent: "Start"
				}).addStyleClass("sapInoProcessIndicatorStatus");
				this.setAggregation("_status", oStatus);
			}
			return oStatus;
		},

		_getPhaseLabel: function() {
			var sPhase = this.getProperty("phase");
			if (this.getProperty("isDraft")) {
				sPhase = "";
			}
			return new Label({
				text: this._oRB.getText("CTRL_PROCESSINDICATOR_FLD_PHASE_LABEL"),
				tooltip: this._oRB.getText("CTRL_PROCESSINDICATOR_ALT_PHASE_TOOLTIP", sPhase)
			}).addStyleClass("sapInoProcessIndicatorPhaseLabel");
		},

		_getPhaseText: function() {
			var sPhase = this.getProperty("phase");
			if (this.getProperty("isDraft")) {
				sPhase = "";
			}
			return new Text({
				text: sPhase,
				tooltip: this._oRB.getText("CTRL_PROCESSINDICATOR_ALT_PHASE_TOOLTIP", sPhase)
			}).addStyleClass("sapInoProcessIndicatorPhaseText");
		},

		_getStatusLabel: function() {
			var sStatus = this.getProperty("status");
			return new Label({
				text: this._oRB.getText("CTRL_PROCESSINDICATOR_FLD_STATUS_LABEL"),
				tooltip: this._oRB.getText("CTRL_PROCESSINDICATOR_ALT_STATUS_TOOLTIP", sStatus)
			}).addStyleClass("sapInoProcessIndicatorStatusLabel");
		},
       _getStatusNewIcon: function(){
			return new Icon({
				tooltip: this._oRB.getText("CTRL_IDEA_OBJECT_LATEST_UPDATE_NEW"),
				visible: this.getProperty("visibleNewFlag"),
                src:"sap-icon://InoIcons/idea-news"				
			}).addStyleClass("sapInoIdeaLatestUpdateNewIcon");
       },
		_getStatusText: function() {
			var sStatus = this.getProperty("status");
			return new Text({
				text: sStatus,
				tooltip: this._oRB.getText("CTRL_PROCESSINDICATOR_ALT_STATUS_TOOLTIP", sStatus)
			}).addStyleClass("sapInoProcessIndicatorStatusText");
		},

		_renderInfoText: function(oRm, oControl, bRenderText) {
			if (bRenderText && !oControl.getProperty("isDraft") && this.getProperty("phase")) {
				oRm.renderControl(oControl._getPhase());
			}
			if ((bRenderText || oControl.getProperty("isDraft")) && this.getProperty("status") && oControl.getDisplayStatus()) {
				oRm.renderControl(oControl._getStatus());
			}
		},

		renderer: function(oRm, oControl) {
			var iSteps = oControl.getProperty("processSteps");
			var iCurrentStep = oControl.getProperty("currentStep");
			var iWidth = sanitizeHTML(oControl.getProperty("width").replace("px", ""));
			var bRenderText = false;
			if (oControl.getProperty("phase") || oControl.getProperty("status")) {
				bRenderText = true;
			}

			var iDiameter = 12;

			var fStartY = iDiameter / 2;
			var fStartX = iDiameter / 2;
			if (bRenderText) {
				fStartX = iDiameter / 2;
				fStartY = iDiameter / 2;
			}
			var fLineHeight = iDiameter / 2.5;

			var fStepX = 0;
			if (iSteps >= 2) {
				fStepX = (iWidth - fStartX * 2) / (iSteps - 1);
			}

			var fProgressLineWidth = ((iCurrentStep < 0) ? 0 : iCurrentStep * fStepX);
			if (iCurrentStep >= iSteps) {
				fProgressLineWidth = iWidth;
			}

			function line(x, y, iWidth, iHeight, sStyleClass) {
				oRm.write("<rect");
				oRm.writeAttributeEscaped("x", x);
				oRm.writeAttributeEscaped("y", y - iHeight / 2);
				oRm.writeAttributeEscaped("width", iWidth + "px");
				oRm.writeAttributeEscaped("height", iHeight + "px");
				oRm.addClass(sStyleClass);
				oRm.writeClasses();
				oRm.write("/>");
			}

			function circle(x, y, iRadius, sStyleClass) {
				oRm.write("<circle");
				oRm.writeAttributeEscaped("cx", x);
				oRm.writeAttributeEscaped("cy", y);
				oRm.writeAttributeEscaped("r", iRadius);
				oRm.addClass(sStyleClass);
				oRm.writeClasses();
				oRm.write("/>");
			}

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addStyle("width", iWidth + "px");
			oRm.addStyle("overflow", "hidden");
			oRm.writeStyles();
			oRm.writeClasses();
			if (oControl.getProperty('phase') && oControl.getProperty('status')) {
				oRm.writeAttributeEscaped("title", oControl._oRB.getText("CTRL_PROCESSINDICATOR_ALT_NOTE", [oControl.getProperty('phase'), oControl.getProperty(
					'status')]));
			} else if (oControl.getProperty('phase') && !oControl.getProperty('status')) {
				oRm.writeAttributeEscaped("title", oControl._oRB.getText("CTRL_PROCESSINDICATOR_ALT_NOTE_WITHOUT_STATUS", [oControl.getProperty(
					'phase')]));
			} else if (!oControl.getProperty('phase') && oControl.getProperty('status')) {
				oRm.writeAttributeEscaped("title", oControl._oRB.getText("CTRL_PROCESSINDICATOR_ALT_NOTE_WITHOUT_PHASE", [oControl.getProperty(
					'status')]));
			}
			oRm.write(">");

			// accessibility: can be read w/ VPC
			oRm.write("<span style=\"position:absolute;clip:rect(1px,1px,1px,1px)\">");
			if (oControl.getProperty('phase') && oControl.getProperty('status')) {
				oRm.writeEscaped(oControl._oRB.getText("CTRL_PROCESSINDICATOR_ALT_NOTE", [oControl.getProperty('phase'), oControl.getProperty(
					'status')]));
			} else if (oControl.getProperty('phase') && !oControl.getProperty('status')) {
				oRm.writeEscaped(oControl._oRB.getText("CTRL_PROCESSINDICATOR_ALT_NOTE_WITHOUT_STATUS", [oControl.getProperty('phase')]));
			} else if (!oControl.getProperty('phase') && oControl.getProperty('status')) {
				oRm.writeEscaped(oControl._oRB.getText("CTRL_PROCESSINDICATOR_ALT_NOTE_WITHOUT_PHASE", [oControl.getProperty('status')]));
			}
			oRm.write("</span>");

			if (oControl.getDisplaySvg()) {
				oRm.write("<svg");
				oRm.writeAttribute("focusable", "false"); // required by IE
				oRm.addStyle("width", iWidth + "px");
				oRm.addStyle("height", iDiameter + "px");

				oRm.writeStyles();
				oRm.writeClasses();
				oRm.write(">");

				var sClassName = "sapInoProcessIndicatorActive";
				if (oControl.getProcessStopped()) {
					sClassName = "sapInoProcessIndicatorStopped";
				}

				if (iSteps > 1) {
					line(fStartX, fStartY, fProgressLineWidth, fLineHeight, sClassName);
					line(fStartX + fProgressLineWidth, fStartY, iWidth - fProgressLineWidth - iDiameter, fLineHeight, "sapInoProcessIndicatorInactive");
				}

				for (var i = 0; i < iSteps; i++) {
					var x = i * fStepX + fStartX;
					var sStepClassName = sClassName;
					if (i > iCurrentStep || oControl.getProperty("isDraft")) {
						sStepClassName = "sapInoProcessIndicatorInactive";
					}
					circle(x, fStartY, iDiameter / 2, sStepClassName);
				}

				oRm.write("</svg>");
			}
			if (!oControl.getRenderProcessFirst()) {
				oControl._renderInfoText(oRm, oControl, bRenderText);
			}

			if (oControl.getRenderProcessFirst()) {
				oControl._renderInfoText(oRm, oControl, bRenderText);
			}

			oRm.write("</div>");
		},
		onAfterRendering: function() {
			var sStatusColor = this.getModel("object") ? this.getModel("object").getProperty("/STATUS_COLOR") : null ||
				this.getProperty("statusColor");
			if (sStatusColor && sStatusColor.length === 6) {
				sStatusColor = "#" + sStatusColor;
			} else {
				sStatusColor = "#333333";
			}
			if (this.getModel("object")) {
				$(".sapInoProcessIndicatorStatusText").css('color', sStatusColor);
			} else {
				if (this.getDomRef()) {
					$(this.getDomRef()).find('.sapInoProcessIndicatorStatusText').css("color", sStatusColor);
				}
			}
		}
	});

	ProcessIndicator.prototype.bindProperty = function(sKey, oBinding) {
		Control.prototype.bindProperty.apply(this, arguments);
		switch (sKey) {
			case "status":
				var oStatusText = this._getStatus().getItems()[1];
				oStatusText.bindProperty("text", oBinding);
				break;
			case "phase":
				Control.prototype.bindProperty.apply(this, arguments);
				var oPhaseText = this._getPhase().getItems()[1];
				oPhaseText.bindProperty("text", oBinding);
				break;
			default:
				break;
		}
	};
	ProcessIndicator.prototype.setVisibleNewFlag = function(oValue) {
		this.setProperty("visibleNewFlag", oValue);
		var oStatusNewLabel = this._getStatus().getItems()[2];
		oStatusNewLabel.setVisible(oValue);
	};
	ProcessIndicator.prototype.setStatus = function(oValue) {
		this.setProperty("status", oValue);
		var oStatusLabel = this._getStatus().getItems()[0];
		oStatusLabel.setText(this._oRB.getText("CTRL_PROCESSINDICATOR_FLD_STATUS_LABEL", oValue));
		oStatusLabel.setTooltip(this._oRB.getText("CTRL_PROCESSINDICATOR_ALT_STATUS_TOOLTIP", oValue));
		var oStatusText = this._getStatus().getItems()[1];
		oStatusText.setText(oValue);
	};

	ProcessIndicator.prototype.setPhase = function(oValue) {
		this.setProperty("phase", oValue);
		var oPhaseLabel = this._getPhase().getItems()[0];
		oPhaseLabel.setText(this._oRB.getText("CTRL_PROCESSINDICATOR_FLD_PHASE_LABEL", oValue));
		oPhaseLabel.setTooltip(this._oRB.getText("CTRL_PROCESSINDICATOR_ALT_PHASE_TOOLTIP", oValue));
		var oPhaseText = this._getPhase().getItems()[1];
		oPhaseText.setText(oValue);
	};

	return ProcessIndicator;
});