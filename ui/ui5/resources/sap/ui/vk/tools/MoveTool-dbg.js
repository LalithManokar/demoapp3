/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.MoveTool
sap.ui.define([
	"./Tool",
	"./CoordinateSystem",
	"./MoveToolHandler",
	"./MoveToolGizmo"
], function(
	Tool,
	CoordinateSystem,
	MoveToolHandler,
	MoveToolGizmo
) {
	"use strict";

	/**
	 * Constructor for a new MoveTool.
	 *
	 * @class
	 * Tool used to move objects in 3D space

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.71.13
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.MoveTool
	 */
	var MoveTool = Tool.extend("sap.ui.vk.tools.MoveTool", /** @lends sap.ui.vk.tools.MoveTool.prototype */ {
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
			this._handler = new MoveToolHandler(this);
			this._gizmo = null;
		}
	});

	MoveTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint([ "sap.ui.vk.threejs.Viewport" ]);

		this.setAggregation("gizmo", new MoveToolGizmo());
	};

	// Checks if the current viewport is of a specified type
	MoveTool.prototype.isViewportType = function(typeString) {
		if (this._viewport && this._viewport.getMetadata().getName() === typeString) {
			return true;
		}
		return false;
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	MoveTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
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

	MoveTool.prototype._activateTool = function(activeViewport) {
		this._viewport = this.getViewportImplementation(activeViewport);
		this._gizmo = this.getGizmo();
		this._gizmo.setCoordinateSystem(this.getCoordinateSystem());
		this._gizmo.show(this._viewport, this);

		// Prepare the tool to execute
		this._prepare();
	};

	MoveTool.prototype._deactivateTool = function() {
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
	MoveTool.prototype._prepare = function() {
		var okToExec = false;

		if (this._viewport._loco) {
			// Add tool handler to loco stack for viewport so that the tool can handler input from user
			this._viewport._loco.addHandler(this._handler, 13);
			okToExec = true;
		}

		return okToExec;
	};

	/** MOVE TO BASE
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {sap.ui.vk.tools.MoveTool} <code>this</code> to allow method chaining.
	 * @public
	 */
	MoveTool.prototype.queueCommand = function(command) {
		if (this._prepare()) {

			if (this.isViewportType("sap.ui.vk.threejs.Viewport")) {
				command();
			}
		}
		return this;
	};

	MoveTool.prototype.setCoordinateSystem = function(value) {
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

	MoveTool.prototype.setShowEditingUI = function(value) {
		this.setProperty("showEditingUI", value, true);
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	/**
	 * Performs movement of selected objects.
	 *
	 * @param {float} [x] Movement offset of x component in currently selected coordinate system.
	 * @param {float} [y] Movement offset of y component in currently selected coordinate system.
	 * @param {float} [z] Movement offset of z component in currently selected coordinate system.
	 * @returns {sap.ui.vk.tools.MoveTool} <code>this</code> to allow method chaining.
	 * @public
	 */
	MoveTool.prototype.move = function(x, y, z) {
		if (this._gizmo) {
			this._gizmo.move(x, y, z);
		}
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	return MoveTool;
});
