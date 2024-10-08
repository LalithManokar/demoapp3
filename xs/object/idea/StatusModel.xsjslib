var StatusModel = $.import("sap.ino.xs.object.status", "Model");

this.definition = StatusModel.definition;

this.definition.Root = this.definition.Root ? this.definition.Root : {};
this.definition.Root.attributes = this.definition.Root.attributes ? this.definition.Root.attributes : {};

this.definition.Root.attributes.OBJECT_TYPE_CODE = {
    constantKey : "IDEA"
};
