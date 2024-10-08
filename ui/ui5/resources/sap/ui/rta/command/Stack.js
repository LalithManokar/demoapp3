/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/ManagedObject","sap/ui/fl/Utils","sap/ui/rta/command/Settings","sap/ui/rta/command/CompositeCommand","sap/ui/core/util/reflection/JsControlTreeModifier","sap/ui/fl/write/api/PersistenceWriteAPI"],function(M,F,S,C,J,P){"use strict";function _(c,d,f){var o=c[f];if(o){d.push(o);}return d;}function a(c,m,s,o){var d=o.getSelector();var e=new S({selector:d,changeType:o.getDefinition().changeType,element:J.bySelector(d,c)});e._oPreparedChange=o;if(o.getUndoOperations()){e._aRecordedUndo=o.getUndoOperations();o.resetUndoOperations();}var f=o.getDefinition().support.compositeCommand;if(f){if(!m[f]){m[f]=new C();s.pushExecutedCommand(m[f]);}m[f].addCommand(e);}else{s.pushExecutedCommand(e);}}var b=M.extend("sap.ui.rta.command.Stack",{metadata:{library:"sap.ui.rta",properties:{},aggregations:{commands:{type:"sap.ui.rta.command.BaseCommand",multiple:true}},events:{modified:{},commandExecuted:{parameters:{command:{type:"object"},undo:{type:"boolean"}}}}}});b.initializeWithChanges=function(c,f){var s=new b();s._aPersistedChanges=f;if(f&&f.length>0){var o=F.getComponentForControl(c);var A=F.getAppDescriptor(o)["sap.app"].id;var p={oComponent:o,appName:A,selector:c,invalidateCache:false};return P._getUIChanges(p).then(function(d){var m={};var e={};d.forEach(function(g){e[g.getDefinition().fileName]=g;});f.reduce(_.bind(null,e),[]).forEach(a.bind(null,o,m,s));return s;});}return Promise.resolve(s);};b.prototype.addCommandExecutionHandler=function(h){this._aCommandExecutionHandler.push(h);};b.prototype.removeCommandExecutionHandler=function(h){var i=this._aCommandExecutionHandler.indexOf(h);if(i>-1){this._aCommandExecutionHandler.splice(i,1);}};b.prototype.init=function(){this._aCommandExecutionHandler=[];this._toBeExecuted=-1;this._oLastCommand=Promise.resolve();};b.prototype._waitForCommandExecutionHandler=function(p){return Promise.all(this._aCommandExecutionHandler.map(function(h){return h(p);}));};b.prototype._getCommandToBeExecuted=function(){return this.getCommands()[this._toBeExecuted];};b.prototype.pushExecutedCommand=function(c){this.push(c,true);};b.prototype.push=function(c,e){if(this._bUndoneCommands){this._bUndoneCommands=false;while(this._toBeExecuted>-1){this.pop();}}this.insertCommand(c,0);if(!e){this._toBeExecuted++;}this.fireModified();};b.prototype.top=function(){return this.getCommands()[0];};b.prototype.pop=function(){if(this._toBeExecuted>-1){this._toBeExecuted--;}return this.removeCommand(0);};b.prototype.removeCommand=function(o,s){var r=this.removeAggregation("commands",o,s);this.fireModified();return r;};b.prototype.removeAllCommands=function(s){var c=this.removeAllAggregation("commands",s);this._toBeExecuted=-1;this.fireModified();return c;};b.prototype.isEmpty=function(){return this.getCommands().length===0;};b.prototype.execute=function(){this._oLastCommand=this._oLastCommand.catch(function(){}).then(function(){var c=this._getCommandToBeExecuted();if(c){return c.execute().then(function(){this._toBeExecuted--;var p={command:c,undo:false};this.fireCommandExecuted(p);this.fireModified();return this._waitForCommandExecutionHandler(p);}.bind(this)).catch(function(e){e=e||new Error("Executing of the change failed.");e.index=this._toBeExecuted;e.command=this.removeCommand(this._toBeExecuted);this._toBeExecuted--;return Promise.reject(e);}.bind(this));}}.bind(this));return this._oLastCommand;};b.prototype._unExecute=function(){if(this.canUndo()){this._bUndoneCommands=true;this._toBeExecuted++;var c=this._getCommandToBeExecuted();if(c){return c.undo().then(function(){var p={command:c,undo:true};this.fireCommandExecuted(p);this.fireModified();return this._waitForCommandExecutionHandler(p);}.bind(this));}return Promise.resolve();}return Promise.resolve();};b.prototype.canUndo=function(){return(this._toBeExecuted+1)<this.getCommands().length;};b.prototype.undo=function(){return this._unExecute();};b.prototype.canRedo=function(){return!!this._getCommandToBeExecuted();};b.prototype.redo=function(){return this.execute();};b.prototype.pushAndExecute=function(c){this.push(c);return this.execute();};b.prototype.getAllExecutedCommands=function(){var A=[];var c=this.getCommands();for(var i=c.length-1;i>this._toBeExecuted;i--){var s=this.getSubCommands(c[i]);A=A.concat(s);}return A;};b.prototype.getSubCommands=function(c){var d=[];if(c.getCommands){c.getCommands().forEach(function(s){var e=this.getSubCommands(s);d=d.concat(e);},this);}else{d.push(c);}return d;};return b;},true);
