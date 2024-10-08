/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.RotateTool
sap.ui.define([
	"./Tool",
	"./CoordinateSystem",
	"./RotateToolHandler",
	"./RotateToolGizmo"
], function(
	Tool,
	CoordinateSystem,
	RotateToolHandler,
	RotateToolGizmo
) {
	"use strict";

	/**
	 * Constructor for a new RotateTool.
	 *
	 * @class
	 * Tool to rotate 3D objects in space

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.71.13
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.RotateTool
	 */
	var RotateTool = Tool.extend("sap.ui.vk.tools.RotateTool", /** @lends sap.ui.vk.tools.RotateTool.prototype */ {
		metadata: {
			properties: {
				/**
				 * Select coordinate system in which this tool operates. Can be Local, World, Screen or Custom
				 */
				coordinateSystem: {
					type: "sap.ui.vk.tools.CoordinateSystem",
					defaultValue: CoordinateSystem.World
				},
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
				}
			},
			events: {
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
				},
				/**
				 * This event will be fired when the coordinate system changes.
				 */
				coordinateSystemChanged: {
					parameters: {
						coordinateSystem: "sap.ui.vk.tools.CoordinateSystem"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._handler = new RotateToolHandler(this);
			this._gizmo = null;
		}
	});

	RotateTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint([ "sap.ui.vk.threejs.Viewport" ]);

		this.setAggregation("gizmo", new RotateToolGizmo());
	};

	// Checks if the current viewport is of a specified type
	RotateTool.prototype.isViewportType = function(typeString) {
		if (this._viewport && this._viewport.getMetadata().getName() === typeString) {
			return true;
		}
		return false;
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	RotateTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		if (Tool.prototype.setActive) {
			Tool.prototype.setActive.call(this, value, activeViewport, gizmoContainer);
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

	RotateTool.prototype._activateTool = function(activeViewport) {
		this._viewport = this.getViewportImplementation(activeViewport);
		this._gizmo = this.getGizmo();
		this._gizmo.setCoordinateSystem(this.getCoordinateSystem());
		this._gizmo.show(this._viewport, this);

		// Prepare the tool to execute
		this._prepare();
	};

	RotateTool.prototype._deactivateTool = function() {
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
	RotateTool.prototype._prepare = function() {
		var okToExec = false;

		if (this._viewport._loco) {
			// Add tool hander to loco stack for viewport so that the tool can handler input from user
			this._viewport._loco.addHandler(this._handler, 12);
			okToExec = true;
		}

		return okToExec;
	};

	/** MOVE TO BASE
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {sap.ui.vk.tools.RotateTool} <code>this</code> to allow method chaining.
	 * @public
	 */
	RotateTool.prototype.queueCommand = function(command) {
		if (this._prepare()) {

			if (this.isViewportType("sap.ui.vk.threejs.Viewport")) {
				command();
			}
		}
		return this;
	};

	RotateTool.prototype.setCoordinateSystem = function(value) {
		var currentValue = this.getCoordinateSystem();
		if (currentValue !== value) {
			this.setProperty("coordinateSystem", value, true);
			this.getGizmo().setCoordinateSystem(value);
			if (this._viewport) {
				this._viewport.setShouldRenderFrame();
			}
			this.fireCoordinateSystemChanged({ coordinateSystem: value });
		}
		return this;
	};

	RotateTool.prototype.setShowEditingUI = function(value) {
		this.setProperty("showEditingUI", value, true);
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	/**
	 * Performs rotation of selected objects.
	 *
	 * @param {float} [x] Euler rotation x axis angle in degrees.
	 * @param {float} [y] Euler rotation y axis angle in degrees.
	 * @param {float} [z] Euler rotation z axis angle in degrees.
	 * @returns {sap.ui.vk.tools.RotateTool} <code>this</code> to allow method chaining.
	 * @public
	 */
	RotateTool.prototype.rotate = function(x, y, z) {
		if (this._gizmo) {
			this._gizmo.rotate(x, y, z);
		}
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	return RotateTool;
});
