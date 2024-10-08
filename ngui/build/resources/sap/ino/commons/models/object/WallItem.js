/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ino/commons/models/aof/ApplicationObject","sap/ino/commons/models/core/ReadSource","sap/ino/commons/models/util/UUID","sap/ino/commons/models/object/Wall"],function(A,R,U,W){"use strict";var o="sap.ino.xs.object.wall.WallItem";var a=A.extend("sap.ino.commons.models.object.WallItem",{objectName:o,readSource:function(k,o,m,b){b=b||{};b.headers=b.headers||{};b.headers["wall-action"]="readItemById";b.headers["wall-wallItemId"]=k;return R.getDefaultAOFSource({cache:false})("",o,m,b);},invalidation:{entitySets:["WallItems"]},constructor:function(){A.apply(this,arguments);this._wallSessionUUID=U.generate();},process:function(b){if(b.type==="DELETE"){var s=b.url.lastIndexOf("/");b.headers["wall-wallItemIds"]=b.url.substring(s+1);b.url=b.url.substring(0,s);}else{var i=JSON.parse(b.data);i.CONTENT=JSON.parse(i.CONTENT);b.data=JSON.stringify({ID:i.WALL_ID,Items:[i]});}return W.processRequest(this,b);},getChangeRequest:function(c){var C=jQuery.extend({},this.getData());C.CONTENT=JSON.stringify(C.CONTENT);var b=this.calculateChangeRequest(this.getApplicationObject(),this._oBeforeData||{},C,c,this);b.WALL_ID=C.WALL_ID;return b;}});return a;});
