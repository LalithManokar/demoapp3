/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.MoveToolGizmo
sap.ui.define([
	"jquery.sap.global",
	"../getResourceBundle",
	"../threejs/thirdparty/three",
	"./Gizmo",
	"./MoveToolGizmoRenderer",
	"./CoordinateSystem",
	"./AxisColours"
], function(
	jQuery,
	getResourceBundle,
	threejs,
	Gizmo,
	MoveToolGizmoRenderer,
	CoordinateSystem,
	AxisColours
) {
	"use strict";

	/**
	 * Constructor for a new MoveToolGizmo.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides handles for move objects tool
	 * @extends sap.ui.vk.tools.Gizmo
	 *
	 * @author SAP SE
	 * @version 1.71.13
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.tools.MoveToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MoveToolGizmo = Gizmo.extend("sap.ui.vk.tools.MoveToolGizmo", /** @lends sap.ui.vk.tools.MoveToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	MoveToolGizmo.prototype.init = function() {
		if (Gizmo.prototype.init) {
			Gizmo.prototype.init.apply(this);
		}

		this._createEditingForm(getResourceBundle().getText("TOOL_UNITS_MM"), 84);
		this._gizmoIndex = -1;
		this._handleIndex = -1;

		this._viewport = null;
		this._tool = null;
		this._sceneGizmo = new THREE.Scene();
		var light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
		light.position.set(1, 3, 2);
		this._sceneGizmo.add(light);
		this._sceneGizmo.add(new THREE.AmbientLight(0xFFFFFF, 0.5));
		this._gizmo = new THREE.Group();
		this._touchAreas = new THREE.Group();
		this._sceneGizmo.add(this._gizmo);
		this._coordinateSystem = CoordinateSystem.World;
		this._nodes = [];
		this._matViewProj = new THREE.Matrix4();
		this._gizmoSize = 144;
		this._gizmoOffset = new THREE.Vector3();

		function createGizmoArrow(dir, color, touchAreas) {
			var arrowLength = 144,
				lineRadius = window.devicePixelRatio * 0.5,
				coneHeight = 32,
				coneRadius = 6,
				touchRadius = 48;
			dir.multiplyScalar(1 / arrowLength);
			var material = new THREE.MeshLambertMaterial({ color: color, transparent: true });
			var lineGeometry = new THREE.CylinderBufferGeometry(lineRadius, lineRadius, arrowLength - coneHeight, 4);
			var m = new THREE.Matrix4().makeBasis(new THREE.Vector3(dir.y, dir.z, dir.x), dir, new THREE.Vector3(dir.z, dir.x, dir.y));
			m.setPosition(dir.clone().multiplyScalar((arrowLength - coneHeight) * 0.5));
			lineGeometry.applyMatrix(m);
			var line = new THREE.Mesh(lineGeometry, material);
			line.matrixAutoUpdate = false;
			line.userData.color = color;

			var coneGeometry = new THREE.CylinderBufferGeometry(0, coneRadius, coneHeight, 12, 1);
			m.setPosition(dir.clone().multiplyScalar(arrowLength - coneHeight * 0.5));
			coneGeometry.applyMatrix(m);
			var cone = new THREE.Mesh(coneGeometry, material);
			cone.matrixAutoUpdate = false;
			line.add(cone);

			var touchGeometry = new THREE.CylinderGeometry(touchRadius * 0.5, touchRadius * 0.5, touchRadius, 12, 1);
			touchGeometry.applyMatrix(m);
			var touchGeometry2 = new THREE.CylinderGeometry(touchRadius * 0.5, touchRadius * 0.2, touchRadius, 12, 1);
			m.setPosition(dir.clone().multiplyScalar(arrowLength * 0.5));
			touchGeometry.merge(touchGeometry2, m);
			touchAreas.add(new THREE.Mesh(touchGeometry, material));

			return line;
		}

		function createGizmoPlane(a, b, touchAreas) {
			var colors = new Float32Array(9);
			colors[ a ] = colors[ b + 6 ] = 1;
			colors[ a + 3 ] = colors[ b + 3 ] = 0.5;
			var v1 = new THREE.Vector3().setComponent(a, 0.333);
			var v2 = new THREE.Vector3().setComponent(b, 0.333);
			var geometry = new THREE.Geometry();
			geometry.vertices.push(new THREE.Vector3(), v1, v2, v1.clone().add(v2));
			geometry.faces.push(new THREE.Face3(0, 2, 1), new THREE.Face3(1, 2, 3));
			var material = new THREE.MeshBasicMaterial({ color: 0xFFFF00, opacity: 0.5, transparent: true, visible: false, side: THREE.DoubleSide });
			var plane = new THREE.Mesh(geometry, material);
			plane.matrixAutoUpdate = false;
			plane.userData.colors = colors;

			var lineGeometry = new THREE.BufferGeometry();
			var vertices = new Float32Array(9);
			vertices[ a ] = vertices[ a + 3 ] = vertices[ b + 3 ] = vertices[ b + 6 ] = 0.333;
			lineGeometry.addAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
			lineGeometry.addAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
			var line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors, transparent: true, linewidth: window.devicePixelRatio }));
			line.matrixAutoUpdate = false;
			plane.add(line);

			var touchGeometry = new THREE.Geometry();
			touchGeometry.vertices.push(new THREE.Vector3(), v1, v2, v1.clone().add(v2));
			touchGeometry.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(2, 1, 3));
			touchAreas.add(new THREE.Mesh(touchGeometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })));

			return plane;
		}

		// create 3 arrows
		this._gizmo.add(createGizmoArrow(new THREE.Vector3(1, 0, 0), AxisColours.x, this._touchAreas));
		this._gizmo.add(createGizmoArrow(new THREE.Vector3(0, 1, 0), AxisColours.y, this._touchAreas));
		this._gizmo.add(createGizmoArrow(new THREE.Vector3(0, 0, 1), AxisColours.z, this._touchAreas));

		// create 3 planes
		this._gizmo.add(createGizmoPlane(1, 2, this._touchAreas));
		this._gizmo.add(createGizmoPlane(2, 0, this._touchAreas));
		this._gizmo.add(createGizmoPlane(0, 1, this._touchAreas));

		this._axisTitles = this._createAxisTitles();
		this._sceneGizmo.add(this._axisTitles);

		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3());
		this._line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial());
		this._line.frustumCulled = false;
		this._line.visible = false;
		this._gizmo.add(this._line);
	};

	MoveToolGizmo.prototype.hasDomElement = function() {
		return true;
	};

	MoveToolGizmo.prototype.setCoordinateSystem = function(coordinateSystem) {
		this._coordinateSystem = coordinateSystem;
		var screenSystem = coordinateSystem === CoordinateSystem.Screen;
		var gizmoObjects = this._gizmo.children,
			touchObjects = this._touchAreas.children;
		gizmoObjects[ 2 ].visible = gizmoObjects[ 3 ].visible = gizmoObjects[ 4 ].visible = !screenSystem;
		touchObjects[ 2 ].visible = touchObjects[ 3 ].visible = touchObjects[ 4 ].visible = !screenSystem;
		this._axisTitles.children[ 2 ].visible = !screenSystem;
		this._gizmoIndex = this._handleIndex = -1;
	};

	MoveToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;
		this._nodes.length = 0;
		this._updateSelection(viewport._viewStateManager);
	};

	MoveToolGizmo.prototype.hide = function() {
		this._viewport = null;
		this._tool = null;
		this._gizmoIndex = this._handleIndex = -1;
		this._updateEditingForm(false);
	};

	MoveToolGizmo.prototype.getGizmoCount = function() {
		if (this._coordinateSystem === CoordinateSystem.Local) {
			return this._nodes.length;
		} else {
			return this._nodes.length > 0 ? 1 : 0;
		}
	};

	MoveToolGizmo.prototype.getTouchObject = function(i) {
		if (this._nodes.length === 0) {
			return null;
		}

		this._updateGizmoObjectTransformation(this._touchAreas, i);

		return this._touchAreas;
	};

	var arrowHighlighting = [ 1, 2, 4, 6, 5, 3 ];

	MoveToolGizmo.prototype.highlightHandle = function(index, hoverMode) {
		var i;
		for (i = 0; i < 3; i++) {// arrows
			var arrow = this._gizmo.children[ i ];
			var highlight = arrowHighlighting[index] & (1 << i);
			var color = highlight ? 0xFFFF00 : arrow.userData.color;
			arrow.material.color.setHex(color); // arrow line color
			arrow.material.opacity = (highlight || hoverMode) ? 1 : 0.35;
			arrow.children[ 0 ].material.color.setHex(color); // arrow cone color
			arrow.children[ 0 ].material.opacity = (highlight || hoverMode) ? 1 : 0.35;

			var axisTitle = this._axisTitles.children[i];
			axisTitle.material.color.setHex(color);
			axisTitle.material.opacity = highlight || hoverMode ? 1 : 0.35;
		}

		for (i = 3; i < 6; i++) {// planes
			var plane = this._gizmo.children[ i ];
			plane.material.visible = i === index;

			var colorAttr = plane.children[ 0 ].geometry.attributes.color;
			colorAttr.copyArray(i === index ? [ 1, 1, 0, 1, 1, 0, 1, 1, 0 ] : plane.userData.colors);
			colorAttr.needsUpdate = true;
			plane.children[ 0 ].material.opacity = (i === index || hoverMode) ? 1 : 0.35;
		}
	};

	MoveToolGizmo.prototype.selectHandle = function(index, gizmoIndex) {
		this._gizmoIndex = gizmoIndex;
		this._handleIndex = index;
		this._viewport.setShouldRenderFrame();
	};

	MoveToolGizmo.prototype.beginGesture = function() {
		this._matOrigin = this._gizmo.matrixWorld.clone();
		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			nodeInfo.matOrigin = node.matrixWorld.clone();
			nodeInfo.originLocal = node.position.clone();
			nodeInfo.origin = new THREE.Vector3().setFromMatrixPosition(node.matrixWorld);
			nodeInfo.matParentInv = new THREE.Matrix4().getInverse(node.parent.matrixWorld);
		});
	};

	MoveToolGizmo.prototype.endGesture = function() {
		this._line.visible = false;
		this._tool.fireMoved({ x: this._gizmoOffset.x, y: this._gizmoOffset.y, z: this._gizmoOffset.z });
	};

	MoveToolGizmo.prototype._setOffset = function(offset, gizmoIndex) {
		if (this._coordinateSystem === CoordinateSystem.Local) {
			// transform offset from world space to gizmo's local space
			var nodeInfo = this._nodes[ gizmoIndex ];
			var matInv = new THREE.Matrix4().getInverse(nodeInfo.node.matrixWorld);
			var scale = new THREE.Vector3().setFromMatrixScale(nodeInfo.node.matrixWorld);
			var originPos = nodeInfo.origin.clone().applyMatrix4(matInv);
			offset = nodeInfo.origin.clone().add(offset).applyMatrix4(matInv).sub(originPos).multiply(scale);
		} else if (this._coordinateSystem === CoordinateSystem.Screen) {
			// transform offset from world space to screen space
			var size = this._viewport.getRenderer().getSize();
			var pos1 = this._gizmo.position.clone().applyMatrix4(this._matViewProj);
			var pos2 = this._gizmo.position.clone().add(offset).applyMatrix4(this._matViewProj);
			offset.set(Math.round((pos2.x - pos1.x) * 0.5 * size.width), Math.round((pos2.y - pos1.y) * 0.5 * size.height), 0);
		}

		if (this._tool.fireEvent("moving", { x: offset.x, y: offset.y, z: offset.z }, true)) {
			this._move(offset);

			if (this._coordinateSystem === CoordinateSystem.Screen) {
				// transform offset from world space to local space of gizmo
				offset.set(new THREE.Vector3().setFromMatrixColumn(this._matOrigin, 0).normalize().dot(offset),
						   new THREE.Vector3().setFromMatrixColumn(this._matOrigin, 1).normalize().dot(offset),
						   0);
			} else if (this._coordinateSystem === CoordinateSystem.Custom) {
				var anchorPoint = this._getAnchorPoint();
				if (anchorPoint) {
					var matInvAnchor = new THREE.Matrix4().getInverse(anchorPoint.matrixWorld);
					var scaleAnchor = new THREE.Vector3().setFromMatrixScale(anchorPoint.matrixWorld);
					var newPos = anchorPoint.position.clone().applyMatrix4(matInvAnchor);
					offset.copy(anchorPoint.position.clone().add(offset).applyMatrix4(matInvAnchor).sub(newPos).multiply(scaleAnchor));
				}
			}

			// update line mesh
			this._line.geometry.vertices[ 0 ].setScalar(0).sub(offset);
			this._line.geometry.verticesNeedUpdate = true;
			this._line.geometry.computeBoundingBox();
			offset.set(Math.abs(offset.x), Math.abs(offset.y), Math.abs(offset.z));
			offset.multiplyScalar(1 / Math.max(offset.x, offset.y, offset.z));
			this._line.material.color.setRGB(offset.x, offset.y, offset.z);
			this._line.visible = true;
		}
	};

	MoveToolGizmo.prototype._move = function(offset) {
		this._gizmoOffset.copy(offset);

		if (this._coordinateSystem === CoordinateSystem.Local) {
			this._nodes.forEach(function(nodeInfo) {
				var node = nodeInfo.node;
				var basis = this._extractBasis(node.matrixWorld);
				var pos = nodeInfo.origin.clone();
				pos.add(basis[ 0 ].multiplyScalar(offset.x)).add(basis[ 1 ].multiplyScalar(offset.y)).add(basis[ 2 ].multiplyScalar(offset.z));
				node.matrixWorld.setPosition(pos);
				node.matrix.multiplyMatrices(nodeInfo.matParentInv, node.matrixWorld);
				node.position.setFromMatrixPosition(node.matrix);
			}.bind(this));

			// this._viewport._updateBoundingBoxesIfNeeded();
		} else {
			if (this._coordinateSystem === CoordinateSystem.Screen) {
				// transform offset from screen space to world space
				var size = this._viewport.getRenderer().getSize();
				var camera = this._viewport.getCamera().getCameraRef();
				var origin = new THREE.Vector4().copy(this._gizmo.position).applyMatrix4(this._matViewProj);
				var dx = offset.x * 2 * origin.w / (camera.projectionMatrix.elements[ 0 ] * size.width);
				var dy = offset.y * 2 * origin.w / (camera.projectionMatrix.elements[ 5 ] * size.height);
				offset.setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(dx);
				offset.add(new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).multiplyScalar(dy));
			}

			this._gizmo.position.setFromMatrixPosition(this._matOrigin).add(offset);
			if (this._coordinateSystem === CoordinateSystem.Custom) {
				// Update anchor point's position
				var anchorPoint = this._getAnchorPoint();
				if (anchorPoint) {
					anchorPoint.position.copy(this._gizmo.position);
				}
			}
			this._nodes.forEach(function(nodeInfo) {
				if (!nodeInfo.ignore) {
					var node = nodeInfo.node;
					node.matrixWorld.setPosition(nodeInfo.origin.clone().add(offset));
					node.matrix.multiplyMatrices(nodeInfo.matParentInv, node.matrixWorld);
					node.position.setFromMatrixPosition(node.matrix);
				}
			});
		}

		this._viewport.setShouldRenderFrame();
	};

	MoveToolGizmo.prototype.move = function(x, y, z) {
		this.beginGesture();
		this._move(new THREE.Vector3(x, y, z || 0));
	};

	MoveToolGizmo.prototype.getValue = function() {
		var value = 0, pos, offset, axis;
		if (this._gizmoIndex >= 0 && this._handleIndex >= 0 && this._handleIndex < 3) {
			switch (this._coordinateSystem) {
				default:
				case CoordinateSystem.World:
					value = this._gizmo.position.getComponent(this._handleIndex);
					break;

				case CoordinateSystem.Local:
					var node = this._nodes[this._gizmoIndex].node;
					pos = new THREE.Vector3().setFromMatrixPosition(node.parent.matrixWorld);
					offset = this._gizmo.position.clone().sub(pos);
					axis = new THREE.Vector3().setFromMatrixColumn(node.matrixWorld, this._handleIndex).normalize();
					value = axis.dot(offset);
					break;

				case CoordinateSystem.Screen:
					var renderer = this._viewport.getRenderer();
					var size = renderer.getSize();
					pos = this._gizmo.position.clone().applyMatrix4(this._matViewProj);
					pos.x *= size.width * 0.5;
					pos.y *= size.height * 0.5;
					value = pos.getComponent(this._handleIndex);
					break;

				case CoordinateSystem.Custom:
					var anchorPoint = this._getAnchorPoint();
					if (anchorPoint) {
						pos = new THREE.Vector3().setFromMatrixPosition(anchorPoint.matrixWorld);
						offset = this._gizmo.position.clone().sub(pos);
						axis = new THREE.Vector3().setFromMatrixColumn(anchorPoint.matrixWorld, this._handleIndex).normalize();
						value = axis.dot(offset);
					}
					break;
			}
		}
		return value;
	};

	MoveToolGizmo.prototype.setValue = function(value) {
		if (this._gizmoIndex >= 0 && this._handleIndex >= 0 && this._handleIndex < 3) {
			this.beginGesture();
			var offset = new THREE.Vector3();
			if (this._coordinateSystem === CoordinateSystem.Custom) {
				var anchorPoint = this._getAnchorPoint();
				if (anchorPoint) {
					offset.setFromMatrixColumn(anchorPoint.matrixWorld, this._handleIndex).normalize().multiplyScalar(value - this._lastEditValue);
				}
			} else {
				offset.setComponent(this._handleIndex, value - this._lastEditValue);
			}
			this._move(offset);
			this.endGesture();
		}
	};

	MoveToolGizmo.prototype.expandBoundingBox = function(boundingBox) {
		if (this._viewport) {
			this._expandBoundingBox(boundingBox, this._viewport.getCamera().getCameraRef());
		}
	};

	MoveToolGizmo.prototype.handleSelectionChanged = function(event) {
		if (this._viewport) {
			this._updateSelection(this._viewport._viewStateManager);
			this._gizmoIndex = this._handleIndex = -1;
		}
	};

	MoveToolGizmo.prototype._updateGizmoTransformation = function(i, camera) {
		var scale = this._updateGizmoObjectTransformation(this._gizmo, i);
		this._updateAxisTitles(this._axisTitles, this._gizmo, camera, this._gizmoSize + 18, scale);
		this._line.scale.setScalar(1 / (this._gizmoSize * scale));
	};

	MoveToolGizmo.prototype._getEditingFormPosition = function() {
		var scale = this._updateGizmoObjectTransformation(this._gizmo, this._gizmoIndex);
		var direction = new THREE.Vector3().setFromMatrixColumn(this._gizmo.matrixWorld, this._handleIndex).normalize();
		return direction.clone().multiplyScalar((this._gizmoSize + 18) * scale).add(this._gizmo.position).applyMatrix4(this._matViewProj);
	};

	MoveToolGizmo.prototype.render = function() {
		jQuery.sap.assert(this._viewport && this._viewport.getMetadata().getName() === "sap.ui.vk.threejs.Viewport", "Can't render gizmo without sap.ui.vk.threejs.Viewport");

		if (this._nodes.length > 0) {
			var renderer = this._viewport.getRenderer(),
				camera = this._viewport.getCamera().getCameraRef();

			this._matViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

			renderer.clearDepth();

			for (var i = 0, l = this.getGizmoCount(); i < l; i++) {
				this._updateGizmoTransformation(i, camera);
				renderer.render(this._sceneGizmo, camera);
			}
		}

		this._updateEditingForm(this._nodes.length > 0 && this._gizmoIndex >= 0 && this._handleIndex >= 0 && this._handleIndex < 3, this._handleIndex);
	};

	return MoveToolGizmo;

});
