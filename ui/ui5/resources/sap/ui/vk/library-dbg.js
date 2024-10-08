/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

/* global escape */

/**
 * Initialization Code and shared classes of library sap.ui.vk.
 *
 * For backward compatibility all enums and standalone functions are pulled in via sap.ui.define in order
 * to be available in legacy applications via sap.ui.vk.*.
 */
sap.ui.define([
	"sap/base/util/ObjectPath",
	"./BillboardBorderLineStyle",
	"./BillboardCoordinateSpace",
	"./BillboardHorizontalAlignment",
	"./BillboardStyle",
	"./BillboardTextEncoding",
	"./CameraFOVBindingType",
	"./CameraProjectionType",
	"./ContentResourceSourceCategory",
	"./ContentResourceSourceTypeToCategoryMap",
	"./DetailViewShape",
	"./DetailViewType",
	"./DvlException",
	"./LeaderLineMarkStyle",
	"./MapContainerButtonType",
	"./Redline",
	"./RenderMode",
	"./SelectionMode",
	"./TransformationMatrix",
	"./VisibilityMode",
	"./ZoomTo",
	"./abgrToColor",
	"./colorToABGR",
	"./cssColorToColor",
	"./colorToCSSColor",
	"./getResourceBundle",
	"./utf8ArrayBufferToString",
	"./dvl/GraphicsCoreApi",
	"./dvl/checkResult",
	"./dvl/getJSONObject",
	"./dvl/getPointer",
	"./tools/AxisColours",
	"./tools/CoordinateSystem",
	"./tools/HitTestClickType",
	"./tools/HitTestIdMode",
	"./tools/PredefinedView"
], function(
	ObjectPath
) {
	"use strict";

	/**
	 * SAPUI5 library with controls for displaying 3D models.
	 *
	 * @namespace
	 * @name sap.ui.vk
	 * @author SAP SE
	 * @version 1.71.13
	 * @public
	 */

	// Delegate further initialization of this library to the Core.
	sap.ui.getCore().initLibrary({
		name: "sap.ui.vk",
		dependencies: [
			"sap.ui.core"
		],
		interfaces: [
			"sap.ui.vk.AuthorizationHandler",
			"sap.ui.vk.DecryptionHandler"
		],
		types: [
			// The `types` list is empty as we put all enums into separate modules. So there is no need
			// list them here, otherwise they will not be available due to how the `types` is processed in
			// the SAPUI core.
		],
		controls: [
			"sap.ui.vk.AnimationTimeSlider",
			"sap.ui.vk.ContainerBase",
			"sap.ui.vk.ContainerContent",
			"sap.ui.vk.DrawerToolbar",
			"sap.ui.vk.FlexibleControl",
			"sap.ui.vk.LegendItem",
			"sap.ui.vk.ListPanel",
			"sap.ui.vk.ListPanelStack",
			"sap.ui.vk.MapContainer",
			"sap.ui.vk.NativeViewport",
			"sap.ui.vk.Notifications",
			"sap.ui.vk.Overlay",
			"sap.ui.vk.ProgressIndicator",
			"sap.ui.vk.RedlineDesign",
			"sap.ui.vk.RedlineSurface",
			"sap.ui.vk.SceneTree",
			"sap.ui.vk.StepNavigation",
			"sap.ui.vk.Toolbar",
			"sap.ui.vk.Viewer",
			"sap.ui.vk.ViewGallery",
			"sap.ui.vk.Viewport",
			"sap.ui.vk.ViewportBase",
			"sap.ui.vk.dvl.Viewport",
			"sap.ui.vk.threejs.Viewport",
			"sap.ui.vk.tools.AnchorPointToolGizmo",
			"sap.ui.vk.tools.CrossSectionToolGizmo",
			"sap.ui.vk.tools.Gizmo",
			"sap.ui.vk.tools.MoveToolGizmo",
			"sap.ui.vk.tools.RotateToolGizmo",
			"sap.ui.vk.tools.ScaleToolGizmo",
			"sap.ui.vk.tools.SceneOrientationToolGizmo",
			"sap.ui.vk.tools.TooltipToolGizmo"
		],
		elements: [
			"sap.ui.vk.ContentConnector",
			"sap.ui.vk.FlexibleControlLayoutData",
			"sap.ui.vk.OverlayArea",
			"sap.ui.vk.RedlineElement",
			"sap.ui.vk.RedlineElementEllipse",
			"sap.ui.vk.RedlineElementFreehand",
			"sap.ui.vk.RedlineElementLine",
			"sap.ui.vk.RedlineElementRectangle",
			"sap.ui.vk.RedlineElementText",
			"sap.ui.vk.ViewStateManager",
			"sap.ui.vk.ViewStateManagerBase",
			"sap.ui.vk.dvl.ViewStateManager",
			"sap.ui.vk.threejs.NodesTransitionHelper",
			"sap.ui.vk.threejs.ViewStateManager",
			"sap.ui.vk.tools.AnchorPointTool",
			"sap.ui.vk.tools.CrossSectionTool",
			"sap.ui.vk.tools.HitTestTool",
			"sap.ui.vk.tools.MoveTool",
			"sap.ui.vk.tools.RectSelectTool",
			"sap.ui.vk.tools.RotateOrbitTool",
			"sap.ui.vk.tools.RotateTool",
			"sap.ui.vk.tools.RotateTurntableTool",
			"sap.ui.vk.tools.ScaleTool",
			"sap.ui.vk.tools.SceneOrientationTool",
			"sap.ui.vk.tools.Tool",
			"sap.ui.vk.tools.TooltipTool"
		],
		noLibraryCSS: false,
		version: "1.71.13",
		designtime: "sap/ui/vk/designtime/library.designtime"
	});

	var vkLibrary = ObjectPath.get("sap.ui.vk");

	var shims = {};
	shims["sap/ui/vk/threejs/thirdparty/three"] = {
		exports: "THREE",
		amd: true
	};
	shims["sap/ui/vk/thirdparty/html2canvas"] = {
		exports: "html2canvas",
		amd: true
	};

	sap.ui.loader.config({ shim: shims });

	// sap.ui.getCore().initLibrary() creates lazy stubs for controls and elements.
	// Create lazy stubs for non-Element-derived classes or extend Element-derived classed with static methods.
	var lazy = function(localClassName, staticMethods) {
		var methods = "new extend getMetadata";
		if (staticMethods) {
			methods += " " + staticMethods;
		}
		sap.ui.lazyRequire("sap.ui.vk." + localClassName, methods);
	};
	lazy("AnimationPlayback");
	lazy("AnimationSequence");
	lazy("BaseNodeProxy");
	lazy("Camera");
	lazy("ContentConnector", "registerSourceType"); // extend the lazy stub with the static method
	lazy("ContentManager");
	lazy("ContentResource");
	lazy("Core");
	lazy("DownloadManager");
	lazy("ImageContentManager");
	lazy("LayerProxy");
	lazy("Loco");
	lazy("Material");
	lazy("NodeHierarchy");
	lazy("NodeProxy");
	lazy("OrthographicCamera");
	lazy("PerspectiveCamera");
	lazy("RedlineDesignHandler");
	lazy("RedlineGesturesHandler");
	lazy("Scene");
	lazy("Smart2DHandler");
	lazy("Texture");
	lazy("View");
	lazy("ViewportHandler");
	lazy("dvl.BaseNodeProxy");
	lazy("dvl.ContentManager", "getRuntimeSettings setRuntimeSettings getWebGLContextAttributes setWebGLContextAttributes getDecryptionHandler setDecryptionHandler");
	lazy("dvl.GraphicsCore");
	lazy("dvl.LayerProxy");
	lazy("dvl.NodeHierarchy");
	lazy("dvl.NodeProxy");
	lazy("dvl.Scene");
	lazy("helpers.RotateOrbitHelperDvl");
	lazy("helpers.RotateOrbitHelperThree");
	lazy("helpers.RotateTurntableHelperDvl");
	lazy("helpers.RotateTurntableHelperThree");
	lazy("threejs.AnimationSequence");
	lazy("threejs.BaseNodeProxy");
	lazy("threejs.Billboard");
	lazy("threejs.Callout");
	lazy("threejs.ContentDeliveryService");
	lazy("threejs.ContentManager", "registerLoader");
	lazy("threejs.DetailView");
	lazy("threejs.LayerProxy");
	lazy("threejs.Material");
	lazy("threejs.NodeHierarchy");
	lazy("threejs.NodeProxy");
	lazy("threejs.OrthographicCamera");
	lazy("threejs.PerspectiveCamera");
	lazy("threejs.Scene");
	lazy("threejs.Texture");
	lazy("threejs.Thrustline");
	lazy("threejs.ViewportGestureHandler");
	lazy("tools.AnchorPointToolHandler");
	lazy("tools.CrossSectionToolHandler");
	lazy("tools.HitTestToolHandler");
	lazy("tools.MoveToolHandler");
	lazy("tools.RectSelectToolHandler");
	lazy("tools.RotateToolHandler");
	lazy("tools.ScaleToolHandler");
	lazy("tools.TooltipToolHandler");

	return vkLibrary;
});
