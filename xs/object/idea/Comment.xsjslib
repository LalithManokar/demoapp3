var Comment = $.import("sap.ino.xs.object.comment", "Comment");
var counts = $.import("sap.ino.xs.object.idea", "ideaCounts");
var ObjectOnPersistCallBack = $.import("sap.ino.xs.xslib", "ObjectOnPersistCallback");

this.definition = Comment.object("IDEA", {
	onPersist: [counts.update, ObjectOnPersistCallBack.entry],
	impacts: {
		create: ["sap.ino.xs.object.idea.Idea"],
		del: ["sap.ino.xs.object.idea.Idea"]
	}
});