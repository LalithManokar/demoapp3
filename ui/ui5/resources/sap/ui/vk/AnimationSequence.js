/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","sap/ui/base/ManagedObject","./AnimationTrackType","./AnimationRotateType","./AnimationInterpolationType"],function(q,M,A,a,b){"use strict";var c=M.extend("sap.ui.vk.AnimationSequence",{metadata:{library:"sap.ui.vk",properties:{name:{type:"string"},sequenceId:{type:"string"}},events:{keyFrameAdded:{parameters:{sequenceId:"string",targetNodeRef:"object",trackType:"sap.ui.vk.AnimationTrackType",keyFrameValue:"float[]",keyFrameTime:"float"},enableEventBubbling:true},keyFrameUpdated:{parameters:{sequenceId:"string",targetNodeRef:"object",trackType:"sap.ui.vk.AnimationTrackType",keyFrameValue:"float[]",keyFrameTime:"float",keyFrameIndex:"int"},enableEventBubbling:true},keyFrameDeleted:{parameters:{sequenceId:"string",targetNodeRef:"object",trackType:"sap.ui.vk.AnimationTrackType",keyFrameValue:"float[]",keyFrameTime:"float",keyFrameIndex:"int",lastKeyFrame:"boolean"},enableEventBubbling:true}}}});return c;});
