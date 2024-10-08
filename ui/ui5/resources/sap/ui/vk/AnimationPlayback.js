/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","sap/ui/base/ManagedObject"],function(q,M){"use strict";var A=M.extend("sap.ui.vk.AnimationPlayback",{metadata:{library:"sap.ui.vk",properties:{pid:{type:"string"},sequenceId:{type:"string"},timeScale:{type:"float",defaultValue:1},preDelay:{type:"float",defaultValue:0},postDelay:{type:"float",defaultValue:0},repeat:{type:"int",defaultValue:1},reversed:{type:"boolean",defaultValue:false},startTime:{type:"float",defaultValue:0},infinite:{type:"boolean",defaultValue:false}}}});return A;});
