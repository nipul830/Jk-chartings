export type DrawingCategory =
  | "Cursors"
  | "Trend"
  | "Channels"
  | "Fibonacci & Gann"
  | "Patterns"
  | "Prediction & Measurement"
  | "Geometric"
  | "Annotation";

export type DrawingToolDefinition = {
  name: string;
  category: DrawingCategory;
  anchors: number;
  kind: "point" | "line" | "shape" | "multi" | "annotation";
};

// TradingView-style public drawing-tool catalogue. The drawing engine can use
// this registry without coupling the UI to individual tools.
export const DRAWING_TOOL_CATALOG: DrawingToolDefinition[] = [
  ...[
    ["Cross", "point"], ["Dot", "point"], ["Arrow", "point"], ["Demonstration", "point"], ["Magic", "point"], ["Eraser", "point"],
  ].map(([name, kind]) => ({ name, category: "Cursors", anchors: 1, kind } as DrawingToolDefinition)),
  ...[
    ["Trend line",2],["Ray",2],["Info line",2],["Extended line",2],["Trend angle",2],["Horizontal line",1],["Horizontal ray",1],["Vertical line",1],["Crossline",1],
  ].map(([name,anchors]) => ({name,category:"Trend",anchors:Number(anchors),kind:"line"} as DrawingToolDefinition)),
  ...[
    ["Parallel channel",3],["Regression trend",2],["Flat top/bottom",2],["Disjoint channel",3],["Classic pitchfork",3],["Inside pitchfork",3],["Schiff pitchfork",3],["Modified Schiff pitchfork",3],["Anchored VWAP",1],
  ].map(([name,anchors]) => ({name,category:"Channels",anchors:Number(anchors),kind:"multi"} as DrawingToolDefinition)),
  ...[
    ["Fibonacci retracement",2],["Trend-based fib extension",3],["Fib channel",3],["Fib time zone",2],["Fib speed resistance fan",2],["Trend-based fib time",3],["Fib circles",2],["Fib spiral",2],["Fib speed resistance arcs",2],["Fib wedge",3],["Pitchfan",3],["Gann box",2],["Gann square fixed",2],["Gann square",2],["Gann fan",2],
  ].map(([name,anchors]) => ({name,category:"Fibonacci & Gann",anchors:Number(anchors),kind:"multi"} as DrawingToolDefinition)),
  ...[
    ["XABCD",5],["Cypher",5],["Head and shoulders",5],["ABCD",4],["Triangle",3],["Three drives",6],["Elliott wave 12345",5],["Elliott wave ABCDE",5],["Elliott wave WXYXZ",5],["Elliott wave ABC",3],["Elliott wave WXY",3],["Elliott wave WXYXZ",5],["Cyclic lines",2],["Time cycles",2],["Sine line",3],
  ].map(([name,anchors]) => ({name,category:"Patterns",anchors:Number(anchors),kind:"multi"} as DrawingToolDefinition)),
  ...[
    ["Long position",2],["Short position",2],["Position forecast",3],["Bars pattern",2],["Ghost feed",2],["Sector",2],["Price range",2],["Date range",2],["Date and price range",2],["Fixed range volume profile",2],["Anchored volume profile",1],
  ].map(([name,anchors]) => ({name,category:"Prediction & Measurement",anchors:Number(anchors),kind:"multi"} as DrawingToolDefinition)),
  ...[
    ["Rectangle",2],["Rotated rectangle",3],["Path",2],["Circle",2],["Ellipse",2],["Polyline",2],["Triangle",3],["Arc",3],["Curve",3],["Double curve",4],["Brush",2],["Highlighter",2],["Arrow",2],["Arrow marker",1],["Arrow marks",2],
  ].map(([name,anchors]) => ({name,category:"Geometric",anchors:Number(anchors),kind:"shape"} as DrawingToolDefinition)),
  ...[
    ["Text",1],["Note",1],["Anchored note",1],["Price note",1],["Pin",1],["Table",1],["Callout",2],["Comment",1],["Price label",1],["Signpost",1],["Image",1],["Icons",1],["Flag mark",1],["Arrow mark left",1],["Arrow mark right",1],["Arrow mark up",1],["Arrow mark down",1],
  ].map(([name,anchors]) => ({name,category:"Annotation",anchors:Number(anchors),kind:"annotation"} as DrawingToolDefinition)),
];

export const DRAWING_CATEGORIES: DrawingCategory[] = [
  "Cursors","Trend","Channels","Fibonacci & Gann","Patterns","Prediction & Measurement","Geometric","Annotation",
];
