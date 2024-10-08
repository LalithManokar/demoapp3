// Provides control sap.ui.vk.tools.AnchorPointToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"../getResourceBundle",
	"../threejs/thirdparty/three"
], function(
	EventProvider,
	Menu,
	MenuItem,
	getResourceBundle,
	threejs
) {
	"use strict";

	var AnchorPointToolHandler = EventProvider.extend("sap.ui.vk.tools.AnchorPointToolHandler", {
		metadata: {
		},
		constructor: function(tool) {
			this._tool = tool;
			this._gizmo = tool.getGizmo();
			this._rect = null;
			this._rayCaster = new THREE.Raycaster();
			// this._rayCaster.linePrecision = 0.2;
			this._handleIndex = -1;
			this._gizmoIndex = -1;
			this._handleAxis = new THREE.Vector3();
			this._gizmoOrigin = new THREE.Vector3();
			this._gizmoScale = 1;
			this._matrixOrigin = new THREE.Matrix4();
			this._rotationOrigin = new THREE.Matrix4();
			this._mouse = new THREE.Vector2();
			this._mouseOrigin = new THREE.Vector2();
		}
	});

	AnchorPointToolHandler.prototype._updateMouse = function(event) {
		var size = this.getViewport().getRenderer().getSize();
		this._mouse.x = ((event.x - this._rect.x) / size.width) * 2 - 1;
		this._mouse.y = ((event.y - this._rect.y) / size.height) * -2 + 1;
		this._rayCaster.setFromCamera(this._mouse, this.getViewport().getCamera().getCameraRef());
	};

	AnchorPointToolHandler.prototype._updateHandles = function(event, hoverMode) {
		var prevHandleIndex = this._handleIndex;
		this._handleIndex = -1;
		if (event.n === 1 || (event.event && event.event.type === "contextmenu")) {
			for (var i = 0, l = this._gizmo.getGizmoCount(); i < l; i++) {
				var touchObj = this._gizmo.getTouchObject(i);
				var intersects = this._rayCaster.intersectObject(touchObj, true);
				if (intersects.length > 0) {
					this._handleIndex = touchObj.children.indexOf(intersects[ 0 ].object);
					if (this._handleIndex >= 0) {
						this._gizmoIndex = i;
						this._gizmoOrigin.setFromMatrixPosition(touchObj.matrixWorld);
						this._matrixOrigin.copy(touchObj.matrixWorld);
						this._gizmoScale = touchObj.scale.x;
						this._rotationOrigin.extractRotation(touchObj.matrixWorld);
						if (this._handleIndex < 3) {// arrow
							this._handleAxis.setFromMatrixColumn(touchObj.matrixWorld, this._handleIndex).normalize();
						} else if (this._handleIndex < 6) {// plane
							this._handleAxis.setFromMatrixColumn(touchObj.matrixWorld, this._handleIndex - 3).normalize();
						} else if (this._handleIndex < 9) {// plane
							this._handleAxis.setFromMatrixColumn(touchObj.matrixWorld, this._handleIndex - 6).normalize();
						}
					}
				}
			}
		}

		this._gizmo.highlightHandle(this._handleIndex, hoverMode || this._handleIndex === -1);
		if (prevHandleIndex !== this._handleIndex) {
			this.getViewport().setShouldRenderFrame();
		}
	};

	AnchorPointToolHandler.prototype.hover = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			event.handled |= this._handleIndex >= 0;
		}
	};

	AnchorPointToolHandler.prototype.click = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			this._gizmo.selectHandle(this._handleIndex);
			event.handled |= this._handleIndex >= 0;
		}
	};

	var delta = new THREE.Vector3();

	AnchorPointToolHandler.prototype._getAxisOffset = function() {
		var ray = this._rayCaster.ray;
		var dir = this._handleAxis.clone().cross(ray.direction).cross(ray.direction).normalize();
		delta.copy(ray.origin).sub(this._gizmoOrigin);
		return dir.dot(delta) / dir.dot(this._handleAxis);
	};

	AnchorPointToolHandler.prototype._getPlaneOffset = function() {
		var ray = this._rayCaster.ray;
		delta.copy(this._gizmoOrigin).sub(ray.origin);
		var dist = this._handleAxis.dot(delta) / this._handleAxis.dot(ray.direction);
		return ray.direction.clone().multiplyScalar(dist).sub(delta);
	};

	AnchorPointToolHandler.prototype.beginGesture = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, false);
			if (this._handleIndex >= 0) {
				event.handled = true;
				this._gesture = true;
				this._mouseOrigin.copy(event);
				this._gizmo.selectHandle(this._handleIndex);
				this._gizmo.beginGesture();

				if (this._handleIndex < 3) {// axis
					this._dragOrigin = this._getAxisOffset();
				} else if (this._handleIndex < 6) {// plane
					this._dragOrigin = this._getPlaneOffset();
				} else if (this._handleIndex < 9) {
					this._dragOrigin = this._getPlaneOffset().normalize();
				}

				var axis1 = new THREE.Vector3().setFromMatrixColumn(this._matrixOrigin, (this._handleIndex + 1) % 3).normalize();
				var axis2 = new THREE.Vector3().setFromMatrixColumn(this._matrixOrigin, (this._handleIndex + 2) % 3).normalize();
				var rotationAxis = new THREE.Vector3().crossVectors(axis1, axis2).normalize();
				var rotationPoint = new THREE.Vector3().setFromMatrixPosition(this._matrixOrigin);

				// calculate level angle
				var levelDir = axis1.clone();
				var minDP = 2;
				for (var i = 0; i < 3; i++) {
					var axis = new THREE.Vector3().setComponent(i, 1);
					var dp = rotationAxis.dot(axis);
					if (minDP > dp) {
						minDP = dp;
						levelDir.copy(axis);
					}
				}
				levelDir.sub(rotationAxis.clone().multiplyScalar(levelDir.dot(rotationAxis))).normalize();
				this._levelAngle = Math.atan2(levelDir.dot(axis2), levelDir.dot(axis1));

				// calculate start angle
				var ray = this._rayCaster.ray;
				var delta = rotationPoint.clone().sub(ray.origin);
				var dist = rotationAxis.dot(delta) / rotationAxis.dot(ray.direction);
				var mouseDirection = ray.direction.clone().multiplyScalar(dist).sub(delta).normalize();
				this._startAngle = Math.atan2(mouseDirection.dot(axis2), mouseDirection.dot(axis1));

				var up = new THREE.Vector3().setFromMatrixColumn(this.getViewport().getCamera().getCameraRef().matrixWorld, 1);
				var dir = new THREE.Vector3().crossVectors(mouseDirection, rotationAxis);
				this._rotationDelta = up.dot(dir) < 0 ? -0.01 : 0.01;
			}
		}
	};

	AnchorPointToolHandler.prototype._setOffset = function(offset) {
		if (this._tool.getEnableStepping()) {
			var stepSize = Math.pow(10, Math.round(Math.log10(this._gizmoScale))) * 0.1;

			var matInv = new THREE.Matrix4().getInverse(this._rotationOrigin);
			var origin = this._gizmoOrigin.clone().applyMatrix4(matInv);
			var pos = this._gizmoOrigin.clone().add(offset).applyMatrix4(matInv);

			for (var i = 0; i < 3; i++) {
				var pos1 = pos.getComponent(i);
				if (Math.abs(pos1 - origin.getComponent(i)) > stepSize * 1e-5) {// if the gizmo is moving along this axis
					var pos2 = Math.round(pos1 / stepSize) * stepSize;
					delta.setFromMatrixColumn(this._rotationOrigin, i).multiplyScalar(pos2 - pos1);
					offset.add(delta);
				}
			}
		}

		this._gizmo._setOffset(offset, this._gizmoIndex);
	};

	AnchorPointToolHandler.prototype.move = function(event) {
		if (this._gesture) {
			event.handled = true;
			this._updateMouse(event);

			if (this._handleIndex < 3) {// axis
				if (isFinite(this._dragOrigin)) {
					this._setOffset(this._handleAxis.clone().multiplyScalar(this._getAxisOffset() - this._dragOrigin));
				}
			} else if (this._handleIndex < 6) {// plane
				if (isFinite(this._dragOrigin.x) && isFinite(this._dragOrigin.y) && isFinite(this._dragOrigin.z)) {
					this._setOffset(this._getPlaneOffset().sub(this._dragOrigin));
				}
			} else if (this._handleIndex < 9) {
				var angle1 = this._startAngle;
				var angle2 = angle1 + (event.y - this._mouseOrigin.y) * this._rotationDelta;

				if (this._tool.getEnableStepping()) {
					var step = THREE.Math.degToRad(5); // default rotation step in degrees
					var angle = angle2 - angle1 - this._levelAngle;
					angle2 += Math.round(angle / step) * step - angle;
				}

				if (isFinite(angle1) && isFinite(angle2)) {
					this._gizmo._setRotationAxisAngle(this._handleIndex - 6, angle1, angle2);
				}
			}
		}
	};

	AnchorPointToolHandler.prototype.endGesture = function(event) {
		if (this._gesture) {
			this._gesture = false;
			event.handled = true;
			this._updateMouse(event);

			this._gizmo.endGesture();
			this._dragOrigin = undefined;
			this._updateHandles(event, true);
			this.getViewport().setShouldRenderFrame();
		}
	};

	AnchorPointToolHandler.prototype.contextMenu = function(event) {
		if (this._inside(event)) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			if (this._handleIndex >= 0) {
				event.handled = true;
				var menu = new Menu({
					items: [
						new MenuItem({ text: getResourceBundle().getText("ANCHOR_POINT_TOOL_MOVE_TO_WORLD_ORIGIN") }),
						new MenuItem({ text: getResourceBundle().getText("ANCHOR_POINT_TOOL_MOVE_TO_SELECTION_CENTER") }),
						new MenuItem({ text: getResourceBundle().getText("ANCHOR_POINT_TOOL_MOVE_TO_SCENE_CENTER") }),
						new MenuItem({ text: getResourceBundle().getText("ANCHOR_POINT_TOOL_MOVE_TO_SELECTED_OBJECTS_ORIGIN") })
					],
					itemSelected: function(event) {
						var item = event.getParameters("item").item;
						var index = event.getSource().indexOfItem(item);
						var pos = new THREE.Vector3();
						var viewport = this.getViewport();
						if (viewport) {
							var boundingBox = new THREE.Box3();
							switch (index) {
								default:
								case 0: // world origin
									break;

								case 1: // center of selection
									if (viewport._viewStateManager) {
										viewport._viewStateManager.enumerateSelection(function(node) {
											boundingBox.expandByObject(node);
										});
										boundingBox.getCenter(pos);
									}
									break;

								case 2: // scene center
									var scene = viewport.getScene() ? viewport.getScene().getSceneRef() : null;
									if (scene) {
										scene._expandBoundingBox(boundingBox, false, true);
										boundingBox.getCenter(pos);
									}
									break;

								case 3: // selected object's origin
									if (viewport._viewStateManager) {
										var count = 0;
										var center = new THREE.Vector3();
										viewport._viewStateManager.enumerateSelection(function(node) {
											pos.add(center.setFromMatrixPosition(node.matrixWorld));
											count++;
										});
										pos.multiplyScalar(1 / count);
									}
									break;
							}
						}
						this._gizmo.setPosition(pos);
					}.bind(this)
				});
				menu.openAsContextMenu(event.event, this.getViewport());
			}
		}
	};

	AnchorPointToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALISE THIS FUNCTION
	AnchorPointToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALISE THIS FUNCTION
	AnchorPointToolHandler.prototype._inside = function(event) {
		if (this._rect === null || true) {
			var id = this._tool._viewport.getIdForLabel();
			var domobj = document.getElementById(id);

			if (domobj === null) {
				return false;
			}

			var o = this._getOffset(domobj);
			this._rect = {
				x: o.x,
				y: o.y,
				w: domobj.offsetWidth,
				h: domobj.offsetHeight
			};
		}

		return (event.x >= this._rect.x && event.x <= this._rect.x + this._rect.w && event.y >= this._rect.y && event.y <= this._rect.y + this._rect.h);
	};

	return AnchorPointToolHandler;
});