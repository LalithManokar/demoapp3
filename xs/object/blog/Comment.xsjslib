var Comment = $.import("sap.ino.xs.object.comment", "Comment");
var counts = $.import("sap.ino.xs.object.blog", "blogCounts");
this.definition = Comment.object("BLOG", {
	onPersist: [counts.update],
	impacts: {
		create: ["sap.ino.xs.object.blog.Blog"],
		del: ["sap.ino.xs.object.blog.Blog"]
	}
});