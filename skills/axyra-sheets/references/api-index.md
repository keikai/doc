# Axyra Sheets API index — 0.1.0.FL.20260930-Eval

Generated with `javap -public` from `axyra-sheets-0.1.0.FL.20260930-Eval.jar` (every public
type except `internal`). One member per line: `Type.method(params) → return`. The
`io.keikai.axyra.sheets.` and `java.*` package prefixes are dropped, nested types are
written `Outer.Inner`, and each type line (`Type :: kind in package`) gives the import.
Signatures only: behavior is in SKILL.md and the pitfalls files.

**Do not read this file whole — grep it**, for example:
`grep -E '^Sheet\.(set|cell)' api-index.md`, `grep -i '^pdfoptions' api-index.md`,
`grep ' :: ' api-index.md` (all types with their packages). If the project resolves
another version, confirm with `javap` on that JAR.

AggregateFunction :: class in io.keikai.axyra.sheets (extends Enum<AggregateFunction>)
AggregateFunction.SUM (field AggregateFunction)
AggregateFunction.COUNT (field AggregateFunction)
AggregateFunction.AVERAGE (field AggregateFunction)
AggregateFunction.MAX (field AggregateFunction)
AggregateFunction.MIN (field AggregateFunction)
AggregateFunction.PRODUCT (field AggregateFunction)
AggregateFunction.COUNT_NUMS (field AggregateFunction)
AggregateFunction.STD_DEV (field AggregateFunction)
AggregateFunction.STD_DEVP (field AggregateFunction)
AggregateFunction.VAR (field AggregateFunction)
AggregateFunction.VARP (field AggregateFunction)
AggregateFunction.values() → static AggregateFunction[]
AggregateFunction.valueOf(String) → static AggregateFunction
AggregateFunction.ooxml() → String
AggregateFunction.fromOoxml(String) → static AggregateFunction
AxyraException :: class in io.keikai.axyra.sheets (extends RuntimeException)
new AxyraException(String)
new AxyraException(String, Throwable)
AxyraFormulaException :: class in io.keikai.axyra.sheets (extends AxyraException)
new AxyraFormulaException(String)
new AxyraFormulaException(String, Throwable)
AxyraIoException :: class in io.keikai.axyra.sheets (extends AxyraException)
new AxyraIoException(String)
new AxyraIoException(String, Throwable)
BorderEdge :: class in io.keikai.axyra.sheets.style (extends Record)
new BorderEdge(BorderStyle, Color)
BorderEdge.isPresent() → boolean
BorderEdge.style() → BorderStyle
BorderEdge.color() → Color
BorderStyle :: class in io.keikai.axyra.sheets.style (extends Enum<BorderStyle>)
BorderStyle.NONE (field BorderStyle)
BorderStyle.THIN (field BorderStyle)
BorderStyle.MEDIUM (field BorderStyle)
BorderStyle.DASHED (field BorderStyle)
BorderStyle.DOTTED (field BorderStyle)
BorderStyle.THICK (field BorderStyle)
BorderStyle.DOUBLE (field BorderStyle)
BorderStyle.HAIR (field BorderStyle)
BorderStyle.MEDIUM_DASHED (field BorderStyle)
BorderStyle.DASH_DOT (field BorderStyle)
BorderStyle.MEDIUM_DASH_DOT (field BorderStyle)
BorderStyle.DASH_DOT_DOT (field BorderStyle)
BorderStyle.MEDIUM_DASH_DOT_DOT (field BorderStyle)
BorderStyle.SLANT_DASH_DOT (field BorderStyle)
BorderStyle.values() → static BorderStyle[]
BorderStyle.valueOf(String) → static BorderStyle
BorderStyle.token() → String
BorderStyle.from(String) → static BorderStyle
CalcMode :: class in io.keikai.axyra.sheets.calc (extends Enum<CalcMode>)
CalcMode.AUTOMATIC (field CalcMode)
CalcMode.MANUAL (field CalcMode)
CalcMode.AUTOMATIC_EXCEPT_TABLES (field CalcMode)
CalcMode.values() → static CalcMode[]
CalcMode.valueOf(String) → static CalcMode
CalcMode.code() → int
CalcMode.fromCode(int) → static CalcMode
Cell :: class in io.keikai.axyra.sheets
Cell.row() → int
Cell.col() → int
Cell.value() → CellValue
Cell.formattedText() → String
Cell.setValue(CellValue) → void
Cell.setDate(LocalDate) → void
Cell.setDateTime(LocalDateTime) → void
Cell.dateValue() → LocalDate
Cell.dateTimeValue() → LocalDateTime
Cell.formula() → String
Cell.setFormula(String) → void
Cell.setFormulaLocalized(String, String) → void
Cell.formulaLocalized(String) → String
Cell.clear() → void
Cell.setRichText(RichText) → void
Cell.richText() → RichText
Cell.richRunCount() → int
Cell.style() → CellStyle
Cell.setStyle(CellStyle) → void
Cell.comment() → Comment
Cell.setComment(String, String) → void
Cell.setCommentLayout(double, double, boolean) → boolean
Cell.setComment(Comment) → void
Cell.setRichComment(String, CommentRun...) → void
Cell.commentRuns() → List<CommentRun>
Cell.removeComment() → void
Cell.threadedComments() → List<ThreadedComment>
Cell.addThreadedComment(String, String) → String
Cell.addThreadedReply(String, String, String) → String
Cell.setThreadedCommentResolved(String, boolean) → boolean
Cell.removeThreadedComment(String) → boolean
Cell.hyperlink() → Hyperlink
Cell.setHyperlink(String) → void
Cell.setHyperlink(Hyperlink) → void
Cell.removeHyperlink() → void
CellRef :: class in io.keikai.axyra.sheets (extends Record)
new CellRef(int, int, int)
CellRef.a1() → String
CellRef.sheetIndex() → int
CellRef.row() → int
CellRef.column() → int
CellStyle :: class in io.keikai.axyra.sheets.style
CellStyle.builder() → static CellStyle.Builder
CellStyle.toBuilder() → CellStyle.Builder
CellStyle.toJson() → String
CellStyle.fromJson(String) → static CellStyle
CellStyle.fontName() → String
CellStyle.fontSize() → double
CellStyle.bold() → boolean
CellStyle.italic() → boolean
CellStyle.strikethrough() → boolean
CellStyle.underline() → Underline
CellStyle.fontColor() → Color
CellStyle.fillColor() → Color
CellStyle.fillBackgroundColor() → Color
CellStyle.fillPattern() → PatternType
CellStyle.fontVertical() → FontVertical
CellStyle.fontCharset() → int
CellStyle.fontFamily() → int
CellStyle.fontScheme() → String
CellStyle.horizontalAlign() → HAlign
CellStyle.verticalAlign() → VAlign
CellStyle.shrinkToFit() → boolean
CellStyle.quotePrefix() → boolean
CellStyle.wrapText() → boolean
CellStyle.textRotation() → int
CellStyle.indent() → int
CellStyle.numberFormat() → String
CellStyle.hasGradientFill() → boolean
CellStyle.gradientType() → String
CellStyle.gradientDegree() → int
CellStyle.gradientStops() → List<GradientStop>
CellStyle.border(Side) → BorderEdge
CellStyle.borderTop() → BorderEdge
CellStyle.borderBottom() → BorderEdge
CellStyle.borderLeft() → BorderEdge
CellStyle.borderRight() → BorderEdge
CellStyle.borderDiagonal() → BorderEdge
CellStyle.diagonalDown() → boolean
CellStyle.diagonalUp() → boolean
CellStyle.locked() → boolean
CellStyle.hidden() → boolean
CellStyle.Builder :: class in io.keikai.axyra.sheets.style
CellStyle.Builder.fontName(String) → CellStyle.Builder
CellStyle.Builder.fontSize(double) → CellStyle.Builder
CellStyle.Builder.bold(boolean) → CellStyle.Builder
CellStyle.Builder.bold() → CellStyle.Builder
CellStyle.Builder.italic(boolean) → CellStyle.Builder
CellStyle.Builder.italic() → CellStyle.Builder
CellStyle.Builder.strikethrough(boolean) → CellStyle.Builder
CellStyle.Builder.underline(Underline) → CellStyle.Builder
CellStyle.Builder.fontColor(Color) → CellStyle.Builder
CellStyle.Builder.fontVertical(FontVertical) → CellStyle.Builder
CellStyle.Builder.superscript() → CellStyle.Builder
CellStyle.Builder.subscript() → CellStyle.Builder
CellStyle.Builder.fontCharset(int) → CellStyle.Builder
CellStyle.Builder.fontFamily(int) → CellStyle.Builder
CellStyle.Builder.fontScheme(String) → CellStyle.Builder
CellStyle.Builder.fill(Color) → CellStyle.Builder
CellStyle.Builder.fillPattern(PatternType, Color, Color) → CellStyle.Builder
CellStyle.Builder.gradientFill(int, Color...) → CellStyle.Builder
CellStyle.Builder.pathGradientFill(Color...) → CellStyle.Builder
CellStyle.Builder.border(Side, BorderStyle, Color) → CellStyle.Builder
CellStyle.Builder.diagonalDown(boolean) → CellStyle.Builder
CellStyle.Builder.diagonalUp(boolean) → CellStyle.Builder
CellStyle.Builder.allBorders(BorderStyle, Color) → CellStyle.Builder
CellStyle.Builder.horizontalAlign(HAlign) → CellStyle.Builder
CellStyle.Builder.verticalAlign(VAlign) → CellStyle.Builder
CellStyle.Builder.shrinkToFit(boolean) → CellStyle.Builder
CellStyle.Builder.wrapText(boolean) → CellStyle.Builder
CellStyle.Builder.textRotation(int) → CellStyle.Builder
CellStyle.Builder.indent(int) → CellStyle.Builder
CellStyle.Builder.numberFormat(String) → CellStyle.Builder
CellStyle.Builder.locked(boolean) → CellStyle.Builder
CellStyle.Builder.hidden(boolean) → CellStyle.Builder
CellStyle.Builder.build() → CellStyle
CellValue :: interface in io.keikai.axyra.sheets
CellValue.BLANK (field CellValue.Blank)
CellValue.TRUE (field CellValue.Bool)
CellValue.FALSE (field CellValue.Bool)
CellValue.number(double) → static CellValue
CellValue.text(String) → static CellValue
CellValue.bool(boolean) → static CellValue
CellValue.error(int) → static CellValue
CellValue.blank() → static CellValue
CellValue.array(CellValue[][]) → static CellValue
CellValue.errorString(int) → static String
CellValue.Array :: class in io.keikai.axyra.sheets (extends Record implements CellValue)
new CellValue.Array(CellValue[][])
CellValue.Array.rowCount() → int
CellValue.Array.colCount() → int
CellValue.Array.get(int, int) → CellValue
CellValue.Array.rows() → CellValue[][]
CellValue.Blank :: class in io.keikai.axyra.sheets (extends Record implements CellValue)
new CellValue.Blank()
CellValue.Bool :: class in io.keikai.axyra.sheets (extends Record implements CellValue)
new CellValue.Bool(boolean)
CellValue.Bool.value() → boolean
CellValue.Error :: class in io.keikai.axyra.sheets (extends Record implements CellValue)
new CellValue.Error(int)
CellValue.Error.display() → String
CellValue.Error.code() → int
CellValue.Number :: class in io.keikai.axyra.sheets (extends Record implements CellValue)
new CellValue.Number(double)
CellValue.Number.value() → double
CellValue.Text :: class in io.keikai.axyra.sheets (extends Record implements CellValue)
new CellValue.Text(String)
CellValue.Text.value() → String
Chart :: class in io.keikai.axyra.sheets.content
Chart.column() → static Chart.Builder
Chart.bar() → static Chart.Builder
Chart.line() → static Chart.Builder
Chart.pie() → static Chart.Builder
Chart.area() → static Chart.Builder
Chart.scatter() → static Chart.Builder
Chart.doughnut() → static Chart.Builder
Chart.radar() → static Chart.Builder
Chart.bubble() → static Chart.Builder
Chart.combo() → static Chart.Builder
Chart.surface() → static Chart.Builder
Chart.stock() → static Chart.Builder
Chart.waterfall() → static Chart.Builder
Chart.histogram() → static Chart.Builder
Chart.funnel() → static Chart.Builder
Chart.treemap() → static Chart.Builder
Chart.sunburst() → static Chart.Builder
Chart.boxWhisker() → static Chart.Builder
Chart.pareto() → static Chart.Builder
Chart.map() → static Chart.Builder
Chart.of(String) → static Chart.Builder
Chart.toBuilder() → Chart.Builder
Chart.toJson() → String
Chart.fromJson(String) → static Chart
Chart.type() → String
Chart.title() → String
Chart.titleAuto() → boolean
Chart.titleFormula() → String
Chart.style() → int
Chart.barShape() → String
Chart.seriesBubbleSizes(int) → String
Chart.seriesCount() → int
Chart.legendPosition() → LegendPosition
Chart.showDataLabels() → boolean
Chart.is3d() → boolean
Chart.categoryAxisTitle() → String
Chart.valueAxisTitle() → String
Chart.pivotSource() → String
Chart.Builder :: class in io.keikai.axyra.sheets.content
Chart.Builder.title(String) → Chart.Builder
Chart.Builder.autoTitle(boolean) → Chart.Builder
Chart.Builder.legend(LegendPosition) → Chart.Builder
Chart.Builder.legendVisible(boolean) → Chart.Builder
Chart.Builder.categoryAxisVisible(boolean) → Chart.Builder
Chart.Builder.valueAxisVisible(boolean) → Chart.Builder
Chart.Builder.showDataLabels(boolean) → Chart.Builder
Chart.Builder.type(String) → Chart.Builder
Chart.Builder.threeD(boolean) → Chart.Builder
Chart.Builder.barShape(String) → Chart.Builder
Chart.Builder.style(int) → Chart.Builder
Chart.Builder.titleFormula(String) → Chart.Builder
Chart.Builder.grouping(String) → Chart.Builder
Chart.Builder.gapWidth(int) → Chart.Builder
Chart.Builder.overlap(int) → Chart.Builder
Chart.Builder.holeSize(int) → Chart.Builder
Chart.Builder.anchor(int, int, int, int) → Chart.Builder
Chart.Builder.anchorOffsets(int, int, int, int) → Chart.Builder
Chart.Builder.chartAreaFill(Color) → Chart.Builder
Chart.Builder.chartAreaBorder(Color) → Chart.Builder
Chart.Builder.chartAreaNoBorder() → Chart.Builder
Chart.Builder.chartAreaNoFill() → Chart.Builder
Chart.Builder.plotAreaFill(Color) → Chart.Builder
Chart.Builder.plotAreaBorder(Color) → Chart.Builder
Chart.Builder.plotAreaNoBorder() → Chart.Builder
Chart.Builder.plotAreaNoFill() → Chart.Builder
Chart.Builder.series(String, String) → Chart.Builder
Chart.Builder.series(String, String, String) → Chart.Builder
Chart.Builder.clearSeries() → Chart.Builder
Chart.Builder.bubbleSeries(String, String, String, String) → Chart.Builder
Chart.Builder.bubbleSizes(String) → Chart.Builder
Chart.Builder.series(String, String, String, Color) → Chart.Builder
Chart.Builder.pointFill(int, Color) → Chart.Builder
Chart.Builder.pointExplosion(int, int) → Chart.Builder
Chart.Builder.pointLabel(int, String) → Chart.Builder
Chart.Builder.pointLabelHidden(int, boolean) → Chart.Builder
Chart.Builder.view3D(int, int, int) → Chart.Builder
Chart.Builder.plotAreaLayout(double, double, double, double) → Chart.Builder
Chart.Builder.legendLayout(double, double, double, double) → Chart.Builder
Chart.Builder.titleLayout(double, double, double, double) → Chart.Builder
Chart.Builder.trendline(Trendline) → Chart.Builder
Chart.Builder.errorBars(ErrorBars) → Chart.Builder
Chart.Builder.dataLabels(DataLabels) → Chart.Builder
Chart.Builder.extendedApparatus(String, String, String) → Chart.Builder
Chart.Builder.categoryAxisTitle(String) → Chart.Builder
Chart.Builder.valueAxisTitle(String) → Chart.Builder
Chart.Builder.valueAxisScale(double, double) → Chart.Builder
Chart.Builder.build() → Chart
ChartView :: class in io.keikai.axyra.sheets
ChartView.reload() → void
ChartView.index() → int
ChartView.type() → String
ChartView.title() → String
ChartView.legendPosition() → LegendPosition
ChartView.showDataLabels() → boolean
ChartView.is3d() → boolean
ChartView.barShape() → String
ChartView.style() → int
ChartView.titleFormula() → String
ChartView.grouping() → String
ChartView.gapWidth() → int
ChartView.overlap() → int
ChartView.holeSize() → int
ChartView.categoryAxisTitle() → String
ChartView.valueAxisTitle() → String
ChartView.valueAxisMin() → Double
ChartView.valueAxisMax() → Double
ChartView.anchor() → int[]
ChartView.anchorOffsets() → int[]
ChartView.chartAreaFill() → Color
ChartView.chartAreaLineColor() → Color
ChartView.chartAreaNoLine() → boolean
ChartView.chartAreaNoFill() → boolean
ChartView.plotAreaFill() → Color
ChartView.plotAreaLineColor() → Color
ChartView.plotAreaNoLine() → boolean
ChartView.plotAreaNoFill() → boolean
ChartView.seriesCount() → int
ChartView.seriesName(int) → String
ChartView.seriesValues(int) → String
ChartView.seriesCategories(int) → String
ChartView.seriesBubbleSizes(int) → String
ChartView.seriesType(int) → String
ChartView.seriesFill(int) → Color
ChartView.seriesPointFills(int) → Map<Integer,Color>
ChartView.seriesPointLabels(int) → Map<Integer,String>
ChartView.seriesHiddenPointLabels(int) → Set<Integer>
ChartView.seriesValueCache(int) → double[]
ChartView.seriesInSecondPlot(int) → boolean[]
ChartView.isOfPie() → boolean
ChartView.ofPieSecondPlotIsBar() → boolean
ChartView.ofPieSplitType() → String
ChartView.ofPieSplitPosition() → Double
ChartView.ofPieCustomSplit() → int[]
ChartView.ofPieSecondPlotSize() → Integer
ChartView.view3D() → int[]
ChartView.plotAreaLayout() → double[]
ChartView.legendLayout() → double[]
ChartView.titleLayout() → double[]
ChartView.seriesPointExplosions(int) → Map<Integer,Integer>
ChartView.titleAuto() → boolean
ChartView.legendVisible() → boolean
ChartView.categoryAxisVisible() → boolean
ChartView.valueAxisVisible() → boolean
ChartView.trendlines(int) → List<Trendline>
ChartView.seriesDataLabels(int) → DataLabels
ChartView.errorBars(int) → ErrorBars
ChartView.isExtendedChart() → boolean
ChartView.extendedChartExData() → String
ChartView.extendedColorsData() → String
ChartView.extendedStyleData() → String
ChartView.setTitle(String) → ChartView
ChartView.setLegend(LegendPosition) → ChartView
ChartView.setLegendVisible(boolean) → ChartView
ChartView.setCategoryAxisVisible(boolean) → ChartView
ChartView.setValueAxisVisible(boolean) → ChartView
ChartView.setAutoTitle(boolean) → ChartView
ChartView.setSeriesFill(int, Color) → ChartView
ChartView.setShowDataLabels(boolean) → ChartView
ChartView.setThreeD(boolean) → ChartView
ChartView.setGapWidth(int) → ChartView
ChartView.setOverlap(int) → ChartView
ChartView.setHoleSize(int) → ChartView
ChartView.setCategoryAxisTitle(String) → ChartView
ChartView.setValueAxisTitle(String) → ChartView
ChartView.setValueAxisScale(double, double) → ChartView
ChartView.setAnchor(int, int, int, int) → ChartView
ChartView.setSeries(int, String, String, String) → ChartView
ChartView.addTrendline(int, Trendline) → ChartView
ChartView.clearTrendlines(int) → ChartView
ChartView.setErrorBars(int, ErrorBars) → ChartView
ChartView.setSeriesDataLabels(int, DataLabels) → ChartView
Color :: class in io.keikai.axyra.sheets.style
Color.BLACK (field Color)
Color.WHITE (field Color)
Color.RED (field Color)
Color.GREEN (field Color)
Color.BLUE (field Color)
Color.YELLOW (field Color)
Color.GRAY (field Color)
Color.rgb(int, int, int) → static Color
Color.argb(int, int, int, int) → static Color
Color.of(int) → static Color
Color.indexed(int) → static Color
Color.theme(int) → static Color
Color.theme(int, double) → static Color
Color.auto() → static Color
Color.parse(String) → static Color
Color.fromJson(Object) → static Color
Color.toJsonValue() → Object
Color.isRgb() → boolean
Color.isIndexed() → boolean
Color.isTheme() → boolean
Color.isAuto() → boolean
Color.indexedValue() → int
Color.themeIndex() → int
Color.tint() → double
Color.argb() → int
Color.alpha() → int
Color.red() → int
Color.green() → int
Color.blue() → int
Color.toHex() → String
Comment :: class in io.keikai.axyra.sheets.content (extends Record)
new Comment(String, String)
Comment.author() → String
Comment.text() → String
CommentRun :: class in io.keikai.axyra.sheets.content (extends Record)
new CommentRun(String, String, Double, boolean, boolean, boolean, boolean, String)
CommentRun.of(String) → static CommentRun
CommentRun.withBold() → CommentRun
CommentRun.withItalic() → CommentRun
CommentRun.withUnderline() → CommentRun
CommentRun.withStrikethrough() → CommentRun
CommentRun.withColor(String) → CommentRun
CommentRun.withFont(String, Double) → CommentRun
CommentRun.text() → String
CommentRun.fontName() → String
CommentRun.fontSize() → Double
CommentRun.bold() → boolean
CommentRun.italic() → boolean
CommentRun.underline() → boolean
CommentRun.strikethrough() → boolean
CommentRun.color() → String
ConditionalFormat :: class in io.keikai.axyra.sheets.content
ConditionalFormat.builder() → static ConditionalFormat.Builder
ConditionalFormat.toBuilder() → ConditionalFormat.Builder
ConditionalFormat.toJson() → String
ConditionalFormat.fromJson(String) → static ConditionalFormat
ConditionalFormat.type() → String
ConditionalFormat.operator() → String
ConditionalFormat.formula1() → String
ConditionalFormat.formula2() → String
ConditionalFormat.text() → String
ConditionalFormat.timePeriod() → TimePeriod
ConditionalFormat.priority() → int
ConditionalFormat.stopIfTrue() → boolean
ConditionalFormat.valueObjects() → List<ConditionalFormat.ValueObject>
ConditionalFormat.showValue() → boolean
ConditionalFormat.reverse() → boolean
ConditionalFormat.colorScaleColors() → List<String>
ConditionalFormat.dataBarColor() → String
ConditionalFormat.iconSetName() → String
ConditionalFormat.gradient() → Boolean
ConditionalFormat.axisPosition() → String
ConditionalFormat.barDirection() → String
ConditionalFormat.barBorderColor() → String
ConditionalFormat.negativeFillColor() → String
ConditionalFormat.negativeBorderColor() → String
ConditionalFormat.axisColor() → String
ConditionalFormat.firstRow() → int
ConditionalFormat.firstColumn() → int
ConditionalFormat.lastRow() → int
ConditionalFormat.lastColumn() → int
ConditionalFormat.Builder :: class in io.keikai.axyra.sheets.content
new ConditionalFormat.Builder()
ConditionalFormat.Builder.cellIs(String, String) → ConditionalFormat.Builder
ConditionalFormat.Builder.between(String, String) → ConditionalFormat.Builder
ConditionalFormat.Builder.containsText(String) → ConditionalFormat.Builder
ConditionalFormat.Builder.beginsWith(String) → ConditionalFormat.Builder
ConditionalFormat.Builder.endsWith(String) → ConditionalFormat.Builder
ConditionalFormat.Builder.top10(int, boolean, boolean) → ConditionalFormat.Builder
ConditionalFormat.Builder.aboveAverage(boolean, boolean) → ConditionalFormat.Builder
ConditionalFormat.Builder.aboveAverage(boolean, boolean, int) → ConditionalFormat.Builder
ConditionalFormat.Builder.expression(String) → ConditionalFormat.Builder
ConditionalFormat.Builder.duplicateValues() → ConditionalFormat.Builder
ConditionalFormat.Builder.uniqueValues() → ConditionalFormat.Builder
ConditionalFormat.Builder.containsBlanks() → ConditionalFormat.Builder
ConditionalFormat.Builder.notContainsBlanks() → ConditionalFormat.Builder
ConditionalFormat.Builder.containsErrors() → ConditionalFormat.Builder
ConditionalFormat.Builder.notContainsErrors() → ConditionalFormat.Builder
ConditionalFormat.Builder.notContainsText(String) → ConditionalFormat.Builder
ConditionalFormat.Builder.dateOccurring(TimePeriod) → ConditionalFormat.Builder
ConditionalFormat.Builder.colorScale(Color...) → ConditionalFormat.Builder
ConditionalFormat.Builder.dataBar(Color) → ConditionalFormat.Builder
ConditionalFormat.Builder.iconSet(String) → ConditionalFormat.Builder
ConditionalFormat.Builder.priority(int) → ConditionalFormat.Builder
ConditionalFormat.Builder.stopIfTrue() → ConditionalFormat.Builder
ConditionalFormat.Builder.valueObject(ConditionalFormat.ValueObject) → ConditionalFormat.Builder
ConditionalFormat.Builder.valueObject(String) → ConditionalFormat.Builder
ConditionalFormat.Builder.valueObject(String, String) → ConditionalFormat.Builder
ConditionalFormat.Builder.showValue(boolean) → ConditionalFormat.Builder
ConditionalFormat.Builder.reverse(boolean) → ConditionalFormat.Builder
ConditionalFormat.Builder.gradient(boolean) → ConditionalFormat.Builder
ConditionalFormat.Builder.barBorderColor(Color) → ConditionalFormat.Builder
ConditionalFormat.Builder.negativeFillColor(Color) → ConditionalFormat.Builder
ConditionalFormat.Builder.negativeBorderColor(Color) → ConditionalFormat.Builder
ConditionalFormat.Builder.axisColor(Color) → ConditionalFormat.Builder
ConditionalFormat.Builder.axisPosition(String) → ConditionalFormat.Builder
ConditionalFormat.Builder.barDirection(String) → ConditionalFormat.Builder
ConditionalFormat.Builder.fillColor(Color) → ConditionalFormat.Builder
ConditionalFormat.Builder.fontColor(Color) → ConditionalFormat.Builder
ConditionalFormat.Builder.bold() → ConditionalFormat.Builder
ConditionalFormat.Builder.italic() → ConditionalFormat.Builder
ConditionalFormat.Builder.strikethrough() → ConditionalFormat.Builder
ConditionalFormat.Builder.underline() → ConditionalFormat.Builder
ConditionalFormat.Builder.numberFormat(String) → ConditionalFormat.Builder
ConditionalFormat.Builder.border(BorderStyle, Color) → ConditionalFormat.Builder
ConditionalFormat.Builder.borderSide(String, BorderStyle, Color) → ConditionalFormat.Builder
ConditionalFormat.Builder.build() → ConditionalFormat
ConditionalFormat.ValueObject :: class in io.keikai.axyra.sheets.content (extends Record)
new ConditionalFormat.ValueObject(String, String, boolean)
ConditionalFormat.ValueObject.of(String) → static ConditionalFormat.ValueObject
ConditionalFormat.ValueObject.of(String, String) → static ConditionalFormat.ValueObject
ConditionalFormat.ValueObject.type() → String
ConditionalFormat.ValueObject.value() → String
ConditionalFormat.ValueObject.gte() → boolean
ConsolidateFunction :: class in io.keikai.axyra.sheets (extends Enum<ConsolidateFunction>)
ConsolidateFunction.AVERAGE (field ConsolidateFunction)
ConsolidateFunction.COUNT (field ConsolidateFunction)
ConsolidateFunction.COUNT_A (field ConsolidateFunction)
ConsolidateFunction.MAX (field ConsolidateFunction)
ConsolidateFunction.MIN (field ConsolidateFunction)
ConsolidateFunction.PRODUCT (field ConsolidateFunction)
ConsolidateFunction.STDEV (field ConsolidateFunction)
ConsolidateFunction.STDEV_P (field ConsolidateFunction)
ConsolidateFunction.SUM (field ConsolidateFunction)
ConsolidateFunction.VAR (field ConsolidateFunction)
ConsolidateFunction.VAR_P (field ConsolidateFunction)
ConsolidateFunction.values() → static ConsolidateFunction[]
ConsolidateFunction.valueOf(String) → static ConsolidateFunction
CustomProperty :: class in io.keikai.axyra.sheets (extends Record)
new CustomProperty(String, CustomProperty.Value)
CustomProperty.name() → String
CustomProperty.value() → CustomProperty.Value
CustomProperty.Bool :: class in io.keikai.axyra.sheets (extends Record implements CustomProperty.Value)
new CustomProperty.Bool(boolean)
CustomProperty.Bool.value() → boolean
CustomProperty.Date :: class in io.keikai.axyra.sheets (extends Record implements CustomProperty.Value)
new CustomProperty.Date(LocalDate)
CustomProperty.Date.value() → LocalDate
CustomProperty.Number :: class in io.keikai.axyra.sheets (extends Record implements CustomProperty.Value)
new CustomProperty.Number(double)
CustomProperty.Number.value() → double
CustomProperty.Raw :: class in io.keikai.axyra.sheets (extends Record implements CustomProperty.Value)
new CustomProperty.Raw(String, String)
CustomProperty.Raw.vtType() → String
CustomProperty.Raw.value() → String
CustomProperty.Text :: class in io.keikai.axyra.sheets (extends Record implements CustomProperty.Value)
new CustomProperty.Text(String)
CustomProperty.Text.value() → String
CustomProperty.Value :: interface in io.keikai.axyra.sheets
DataConnection :: class in io.keikai.axyra.sheets.content (extends Record)
new DataConnection(int, String, String, String, String)
DataConnection.fromMap(Map<String,Object>) → static DataConnection
DataConnection.id() → int
DataConnection.name() → String
DataConnection.kind() → String
DataConnection.command() → String
DataConnection.connectionString() → String
DataLabels :: class in io.keikai.axyra.sheets.content (extends Record)
new DataLabels(boolean, boolean, boolean, boolean, boolean, String, String)
new DataLabels(boolean, boolean, boolean, boolean, boolean, String, String, Integer, Color, Boolean, Double)
DataLabels.value() → static DataLabels
DataLabels.categoryName() → static DataLabels
DataLabels.seriesName() → static DataLabels
DataLabels.percent() → static DataLabels
DataLabels.isVisible() → boolean
DataLabels.hasTextStyle() → boolean
DataLabels.withShowValue(boolean) → DataLabels
DataLabels.withShowCategoryName(boolean) → DataLabels
DataLabels.withShowSeriesName(boolean) → DataLabels
DataLabels.withShowPercent(boolean) → DataLabels
DataLabels.withShowLegendKey(boolean) → DataLabels
DataLabels.withPosition(String) → DataLabels
DataLabels.withNumberFormat(String) → DataLabels
DataLabels.withRotation(Integer) → DataLabels
DataLabels.withTextColor(Color) → DataLabels
DataLabels.withBold(Boolean) → DataLabels
DataLabels.withFontSize(Double) → DataLabels
DataLabels.showValue() → boolean
DataLabels.showCategoryName() → boolean
DataLabels.showSeriesName() → boolean
DataLabels.showPercent() → boolean
DataLabels.showLegendKey() → boolean
DataLabels.position() → String
DataLabels.numberFormat() → String
DataLabels.rotation() → Integer
DataLabels.textColor() → Color
DataLabels.bold() → Boolean
DataLabels.fontSize() → Double
DateGroupItem :: class in io.keikai.axyra.sheets (extends Record)
new DateGroupItem(String, int, Integer, Integer, Integer, Integer, Integer)
DateGroupItem.year(int) → static DateGroupItem
DateGroupItem.month(int, int) → static DateGroupItem
DateGroupItem.day(int, int, int) → static DateGroupItem
DateGroupItem.hour(int, int, int, int) → static DateGroupItem
DateGroupItem.minute(int, int, int, int, int) → static DateGroupItem
DateGroupItem.second(int, int, int, int, int, int) → static DateGroupItem
DateGroupItem.grouping() → String
DateGroupItem.year() → int
DateGroupItem.month() → Integer
DateGroupItem.day() → Integer
DateGroupItem.hour() → Integer
DateGroupItem.minute() → Integer
DateGroupItem.second() → Integer
DynamicFilterType :: class in io.keikai.axyra.sheets (extends Enum<DynamicFilterType>)
DynamicFilterType.TODAY (field DynamicFilterType)
DynamicFilterType.YESTERDAY (field DynamicFilterType)
DynamicFilterType.TOMORROW (field DynamicFilterType)
DynamicFilterType.THIS_WEEK (field DynamicFilterType)
DynamicFilterType.LAST_WEEK (field DynamicFilterType)
DynamicFilterType.NEXT_WEEK (field DynamicFilterType)
DynamicFilterType.THIS_MONTH (field DynamicFilterType)
DynamicFilterType.LAST_MONTH (field DynamicFilterType)
DynamicFilterType.NEXT_MONTH (field DynamicFilterType)
DynamicFilterType.THIS_QUARTER (field DynamicFilterType)
DynamicFilterType.LAST_QUARTER (field DynamicFilterType)
DynamicFilterType.NEXT_QUARTER (field DynamicFilterType)
DynamicFilterType.THIS_YEAR (field DynamicFilterType)
DynamicFilterType.LAST_YEAR (field DynamicFilterType)
DynamicFilterType.NEXT_YEAR (field DynamicFilterType)
DynamicFilterType.YEAR_TO_DATE (field DynamicFilterType)
DynamicFilterType.ABOVE_AVERAGE (field DynamicFilterType)
DynamicFilterType.BELOW_AVERAGE (field DynamicFilterType)
DynamicFilterType.values() → static DynamicFilterType[]
DynamicFilterType.valueOf(String) → static DynamicFilterType
DynamicFilterType.code() → String
ErrorBars :: class in io.keikai.axyra.sheets.content (extends Record)
new ErrorBars(String, String, String, Double, boolean)
ErrorBars.fixed(double) → static ErrorBars
ErrorBars.percentage(double) → static ErrorBars
ErrorBars.direction() → String
ErrorBars.barType() → String
ErrorBars.valueType() → String
ErrorBars.value() → Double
ErrorBars.endCap() → boolean
ExternalLink :: class in io.keikai.axyra.sheets.content (extends Record)
new ExternalLink(int, String, List<String>, int, List<Integer>)
ExternalLink.fromMap(Map<String,Object>) → static ExternalLink
ExternalLink.index() → int
ExternalLink.name() → String
ExternalLink.sheetNames() → List<String>
ExternalLink.cachedValueCount() → int
ExternalLink.refreshErrorSheets() → List<Integer>
FilterOperator :: class in io.keikai.axyra.sheets (extends Enum<FilterOperator>)
FilterOperator.EQUAL (field FilterOperator)
FilterOperator.NOT_EQUAL (field FilterOperator)
FilterOperator.GREATER_THAN (field FilterOperator)
FilterOperator.GREATER_THAN_OR_EQUAL (field FilterOperator)
FilterOperator.LESS_THAN (field FilterOperator)
FilterOperator.LESS_THAN_OR_EQUAL (field FilterOperator)
FilterOperator.values() → static FilterOperator[]
FilterOperator.valueOf(String) → static FilterOperator
FilterOperator.code() → int
FindFormat :: class in io.keikai.axyra.sheets (extends Record)
new FindFormat(Color, Color, Boolean, Boolean, String)
FindFormat.of() → static FindFormat
FindFormat.withFillColor(Color) → FindFormat
FindFormat.withFontColor(Color) → FindFormat
FindFormat.withBold(boolean) → FindFormat
FindFormat.withItalic(boolean) → FindFormat
FindFormat.withNumberFormat(String) → FindFormat
FindFormat.isEmpty() → boolean
FindFormat.fillColor() → Color
FindFormat.fontColor() → Color
FindFormat.bold() → Boolean
FindFormat.italic() → Boolean
FindFormat.numberFormat() → String
FontVertical :: class in io.keikai.axyra.sheets.style (extends Enum<FontVertical>)
FontVertical.BASELINE (field FontVertical)
FontVertical.SUPERSCRIPT (field FontVertical)
FontVertical.SUBSCRIPT (field FontVertical)
FontVertical.values() → static FontVertical[]
FontVertical.valueOf(String) → static FontVertical
FontVertical.token() → String
FontVertical.from(String) → static FontVertical
FormControl :: class in io.keikai.axyra.sheets.content
FormControl.checkBox(String) → static FormControl.Builder
FormControl.optionButton(String) → static FormControl.Builder
FormControl.button(String) → static FormControl.Builder
FormControl.comboBox(String) → static FormControl.Builder
FormControl.listBox(String) → static FormControl.Builder
FormControl.scrollBar(String) → static FormControl.Builder
FormControl.spinButton(String) → static FormControl.Builder
FormControl.editBox(String) → static FormControl.Builder
FormControl.label(String) → static FormControl.Builder
FormControl.groupBox(String) → static FormControl.Builder
FormControl.of(FormControlType, String) → static FormControl.Builder
FormControl.toBuilder() → FormControl.Builder
FormControl.toJson() → String
FormControl.fromJson(String) → static FormControl
FormControl.type() → FormControlType
FormControl.name() → String
FormControl.fromRow() → int
FormControl.fromColumn() → int
FormControl.toRow() → int
FormControl.toColumn() → int
FormControl.linkedCell() → String
FormControl.listFillRange() → String
FormControl.checked() → boolean
FormControl.selectedIndex() → int
FormControl.dropLines() → int
FormControl.value() → int
FormControl.min() → int
FormControl.max() → int
FormControl.increment() → int
FormControl.page() → int
FormControl.text() → String
FormControl.threeD() → boolean
FormControl.Builder :: class in io.keikai.axyra.sheets.content
FormControl.Builder.anchor(int, int, int, int) → FormControl.Builder
FormControl.Builder.anchorOffsets(long, long, long, long) → FormControl.Builder
FormControl.Builder.linkedCell(String) → FormControl.Builder
FormControl.Builder.listFillRange(String) → FormControl.Builder
FormControl.Builder.checked(boolean) → FormControl.Builder
FormControl.Builder.selectedIndex(int) → FormControl.Builder
FormControl.Builder.dropLines(int) → FormControl.Builder
FormControl.Builder.value(int) → FormControl.Builder
FormControl.Builder.range(int, int) → FormControl.Builder
FormControl.Builder.increment(int) → FormControl.Builder
FormControl.Builder.page(int) → FormControl.Builder
FormControl.Builder.text(String) → FormControl.Builder
FormControl.Builder.threeD(boolean) → FormControl.Builder
FormControl.Builder.build() → FormControl
FormControlType :: class in io.keikai.axyra.sheets.content (extends Enum<FormControlType>)
FormControlType.CHECK_BOX (field FormControlType)
FormControlType.OPTION_BUTTON (field FormControlType)
FormControlType.BUTTON (field FormControlType)
FormControlType.COMBO_BOX (field FormControlType)
FormControlType.LIST_BOX (field FormControlType)
FormControlType.SCROLL_BAR (field FormControlType)
FormControlType.SPIN_BUTTON (field FormControlType)
FormControlType.EDIT_BOX (field FormControlType)
FormControlType.LABEL (field FormControlType)
FormControlType.GROUP_BOX (field FormControlType)
FormControlType.UNKNOWN (field FormControlType)
FormControlType.values() → static FormControlType[]
FormControlType.valueOf(String) → static FormControlType
FormControlType.code() → String
FormControlType.fromCode(String) → static FormControlType
Formats :: class in io.keikai.axyra.sheets.format
Formats.format(double, String) → static String
Formats.format(double, String, String) → static String
Formats.parse(String) → static ParsedValue
FormulaPolicy :: class in io.keikai.axyra.sheets.io (extends Enum<FormulaPolicy>)
FormulaPolicy.KEEP (field FormulaPolicy)
FormulaPolicy.BLANK (field FormulaPolicy)
FormulaPolicy.VALUES_ONLY (field FormulaPolicy)
FormulaPolicy.values() → static FormulaPolicy[]
FormulaPolicy.valueOf(String) → static FormulaPolicy
FormulaPolicy.code() → int
Functions :: class in io.keikai.axyra.sheets.formula
Functions.count() → static int
Functions.contains(String) → static boolean
Functions.list() → static String[]
GradientStop :: class in io.keikai.axyra.sheets.style (extends Record)
new GradientStop(double, Color)
GradientStop.position() → double
GradientStop.color() → Color
HAlign :: class in io.keikai.axyra.sheets.style (extends Enum<HAlign>)
HAlign.GENERAL (field HAlign)
HAlign.LEFT (field HAlign)
HAlign.CENTER (field HAlign)
HAlign.RIGHT (field HAlign)
HAlign.FILL (field HAlign)
HAlign.JUSTIFY (field HAlign)
HAlign.CENTER_CONTINUOUS (field HAlign)
HAlign.DISTRIBUTED (field HAlign)
HAlign.values() → static HAlign[]
HAlign.valueOf(String) → static HAlign
HAlign.token() → String
HAlign.from(String) → static HAlign
HtmlOptions :: class in io.keikai.axyra.sheets.io
new HtmlOptions()
HtmlOptions.create() → static HtmlOptions
HtmlOptions.singleFile(boolean) → HtmlOptions
HtmlOptions.singleFile() → boolean
Hyperlink :: class in io.keikai.axyra.sheets.content (extends Record)
new Hyperlink(String, String, String)
Hyperlink.url(String) → static Hyperlink
Hyperlink.url(String, String) → static Hyperlink
Hyperlink.internal(String, String) → static Hyperlink
Hyperlink.email(String, String, String) → static Hyperlink
Hyperlink.isInternal() → boolean
Hyperlink.isEmail() → boolean
Hyperlink.address() → String
Hyperlink.display() → String
Hyperlink.tooltip() → String
ImageOptions :: class in io.keikai.axyra.sheets.io
ImageOptions.builder() → static ImageOptions.Builder
ImageOptions.toBuilder() → ImageOptions.Builder
ImageOptions.fontDirs() → List<String>
ImageOptions.scale() → double
ImageOptions.targetWidthPx() → Integer
ImageOptions.gridLines() → Boolean
ImageOptions.page() → Integer
ImageOptions.Builder :: class in io.keikai.axyra.sheets.io
ImageOptions.Builder.scale(double) → ImageOptions.Builder
ImageOptions.Builder.targetWidthPx(int) → ImageOptions.Builder
ImageOptions.Builder.gridLines(boolean) → ImageOptions.Builder
ImageOptions.Builder.page(int) → ImageOptions.Builder
ImageOptions.Builder.fontDirs(List<String>) → ImageOptions.Builder
ImageOptions.Builder.addFontDir(String) → ImageOptions.Builder
ImageOptions.Builder.build() → ImageOptions
ImportOptions :: class in io.keikai.axyra.sheets (extends Record)
new ImportOptions(String[], boolean, String[], CellStyle)
ImportOptions.defaults() → static ImportOptions
ImportOptions.builder() → static ImportOptions.Builder
ImportOptions.toBuilder() → ImportOptions.Builder
ImportOptions.columns() → String[]
ImportOptions.headers() → boolean
ImportOptions.columnLabels() → String[]
ImportOptions.headerStyle() → CellStyle
ImportOptions.Builder :: class in io.keikai.axyra.sheets
ImportOptions.Builder.columns(String...) → ImportOptions.Builder
ImportOptions.Builder.headers(boolean) → ImportOptions.Builder
ImportOptions.Builder.columnLabels(String...) → ImportOptions.Builder
ImportOptions.Builder.headerStyle(CellStyle) → ImportOptions.Builder
ImportOptions.Builder.build() → ImportOptions
LegendPosition :: class in io.keikai.axyra.sheets.content (extends Enum<LegendPosition>)
LegendPosition.BOTTOM (field LegendPosition)
LegendPosition.TOP (field LegendPosition)
LegendPosition.LEFT (field LegendPosition)
LegendPosition.RIGHT (field LegendPosition)
LegendPosition.TOP_RIGHT (field LegendPosition)
LegendPosition.NONE (field LegendPosition)
LegendPosition.values() → static LegendPosition[]
LegendPosition.valueOf(String) → static LegendPosition
LegendPosition.token() → String
LegendPosition.from(String) → static LegendPosition
License :: class in io.keikai.axyra.sheets
License.status() → static LicenseInfo
License.isFeatureEnabled(String) → static boolean
LicenseInfo :: class in io.keikai.axyra.sheets (extends Record)
new LicenseInfo(LicenseStatus, String, String, List<String>, Long)
LicenseInfo.hasFeature(String) → boolean
LicenseInfo.isLicensed() → boolean
LicenseInfo.state() → LicenseStatus
LicenseInfo.edition() → String
LicenseInfo.licensee() → String
LicenseInfo.features() → List<String>
LicenseInfo.expiresAt() → Long
LicenseStatus :: class in io.keikai.axyra.sheets (extends Enum<LicenseStatus>)
LicenseStatus.UNLICENSED (field LicenseStatus)
LicenseStatus.EVALUATION (field LicenseStatus)
LicenseStatus.LICENSED (field LicenseStatus)
LicenseStatus.GRACE (field LicenseStatus)
LicenseStatus.values() → static LicenseStatus[]
LicenseStatus.valueOf(String) → static LicenseStatus
LicenseStatus.fromLabel(String) → static LicenseStatus
NamedRange :: class in io.keikai.axyra.sheets
new NamedRange(String, String, int)
NamedRange.name() → String
NamedRange.formula() → String
NamedRange.sheetScope() → int
NamedRange.isWorkbookScoped() → boolean
NamedRange.asRange() → Range
OleObject :: class in io.keikai.axyra.sheets.content (extends Record)
new OleObject(String, String, byte[])
OleObject.name() → String
OleObject.progId() → String
OleObject.data() → byte[]
PageMargins :: class in io.keikai.axyra.sheets (extends Record)
new PageMargins(double, double, double, double, double, double)
PageMargins.left() → double
PageMargins.right() → double
PageMargins.top() → double
PageMargins.bottom() → double
PageMargins.header() → double
PageMargins.footer() → double
ParsedValue :: class in io.keikai.axyra.sheets.format (extends Record)
new ParsedValue(ParsedValue.Kind, double, String)
ParsedValue.booleanValue() → boolean
ParsedValue.kind() → ParsedValue.Kind
ParsedValue.number() → double
ParsedValue.text() → String
ParsedValue.Kind :: class in io.keikai.axyra.sheets.format (extends Enum<ParsedValue.Kind>)
ParsedValue.Kind.NUMBER (field ParsedValue.Kind)
ParsedValue.Kind.DATE (field ParsedValue.Kind)
ParsedValue.Kind.BOOL (field ParsedValue.Kind)
ParsedValue.Kind.TEXT (field ParsedValue.Kind)
ParsedValue.Kind.FORMULA (field ParsedValue.Kind)
ParsedValue.Kind.values() → static ParsedValue.Kind[]
ParsedValue.Kind.valueOf(String) → static ParsedValue.Kind
PatternType :: class in io.keikai.axyra.sheets.style (extends Enum<PatternType>)
PatternType.NONE (field PatternType)
PatternType.SOLID (field PatternType)
PatternType.MEDIUM_GRAY (field PatternType)
PatternType.DARK_GRAY (field PatternType)
PatternType.LIGHT_GRAY (field PatternType)
PatternType.DARK_HORIZONTAL (field PatternType)
PatternType.DARK_VERTICAL (field PatternType)
PatternType.DARK_DOWN (field PatternType)
PatternType.DARK_UP (field PatternType)
PatternType.DARK_GRID (field PatternType)
PatternType.DARK_TRELLIS (field PatternType)
PatternType.LIGHT_HORIZONTAL (field PatternType)
PatternType.LIGHT_VERTICAL (field PatternType)
PatternType.LIGHT_DOWN (field PatternType)
PatternType.LIGHT_UP (field PatternType)
PatternType.LIGHT_GRID (field PatternType)
PatternType.LIGHT_TRELLIS (field PatternType)
PatternType.GRAY_125 (field PatternType)
PatternType.GRAY_0625 (field PatternType)
PatternType.values() → static PatternType[]
PatternType.valueOf(String) → static PatternType
PatternType.token() → String
PatternType.from(String) → static PatternType
PdfOptions :: class in io.keikai.axyra.sheets.io
PdfOptions.builder() → static PdfOptions.Builder
PdfOptions.toBuilder() → PdfOptions.Builder
PdfOptions.fontDirs() → List<String>
PdfOptions.title() → String
PdfOptions.author() → String
PdfOptions.pageRange() → String
PdfOptions.sheets() → int[]
PdfOptions.sheetNames() → List<String>
PdfOptions.fitTo() → PdfOptions.Fit
PdfOptions.userPassword() → String
PdfOptions.ownerPassword() → String
PdfOptions.allowPrint() → boolean
PdfOptions.allowCopy() → boolean
PdfOptions.allowModify() → boolean
PdfOptions.watermark() → String
PdfOptions.bookmarks() → boolean
PdfOptions.pdfA() → boolean
PdfOptions.Builder :: class in io.keikai.axyra.sheets.io
PdfOptions.Builder.title(String) → PdfOptions.Builder
PdfOptions.Builder.author(String) → PdfOptions.Builder
PdfOptions.Builder.pageRange(String) → PdfOptions.Builder
PdfOptions.Builder.sheets(int...) → PdfOptions.Builder
PdfOptions.Builder.sheetNames(String...) → PdfOptions.Builder
PdfOptions.Builder.fitTo(PdfOptions.Fit) → PdfOptions.Builder
PdfOptions.Builder.userPassword(String) → PdfOptions.Builder
PdfOptions.Builder.ownerPassword(String) → PdfOptions.Builder
PdfOptions.Builder.allowPrint(boolean) → PdfOptions.Builder
PdfOptions.Builder.allowCopy(boolean) → PdfOptions.Builder
PdfOptions.Builder.allowModify(boolean) → PdfOptions.Builder
PdfOptions.Builder.watermark(String) → PdfOptions.Builder
PdfOptions.Builder.bookmarks(boolean) → PdfOptions.Builder
PdfOptions.Builder.fontDirs(List<String>) → PdfOptions.Builder
PdfOptions.Builder.addFontDir(String) → PdfOptions.Builder
PdfOptions.Builder.pdfA(boolean) → PdfOptions.Builder
PdfOptions.Builder.build() → PdfOptions
PdfOptions.Fit :: class in io.keikai.axyra.sheets.io (extends Enum<PdfOptions.Fit>)
PdfOptions.Fit.WIDTH (field PdfOptions.Fit)
PdfOptions.Fit.HEIGHT (field PdfOptions.Fit)
PdfOptions.Fit.PAGE (field PdfOptions.Fit)
PdfOptions.Fit.values() → static PdfOptions.Fit[]
PdfOptions.Fit.valueOf(String) → static PdfOptions.Fit
PivotCalculatedField :: class in io.keikai.axyra.sheets (extends Record)
new PivotCalculatedField(String, String)
PivotCalculatedField.name() → String
PivotCalculatedField.formula() → String
PivotCalculatedItem :: class in io.keikai.axyra.sheets (extends Record)
new PivotCalculatedItem(String, String, String)
PivotCalculatedItem.field() → String
PivotCalculatedItem.name() → String
PivotCalculatedItem.formula() → String
PivotDateGroupBy :: class in io.keikai.axyra.sheets (extends Enum<PivotDateGroupBy>)
PivotDateGroupBy.YEARS (field PivotDateGroupBy)
PivotDateGroupBy.QUARTERS (field PivotDateGroupBy)
PivotDateGroupBy.MONTHS (field PivotDateGroupBy)
PivotDateGroupBy.DAYS (field PivotDateGroupBy)
PivotDateGroupBy.HOURS (field PivotDateGroupBy)
PivotDateGroupBy.MINUTES (field PivotDateGroupBy)
PivotDateGroupBy.SECONDS (field PivotDateGroupBy)
PivotDateGroupBy.values() → static PivotDateGroupBy[]
PivotDateGroupBy.valueOf(String) → static PivotDateGroupBy
PivotDateGroupBy.wire() → String
PivotField :: class in io.keikai.axyra.sheets (extends Record)
new PivotField(String, int, AggregateFunction, String, String, boolean)
PivotField.name() → String
PivotField.sourceIndex() → int
PivotField.aggregation() → AggregateFunction
PivotField.customName() → String
PivotField.displayName() → String
PivotField.showSubtotals() → boolean
PivotFieldGroup :: class in io.keikai.axyra.sheets (extends Record)
new PivotFieldGroup(PivotDateGroupBy, double, double, double)
PivotFieldGroup.isDate() → boolean
PivotFieldGroup.dateBy() → PivotDateGroupBy
PivotFieldGroup.start() → double
PivotFieldGroup.end() → double
PivotFieldGroup.interval() → double
PivotFieldSort :: class in io.keikai.axyra.sheets (extends Record)
new PivotFieldSort(boolean, int)
PivotFieldSort.byValue() → boolean
PivotFieldSort.ascending() → boolean
PivotFieldSort.byValueDataField() → int
PivotLabelFilter :: class in io.keikai.axyra.sheets (extends Record)
new PivotLabelFilter(PivotLabelFilterType, String)
PivotLabelFilter.type() → PivotLabelFilterType
PivotLabelFilter.value() → String
PivotLabelFilterType :: class in io.keikai.axyra.sheets (extends Enum<PivotLabelFilterType>)
PivotLabelFilterType.BEGINS_WITH (field PivotLabelFilterType)
PivotLabelFilterType.CONTAINS (field PivotLabelFilterType)
PivotLabelFilterType.EQUALS (field PivotLabelFilterType)
PivotLabelFilterType.ENDS_WITH (field PivotLabelFilterType)
PivotLabelFilterType.values() → static PivotLabelFilterType[]
PivotLabelFilterType.valueOf(String) → static PivotLabelFilterType
PivotLabelFilterType.wire() → String
PivotLayout :: class in io.keikai.axyra.sheets (extends Enum<PivotLayout>)
PivotLayout.COMPACT (field PivotLayout)
PivotLayout.OUTLINE (field PivotLayout)
PivotLayout.TABULAR (field PivotLayout)
PivotLayout.values() → static PivotLayout[]
PivotLayout.valueOf(String) → static PivotLayout
PivotLayout.engineName() → String
PivotShowDataAs :: class in io.keikai.axyra.sheets (extends Record)
new PivotShowDataAs(PivotShowDataAsType, String, String)
PivotShowDataAs.type() → PivotShowDataAsType
PivotShowDataAs.baseField() → String
PivotShowDataAs.baseItem() → String
PivotShowDataAsType :: class in io.keikai.axyra.sheets (extends Enum<PivotShowDataAsType>)
PivotShowDataAsType.NORMAL (field PivotShowDataAsType)
PivotShowDataAsType.PERCENT_OF_TOTAL (field PivotShowDataAsType)
PivotShowDataAsType.PERCENT_OF_ROW (field PivotShowDataAsType)
PivotShowDataAsType.PERCENT_OF_COLUMN (field PivotShowDataAsType)
PivotShowDataAsType.PERCENT_OF_PARENT (field PivotShowDataAsType)
PivotShowDataAsType.DIFFERENCE_FROM (field PivotShowDataAsType)
PivotShowDataAsType.PERCENT_DIFFERENCE_FROM (field PivotShowDataAsType)
PivotShowDataAsType.RUNNING_TOTAL (field PivotShowDataAsType)
PivotShowDataAsType.RANK_ASCENDING (field PivotShowDataAsType)
PivotShowDataAsType.RANK_DESCENDING (field PivotShowDataAsType)
PivotShowDataAsType.INDEX (field PivotShowDataAsType)
PivotShowDataAsType.values() → static PivotShowDataAsType[]
PivotShowDataAsType.valueOf(String) → static PivotShowDataAsType
PivotShowDataAsType.wire() → String
PivotStyle :: class in io.keikai.axyra.sheets (extends Record)
new PivotStyle(String, boolean, boolean, boolean, boolean, boolean)
PivotStyle.of(String) → static PivotStyle
PivotStyle.withRowStripes() → PivotStyle
PivotStyle.withColStripes() → PivotStyle
PivotStyle.name() → String
PivotStyle.showRowHeaders() → boolean
PivotStyle.showColHeaders() → boolean
PivotStyle.showRowStripes() → boolean
PivotStyle.showColStripes() → boolean
PivotStyle.showLastColumn() → boolean
PivotTableView :: class in io.keikai.axyra.sheets
PivotTableView.reload() → void
PivotTableView.index() → int
PivotTableView.name() → String
PivotTableView.location() → String
PivotTableView.sourceRef() → String
PivotTableView.refreshedBy() → String
PivotTableView.sourceFields() → List<String>
PivotTableView.addRowField(String) → void
PivotTableView.addColumnField(String) → void
PivotTableView.addFilterField(String) → void
PivotTableView.addPageField(String) → void
PivotTableView.addDataField(String, AggregateFunction) → void
PivotTableView.addDataField(String, AggregateFunction, String) → void
PivotTableView.removeRowField(int) → void
PivotTableView.removeColumnField(int) → void
PivotTableView.removeFilterField(int) → void
PivotTableView.removeDataField(int) → void
PivotTableView.moveRowField(int, int) → void
PivotTableView.moveColumnField(int, int) → void
PivotTableView.moveDataField(int, int) → void
PivotTableView.rowFields() → List<PivotField>
PivotTableView.columnFields() → List<PivotField>
PivotTableView.filterFields() → List<PivotField>
PivotTableView.dataFields() → List<PivotField>
PivotTableView.layout() → PivotLayout
PivotTableView.setLayout(PivotLayout) → void
PivotTableView.grandTotalRow() → boolean
PivotTableView.grandTotalColumn() → boolean
PivotTableView.setGrandTotals(boolean, boolean) → void
PivotTableView.grandTotalCaption() → String
PivotTableView.setGrandTotalCaption(String) → void
PivotTableView.setRowFieldSubtotals(int, boolean) → void
PivotTableView.setColumnFieldSubtotals(int, boolean) → void
PivotTableView.setRowFieldCaption(int, String) → void
PivotTableView.setColumnFieldCaption(int, String) → void
PivotTableView.setFilterFieldCaption(int, String) → void
PivotTableView.setTopNFilter(String, int, int, boolean) → boolean
PivotTableView.setTopPercentFilter(String, int, double, boolean) → boolean
PivotTableView.clearTopNFilter(String) → boolean
PivotTableView.topNFilter(String) → PivotTopNFilter
PivotTableView.setStyle(PivotStyle) → boolean
PivotTableView.setStyle(String) → boolean
PivotTableView.style() → PivotStyle
PivotTableView.groupFieldByDate(String, PivotDateGroupBy) → boolean
PivotTableView.groupFieldByDate(String, PivotDateGroupBy...) → boolean
PivotTableView.groupFieldNumeric(String, double, double, double) → boolean
PivotTableView.ungroupField(String) → boolean
PivotTableView.fieldGroup(String) → PivotFieldGroup
PivotTableView.setShowDataAs(int, PivotShowDataAsType) → boolean
PivotTableView.setShowDataAs(int, PivotShowDataAsType, String, String) → boolean
PivotTableView.clearShowDataAs(int) → boolean
PivotTableView.showDataAs(int) → PivotShowDataAs
PivotTableView.addCalculatedField(String, String) → void
PivotTableView.removeCalculatedField(String) → void
PivotTableView.addCalculatedItem(String, String, String) → void
PivotTableView.removeCalculatedItem(String, String) → void
PivotTableView.calculatedItems() → List<PivotCalculatedItem>
PivotTableView.calculatedFields() → List<PivotCalculatedField>
PivotTableView.setItemFilter(String, String...) → boolean
PivotTableView.itemFilter(String) → String[]
PivotTableView.setPageFilter(String, String) → boolean
PivotTableView.pageFilter(String) → String
PivotTableView.setLabelFilter(String, PivotLabelFilterType, String) → boolean
PivotTableView.clearLabelFilter(String) → boolean
PivotTableView.labelFilter(String) → PivotLabelFilter
PivotTableView.setValueFilter(String, int, PivotValueFilterType, double) → boolean
PivotTableView.setValueFilterBetween(String, int, double, double) → boolean
PivotTableView.clearValueFilter(String) → boolean
PivotTableView.valueFilter(String) → PivotValueFilter
PivotTableView.sortField(String, boolean) → boolean
PivotTableView.sortFieldByValue(String, boolean, int) → boolean
PivotTableView.clearFieldSort(String) → boolean
PivotTableView.fieldSort(String) → PivotFieldSort
PivotTableView.refresh() → int
PivotTopNFilter :: class in io.keikai.axyra.sheets (extends Record)
new PivotTopNFilter(int, double, boolean, boolean)
PivotTopNFilter.dataField() → int
PivotTopNFilter.value() → double
PivotTopNFilter.byPercent() → boolean
PivotTopNFilter.bottom() → boolean
PivotValueFilter :: class in io.keikai.axyra.sheets (extends Record)
new PivotValueFilter(int, PivotValueFilterType, double, double)
PivotValueFilter.dataField() → int
PivotValueFilter.type() → PivotValueFilterType
PivotValueFilter.value1() → double
PivotValueFilter.value2() → double
PivotValueFilterType :: class in io.keikai.axyra.sheets (extends Enum<PivotValueFilterType>)
PivotValueFilterType.GREATER_THAN_OR_EQUAL (field PivotValueFilterType)
PivotValueFilterType.GREATER_THAN (field PivotValueFilterType)
PivotValueFilterType.LESS_THAN_OR_EQUAL (field PivotValueFilterType)
PivotValueFilterType.LESS_THAN (field PivotValueFilterType)
PivotValueFilterType.EQUAL (field PivotValueFilterType)
PivotValueFilterType.NOT_EQUAL (field PivotValueFilterType)
PivotValueFilterType.BETWEEN (field PivotValueFilterType)
PivotValueFilterType.values() → static PivotValueFilterType[]
PivotValueFilterType.valueOf(String) → static PivotValueFilterType
PivotValueFilterType.wire() → String
ProtectedRange :: class in io.keikai.axyra.sheets.content (extends Record)
new ProtectedRange(String, String, boolean)
ProtectedRange.name() → String
ProtectedRange.sqref() → String
ProtectedRange.hasPassword() → boolean
Range :: class in io.keikai.axyra.sheets
Range.CONTENT_COMMENT (field int)
Range.CONTENT_HYPERLINK (field int)
Range.CONTENT_RICH_TEXT (field int)
Range.firstRow() → int
Range.firstColumn() → int
Range.lastRow() → int
Range.lastColumn() → int
Range.sheetIndex() → int
Range.rowCount() → int
Range.colCount() → int
Range.values() → CellValue[][]
Range.numbers() → double[]
Range.setNumbers(double[]) → void
Range.setValues(CellValue[][]) → void
Range.formulas() → String[][]
Range.setFormula(String) → void
Range.setFormulas(String[][]) → void
Range.setArrayFormula(String) → void
Range.copyTo(Sheet, int, int) → void
Range.copyTo(Sheet, int, int, String) → void
Range.spillRange() → String
Range.setStyle(CellStyle) → void
Range.applyNamedStyle(String) → void
Range.style() → CellStyle
Range.styleIds() → int[]
Range.contentFlags() → byte[]
Range.sort(SortKey...) → void
Range.sort(int, boolean) → void
Range.sortLeftToRight(SortKey...) → void
Range.autoFill(Range) → void
Range.removeDuplicates(int[], boolean) → int
Range.setValidation(Validation) → void
Range.addConditionalFormat(ConditionalFormat) → void
Range.createTable(String, String...) → void
Range.merge() → void
Range.unmerge() → void
Range.autoMerge(boolean) → int
Range.insertCells(Shift) → void
Range.deleteCells(Shift) → void
Range.clearHyperlinks() → int
Range.clear() → void
Renderer :: class in io.keikai.axyra.sheets.io
Renderer.toPdf(Workbook, Path) → static void
Renderer.toPdf(Workbook, Path, PdfOptions) → static void
Renderer.toPdf(Workbook, PdfOptions) → static byte[]
Renderer.pageCount(Workbook, int) → static int
Renderer.toPng(Workbook, int, ImageOptions) → static byte[]
Renderer.toPng(Workbook, int, String, ImageOptions) → static byte[]
Renderer.toSvg(Workbook, int, ImageOptions) → static byte[]
Renderer.toSvg(Workbook, int, String, ImageOptions) → static byte[]
Renderer.toImage(Workbook, int, String, ImageOptions) → static byte[]
Renderer.toImage(Workbook, int, String, String, ImageOptions) → static byte[]
Renderer.toJpeg(Workbook, int, ImageOptions) → static byte[]
Renderer.toGif(Workbook, int, ImageOptions) → static byte[]
Renderer.toBmp(Workbook, int, ImageOptions) → static byte[]
Renderer.toTiff(Workbook, int, ImageOptions) → static byte[]
RichText :: class in io.keikai.axyra.sheets.content
RichText.builder() → static RichText.Builder
RichText.toBuilder() → RichText.Builder
RichText.run() → static RichText.Run
RichText.toJson() → String
RichText.fromJson(String) → static RichText
RichText.runCount() → int
RichText.text() → String
RichText.run(int) → RichText.RunInfo
RichText.runs() → List<RichText.RunInfo>
RichText.Builder :: class in io.keikai.axyra.sheets.content
new RichText.Builder()
RichText.Builder.run(String) → RichText.Builder
RichText.Builder.run(String, RichText.Run) → RichText.Builder
RichText.Builder.build() → RichText
RichText.Run :: class in io.keikai.axyra.sheets.content
new RichText.Run()
RichText.Run.bold() → RichText.Run
RichText.Run.italic() → RichText.Run
RichText.Run.underline() → RichText.Run
RichText.Run.strike() → RichText.Run
RichText.Run.fontName(String) → RichText.Run
RichText.Run.fontSize(double) → RichText.Run
RichText.Run.color(Color) → RichText.Run
RichText.RunInfo :: class in io.keikai.axyra.sheets.content (extends Record)
new RichText.RunInfo(String, String, Double, boolean, boolean, boolean, boolean, Color)
RichText.RunInfo.text() → String
RichText.RunInfo.fontName() → String
RichText.RunInfo.fontSize() → Double
RichText.RunInfo.bold() → boolean
RichText.RunInfo.italic() → boolean
RichText.RunInfo.underline() → boolean
RichText.RunInfo.strike() → boolean
RichText.RunInfo.color() → Color
SaveOptions :: class in io.keikai.axyra.sheets.io
new SaveOptions()
SaveOptions.create() → static SaveOptions
SaveOptions.formulaPolicy(FormulaPolicy) → SaveOptions
SaveOptions.skipComments(boolean) → SaveOptions
SaveOptions.skipHyperlinks(boolean) → SaveOptions
SaveOptions.formulaPolicy() → FormulaPolicy
SaveOptions.skipComments() → boolean
SaveOptions.skipHyperlinks() → boolean
Sheet :: class in io.keikai.axyra.sheets
Sheet.name() → String
Sheet.index() → int
Sheet.visibility() → Visibility
Sheet.setVisibility(Visibility) → void
Sheet.sheetType() → SheetType
Sheet.uniqueId() → String
Sheet.rightToLeft() → boolean
Sheet.setRightToLeft(boolean) → void
Sheet.tabColor() → Color
Sheet.setTabColor(Color) → void
Sheet.header() → String
Sheet.setHeader(String) → void
Sheet.footer() → String
Sheet.setFooter(String) → void
Sheet.firstHeader() → String
Sheet.setFirstHeader(String) → void
Sheet.firstFooter() → String
Sheet.setFirstFooter(String) → void
Sheet.differentFirst() → boolean
Sheet.setDifferentFirst(boolean) → void
Sheet.evenHeader() → String
Sheet.setEvenHeader(String) → void
Sheet.evenFooter() → String
Sheet.setEvenFooter(String) → void
Sheet.differentOddEven() → boolean
Sheet.setDifferentOddEven(boolean) → void
Sheet.range(int, int, int, int) → Range
Sheet.range(String) → Range
Sheet.cell(int, int) → Cell
Sheet.value(int, int) → CellValue
Sheet.setNumber(int, int, double) → void
Sheet.importData(int, int, List<T>, ImportOptions) → int
Sheet.importData(int, int, List<T>) → int
Sheet.insertRows(int, int) → void
Sheet.deleteRows(int, int) → void
Sheet.insertColumns(int, int) → void
Sheet.deleteColumns(int, int) → void
Sheet.setRowHeight(int, double) → void
Sheet.rowHeight(int) → double
Sheet.isRowHeightCustom(int) → boolean
Sheet.setColumnWidth(int, double) → void
Sheet.columnWidth(int) → double
Sheet.defaultRowHeight() → double
Sheet.setDefaultRowHeight(double) → void
Sheet.isDefaultRowHeightCustom() → boolean
Sheet.setDefaultRowHeightCustom(boolean) → void
Sheet.defaultColumnWidth() → double
Sheet.setDefaultColumnWidth(double) → void
Sheet.baseColumnWidth() → int
Sheet.setBaseColumnWidth(int) → void
Sheet.formattedColumns() → int[]
Sheet.formattedRows() → int[]
Sheet.isColumnWidthCustom(int) → boolean
Sheet.columnStyleId(int) → int
Sheet.columnStyle(int) → CellStyle
Sheet.setColumnStyle(int, CellStyle) → void
Sheet.rowStyleId(int) → int
Sheet.rowStyle(int) → CellStyle
Sheet.setRowStyle(int, CellStyle) → void
Sheet.showGridlines() → boolean
Sheet.setShowGridlines(boolean) → void
Sheet.showRowColHeaders() → boolean
Sheet.setShowRowColHeaders(boolean) → void
Sheet.showZeros() → boolean
Sheet.setShowZeros(boolean) → void
Sheet.showFormulas() → boolean
Sheet.setShowFormulas(boolean) → void
Sheet.viewType() → String
Sheet.setViewType(String) → void
Sheet.summaryBelow() → boolean
Sheet.setSummaryBelow(boolean) → void
Sheet.summaryRight() → boolean
Sheet.setSummaryRight(boolean) → void
Sheet.activeCell() → String
Sheet.selectionSqref() → String
Sheet.setActiveCell(String, String) → void
Sheet.sourceSheetId() → int
Sheet.setSourceSheetId(int) → boolean
Sheet.scrollRow() → int
Sheet.scrollColumn() → int
Sheet.setScrollPosition(int, int) → boolean
Sheet.hasPageSetup() → boolean
Sheet.dyDescent() → double
Sheet.setDyDescent(double) → void
Sheet.setRowHidden(int, boolean) → void
Sheet.isRowHidden(int) → boolean
Sheet.setColumnHidden(int, boolean) → void
Sheet.isColumnHidden(int) → boolean
Sheet.freezePanes(int, int) → void
Sheet.unfreeze() → void
Sheet.freezeRow() → int
Sheet.freezeColumn() → int
Sheet.splitPanes(int, int) → void
Sheet.splitRow() → int
Sheet.splitColumn() → int
Sheet.addRowPageBreak(int) → void
Sheet.addColumnPageBreak(int) → void
Sheet.rowPageBreaks() → int[]
Sheet.columnPageBreaks() → int[]
Sheet.clearPageBreaks() → void
Sheet.mergedRegions() → List<Range>
Sheet.usedRange() → Range
Sheet.find(String) → int[][]
Sheet.find(String, boolean, boolean, boolean) → int[][]
Sheet.findRegex(String) → int[][]
Sheet.findRegex(String, boolean) → int[][]
Sheet.find(String, FindFormat) → int[][]
Sheet.find(String, boolean, boolean, boolean, FindFormat) → int[][]
Sheet.replaceAll(String, String) → int
Sheet.replaceAll(String, String, boolean, boolean, boolean) → int
Sheet.replaceAllRegex(String, String) → int
Sheet.replaceAllRegex(String, String, boolean) → int
Sheet.replaceAll(String, String, FindFormat) → int
Sheet.replaceAll(String, String, boolean, boolean, boolean, FindFormat) → int
Sheet.textToColumns(String, String) → int
Sheet.textToColumns(String, String, boolean) → int
Sheet.textToColumns(String, int, int, String, boolean) → int
Sheet.validations() → List<Validation>
Sheet.clearValidations() → void
Sheet.removeValidation(int) → boolean
Sheet.conditionalFormats() → List<ConditionalFormat>
Sheet.clearConditionalFormats() → void
Sheet.removeConditionalFormat(int) → boolean
Sheet.tables() → List<Table>
Sheet.removeTable(String) → boolean
Sheet.convertTableToRange(String) → boolean
Sheet.resizeTable(String, Range) → boolean
Sheet.autoExpandTables(int, int, String) → boolean
Sheet.smartArtCount() → int
Sheet.smartArts() → List<SmartArt>
Sheet.setTableStyle(String, TableStyleInfo) → boolean
Sheet.setTableTotalsRow(String, boolean) → boolean
Sheet.setTableHeaderRow(String, boolean) → boolean
Sheet.setTableColumnTotals(String, String, TotalsRowFunction) → boolean
Sheet.setTableColumnTotals(String, String, TotalsRowFunction, String, String) → boolean
Sheet.addChart(Chart) → int
Sheet.addPivotChart(int, String, int, int, int, int) → int
Sheet.charts() → List<Chart>
Sheet.chart(int) → ChartView
Sheet.replaceChart(int, Chart) → void
Sheet.clearCharts() → void
Sheet.removeChart(int) → boolean
Sheet.addCheckbox(String, int, int, int, int, String) → int
Sheet.formControlCount() → int
Sheet.addFormControl(FormControl) → int
Sheet.formControls() → List<FormControl>
Sheet.updateFormControl(int, FormControl) → boolean
Sheet.removeFormControl(int) → boolean
Sheet.addPivotTable(String, String, String) → int
Sheet.pivotCount() → int
Sheet.pivotName(int) → String
Sheet.pivotLocation(int) → String
Sheet.pivotSource(int) → String
Sheet.pivotTable(int) → PivotTableView
Sheet.pivotTable(String) → PivotTableView
Sheet.addScenario(String, String[], String[]) → int
Sheet.scenarioCount() → int
Sheet.scenarioName(int) → String
Sheet.showScenario(int) → boolean
Sheet.addPicture(byte[], String, int, int, int, int) → int
Sheet.addPicture(byte[], String, int, int, int, int, int, int, int, int) → int
Sheet.pictureCount() → int
Sheet.addLinkedPicture(String, String, int, int, int, int) → int
Sheet.pictureLinkTarget(int) → String
Sheet.setPictureLinkTarget(int, String) → boolean
Sheet.setHeaderFooterPicture(String, byte[], String, double, double) → boolean
Sheet.headerFooterPictureData(String) → byte[]
Sheet.removeHeaderFooterPicture(String) → boolean
Sheet.anchorOleObject(int, byte[], String, int, int, int, int) → boolean
Sheet.pictureData(int) → byte[]
Sheet.pictureFormat(int) → String
Sheet.pictureAnchor(int) → int[]
Sheet.pictureAnchorFull(int) → int[]
Sheet.clearPictures() → void
Sheet.removePicture(int) → boolean
Sheet.setBackgroundImage(byte[], String) → void
Sheet.backgroundImage() → byte[]
Sheet.backgroundImageFormat() → String
Sheet.clearBackgroundImage() → boolean
Sheet.setLandscape(boolean) → void
Sheet.isLandscape() → boolean
Sheet.setPrintArea(String) → void
Sheet.printArea() → String
Sheet.setPrintTitleRows(String) → void
Sheet.printTitleRows() → String
Sheet.setPrintTitleColumns(String) → void
Sheet.printTitleColumns() → String
Sheet.setPrintGridlines(boolean) → void
Sheet.printGridlines() → boolean
Sheet.setPrintHeadings(boolean) → void
Sheet.setPageOrderOverThenDown(boolean) → void
Sheet.pageOrderOverThenDown() → boolean
Sheet.setPrintBlackAndWhite(boolean) → void
Sheet.printBlackAndWhite() → boolean
Sheet.setPrintDraft(boolean) → void
Sheet.printDraft() → boolean
Sheet.setPrintErrors(int) → void
Sheet.printErrors() → int
Sheet.setFirstPageNumber(int) → void
Sheet.firstPageNumber() → int
Sheet.setPrintComments(int) → void
Sheet.printComments() → int
Sheet.setPrintResolution(int) → void
Sheet.printResolution() → int
Sheet.printHeadings() → boolean
Sheet.fitToPage(int, int) → void
Sheet.isFitToPage() → boolean
Sheet.fitToWidth() → int
Sheet.fitToHeight() → int
Sheet.setPageScale(int) → void
Sheet.pageScale() → int
Sheet.setPaperSize(int) → void
Sheet.paperSize() → int
Sheet.isPaperSizeDeclared() → boolean
Sheet.clearPaperSize() → void
Sheet.printHorizontallyCentered() → boolean
Sheet.setPrintHorizontallyCentered(boolean) → void
Sheet.printVerticallyCentered() → boolean
Sheet.setPrintVerticallyCentered(boolean) → void
Sheet.setPageMargins(double, double, double, double, double, double) → void
Sheet.setPageMargins(PageMargins) → void
Sheet.pageMargins() → PageMargins
Sheet.setZoom(int) → void
Sheet.zoom() → int
Sheet.protect() → void
Sheet.protect(String) → void
Sheet.protect(String, SheetProtection) → void
Sheet.unprotect() → void
Sheet.unprotect(String) → boolean
Sheet.isProtected() → boolean
Sheet.isProtectedWithPassword() → boolean
Sheet.verifyProtectionPassword(String) → boolean
Sheet.protection() → SheetProtection
Sheet.addProtectedRange(String, String, String) → void
Sheet.addProtectedRange(String, String) → void
Sheet.removeProtectedRange(String) → boolean
Sheet.protectedRanges() → List<ProtectedRange>
Sheet.verifyProtectedRangePassword(String, String) → boolean
Sheet.setAutoFilter(Range) → void
Sheet.autoFilterRange() → Range
Sheet.hasAutoFilter() → boolean
Sheet.clearAutoFilter() → void
Sheet.setColumnFilter(int, String...) → void
Sheet.setColumnCustomFilter(int, FilterOperator, String) → void
Sheet.setColumnCustomFilter(int, FilterOperator, String, FilterOperator, String, boolean) → void
Sheet.setColumnColorFilter(int, boolean, Color) → void
Sheet.setColumnTop10Filter(int, boolean, double, boolean) → void
Sheet.setColumnDynamicFilter(int, DynamicFilterType) → void
Sheet.setColumnDateFilter(int, DateGroupItem...) → void
Sheet.setColumnDateFilter(int, boolean, DateGroupItem...) → void
Sheet.clearColumnFilter(int) → void
Sheet.sortByColor(Range, int, boolean, boolean, Color...) → void
Sheet.applyAutoFilter() → int
Sheet.applyAdvancedFilter(Range, Range, boolean) → int
Sheet.applyAdvancedFilterCopyTo(Range, Range, Range, boolean) → int
Sheet.groupRows(int, int) → void
Sheet.setRowGroupCollapsed(int, int, boolean) → void
Sheet.setColumnGroupCollapsed(int, int, boolean) → void
Sheet.setRowsOutlineLevel(int, int, int) → void
Sheet.groupColumns(int, int) → void
Sheet.setColumnsOutlineLevel(int, int, int) → void
Sheet.rowOutlineLevel(int) → int
Sheet.autoFitRow(int) → void
Sheet.autoFitColumn(int) → void
Sheet.subtotal(int, int, int, SubtotalFunction, int...) → int
Sheet.subtotal(int, int, int, boolean, SubtotalFunction, int...) → int
Sheet.consolidate(int, int, ConsolidateFunction, Range...) → int[]
Sheet.addSparkline(String, String, String) → int
Sheet.setSparklineStyle(int, SparklineStyle) → boolean
Sheet.sparklineGroupCount() → int
Sheet.sparklines() → List<SparklineGroup>
Sheet.addShape(String, String, int, int, int, int) → int
Sheet.groupShapes(String, int...) → int
Sheet.ungroupShapes(int) → boolean
Sheet.addTextBox(String, int, int, int, int) → int
Sheet.addConnector(String, int, int, int, int) → int
Sheet.shapeCount() → int
Sheet.removeShape(int) → boolean
Sheet.shapeType(int) → String
Sheet.shapeText(int) → String
Sheet.shapeFillColor(int) → Color
Sheet.shapeLineColor(int) → Color
Sheet.shapeStyleXml(int) → String
Sheet.shapeRotation(int) → double
Sheet.shapeFlip(int) → boolean[]
Sheet.shapeAnchor(int) → int[]
Sheet.setShapeFillColor(int, Color) → void
Sheet.setShapeLineColor(int, Color) → void
Sheet.setShapeStyleXml(int, String) → void
Sheet.setShapeRotation(int, double) → void
Sheet.setShapeText(int, String) → void
Sheet.setShapeFlip(int, boolean, boolean) → void
Sheet.shapeHyperlink(int) → String
Sheet.setShapeHyperlink(int, String) → void
Sheet.shapeAltText(int) → String
Sheet.setShapeAltText(int, String) → void
Sheet.shapeName(int) → String
Sheet.setShapeName(int, String) → boolean
Sheet.renderChartToPng(int, int, int) → byte[]
Sheet.renderChartToSvg(int, int, int) → String
SheetProtection :: class in io.keikai.axyra.sheets (extends Record)
new SheetProtection(boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean)
SheetProtection.defaults() → static SheetProtection
SheetProtection.builder() → static SheetProtection.Builder
SheetProtection.toBuilder() → SheetProtection.Builder
SheetProtection.selectLockedCells() → boolean
SheetProtection.selectUnlockedCells() → boolean
SheetProtection.formatCells() → boolean
SheetProtection.formatColumns() → boolean
SheetProtection.formatRows() → boolean
SheetProtection.insertColumns() → boolean
SheetProtection.insertRows() → boolean
SheetProtection.insertHyperlinks() → boolean
SheetProtection.deleteColumns() → boolean
SheetProtection.deleteRows() → boolean
SheetProtection.sort() → boolean
SheetProtection.autoFilter() → boolean
SheetProtection.pivotTables() → boolean
SheetProtection.objects() → boolean
SheetProtection.scenarios() → boolean
SheetProtection.Builder :: class in io.keikai.axyra.sheets
SheetProtection.Builder.selectLockedCells(boolean) → SheetProtection.Builder
SheetProtection.Builder.selectUnlockedCells(boolean) → SheetProtection.Builder
SheetProtection.Builder.formatCells(boolean) → SheetProtection.Builder
SheetProtection.Builder.formatColumns(boolean) → SheetProtection.Builder
SheetProtection.Builder.formatRows(boolean) → SheetProtection.Builder
SheetProtection.Builder.insertColumns(boolean) → SheetProtection.Builder
SheetProtection.Builder.insertRows(boolean) → SheetProtection.Builder
SheetProtection.Builder.insertHyperlinks(boolean) → SheetProtection.Builder
SheetProtection.Builder.deleteColumns(boolean) → SheetProtection.Builder
SheetProtection.Builder.deleteRows(boolean) → SheetProtection.Builder
SheetProtection.Builder.sort(boolean) → SheetProtection.Builder
SheetProtection.Builder.autoFilter(boolean) → SheetProtection.Builder
SheetProtection.Builder.pivotTables(boolean) → SheetProtection.Builder
SheetProtection.Builder.objects(boolean) → SheetProtection.Builder
SheetProtection.Builder.scenarios(boolean) → SheetProtection.Builder
SheetProtection.Builder.build() → SheetProtection
SheetType :: class in io.keikai.axyra.sheets (extends Enum<SheetType>)
SheetType.WORKSHEET (field SheetType)
SheetType.CHART (field SheetType)
SheetType.DIALOG (field SheetType)
SheetType.MACRO_SHEET (field SheetType)
SheetType.INTERNATIONAL_MACRO_SHEET (field SheetType)
SheetType.values() → static SheetType[]
SheetType.valueOf(String) → static SheetType
Shift :: class in io.keikai.axyra.sheets (extends Enum<Shift>)
Shift.DOWN (field Shift)
Shift.UP (field Shift)
Shift.LEFT (field Shift)
Shift.RIGHT (field Shift)
Shift.values() → static Shift[]
Shift.valueOf(String) → static Shift
Side :: class in io.keikai.axyra.sheets.style (extends Enum<Side>)
Side.LEFT (field Side)
Side.RIGHT (field Side)
Side.TOP (field Side)
Side.BOTTOM (field Side)
Side.DIAGONAL (field Side)
Side.values() → static Side[]
Side.valueOf(String) → static Side
SignatureInfo :: class in io.keikai.axyra.sheets (extends Record)
new SignatureInfo(String, String, String, SignatureInfo.Status, String)
SignatureInfo.signerName() → String
SignatureInfo.algorithm() → String
SignatureInfo.signedAt() → String
SignatureInfo.status() → SignatureInfo.Status
SignatureInfo.detail() → String
SignatureInfo.Status :: class in io.keikai.axyra.sheets (extends Enum<SignatureInfo.Status>)
SignatureInfo.Status.VALID (field SignatureInfo.Status)
SignatureInfo.Status.INVALID (field SignatureInfo.Status)
SignatureInfo.Status.UNSUPPORTED (field SignatureInfo.Status)
SignatureInfo.Status.values() → static SignatureInfo.Status[]
SignatureInfo.Status.valueOf(String) → static SignatureInfo.Status
Slicer :: class in io.keikai.axyra.sheets.content (extends Record)
new Slicer(String, String, String, String, boolean, List<String>, int, boolean, String, int, int, int, int, int)
Slicer.fromMap(Map<String,Object>) → static Slicer
Slicer.name() → String
Slicer.caption() → String
Slicer.cacheName() → String
Slicer.sourceField() → String
Slicer.tableSlicer() → boolean
Slicer.pivotTables() → List<String>
Slicer.columnCount() → int
Slicer.showCaption() → boolean
Slicer.style() → String
Slicer.sheetIndex() → int
Slicer.row() → int
Slicer.col() → int
Slicer.endRow() → int
Slicer.endCol() → int
SmartArt :: class in io.keikai.axyra.sheets.content (extends Record)
new SmartArt(String, String, String, String, int, int, int, int, List<String>)
SmartArt.fromMap(Map<String,Object>) → static SmartArt
SmartArt.layoutFamily() → String
SmartArt.layoutId() → String
SmartArt.quickStyle() → String
SmartArt.colorStyle() → String
SmartArt.fromRow() → int
SmartArt.fromCol() → int
SmartArt.toRow() → int
SmartArt.toCol() → int
SmartArt.nodeTexts() → List<String>
SortKey :: class in io.keikai.axyra.sheets (extends Record)
new SortKey(int, boolean, String[])
new SortKey(int, boolean)
new SortKey(int, boolean, String[], boolean)
SortKey.asc(int) → static SortKey
SortKey.desc(int) → static SortKey
SortKey.customOrder(int, String...) → static SortKey
SortKey.withCustomOrder(String...) → SortKey
SortKey.sortingTextAsNumber() → SortKey
SortKey.column() → int
SortKey.ascending() → boolean
SortKey.customOrder() → String[]
SortKey.textAsNumber() → boolean
Sparkline :: class in io.keikai.axyra.sheets.content (extends Record)
new Sparkline(String, String)
Sparkline.dataRange() → String
Sparkline.location() → String
SparklineGroup :: class in io.keikai.axyra.sheets.content (extends Record)
new SparklineGroup(String, boolean, boolean, boolean, boolean, boolean, boolean, String, String, String, String, String, String, String, String, String, String, Double, Double, String, List<Sparkline>)
SparklineGroup.style() → SparklineStyle
SparklineGroup.fromJson(String) → static SparklineGroup
SparklineGroup.type() → String
SparklineGroup.showMarkers() → boolean
SparklineGroup.showHigh() → boolean
SparklineGroup.showLow() → boolean
SparklineGroup.showFirst() → boolean
SparklineGroup.showLast() → boolean
SparklineGroup.showNegative() → boolean
SparklineGroup.seriesColor() → String
SparklineGroup.negativeColor() → String
SparklineGroup.axisColor() → String
SparklineGroup.markersColor() → String
SparklineGroup.firstColor() → String
SparklineGroup.lastColor() → String
SparklineGroup.highColor() → String
SparklineGroup.lowColor() → String
SparklineGroup.minAxisType() → String
SparklineGroup.maxAxisType() → String
SparklineGroup.manualMin() → Double
SparklineGroup.manualMax() → Double
SparklineGroup.dateAxisRange() → String
SparklineGroup.sparklines() → List<Sparkline>
SparklineStyle :: class in io.keikai.axyra.sheets.content (extends Record)
new SparklineStyle(String, String, String, String, String, String, String, String, boolean, boolean, boolean, boolean, boolean, boolean, String, String, Double, Double, String)
SparklineStyle.defaults() → static SparklineStyle
SparklineStyle.withSeriesColor(String) → SparklineStyle
SparklineStyle.withNegativeColor(String) → SparklineStyle
SparklineStyle.withAxisColor(String) → SparklineStyle
SparklineStyle.withMarkersColor(String) → SparklineStyle
SparklineStyle.withFirstColor(String) → SparklineStyle
SparklineStyle.withLastColor(String) → SparklineStyle
SparklineStyle.withHighColor(String) → SparklineStyle
SparklineStyle.withLowColor(String) → SparklineStyle
SparklineStyle.withShowMarkers(boolean) → SparklineStyle
SparklineStyle.withCustomAxis(double, double) → SparklineStyle
SparklineStyle.withGroupAxis() → SparklineStyle
SparklineStyle.withDateAxis(String) → SparklineStyle
SparklineStyle.seriesColor() → String
SparklineStyle.negativeColor() → String
SparklineStyle.axisColor() → String
SparklineStyle.markersColor() → String
SparklineStyle.firstColor() → String
SparklineStyle.lastColor() → String
SparklineStyle.highColor() → String
SparklineStyle.lowColor() → String
SparklineStyle.showMarkers() → boolean
SparklineStyle.showHigh() → boolean
SparklineStyle.showLow() → boolean
SparklineStyle.showFirst() → boolean
SparklineStyle.showLast() → boolean
SparklineStyle.showNegative() → boolean
SparklineStyle.minAxisType() → String
SparklineStyle.maxAxisType() → String
SparklineStyle.manualMin() → Double
SparklineStyle.manualMax() → Double
SparklineStyle.dateAxisRange() → String
StreamRow :: class in io.keikai.axyra.sheets.io
StreamRow.addNumber(double) → StreamRow
StreamRow.addNumber(double, int) → StreamRow
StreamRow.addText(String) → StreamRow
StreamRow.addText(String, int) → StreamRow
StreamRow.addBoolean(boolean) → StreamRow
StreamRow.addDate(LocalDate, int) → StreamRow
StreamRow.skip() → StreamRow
StreamRow.setNumber(int, double) → StreamRow
StreamRow.setNumber(int, double, int) → StreamRow
StreamRow.setText(int, String) → StreamRow
StreamRow.setText(int, String, int) → StreamRow
StreamRow.setBoolean(int, boolean) → StreamRow
StreamRow.setBoolean(int, boolean, int) → StreamRow
StreamRow.setFormula(int, String) → StreamRow
StreamRow.setFormula(int, String, int) → StreamRow
StreamRow.setFormula(int, String, double, int) → StreamRow
StreamRow.setBlank(int, int) → StreamRow
StreamRow.setDate(int, LocalDate, int) → StreamRow
StreamRow.setDateTime(int, LocalDateTime, int) → StreamRow
StreamRow.commit() → void
StreamStyle :: class in io.keikai.axyra.sheets.io
StreamStyle.defaults() → static StreamStyle
StreamStyle.withNumberFormat(String) → StreamStyle
StreamStyle.withBold() → StreamStyle
StreamStyle.withBold(boolean) → StreamStyle
StreamStyle.withItalic() → StreamStyle
StreamStyle.withItalic(boolean) → StreamStyle
StreamStyle.numberFormat() → String
StreamStyle.bold() → boolean
StreamStyle.italic() → boolean
StreamWorkbook :: class in io.keikai.axyra.sheets.io (implements AutoCloseable)
StreamWorkbook.create(Path) → static StreamWorkbook
StreamWorkbook.addStyle(StreamStyle) → int
StreamWorkbook.startSheet(String) → void
StreamWorkbook.row(int) → StreamRow
StreamWorkbook.finish() → void
StreamWorkbook.close() → void
StreamWorkbook.isFinished() → boolean
SubtotalFunction :: class in io.keikai.axyra.sheets (extends Enum<SubtotalFunction>)
SubtotalFunction.AVERAGE (field SubtotalFunction)
SubtotalFunction.COUNT (field SubtotalFunction)
SubtotalFunction.COUNTA (field SubtotalFunction)
SubtotalFunction.MAX (field SubtotalFunction)
SubtotalFunction.MIN (field SubtotalFunction)
SubtotalFunction.PRODUCT (field SubtotalFunction)
SubtotalFunction.STDEV (field SubtotalFunction)
SubtotalFunction.STDEVP (field SubtotalFunction)
SubtotalFunction.SUM (field SubtotalFunction)
SubtotalFunction.VAR (field SubtotalFunction)
SubtotalFunction.VARP (field SubtotalFunction)
SubtotalFunction.values() → static SubtotalFunction[]
SubtotalFunction.valueOf(String) → static SubtotalFunction
Table :: class in io.keikai.axyra.sheets.content (extends Record)
new Table(String, int, int, int, int, List<String>, int, boolean, TableStyleInfo, List<TableColumn>)
Table.fromJson(String) → static Table
Table.name() → String
Table.firstRow() → int
Table.firstColumn() → int
Table.lastRow() → int
Table.lastColumn() → int
Table.columns() → List<String>
Table.headerRowCount() → int
Table.totalsRowShown() → boolean
Table.style() → TableStyleInfo
Table.tableColumns() → List<TableColumn>
TableColumn :: class in io.keikai.axyra.sheets.content (extends Record)
new TableColumn(String, String, String)
TableColumn.name() → String
TableColumn.totalsRowFunction() → String
TableColumn.totalsRowLabel() → String
TableStyleInfo :: class in io.keikai.axyra.sheets.content (extends Record)
new TableStyleInfo(String, boolean, boolean, boolean, boolean)
TableStyleInfo.defaults() → static TableStyleInfo
TableStyleInfo.of(String) → static TableStyleInfo
TableStyleInfo.styleName() → String
TableStyleInfo.showFirstColumn() → boolean
TableStyleInfo.showLastColumn() → boolean
TableStyleInfo.showRowStripes() → boolean
TableStyleInfo.showColumnStripes() → boolean
TemplateMarkers :: class in io.keikai.axyra.sheets.template
TemplateMarkers.process(Sheet, Map<String,Object>) → static void
Theme :: class in io.keikai.axyra.sheets.style
Theme.SLOT_COUNT (field int)
Theme.of(String[], String, String) → static Theme
Theme.color(Theme.Slot) → String
Theme.rgb(Theme.Slot) → Color
Theme.majorFont() → String
Theme.minorFont() → String
Theme.colors() → String[]
Theme.toBuilder() → Theme.Builder
Theme.builder() → static Theme.Builder
Theme.Builder :: class in io.keikai.axyra.sheets.style
new Theme.Builder()
Theme.Builder.color(Theme.Slot, String) → Theme.Builder
Theme.Builder.color(Theme.Slot, Color) → Theme.Builder
Theme.Builder.majorFont(String) → Theme.Builder
Theme.Builder.minorFont(String) → Theme.Builder
Theme.Builder.build() → Theme
Theme.Slot :: class in io.keikai.axyra.sheets.style (extends Enum<Theme.Slot>)
Theme.Slot.DARK1 (field Theme.Slot)
Theme.Slot.LIGHT1 (field Theme.Slot)
Theme.Slot.DARK2 (field Theme.Slot)
Theme.Slot.LIGHT2 (field Theme.Slot)
Theme.Slot.ACCENT1 (field Theme.Slot)
Theme.Slot.ACCENT2 (field Theme.Slot)
Theme.Slot.ACCENT3 (field Theme.Slot)
Theme.Slot.ACCENT4 (field Theme.Slot)
Theme.Slot.ACCENT5 (field Theme.Slot)
Theme.Slot.ACCENT6 (field Theme.Slot)
Theme.Slot.HYPERLINK (field Theme.Slot)
Theme.Slot.FOLLOWED_HYPERLINK (field Theme.Slot)
Theme.Slot.values() → static Theme.Slot[]
Theme.Slot.valueOf(String) → static Theme.Slot
ThreadedComment :: class in io.keikai.axyra.sheets.content (extends Record)
new ThreadedComment(String, String, String, String, boolean, List<ThreadedComment>)
ThreadedComment.id() → String
ThreadedComment.author() → String
ThreadedComment.text() → String
ThreadedComment.timestamp() → String
ThreadedComment.resolved() → boolean
ThreadedComment.replies() → List<ThreadedComment>
TimePeriod :: class in io.keikai.axyra.sheets.content (extends Enum<TimePeriod>)
TimePeriod.TODAY (field TimePeriod)
TimePeriod.YESTERDAY (field TimePeriod)
TimePeriod.TOMORROW (field TimePeriod)
TimePeriod.LAST_7_DAYS (field TimePeriod)
TimePeriod.THIS_WEEK (field TimePeriod)
TimePeriod.LAST_WEEK (field TimePeriod)
TimePeriod.NEXT_WEEK (field TimePeriod)
TimePeriod.THIS_MONTH (field TimePeriod)
TimePeriod.LAST_MONTH (field TimePeriod)
TimePeriod.NEXT_MONTH (field TimePeriod)
TimePeriod.values() → static TimePeriod[]
TimePeriod.valueOf(String) → static TimePeriod
TimePeriod.token() → String
TimePeriod.from(String) → static TimePeriod
Timeline :: class in io.keikai.axyra.sheets.content (extends Record)
new Timeline(String, String, String, String, String, String, Integer, int, int, int, int, int)
Timeline.fromMap(Map<String,Object>) → static Timeline
Timeline.name() → String
Timeline.caption() → String
Timeline.cacheName() → String
Timeline.source() → String
Timeline.dateField() → String
Timeline.level() → String
Timeline.pivotCacheId() → Integer
Timeline.sheetIndex() → int
Timeline.row() → int
Timeline.col() → int
Timeline.endRow() → int
Timeline.endCol() → int
TotalsRowFunction :: class in io.keikai.axyra.sheets (extends Enum<TotalsRowFunction>)
TotalsRowFunction.NONE (field TotalsRowFunction)
TotalsRowFunction.SUM (field TotalsRowFunction)
TotalsRowFunction.MIN (field TotalsRowFunction)
TotalsRowFunction.MAX (field TotalsRowFunction)
TotalsRowFunction.AVERAGE (field TotalsRowFunction)
TotalsRowFunction.COUNT (field TotalsRowFunction)
TotalsRowFunction.COUNT_NUMS (field TotalsRowFunction)
TotalsRowFunction.STD_DEV (field TotalsRowFunction)
TotalsRowFunction.VAR (field TotalsRowFunction)
TotalsRowFunction.CUSTOM (field TotalsRowFunction)
TotalsRowFunction.values() → static TotalsRowFunction[]
TotalsRowFunction.valueOf(String) → static TotalsRowFunction
TotalsRowFunction.code() → String
Trendline :: class in io.keikai.axyra.sheets.content (extends Record)
new Trendline(String, double, double, int, int, boolean, boolean)
Trendline.linear() → static Trendline
Trendline.movingAverage(int) → static Trendline
Trendline.polynomial(int) → static Trendline
Trendline.kind() → String
Trendline.forward() → double
Trendline.backward() → double
Trendline.order() → int
Trendline.period() → int
Trendline.showEquation() → boolean
Trendline.showRSquared() → boolean
TypedUserFunction :: interface in io.keikai.axyra.sheets.formula
TypedUserFunction.apply(CellValue[]) → CellValue
Underline :: class in io.keikai.axyra.sheets.style (extends Enum<Underline>)
Underline.NONE (field Underline)
Underline.SINGLE (field Underline)
Underline.DOUBLE (field Underline)
Underline.SINGLE_ACCOUNTING (field Underline)
Underline.DOUBLE_ACCOUNTING (field Underline)
Underline.values() → static Underline[]
Underline.valueOf(String) → static Underline
Underline.token() → String
Underline.from(String) → static Underline
UserFunction :: interface in io.keikai.axyra.sheets.formula
UserFunction.apply(double[]) → double
VAlign :: class in io.keikai.axyra.sheets.style (extends Enum<VAlign>)
VAlign.TOP (field VAlign)
VAlign.CENTER (field VAlign)
VAlign.BOTTOM (field VAlign)
VAlign.JUSTIFY (field VAlign)
VAlign.DISTRIBUTED (field VAlign)
VAlign.values() → static VAlign[]
VAlign.valueOf(String) → static VAlign
VAlign.token() → String
VAlign.from(String) → static VAlign
Validation :: class in io.keikai.axyra.sheets.content
Validation.list(String...) → static Validation
Validation.wholeNumber(String, String, String) → static Validation
Validation.decimal(String, String, String) → static Validation
Validation.date(String, String, String) → static Validation
Validation.time(String, String, String) → static Validation
Validation.textLength(String, String, String) → static Validation
Validation.custom(String) → static Validation
Validation.builder() → static Validation.Builder
Validation.toBuilder() → Validation.Builder
Validation.toJson() → String
Validation.fromJson(String) → static Validation
Validation.type() → String
Validation.operator() → String
Validation.formula1() → String
Validation.formula2() → String
Validation.allowBlank() → boolean
Validation.showDropdown() → boolean
Validation.errorStyle() → String
Validation.errorTitle() → String
Validation.errorMessage() → String
Validation.showErrorMessage() → boolean
Validation.inputTitle() → String
Validation.inputMessage() → String
Validation.showInputMessage() → boolean
Validation.firstRow() → int
Validation.firstColumn() → int
Validation.lastRow() → int
Validation.lastColumn() → int
Validation.Builder :: class in io.keikai.axyra.sheets.content
new Validation.Builder()
Validation.Builder.type(String) → Validation.Builder
Validation.Builder.operator(String) → Validation.Builder
Validation.Builder.formula1(String) → Validation.Builder
Validation.Builder.formula2(String) → Validation.Builder
Validation.Builder.allowBlank(boolean) → Validation.Builder
Validation.Builder.showDropdown(boolean) → Validation.Builder
Validation.Builder.errorMessage(String, String) → Validation.Builder
Validation.Builder.errorStyle(String) → Validation.Builder
Validation.Builder.showErrorMessage(boolean) → Validation.Builder
Validation.Builder.showInputMessage(boolean) → Validation.Builder
Validation.Builder.inputMessage(String, String) → Validation.Builder
Validation.Builder.build() → Validation
VbaModule :: class in io.keikai.axyra.sheets.content (extends Record)
new VbaModule(String, String, String)
VbaModule.fromMap(Map<String,Object>) → static VbaModule
VbaModule.name() → String
VbaModule.kind() → String
VbaModule.source() → String
Visibility :: class in io.keikai.axyra.sheets (extends Enum<Visibility>)
Visibility.VISIBLE (field Visibility)
Visibility.HIDDEN (field Visibility)
Visibility.VERY_HIDDEN (field Visibility)
Visibility.values() → static Visibility[]
Visibility.valueOf(String) → static Visibility
Workbook :: class in io.keikai.axyra.sheets (implements AutoCloseable)
Workbook.create() → static Workbook
Workbook.createColumnar() → static Workbook
Workbook.open(Path) → static Workbook
Workbook.open(Path, String) → static Workbook
Workbook.save(Path) → void
Workbook.saveHtml(Path, HtmlOptions) → void
Workbook.save(Path, SaveOptions) → void
Workbook.saveEncrypted(Path, String) → void
Workbook.saveBytes(String) → byte[]
Workbook.save(OutputStream, String) → void
Workbook.sign(byte[], byte[]) → byte[]
Workbook.sign(Path, byte[], byte[]) → void
Workbook.signatures() → List<SignatureInfo>
Workbook.openBytes(byte[], String) → static Workbook
Workbook.openBytes(byte[], String, String) → static Workbook
Workbook.open(InputStream, String) → static Workbook
Workbook.renderPdf(Path) → void
Workbook.renderPdf(PdfOptions) → byte[]
Workbook.renderPdf(Path, PdfOptions) → void
Workbook.renderSheetPng(int, ImageOptions) → byte[]
Workbook.renderSheetSvg(int, ImageOptions) → byte[]
Workbook.renderSheetImage(int, String, ImageOptions) → byte[]
Workbook.renderRangeImage(int, String, String, ImageOptions) → byte[]
Workbook.renderRangePng(int, String, ImageOptions) → byte[]
Workbook.renderRangeSvg(int, String, ImageOptions) → byte[]
Workbook.sheetPageCount(int) → int
Workbook.setSlicerStyle(String, String) → boolean
Workbook.setSlicerSelection(String, String...) → boolean
Workbook.slicerSelection(String) → String[]
Workbook.addSlicer(String, String) → void
Workbook.addSlicer(String, String, String, int, int, int, int, int) → void
Workbook.addSlicer(String, String, String, String, int, int, int, int, int) → void
Workbook.slicerCount() → int
Workbook.slicers() → List<Slicer>
Workbook.addTimeline(String, String, String) → void
Workbook.addTimeline(String, String, String, int, int, int, int, int) → void
Workbook.timelineCount() → int
Workbook.timelines() → List<Timeline>
Workbook.setTimelineRange(String, LocalDate, LocalDate) → boolean
Workbook.timelineRange(String) → LocalDate[]
Workbook.externalLinkCount() → int
Workbook.externalLinks() → List<ExternalLink>
Workbook.removeExternalLink(int) → boolean
Workbook.setExternalLinkSource(int, String) → boolean
Workbook.externalLinkSource(int) → String
Workbook.setLicense(byte[]) → static LicenseInfo
Workbook.setLicense(String) → static LicenseInfo
Workbook.setLicense(InputStream) → static LicenseInfo
Workbook.licenseStatus() → static LicenseInfo
Workbook.recalculate() → void
Workbook.recalculateDirty() → void
Workbook.evaluate(String) → CellValue
Workbook.evaluate(String, Sheet) → CellValue
Workbook.calcMode() → CalcMode
Workbook.setCalcMode(CalcMode) → void
Workbook.setIterativeCalc(boolean, int, double) → void
Workbook.date1904() → boolean
Workbook.setDate1904(boolean) → void
Workbook.locale() → String
Workbook.setLocale(String) → void
Workbook.registerFunction(String, UserFunction) → void
Workbook.registerTypedFunction(String, TypedUserFunction) → void
Workbook.sheetCount() → int
Workbook.sheet(int) → Sheet
Workbook.sheet(String) → Sheet
Workbook.createSheet(String) → Sheet
Workbook.insertSheet(int, String) → Sheet
Workbook.deleteSheet(int) → void
Workbook.renameSheet(int, String) → void
Workbook.moveSheet(int, int) → void
Workbook.activeSheet() → Sheet
Workbook.setActiveSheet(int) → void
Workbook.addChartSheet(String, Chart) → int
Workbook.chartSheetCount() → int
Workbook.chartSheetName(int) → String
Workbook.chartSheetChart(int) → ChartView
Workbook.removeChartSheet(int) → boolean
Workbook.copySheet(Sheet, String) → Sheet
Workbook.copySheetFrom(Workbook, int) → Sheet
Workbook.copySheetFrom(Workbook, int, String) → Sheet
Workbook.combine(Workbook...) → void
Workbook.splitToFiles(Path, String) → List<Path>
Workbook.sheets() → List<Sheet>
Workbook.title() → String
Workbook.setTitle(String) → void
Workbook.subject() → String
Workbook.setSubject(String) → void
Workbook.author() → String
Workbook.setAuthor(String) → void
Workbook.keywords() → String
Workbook.setKeywords(String) → void
Workbook.comments() → String
Workbook.setComments(String) → void
Workbook.lastModifiedBy() → String
Workbook.setLastModifiedBy(String) → void
Workbook.lastPrinted() → String
Workbook.setLastPrinted(String) → void
Workbook.created() → String
Workbook.setCreated(String) → void
Workbook.modified() → String
Workbook.setModified(String) → void
Workbook.revision() → String
Workbook.setRevision(String) → void
Workbook.contentStatus() → String
Workbook.setContentStatus(String) → void
Workbook.category() → String
Workbook.setCategory(String) → void
Workbook.language() → String
Workbook.setLanguage(String) → void
Workbook.documentVersion() → String
Workbook.setDocumentVersion(String) → void
Workbook.application() → String
Workbook.setApplication(String) → void
Workbook.appVersion() → String
Workbook.setAppVersion(String) → void
Workbook.company() → String
Workbook.setCompany(String) → void
Workbook.manager() → String
Workbook.setManager(String) → void
Workbook.hyperlinkBase() → String
Workbook.setHyperlinkBase(String) → void
Workbook.docSecurity() → Integer
Workbook.setDocSecurity(Integer) → void
Workbook.scaleCrop() → Boolean
Workbook.setScaleCrop(Boolean) → void
Workbook.linksUpToDate() → Boolean
Workbook.setLinksUpToDate(Boolean) → void
Workbook.sharedDoc() → Boolean
Workbook.setSharedDoc(Boolean) → void
Workbook.hyperlinksChanged() → Boolean
Workbook.setHyperlinksChanged(Boolean) → void
Workbook.customProperties() → List<CustomProperty>
Workbook.setCustomProperty(String, String) → void
Workbook.setCustomProperty(String, double) → void
Workbook.setCustomProperty(String, boolean) → void
Workbook.setCustomProperty(String, LocalDate) → void
Workbook.removeCustomProperty(String) → boolean
Workbook.theme() → Theme
Workbook.setTheme(Theme) → void
Workbook.defaultStyle() → CellStyle
Workbook.setDefaultFont(CellStyle) → void
Workbook.formulaToR1C1(String, int, int) → String
Workbook.formulaToA1(String, int, int) → String
Workbook.precedents(Sheet, int, int) → List<CellRef>
Workbook.dependents(Sheet, int, int) → List<CellRef>
Workbook.allDependents(Sheet, int, int) → List<CellRef>
Workbook.xmlMaps() → List<XmlMap>
Workbook.connections() → List<DataConnection>
Workbook.setConnectionCommand(String, String) → boolean
Workbook.setConnectionString(String, String) → boolean
Workbook.vbaModules() → List<VbaModule>
Workbook.oleObjects() → List<OleObject>
Workbook.addOleObject(String, String, byte[]) → int
Workbook.setOleObjectData(int, byte[]) → boolean
Workbook.removeOleObject(int) → boolean
Workbook.registerNamedStyle(String, CellStyle) → void
Workbook.namedStyleCount() → int
Workbook.hasNamedStyle(String) → boolean
Workbook.removeNamedStyle(String) → boolean
Workbook.updateNamedStyle(String, CellStyle) → boolean
Workbook.addName(String, String) → void
Workbook.addName(String, String, Sheet) → void
Workbook.removeName(String) → boolean
Workbook.customTableStyles() → String
Workbook.setCustomTableStyles(String) → void
Workbook.names() → List<NamedRange>
Workbook.findName(String) → NamedRange
Workbook.range(String) → Range
Workbook.goalSeek(Cell, double, Cell) → double
Workbook.protect(boolean) → void
Workbook.protect(boolean, boolean) → void
Workbook.unprotect() → void
Workbook.isStructureLocked() → boolean
Workbook.protectStructure(String) → void
Workbook.protectStructure(String, boolean) → void
Workbook.unprotectStructure(String) → boolean
Workbook.isStructureProtected() → boolean
Workbook.isWindowsLocked() → boolean
Workbook.setWriteProtection(String) → void
Workbook.setWriteProtection(String, String, boolean) → void
Workbook.removeWriteProtection() → void
Workbook.isWriteProtected() → boolean
Workbook.writeProtection() → WriteProtection
Workbook.verifyWritePassword(String) → boolean
Workbook.close() → void
WriteProtection :: class in io.keikai.axyra.sheets.content (extends Record)
new WriteProtection(boolean, String, boolean)
WriteProtection.readOnlyRecommended() → boolean
WriteProtection.userName() → String
WriteProtection.hasPassword() → boolean
XmlMap :: class in io.keikai.axyra.sheets.content (extends Record)
new XmlMap(int, String, String, String, String, List<XmlMapBinding>)
XmlMap.fromMap(Map<String,Object>) → static XmlMap
XmlMap.id() → int
XmlMap.name() → String
XmlMap.rootElement() → String
XmlMap.schemaId() → String
XmlMap.schema() → String
XmlMap.bindings() → List<XmlMapBinding>
XmlMapBinding :: class in io.keikai.axyra.sheets.content (extends Record)
new XmlMapBinding(String, String, String, String, String)
XmlMapBinding.fromMap(Map<String,Object>) → static XmlMapBinding
XmlMapBinding.column() → String
XmlMapBinding.xpath() → String
XmlMapBinding.dataType() → String
XmlMapBinding.tableName() → String
XmlMapBinding.cellRef() → String
