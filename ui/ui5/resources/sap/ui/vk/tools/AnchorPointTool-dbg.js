/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.AnchorPointTool
sap.ui.define([
	"./Tool",
	"./AnchorPointToolHandler",
	"./AnchorPointToolGizmo"
], function(
	Tool,
	AnchorPointToolHandler,
	AnchorPointToolGizmo
) {
	"use strict";

	/**
	 * Constructor for an AnchorPointTool.
	 *
	 * @class
	 * Tool used to define an anchor point and orientation in 3D space which can be used to rotate, move or scale one or more selected objects

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.71.13
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.AnchorPointTool
	 */
	var AnchorPointTool = Tool.extend("sap.ui.vk.tools.AnchorPointTool", /** @lends sap.ui.vk.tools.AnchorPointTool.prototype */ {
		metadata: {
			properties: {
				/**
				 * If set to <code>true<code> values will change in round number increments instead of continual change
				 */
				enableStepping: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Display text box with current value, which can also be used to directly modify the value
				 */
				showEditingUI: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * If set to <code>true<code> then rotation of anchor point will be enabled
				 */
				enableRotation: {
					type: "boolean",
					defaultValue: false
				}
			},
			events: {
				/**
				 * This event will be fired when movement occurs.
				 */
				moving: {
					parameters: {
						x: "float",
						y: "float",
						z: "float"
					}
				},
				/**
				 * This event will be fired when movement finished.
				 */
				moved: {
					parameters: {
						x: "float",
						y: "float",
						z: "float"
					}
				},
				/**
				 * This event will be fired when rotation occurs.
				 */
				rotating: {
					parameters: {
						x: "float",
						y: "float",
						z: "float"
					}
				},
				/**
				 * This event will be fired when rotation finished.
				 */
				rotated: {
					parameters: {
						x: "float",
						y: "float",
						z: "float"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._handler = new AnchorPointToolHandler(this);
			this._gizmo = null;
		}
	});

	AnchorPointTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint([ "sap.ui.vk.threejs.Viewport" ]);

		this.setAggregation("gizmo", new AnchorPointToolGizmo());
	};

	// Checks if the current viewport is of a specified type
	AnchorPointTool.prototype.isViewportType = function(typeString) {
		if (this._viewport && this._viewport.getMetadata().getName() === typeString) {
			return true;
		}
		return false;
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	AnchorPointTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		if (Tool.prototype.setActive) {
			Tool.prototype.setActive.call(this, value, activeViewport, gizmoContainer);
		}

		if (activeViewport == null) {
			activeViewport = this._viewport;
		}

		if (value) {
			this._activateTool(activeViewport);
		} else {
			this._deactivateTool();
		}

		if (activeViewport) {
			activeViewport.setShouldRenderFrame();
		}

		return this;
	};

	AnchorPointTool.prototype._activateTool = function(activeViewport) {
		this._viewport = this.getViewportImplementation(activeViewport);
		this._gizmo = this.getGizmo();
		if (this._gizmo) {
			this._gizmo.show(this._viewport, this);
		}

		// Prepare the tool to execute
		this._prepare();
	};

	AnchorPointTool.prototype._deactivateTool = function() {
		// Remove tool handler from loco stack for viewport so that the tool no longer handles input from user
		if (this._viewport && this._viewport._loco) {
			this._viewport._loco.removeHandler(this._handler);
		}

		if (this._gizmo) {
			this._gizmo.hide();
			this._gizmo = null;
		}
	};

	/*
	* Checks that the execution criteria for this tool are met before execution of tool commands
	*/
	AnchorPointTool.prototype._prepare = function() {
		var okToExec = false;

		if (this._viewport._loco) {
			// Add tool handler to loco stack for viewport so that the tool can handle input from user
			this._viewport._loco.addHandler(this._handler, 10);
			okToExec = true;
		}

		return okToExec;
	};

	/** MOVE TO BASE
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {sap.ui.vk.tools.AnchorPointTool} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnchorPointTool.prototype.queueCommand = function(command) {
		if (this._prepare()) {

			if (this.isViewportType("sap.ui.vk.threejs.Viewport")) {
				command();
			}
		}
		return this;
	};

	AnchorPointTool.prototype.setShowEditingUI = function(value) {
		this.setProperty("showEditingUI", value, true);
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	/**
	 * Performs movement of the anchor point.
	 *
	 * @param {float} [x] Movement offset along x axis.
	 * @param {float} [y] Movement offset along y axis.
	 * @param {float} [z] Movement offset along z axis.
	 * @returns {sap.ui.vk.tools.AnchorPointTool} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnchorPointTool.prototype.move = function(x, y, z) {
		if (this._gizmo) {
			this._gizmo.move(x, y, z);
		}
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	/**
	 * Performs rotation of the anchor point.
	 *
	 * @param {float} [x] Rotation angle around x axis in degrees.
	 * @param {float} [y] Rotation angle around y axis in degrees.
	 * @param {float} [z] Rotation angle around z axis in degrees.
	 * @returns {sap.ui.vk.tools.AnchorPointTool} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnchorPointTool.prototype.rotate = function(x, y, z) {
		if (!this.getEnableRotation()) {
			// Rotation is not enabled
			return this;
		}

		if (this._gizmo) {
			this._gizmo.rotate(x, y, z);
		}
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	return AnchorPointTool;
});
