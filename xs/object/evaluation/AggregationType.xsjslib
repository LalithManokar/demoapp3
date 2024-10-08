var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.AggregationType = {
	Sum: "SUM",
	Avg: "AVG",
	And: "AND",
	Or: "OR",
	Matrix: "MATRIX",
	FORMULA: "FORMULA"
};

this.definition = {
	type: ObjectType.SystemConfiguration,
	Root: {
		table: "sap.ino.db.evaluation::t_aggregation_type",
		customProperties: {
			codeTextBundle: "sap.ino.text::t_aggregation_type"
		}
	}
};