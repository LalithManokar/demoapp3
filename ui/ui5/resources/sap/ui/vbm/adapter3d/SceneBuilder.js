/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/ui/base/Object","./Utilities","./PolygonHandler","./ModelHandler","./thirdparty/three","./thirdparty/DecalGeometry","./thirdparty/html2canvas"],function(q,B,U,P,M,T,D,h){"use strict";var t="sap.ui.vbm.adapter3d.SceneBuilder";var l=q.sap.log;var F=T.Face3;var a=T.Matrix4;var V=T.Vector2;var b=T.Vector3;var d=T.Math.degToRad;var c=U.toArray;var e=U.toBoolean;var f=U.toVector3;var g=U.createMaterial;var p=U.propertyChanged;var j=U.propertyRemoved;var k=U.propertyAdded;var u=U.updateProperty;var r=U.refCountableDispose;var m;var n;var S=B.extend("sap.ui.vbm.adapter3d.SceneBuilder",{constructor:function(i,v){B.call(this);this._context=i;this._viewport=v;this._root=v.getRoot();this._scene=v.getScene();this._hotInstance=null;this._decalHelper=null;this._targets=new Map();this._textures=new Map();this._box4=null;this._box6=null;this._cylinder=null;this._cylinderCaps=null;this._polygonHandler=new P(this._root);this._modelHandler=new M(this._context.resources,this._textures,this._scene,this._root);this._textureLoader=null;}});S.prototype.destroy=function(){this._root=null;this._scene=null;this._viewport=null;this._context=null;this._hotInstance=null;if(this._box4){this._box4.dispose();}if(this._box6){this._box6.dispose();}if(this._cylinder){this._cylinder.dispose();}if(this._cylinderCaps){this._cylinderCaps.dispose();}if(this._decalHelper){this._decalHelper.material.dispose();this._decalHelper.geometry.dispose();this._scene.remove(this._decalHelper);this._decalHelper=null;}this._polygonHandler.destroy();this._polygonHandler=null;this._modelHandler.destroy();this._modelHandler=null;this._textures.forEach(function(i){i.dispose();});this._targets.clear();this._targets=null;B.prototype.destroy.call(this);};S.prototype.synchronize=function(){var i=this;function o(s){var v=i._textures.get(s);if(!v){i._textures.set(s,null);}}return new Promise(function(s,v){var w=sap.ui.vbm.findInArray(i._context.windows,function(w){return w.type==="default";});var x=w&&sap.ui.vbm.findInArray(i._context.scenes,function(x){return x.id===w.refScene;});if(!x){s();return;}i._context.scene=x;if(i._context.setupView){var y=i._context.setupView;i._setupView(y.position,y.zoom,y.pitch,y.yaw,y.home,y.flyTo);i._context.setupView=undefined;}var z=[];var A=[],C=[];var E=i._context.voQueues.toAdd.get(x)||[];var G=i._context.voQueues.toUpdate.get(x)||[];var H=i._context.voQueues.toRemove.get(x)||[];[].concat(E,G).forEach(function(I){if(I.isModel){i._modelHandler.addModel(I);}if(I.texture&&p(I,"texture")){o(I.texture);}if(I.textureCap&&p(I,"textureCap")){o(I.textureCap);}if(I.isDecal&&I.text&&p(I,["text","size"])){z.push(I);}});i._loadTextures().then(function(){return i._modelHandler.loadModels();}).then(function(){return i._renderTexts(z);}).then(function(){H.forEach(i._removeInstance.bind(i));G.forEach(i._updateInstance.bind(i,C));E.forEach(i._addInstance.bind(i,A));i._polygonHandler.update();i._modelHandler.update();i._scene.updateMatrixWorld(true);C.forEach(i._updateInstance.bind(i,null));A.forEach(i._addInstance.bind(i,null));i._cleanupCache();s();}).catch(function(I){v(I);});});};S.prototype._findMesh=function(i){var o=null;i.traverse(function(s){if(!o&&s.isMesh){o=s;}});return o;};S.prototype._getGeometrySize=function(){return 2.0;};S.prototype._getZoomFactor=function(i,o){var s=new b();s.subVectors(o,i);return(this._getGeometrySize()*2)/s.length();};S.prototype._setupView=function(i,z,o,y,s,v){i=f(i||"0;0;0");z=parseFloat(z||"1");if(z===0){z=1;}else if(z<0){z=0.1;}var w=this._getGeometrySize()*2/z;o=parseFloat(o||"0");y=parseFloat(y||"0");o=(o%180===0?o+1:o);var x=new a();x.makeRotationX(d(o+180));var A=new a();A.makeRotationZ(d(-(y+180)));var C=new a();C.multiplyMatrices(A,x);var E=new b(0,0,-5);var G=new b(0,0,0);var H=new b();H.subVectors(G,E).normalize();H.multiplyScalar(w);H.applyMatrix4(C);H.add(i);G.add(i);var I={zoom:1.0,target:new b(-G.x,-G.z,G.y),position:new b(-H.x,-H.z,H.y)};if(s){this._viewport._setCameraHome(I);this._viewport._applyCamera(I,v);}else{this._viewport._applyCamera(I,v);}};S.prototype._getDecalTextKey=function(i){return i.size+";"+i.text;};S.prototype._renderTexts=function(i){var o=[];i.forEach(function(s){if(!this._textures.has(this._getDecalTextKey(s))){o.push(this._renderText(s));}},this);return Promise.all(o);};S.prototype._renderText=function(i){var o=this;return new Promise(function(s,v){var w=f(i.size);if(w.length()<1E-6){l.error("Unable render text to html: decal size is invalid","",t);s();}else{var x=512;var y=w.x/w.y;var z=Math.ceil(y>=1?x:x*y);var A=Math.ceil(y<=1?x:x/y);var C=document.createElement("iframe");C.style.visibility="hidden";C.sandbox="allow-same-origin";C.width=z;C.height=A;document.body.appendChild(C);var E=C.contentDocument||C.contentWindow.document;E.open();E.close();E.body.innerHTML=i.text;var G=document.createElement("canvas");G.width=C.width*window.devicePixelRatio;G.height=C.height*window.devicePixelRatio;G.style.width=C.width+"px";G.style.height=C.height+"px";var H=G.getContext("2d");H.scale(window.devicePixelRatio,window.devicePixelRatio);h(E.body,{canvas:G,width:z,height:A,backgroundColor:null}).then(function(I){if(I.width>0&&I.height>0){var J=new T.Texture(I);J.needsUpdate=true;U.addRef(J);o._textures.set(o._getDecalTextKey(i),J);}else{l.error("Failed render text to html","",t);}document.body.removeChild(C);s();});}});};S.prototype._loadTextures=function(){var i=[];this._textures.forEach(function(o,s){if(!o){i.push(this._loadTexture(s));}},this);return Promise.all(i);};S.prototype._loadTexture=function(i){var o=this;var s=this._context.resources.get(i);if(!s){this._textures.delete(i);l.error("Failed to get texture from context",i,t);return Promise.resolve();}return new Promise(function(v,w){o._getTextureLoader().load(U.makeDataUri(s),function(x){x.flipY=false;o._textures.set(i,x);v();},null,function(x){o._textures.delete(i);l.error("Failed to load texture from Data URI: "+i,"status: "+x.status+", status text: "+x.statusText,t);v();});});};S.prototype._cleanupCache=function(){this._textures.forEach(function(i){if(r(i)){i.dispose();this._textures.delete(i);}},this);if(this._box4&&r(this._box4)){this._box4.dispose();this._box4=null;}if(this._box6&&r(this._box6)){this._box6.dispose();this._box6=null;}if(this._cylinder&&r(this._cylinder)){this._cylinder.dispose();this._cylinder=null;}if(this._cylinderCaps&&r(this._cylinderCaps)){this._cylinderCaps.dispose();this._cylinderCaps=null;}};S.prototype._addInstance=function(i,o){if(!o.isDecal){this._updateInstanceKeys(o);}if(o.isPolygon){this._polygonHandler.addInstance(o);}else if(o.isModel){this._modelHandler.addInstance(o);}else if(o.isBox||o.isCylinder){o.object3D=new T.Group();o.object3D.matrixAutoUpdate=false;this._root.add(o.object3D);if(o.isBox){this._assignBoxProperties(o);}else{this._assignCylinderProperties(o);}}else if(o.isDecal){if(i){i.push(o);}else{this._assignDecalProperties(o);}}else{l.error("Unable to add instance: instance type is unknown","",t);}};S.prototype._updateInstance=function(i,o){if(!o.isDecal){this._updateInstanceKeys(o);}if(o.isPolygon){this._polygonHandler.updateInstance(o);}else if(o.isModel){this._modelHandler.updateInstance(o);}else if(o.isBox){this._assignBoxProperties(o,o===this._hotInstance);}else if(o.isCylinder){this._assignCylinderProperties(o,o===this._hotInstance);}else if(o.isDecal){if(i){i.push(o);}else{this._assignDecalProperties(o);}}else{l.error("Unable to update instance: instance type is unknown","",t);}};S.prototype._removeInstance=function(i){if(!i.isDecal){this._removeInstanceKeys(i);}if(i.isPolygon){this._polygonHandler.removeInstance(i);}else if(i.isModel){this._modelHandler.removeInstance(i);}else if(i.isBox||i.isCylinder||i.isDecal){if(i.object3D){this._deleteObject3D(i.object3D);i.object3D=null;i._last={};}else{l.error("Unable to remove instance: object3D is missing","",t);}}else{l.error("Unable to remove instance: instance type is unknown","",t);}if(this._hotInstance===i){this._hotInstance=null;}};S.prototype.updateSelection=function(s,i){s.concat(i).forEach(function(o){if(o.isPolygon){this._polygonHandler.updateInstance(o);}else if(o.isModel){this._modelHandler.updateInstance(o);}else if(o.isBox){this._assignBoxProperties(o,o===this._hotInstance);}else if(o.isCylinder){this._assignCylinderProperties(o,o===this._hotInstance);}},this);this._polygonHandler.update();this._modelHandler.update();};S.prototype._updateHotStatus=function(i,o){if(i.isBox){this._assignBoxProperties(i,o);}else if(i.isCylinder){this._assignCylinderProperties(i,o);}};S.prototype.updateHotInstance=function(i){this._polygonHandler.updateHotInstance(i);this._modelHandler.updateHotInstance(i);this._polygonHandler.update();this._modelHandler.update();if(this._hotInstance){this._updateHotStatus(this._hotInstance,false);}if(i){this._updateHotStatus(i,true);}this._hotInstance=i;};S.prototype._assignBoxProperties=function(i,o){var s=i.object3D.children.length===0?null:i.object3D.children[0];if(!s||p(i,"texture6")){var v=this._getBoxGeometry(e(i.texture6));U.addRef(v);if(s){U.subRef(s.geometry);s.geometry=v;}else{s=new T.Mesh(v,g(false));s.matrixAutoUpdate=false;s.layers.set(0);s._sapInstance=i;i.object3D.add(s);}}u(i,"texture6");this._assignProperties(i,o);};S.prototype._assignCylinderProperties=function(i,o){var s,v=false,w=e(i.isOpen),x=i.object3D.children.length===0?null:i.object3D.children[0];if(!x||p(i,"isOpen")){var y=this._getCylinderGeometry(w);U.addRef(y);if(x){U.subRef(x.geometry);x.geometry=y;if(w){s=x.material[1];if(s.map){U.subRef(s.map);s.dispose();}x.material=x.material[0];x.material.side=T.DoubleSide;x.material.needsUpdate=true;}else{s=x.material.clone();s.map=null;x.material=[x.material,s];x.material.forEach(function(z){z.needsUpdate=true;z.side=T.FrontSide;});v=true;}}else{x=new T.Mesh(y,w?g(true):[g(false),g(false)]);x.matrixAutoUpdate=false;x.layers.set(0);x._sapInstance=i;i.object3D.add(x);}}if(p(i,"textureCap")||v){s=Array.isArray(x.material)?x.material[1]:null;if(s){if(s.map){U.subRef(s.map);s.map=null;s.needsUpdate=true;}if(i.textureCap){s.map=this._textures.get(i.textureCap);if(s.map){s.needsUpdate=true;U.addRef(s.map);}else{l.error("Unable to apply cap texture on cylinder, texture not found",i.textureCap,t);}}}}u(i,["isOpen","testureCap"]);this._assignProperties(i,o);};S.prototype._assignProperties=function(i,o){var s,v,w=i.object3D.children[0];if(p(i,"texture")){v=Array.isArray(w.material)?w.material[0]:w.material;if(v.map){U.subRef(v.map);v.map=null;v.needsUpdate=true;}if(i.texture){v.map=this._textures.get(i.texture);if(v.map){v.needsUpdate=true;U.addRef(v.map);}else{l.error("Unable to apply texture, texture not found",i.texture,t);}}}if(p(i,["color","selectColor","VB:s"])||o!==undefined){s=U.getColor(i,i.color,o);U.toArray(w.material).forEach(function(z){z.color.copy(s.rgb);z.opacity=s.opacity;z.transparent=z.opacity<1;z.needsUpdate=true;});}var x=w.children.length===0?null:w.children[0];if(j(i,"colorBorder")){x.material.dispose();x.geometry.dispose();w.remove(x);}else if(i.colorBorder){if(k(i,"colorBorder")){var y=i.isBox?new T.EdgesGeometry(w.geometry):new T.EdgesGeometry(w.geometry,60);x=new T.LineSegments(y,U.createLineMaterial());x.matrixAutoUpdate=false;x.layers.set(1);w.add(x);}if(p(i,["colorBorder","selectColor,","VB:s"])||o!==undefined){v=x.material;s=U.getColor(i,i.colorBorder,o);v.color.copy(s.rgb);v.opacity=s.opacity;v.transparent=v.opacity<1;v.needsUpdate=true;}}if(p(i,"normalize")){if(e(i.normalize)){U.normalizeObject3D(w);w.updateMatrix();}else{w.position.set(0,0,0);w.rotation.set(0,0,0);w.scale.set(1,1,1);}}if(p(i,["pos","rot","scale"])){U.getInstanceTransform(i,i.object3D.position,i.object3D.rotation,i.object3D.scale);i.object3D.updateMatrix();}u(i,["texture","color","selectColor","VB:s","colorBorder","normalize","pos","rot","scale"]);};S.prototype._assignDecalProperties=function(i){var o=false,s;if(p(i,["position","direction","size","rotation","target"])){o=true;}if(!i.target&&p(i,["planeOrigin","planeNormal"])){o=true;}if(o){if(i.object3D){s=i.object3D.material.clone();this._deleteObject3D(i.object3D);i.object3D=null;}var v=this._getDecalTarget(i);if(!v){l.error("Unable to create decal","target is missing",t);return;}var w=this._createDecal(i,v,s);this._disposeDecalTarget(i,v);if(!w){return;}}if(p(i,["texture","text"])){s=i.object3D.material;if(s.map){U.subRef(s.map);s.map=null;}s.map=this._textures.get(i.text?this._getDecalTextKey(i):i.texture);if(s.map){s.map.flipY=true;s.needsUpdate=true;U.addRef(s.map);}else{l.error("Unable to apply texture, texture not found",i.texture,t);}}u(i,["position","direction","size","rotation","target","texture","text","planeOrigin","planeNormal"]);};S.prototype._createDecal=function(i,o,s){this._root.updateMatrixWorld(true);var v=f(i.position);var w=f(i.direction).normalize();if(w.length()<1E-6){l.error("Unable create decal: direction is invalid","",t);return false;}var x=d(U.toFloat(i.rotation));var y=f(i.size);if(y.length()<1E-6){l.error("Unable create decal: size is invalid","",t);return false;}v.applyMatrix4(o.matrixWorld);w.transformDirection(o.matrixWorld);var z=new T.Raycaster(v,w);var A=z.intersectObject(o);if(!A.length){l.error("Unable create decal: cannot project decal to plane","",t);return false;}if(!this._decalHelper){this._decalHelper=new T.Mesh(new T.BoxBufferGeometry(1,1,5));this._decalHelper.visible=false;this._decalHelper.layers.set(1);this._decalHelper.up.set(0,1,0);this._scene.add(this._decalHelper);}var C=A[0];var E=C.point;var G=w.clone().negate();var H=new T.Box3().setFromObject(o);var I=H.max.clone().sub(H.min).length();G.multiplyScalar(I);G.add(E);this._decalHelper.position.copy(E);this._decalHelper.lookAt(G);this._decalHelper.rotation.z+=x;s=s||new T.MeshPhongMaterial({specular:0x444444,shininess:0,opacity:0.99,transparent:true,depthTest:true,depthWrite:false,polygonOffset:true,polygonOffsetUnits:0.1,polygonOffsetFactor:-1});i.object3D=new T.Mesh(new T.DecalGeometry(o,E,this._decalHelper.rotation,y),s);i.object3D.renderOrder=100;i.object3D.matrixAutoUpdate=false;i.object3D.layers.set(1);this._scene.add(i.object3D);return true;};S.prototype._createPlane=function(i,o){var s=f(i.planeOrigin);var v=f(i.planeNormal).normalize();if(v.length()<1E-6){l.error("Unable to create plane for decal: normal is invalid","",t);return null;}var w=new b(v.x===0?10:-v.x,v.y===0?-10:v.y,v.z===0?10:-v.z);var x=s.clone(s).add(w);x.sub(v.clone().multiplyScalar(v.dot(x.clone().sub(s))));var y=10000;w=x.clone().sub(s).normalize();var z=v.clone().cross(w).normalize();w.multiplyScalar(y);z.multiplyScalar(y);var A=s.clone().add(w);var C=s.clone().sub(w);var E=s.clone().add(z);var G=s.clone().sub(z);var H=new T.Geometry();H.vertices.push(A,E,C,G);H.faces.push(new F(0,1,2,v),new F(2,3,0,v));var I=new T.Mesh(H);o.add(I);return I;};S.prototype._getDecalTarget=function(i){if(i.target){var o=this._targets.get(i.target);if(o){if(o.isBox||o.isCylinder){return o.object3D.children[0];}else if(o.isPolygon){return this._polygonHandler.getTarget(o);}else if(o.isModel){return this._modelHandler.getTarget(o);}else{l.error("Unable to get decal's target","target instance type is unknown",t);return null;}}}else if(i.planeOrigin&&i.planeNormal){return this._createPlane(i,this._root);}else{l.error("Unable to get/create decal's target","missing parameters",t);return null;}};S.prototype._disposeDecalTarget=function(i,o){if(i.target){var s=this._targets.get(i.target);if(s){if(s.isPolygon||s.isModel){this._deleteObject3D(o);}}else{l.error("Unable to dispose decal's target","target not found",t);}}else{this._deleteObject3D(o);}};S.prototype._updateInstanceKeys=function(i){var v=this._getInstanceKeys(i);if(v){this._targets.set(v.key,i);this._targets.set(v.group,i);}};S.prototype._removeInstanceKeys=function(i){var v=this._getInstanceKeys(i);if(v){this._targets.delete(v.key);this._targets.delete(v.group);}};S.prototype._getInstanceKeys=function(i){if(i.dataInstance){var o=i.voGroup.keyAttributeName;if(o){var v=i.dataInstance[o];if(v){return{key:v,group:i.voGroup.id+"."+v};}}}return null;};S.prototype._deleteObject3D=function(o){o.traverse(function(i){if(i.geometry){if(U.refCountable(i.geometry)){U.subRef(i.geometry);}else{i.geometry.dispose();}}c(i.material).forEach(function(s){if(s.map){U.subRef(s.map);}s.dispose();});});o.parent.remove(o);};S.prototype._getBoxGeometry=function(s){if(s){return this._box6||(this._box6=m(s));}else{return this._box4||(this._box4=m(s));}};S.prototype._getCylinderGeometry=function(o){if(o){return this._cylinder||(this._cylinder=n(o));}else{return this._cylinderCaps||(this._cylinderCaps=n(o));}};S.prototype._getTextureLoader=function(){return this._textureLoader||(this._textureLoader=new T.TextureLoader());};m=function(s){var i=new T.Geometry();var o=0.1;i.vertices.push(new b(o,o,-o),new b(o,-o,-o),new b(-o,-o,-o),new b(-o,o,-o),new b(o,o,o),new b(-o,o,o),new b(-o,-o,o),new b(o,-o,o),new b(o,o,-o),new b(o,o,o),new b(o,-o,o),new b(o,-o,-o),new b(o,-o,-o),new b(o,-o,o),new b(-o,-o,o),new b(-o,-o,-o),new b(-o,-o,-o),new b(-o,-o,o),new b(-o,o,o),new b(-o,o,-o),new b(o,o,o),new b(o,o,-o),new b(-o,o,-o),new b(-o,o,o));var v=new T.Color(0.5,0.5,0.5);i.faces.push(new F(0,2,3,new b(0,0,-1),v),new F(0,1,2,new b(0,0,-1),v),new F(4,5,6,new b(0,0,1),v),new F(4,6,7,new b(0,0,1),v),new F(8,10,11,new b(1,0,0),v),new F(8,9,10,new b(1,0,0),v),new F(12,14,15,new b(0,-1,0),v),new F(12,13,14,new b(0,-1,0),v),new F(16,18,19,new b(-1,0,0),v),new F(16,17,18,new b(-1,0,0),v),new F(20,22,23,new b(0,1,0),v),new F(20,21,22,new b(0,1,0),v));var w;if(s){w=[new V(2/3,0.5),new V(1.0,0.5),new V(1.0,1.0),new V(2/3,1.0),new V(2/3,0.5),new V(2/3,0.0),new V(1.0,0.0),new V(1.0,0.5),new V(2/3,0.5),new V(2/3,1.0),new V(1/3,1.0),new V(1/3,0.5),new V(2/3,0.0),new V(2/3,0.5),new V(1/3,0.5),new V(1/3,0.0),new V(1/3,0.5),new V(1/3,1.0),new V(0.0,1.0),new V(0.0,0.5),new V(0.0,0.5),new V(0.0,0.0),new V(1/3,0.0),new V(1/3,0.5)];}else{w=[new V(0.5,0.5),new V(1.0,0.5),new V(1.0,1.0),new V(0.5,1.0),new V(0.5,0.5),new V(1.0,0.5),new V(1.0,1.0),new V(0.5,1.0),new V(0.5,0.5),new V(0.5,1.0),new V(0.0,1.0),new V(0.0,0.5),new V(0.5,0.5),new V(0.5,0.0),new V(1.0,0.0),new V(1.0,0.5),new V(0.5,0.5),new V(0.5,1.0),new V(0.0,1.0),new V(0.0,0.5),new V(0.0,0.5),new V(0.0,0.0),new V(0.5,0.0),new V(0.5,0.5)];}i.faceVertexUvs[0].push([w[0],w[2],w[3]],[w[0],w[1],w[2]],[w[5],w[6],w[7]],[w[5],w[7],w[4]],[w[8],w[10],w[11]],[w[8],w[9],w[10]],[w[12],w[14],w[15]],[w[12],w[13],w[14]],[w[16],w[18],w[19]],[w[16],w[17],w[18]],[w[20],w[22],w[23]],[w[20],w[21],w[22]]);return i;};n=function(o){var s=0.1;var v=new T.CylinderGeometry(s,s,2*s,32,1,o);if(!o){for(var i=0;i<v.faces.length;++i){var w=v.faces[i];if(w.normal.y!==0){v.faceVertexUvs[0][i][0].u=(v.vertices[w.a].x+s/2)/s;v.faceVertexUvs[0][i][0].v=(v.vertices[w.a].z+s/2)/s;v.faceVertexUvs[0][i][1].u=(v.vertices[w.b].x+s/2)/s;v.faceVertexUvs[0][i][1].v=(v.vertices[w.b].z+s/2)/s;v.faceVertexUvs[0][i][2].u=(v.vertices[w.c].x+s/2)/s;v.faceVertexUvs[0][i][2].v=(v.vertices[w.c].z+s/2)/s;w.materialIndex=1;}else{w.materialIndex=0;}}}return v;};return S;});
