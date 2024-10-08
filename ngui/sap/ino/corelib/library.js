 /*!
  * @copyright@
  */
 sap.ui.define([
    "sap/ui/core/library",
    "sap/m/library"
], function() {
 	"use strict";

 	sap.ui.getCore().initLibrary({
 		name: "sap.ino.corelib",
 		dependencies: ["sap.ui.core", "sap.m"],
 		types: [],
 		interfaces: [],
 		controls: [
            "sap.ino.commons.application.BaseComponent",
            "sap.ino.commons.application.Configuration",
            "sap.ino.commons.application.Router",
            "sap.ino.commons.application.WebAnalytics",

            "sap.ino.commons.formatters.BaseFormatter",
            "sap.ino.commons.formatters.BaseListFormatter",
            "sap.ino.commons.formatters.ListFormatter",
            "sap.ino.commons.formatters.ObjectFormatter",
            "sap.ino.commons.formatters.ObjectListFormatter",

            "sap.ino.commons.models.aof.ApplicationObject",
            "sap.ino.commons.models.aof.ApplicationObjectChange",
            "sap.ino.commons.models.aof.MessageParser",
            "sap.ino.commons.models.aof.MetaModel",
            "sap.ino.commons.models.aof.PropertyModel",
            "sap.ino.commons.models.aof.PropertyModelCache",

            "sap.ino.commons.models.core.CoreModel",
            "sap.ino.commons.models.core.Extensibility",
            "sap.ino.commons.models.core.ModelSynchronizer",
            "sap.ino.commons.models.core.ReadSource",

            "sap.ino.commons.models.object.Attachment",
            "sap.ino.commons.models.object.Campaign",
            "sap.ino.commons.models.object.CampaignComment",
            "sap.ino.commons.models.object.Evaluation",
            "sap.ino.commons.models.object.Idea",
            "sap.ino.commons.models.object.IdeaComment",
            "sap.ino.commons.models.object.Notification",
            "sap.ino.commons.models.object.UserSettings",
            "sap.ino.commons.models.object.Vote",
            "sap.ino.commons.models.object.Wall",
            "sap.ino.commons.models.object.WallItem",

            "sap.ino.commons.models.util.UUID",
            "sap.ino.commons.models.util.WallMapper",

            "sap.ino.controls.ActiveNavigationListItem",
            "sap.ino.controls.Campaign",
            "sap.ino.controls.ColorBar",
            "sap.ino.controls.ColorPicker",
            "sap.ino.controls.ColorPickerLite",
            "sap.ino.controls.ColorRibbon",
            "sap.ino.controls.EvaluationMatrix",
            "sap.ino.controls.EvaluationMatrixItem",
            "sap.ino.controls.GenericStyle",
            "sap.ino.controls.HorizontalLine",
            "sap.ino.controls.IdeaCard",
            "sap.ino.controls.Image",
            "sap.ino.controls.ImageCropping",
            "sap.ino.controls.LabelledIcon",
            "sap.ino.controls.MobileTextEditor",
            "sap.ino.controls.NotificationHeadItem",
            "sap.ino.controls.ProcessIndicator",
            "sap.ino.controls.RichTextEditor",
            "sap.ino.controls.SidePanel",
            "sap.ino.controls.Vote",
            "sap.ino.controls.VoteDisplay",
            "sap.ino.controls.WrappingList",

            "sap.ino.vc.commons.BaseController",
            "sap.ino.vc.commons.BaseListController",
            "sap.ino.vc.commons.BaseObjectController",
            "sap.ino.vc.commons.BaseObjectModifyController",
            "sap.ino.vc.commons.BaseVariantListController",
            "sap.ino.vc.commons.TopLevelPageFacet",
            "sap.ino.vc.evaluation.EvaluationFacet",
            "sap.ino.vc.evaluation.EvaluationFormatter",
            "sap.ino.vc.idea.ActivitiesBlock",
            "sap.ino.vc.idea.AttachmentBlock",
            "sap.ino.vc.idea.CommentBlock",
            "sap.ino.vc.idea.EvaluationsBlock",
            "sap.ino.vc.idea.ExpertFinderBlock",
            "sap.ino.vc.idea.ListInIdeaBlock",
            "sap.ino.vc.idea.RelatedIdeasBlock",
            "sap.ino.vc.wall.util.Helper",
            "sap.ino.vc.wall.util.WallFactory"],
 		elements: [
            "sap.ino.controls.EvaluationData",
            "sap.ino.controls.EvaluationDataCriterionValue",
            "sap.ino.controls.EvaluationMatrixItem",
            "sap.ino.controls.NotificationHeadItem"],
 		version: "@version@"
 	});
 });