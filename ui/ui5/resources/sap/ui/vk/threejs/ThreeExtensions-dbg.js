/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"../abgrToColor",
	"../ObjectType",
	"./thirdparty/three"
], function(
	abgrToColor,
	ObjectType,
	threeJs
) {
	"use strict";

	THREE.Object3D.prototype.defaultEmissive = {
		r: 0.0235,
		g: 0.0235,
		b: 0.0235
	};

	THREE.Object3D.prototype.defaultSpecular = {
		r: 0.0602,
		g: 0.0602,
		b: 0.0602
	};

	THREE.Box3.prototype._setFromObjectExcludingHotSpotAndPMI = function(object) {
		this.makeEmpty();
		var v1 = new THREE.Vector3();
		var that = this;
		object.updateMatrixWorld(true);
		object.traverse(function(node) {
			if (node.userData.objectType === ObjectType.Hotspot || node.userData.objectType === ObjectType.PMI) {
				return;
			}

			var i, l;
			var geometry = node.geometry;
			if (geometry !== undefined) {
				if (geometry.isGeometry) {
					var vertices = geometry.vertices;

					for (i = 0, l = vertices.length; i < l; i++) {
						v1.copy(vertices[i]);
						v1.applyMatrix4(node.matrixWorld);
						that.expandByPoint(v1);
					}
				} else if (geometry.isBufferGeometry) {
					var attribute = geometry.attributes.position;
					if (attribute !== undefined) {
						for (i = 0, l = attribute.count; i < l; i++) {
							v1.fromBufferAttribute(attribute, i).applyMatrix4(node.matrixWorld);
							that.expandByPoint(v1);
						}
					}
				}
			}
		});

		return this;
	};

	THREE.Object3D.prototype._vkCalculateObjectOrientedBoundingBox = function() {
		var parent = this.parent,
			matrix = this.matrix.clone(),
			matrixAutoUpdate = this.matrixAutoUpdate;
		this.parent = null;
		this.matrix.identity();
		this.matrixAutoUpdate = false;
		this.userData.boundingBox._setFromObjectExcludingHotSpotAndPMI(this);
		this.matrixAutoUpdate = matrixAutoUpdate;
		this.matrix.copy(matrix);
		this.parent = parent;
		this.updateMatrixWorld(true);
	};

	THREE.Object3D.prototype._vkTraverseNodeGeometry = function(callback) {
		callback(this);
		for (var i = 0, l = this.children.length; i < l; i++) {
			var child = this.children[i];
			if (child.geometry !== undefined && !child.name && child.children.length === 0) { // consider as a node geometry
				callback(child);
			}
		}
	};

	THREE.Object3D.prototype._vkSetTintColor = function(tintColorABGR) {
		this._vkTraverseNodeGeometry(function(node) {
			node.userData.tintColor = tintColorABGR;
			node._vkUpdateMaterialColor();
		});
	};

	THREE.Object3D.prototype._vkSetOpacity = function(opacity) {
		this._vkTraverseNodeGeometry(function(node) {
			node.userData.opacity = opacity;
			node._vkUpdateMaterialOpacity();
		});
	};

	THREE.Object3D.prototype._vkUpdateMaterialColor = function() {
		if (!this.material || !this.material.color) {
			return;
		}

		var userData = this.userData;

		if (userData.originalMaterial) {
			if (userData.originalMaterial.color.r === undefined) {
				userData.originalMaterial = null;
			} else if (userData.originalMaterial.userData && userData.originalMaterial.userData.textureAdded) {
				// in stream reading, texture image can be read late
				this.material = userData.originalMaterial.clone();
				if (userData.opacity) {
					this.material.opacity *= userData.opacity;
					this.material.transparent = this.material.transparent || this.material.opacity < 0.99;
				}

				delete userData.originalMaterial.userData.textureAdded;
			} else {
				this.material.color.copy(userData.originalMaterial.color);
				if (this.material.emissive !== undefined) {
					this.material.emissive.copy(userData.originalMaterial.emissive);
				}
				if (this.material.specular !== undefined) {
					this.material.specular.copy(userData.originalMaterial.specular);
				}
			}
		}

		if (userData.highlightColor !== undefined || userData.tintColor !== undefined) {
			if (!userData.originalMaterial) {
				userData.originalMaterial = this.material;
				this.material = this.material.clone();
			}

			var c;
			if (userData.tintColor !== undefined) {
				c = abgrToColor(userData.tintColor);
				this.material.color.lerp(new THREE.Color(c.red / 255.0, c.green / 255.0, c.blue / 255.0), c.alpha);
				if (this.material.emissive !== undefined) {
					if (this.material.userData.defaultHighlightingEmissive) {
						this.material.emissive.copy(this.material.userData.defaultHighlightingEmissive);
					} else {
						this.material.emissive.copy(THREE.Object3D.prototype.defaultEmissive);
					}
				}
				if (this.material.specular !== undefined) {
					if (this.material.userData.defaultHighlightingSpecular) {
						this.material.specular.copy(this.material.userData.defaultHighlightingSpecular);
					} else {
						this.material.specular.copy(THREE.Object3D.prototype.defaultSpecular);
					}
				}
			}

			if (userData.highlightColor !== undefined) {
				c = abgrToColor(userData.highlightColor);
				this.material.color.lerp(new THREE.Color(c.red / 255.0, c.green / 255.0, c.blue / 255.0), c.alpha);
				if (this.material.emissive !== undefined) {
					if (this.material.userData.defaultHighlightingEmissive) {
						this.material.emissive.copy(this.material.userData.defaultHighlightingEmissive);
					} else {
						this.material.emissive.copy(THREE.Object3D.prototype.defaultEmissive);
					}
				}
				if (this.material.specular !== undefined) {
					if (this.material.userData.defaultHighlightingSpecular) {
						this.material.specular.copy(this.material.userData.defaultHighlightingSpecular);
					} else {
						this.material.specular.copy(THREE.Object3D.prototype.defaultSpecular);
					}
				}
			}
		}
	};

	THREE.Object3D.prototype._vkUpdateMaterialOpacity = function() {
		if (!this.material) {
			return;
		}

		var userData = this.userData;

		if (userData.originalMaterial) {
			this.material.opacity = userData.originalMaterial.opacity;
			this.material.transparent = userData.originalMaterial.transparent;
		}

		if (userData.opacity !== undefined) {
			if (!userData.originalMaterial) {
				userData.originalMaterial = this.material;
				this.material = this.material.clone();
			}

			if (this.material.opacity) {
				this.material.opacity *= userData.opacity;
				this.material.transparent = this.material.transparent || this.material.opacity < 0.99;
			}
		}
	};

	THREE.Object3D.prototype._vkTraverseMeshNodes = function(callback) {
		if (this._vkUpdate !== undefined || this.isDetailView) {
			return;
		}

		callback(this);
		var children = this.children;
		for (var i = 0, l = children.length; i < l; i++) {
			children[ i ]._vkTraverseMeshNodes(callback);
		}
	};

	// THREE.Box3().applyMatrix4() analogue, but 10x faster and sutable for non-perspective transformation matrices. The original implementation is dumb.
	function box3ApplyMatrix4(boundingBox, matrix) {
		var min = boundingBox.min,
			max = boundingBox.max,
			m = matrix.elements,
			cx = (min.x + max.x) * 0.5,
			cy = (min.y + max.y) * 0.5,
			cz = (min.z + max.z) * 0.5,
			ex = max.x - cx,
			ey = max.y - cy,
			ez = max.z - cz;

		var tcx = m[ 0 ] * cx + m[ 4 ] * cy + m[ 8 ] * cz + m[ 12 ];
		var tcy = m[ 1 ] * cx + m[ 5 ] * cy + m[ 9 ] * cz + m[ 13 ];
		var tcz = m[ 2 ] * cx + m[ 6 ] * cy + m[ 10 ] * cz + m[ 14 ];

		var tex = Math.abs(m[ 0 ] * ex) + Math.abs(m[ 4 ] * ey) + Math.abs(m[ 8 ] * ez);
		var tey = Math.abs(m[ 1 ] * ex) + Math.abs(m[ 5 ] * ey) + Math.abs(m[ 9 ] * ez);
		var tez = Math.abs(m[ 2 ] * ex) + Math.abs(m[ 6 ] * ey) + Math.abs(m[ 10 ] * ez);

		min.set(tcx - tex, tcy - tey, tcz - tez);
		max.set(tcx + tex, tcy + tey, tcz + tez);
	}

	THREE.Object3D.prototype._expandBoundingBox = function(boundingBox, visibleOnly, ignoreDynamicObjects) {
		var nodeBoundingBox = new THREE.Box3();

		function expandBoundingBox(node) {
			var geometry = node.geometry;
			if (geometry !== undefined) {
				if (!geometry.boundingBox) {
					geometry.computeBoundingBox();
				}

				if (!geometry.boundingBox.isEmpty()) {
					// exclude 2D geometry that is placed on screen, as the size of its bounding box will keep increasing when zooming
					// if (geometry.boundingBox.min.z === 0 && geometry.boundingBox.max.z === 0 && ignoreDynamicObjects) {
					// 	return;
					// }

					nodeBoundingBox.copy(geometry.boundingBox);
					box3ApplyMatrix4(nodeBoundingBox, node.matrixWorld);
					if (isFinite(nodeBoundingBox.min.x) && isFinite(nodeBoundingBox.min.y) && isFinite(nodeBoundingBox.min.z) &&
						isFinite(nodeBoundingBox.max.x) && isFinite(nodeBoundingBox.max.y) && isFinite(nodeBoundingBox.max.z)) {
							boundingBox.min.min(nodeBoundingBox.min);
							boundingBox.max.max(nodeBoundingBox.max);
					}
				}
			}

			var selectionBoundingBox = node.userData.boundingBox;
			if (selectionBoundingBox !== undefined && !selectionBoundingBox.isEmpty() && !visibleOnly) {
				nodeBoundingBox.copy(selectionBoundingBox);
				box3ApplyMatrix4(nodeBoundingBox, node.matrixWorld);

				boundingBox.min.min(nodeBoundingBox.min);
				boundingBox.max.max(nodeBoundingBox.max);
			}
		}

		function traverse(node) {
			if ((visibleOnly && node.visible === false) || // ignore invisible objects
				(ignoreDynamicObjects && node._vkUpdate !== undefined)) { // ignore dynamic objects (billboards, callouts, etc)
				return;
			}

			expandBoundingBox(node);

			var children = node.children;
			for (var i = 0, l = children.length; i < l; i++) {
				traverse(children[ i ]);
			}
		}

		this.updateMatrixWorld();
		traverse(this);

		return boundingBox;
	};

	THREE.Object3D.prototype._vkPersistentId = function() {
		/* eslint-disable consistent-this */
		var obj3D = this;
		do {
			if (obj3D.userData.treeNode && obj3D.userData.treeNode.sid) {
				return obj3D.userData.treeNode.sid;
			}
			obj3D = obj3D.parent;
		} while (obj3D);
		/* eslint-enable consistent-this */
		return null;
	};
});