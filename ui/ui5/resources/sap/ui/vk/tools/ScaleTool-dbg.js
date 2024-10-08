/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.ScaleTool
sap.ui.define([
	"./Tool",
	"./CoordinateSystem",
	"./ScaleToolHandler",
	"./ScaleToolGizmo"
], function(
	Tool,
	CoordinateSystem,
	ScaleToolHandler,
	ScaleToolGizmo
) {
	"use strict";

	/**
	 * Constructor for a new ScaleTool.
	 *
	 * @class
	 * Tool to scale 3D objects

	 * @param {string} [sId] ID of the new content resource. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.71.13
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.ScaleTool
	 */
	var ScaleTool = Tool.extend("sap.ui.vk.tools.ScaleTool", /** @lends sap.ui.vk.tools.ScaleTool.prototype */ {
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
				 * If set to <code>true<code> then this tool will enable scaling along a single axis, otherwise it will scale objects along all three axes proportionaly
				 */
				nonUniformScaleEnabled: {
					type: "boolean",
					defaultValue: false
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
				 * This event will be fired when scaling occurs.
				 */
				scaling: {
					parameters: {
						x: "float",
						y: "float",
						z: "float"
					}
				},
				/**
				 * This event will be fired when scaling finished.
				 */
				scaled: {
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
			this._handler = new ScaleToolHandler(this);
			this._gizmo = null;
		}
	});

	ScaleTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint([ "sap.ui.vk.threejs.Viewport" ]);

		this.setAggregation("gizmo", new ScaleToolGizmo());
	};

	// Checks if the current viewport is of a specified type
	ScaleTool.prototype.isViewportType = function(typeString) {
		if (this._viewport && this._viewport.getMetadata().getName() === typeString) {
			return true;
		}
		return false;
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	ScaleTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
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

	ScaleTool.prototype._activateTool = function(activeViewport) {
		this._viewport = this.getViewportImplementation(activeViewport);
		this._gizmo = this.getGizmo();
		this._gizmo.setCoordinateSystem(this.getCoordinateSystem());
		this._gizmo.setNonUniformScaleEnabled(this.getNonUniformScaleEnabled());
		this._gizmo.show(this._viewport, this);

		// Prepare the tool to execute
		this._prepare();
	};

	ScaleTool.prototype._deactivateTool = function() {
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
	ScaleTool.prototype._prepare = function() {
		var okToExec = false;

		if (this._viewport._loco) {
			// Add tool hander to loco stack for viewport so that the tool can handler input from user
			this._viewport._loco.addHandler(this._handler, 11);
			okToExec = true;
		}

		return okToExec;
	};

	/** MOVE TO BASE
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {sap.ui.vk.tools.ScaleTool} <code>this</code> to allow method chaining.
	 * @public
	 */
	ScaleTool.prototype.queueCommand = function(command) {
		if (this._prepare()) {

			if (this.isViewportType("sap.ui.vk.threejs.Viewport")) {
				command();
			}
		}
		return this;
	};

	ScaleTool.prototype.setCoordinateSystem = function(value) {
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

	ScaleTool.prototype.setNonUniformScaleEnabled = function(value) {
		this.setProperty("nonUniformScaleEnabled", value, true);
		this.getGizmo().setNonUniformScaleEnabled(value);
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	ScaleTool.prototype.setShowEditingUI = function(value) {
		this.setProperty("showEditingUI", value, true);
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	/**
	 * Performs scaling of selected objects.
	 *
	 * @param {float} [x] Scaling value for x axis.
	 * @param {float} [y] Scaling value for y axis.
	 * @param {float} [z] Scaling value for z axis.
	 * @returns {sap.ui.vk.tools.ScaleTool} <code>this</code> to allow method chaining.
	 * @public
	 */
	ScaleTool.prototype.scale = function(x, y, z) {
		if (this._gizmo) {
			this._gizmo.scale(x, y, z);
		}
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	return ScaleTool;
});
