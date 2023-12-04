---
title: 'Supported Formula Functions'
---
Here we list all built-in functions in Keikai OSE and EE:

Check [Microsoft Excel function list](https://support.microsoft.com/en-us/office/excel-functions-alphabetical-b3944572-255d-4efb-bb96-c6d90033e188) for details.


# Date & Time (18)

| Function    | OSE | EE |
|-------------|-----|----|
| DATE        |  Y  |  Y |
| DATEDIF*    |     |  Y |
| DATEVALUE   |     |  Y |
| DAY         |  Y  |  Y |
| DAYS360     |  Y  |  Y |
| EOMONTH     |     |  Y |
| HOUR        |  Y  |  Y |
| MINUTE      |  Y  |  Y |
| MONTH       |  Y  |  Y |
| NETWORKDAYS |  Y  |  Y |
| NOW         |  Y  |  Y |
| SECOND      |  Y  |  Y |
| TIME        |  Y  |  Y |
| TODAY       |  Y  |  Y |
| WEEKDAY     |  Y  |  Y |
| WORKDAY     |  Y  |  Y |
| YEAR        |  Y  |  Y |
| YEARFRAC    |  Y  |  Y |

* `DATEDIF`: supported {% include version-badge.html version='5.8.0' %}

# Engineering (38)

| Function  | OSE | EE |
|-----------|-----|----|
| BESSELI   |     |  Y |
| BESSELJ   |     |  Y |
| BESSELK   |     |  Y |
| BESSELY   |     |  Y |
| BIN2DEC   |     |  Y |
| BIN2HEX   |     |  Y |
| BIN2OCT   |     |  Y |
| COMPLEX   |     |  Y |
| DEC2BIN   |     |  Y |
| DEC2HEX   |     |  Y |
| DEC2OCT   |     |  Y |
| DELTA     |     |  Y |
| ERF       |     |  Y |
| ERFC      |     |  Y |
| GESTEP    |     |  Y |
| HEX2BIN   |     |  Y |
| HEX2DEC   |     |  Y |
| HEX2OCT   |     |  Y |
| IMABS     |     |  Y |
| IMAGINARY |     |  Y |
| IMARGUMENT|     |  Y |
| IMCONJUGATE|    |  Y |
| IMCOS     |     |  Y |
| IMDIV     |     |  Y |
| IMEXP     |     |  Y |
| IMLN      |     |  Y |
| IMLOG10   |     |  Y |
| IMLOG2    |     |  Y |
| IMPOWER   |     |  Y |
| IMPRODUCT |     |  Y |
| IMREAL    |     |  Y |
| IMSIN     |     |  Y |
| IMSQRT    |     |  Y |
| IMSUB     |     |  Y |
| IMSUM     |     |  Y |
| OCT2BIN   |     |  Y |
| OCT2DEC   |     |  Y |
| OCT2HEX   |     |  Y |


# Financial (44)

| Function    | OSE | EE |
|-------------|-----|----|
| ACCRINT     |     |  Y |
| ACCRINTM    |     |  Y |
| AMORDEGRC   |     |  Y |
| AMORLINC    |     |  Y |
| COUPDAYBS   |     |  Y |
| COUPDAYS    |     |  Y |
| COUPDAYSNC  |     |  Y |
| COUPNCD     |     |  Y |
| COUPNUM     |     |  Y |
| COUPPCD     |     |  Y |
| CUMIPMT     |     |  Y |
| CUMPRINC    |     |  Y |
| DB          |     |  Y |
| DDB         |     |  Y |
| DISC        |     |  Y |
| DOLLARDE    |     |  Y |
| DOLLARFR    |     |  Y |
| DURATION    |     |  Y |
| EFFECT      |     |  Y |
| FV          |  Y  |  Y |
| FVSCHEDULE  |     |  Y |
| INTRATE     |     |  Y |
| IPMT        |     |  Y |
| IRR         |  Y  |  Y |
| NOMINAL     |     |  Y |
| NPER        |  Y  |  Y |
| NPV         |  Y  |  Y |
| PMT         |  Y  |  Y |
| PPMT        |     |  Y |
| PRICE       |     |  Y |
| PRICEDISC   |     |  Y |
| PRICEMAT    |     |  Y |
| PV          |  Y  |  Y |
| RATE        |  Y  |  Y |
| RECEIVED    |     |  Y |
| SLN         |     |  Y |
| SYD         |     |  Y |
| TBILLEQ     |     |  Y |
| TBILLPRICE  |     |  Y |
| TBILLYIELD  |     |  Y |
| XNPV        |     |  Y |
| YIELD       |     |  Y |
| YIELDDISC   |     |  Y |
| YIELDMAT    |     |  Y |


# Info (15)

| Function    | OSE | EE |
|-------------|-----|----|
| ERROR.TYPE  |  Y  |  Y |
| ISBLANK     |  Y  |  Y |
| ISERR       |     |  Y |
| ISERROR     |  Y  |  Y |
| ISEVEN      |  Y  |  Y |
| ISLOGICAL   |  Y  |  Y |
| ISNA        |  Y  |  Y |
| ISNONTEXT   |  Y  |  Y |
| ISNUMBER    |  Y  |  Y |
| ISODD       |  Y  |  Y |
| ISREF       |  Y  |  Y |
| ISTEXT      |  Y  |  Y |
| N           |     |  Y |
| NA          |  Y  |  Y |
| TYPE        |     |  Y |


# Logical (7)

| Function | OSE | EE |
|----------|-----|----|
| AND      |  Y  |  Y |
| FALSE    |  Y  |  Y |
| IF       |  Y  |  Y |
| IFERROR  |     |  Y |
| NOT      |  Y  |  Y |
| OR       |  Y  |  Y |
| TRUE     |  Y  |  Y |


# Lookup & Reference (14)

| Function   | OSE | EE |
|------------|-----|----|
| ADDRESS    |  Y  |  Y |
| CHOOSE     |  Y  |  Y |
| COLUMN     |  Y  |  Y |
| COLUMNS    |  Y  |  Y |
| HLOOKUP    |  Y  |  Y |
| HYPERLINK  |  Y  |  Y |
| INDEX      |  Y  |  Y |
| INDIRECT   |  Y  |  Y |
| LOOKUP     |  Y  |  Y |
| MATCH      |  Y  |  Y |
| OFFSET     |  Y  |  Y |
| ROW        |  Y  |  Y |
| ROWS       |  Y  |  Y |
| VLOOKUP    |  Y  |  Y |


# Mathematical (59)

| Function    | OSE | EE |
|-------------|-----|----|
| ABS         |  Y  |  Y |
| ACOS        |  Y  |  Y |
| ACOSH       |  Y  |  Y |
| ASIN        |  Y  |  Y |
| ASINH       |  Y  |  Y |
| ATAN        |  Y  |  Y |
| ATAN2       |  Y  |  Y |
| ATANH       |  Y  |  Y |
| CEILING     |  Y  |  Y |
| COMBIN      |  Y  |  Y |
| COS         |  Y  |  Y |
| COSH        |  Y  |  Y |
| DEGREES     |  Y  |  Y |
| EVEN        |  Y  |  Y |
| EXP         |  Y  |  Y |
| FACT        |  Y  |  Y |
| FACTDOUBLE  |     |  Y |
| FLOOR       |  Y  |  Y |
| GCD         |     |  Y |
| INT         |  Y  |  Y |
| LCM         |     |  Y |
| LN          |  Y  |  Y |
| LOG         |  Y  |  Y |
| LOG10       |  Y  |  Y |
| MDETERM     |     |  Y |
| MINVERSE    |     |  Y |
| MMULT       |     |  Y |
| MOD         |  Y  |  Y |
| MROUND      |     |  Y |
| MULTINOMIAL |     |  Y |
| ODD         |  Y  |  Y |
| PI          |  Y  |  Y |
| POWER       |  Y  |  Y |
| PRODUCT     |  Y  |  Y |
| QUOTIENT    |     |  Y |
| RADIANS     |  Y  |  Y |
| RAND        |  Y  |  Y |
| RANDBETWEEN |  Y  |  Y |
| ROMAN       |     |  Y |
| ROUND       |  Y  |  Y |
| ROUNDDOWN   |  Y  |  Y |
| ROUNDUP     |  Y  |  Y |
| SIGN        |  Y  |  Y |
| SIN         |  Y  |  Y |
| SINH        |  Y  |  Y |
| SQRT        |  Y  |  Y |
| SQRTPI      |     |  Y |
| SUBTOTAL    |  Y  |  Y |
| SUM         |  Y  |  Y |
| SUMIF       |  Y  |  Y |
| SUMIFS      |  Y  |  Y |
| SUMPRODUCT  |  Y  |  Y |
| SUMSQ       |  Y  |  Y |
| SUMX2MY2    |  Y  |  Y |
| SUMX2PY2    |  Y  |  Y |
| SUMXMY2     |  Y  |  Y |
| TAN         |  Y  |  Y |
| TANH        |  Y  |  Y |
| TRUNC       |  Y  |  Y |


## SUMPRODUCT

You can specify a condition to just calculate partial cells in a given range. For example,

`=SUMPRODUCT(--(A1:A3="John"),(B1:B3),(C1:C3))`

or simpler

`=SUMPRODUCT((F12:F21=1)*(G12:G21="Z")*H12:H21)`

## SUBTOTAL
Keikai follows [Microsoft SUBTOTAL function](https://support.office.com/en-us/article/subtotal-function-7b027003-f060-4ade-9040-e478765b9939?redirectSourcePath=%252fen-US%252farticle%252fSUBTOTAL-function-e27c301c-be9a-458b-9d12-b9a2ce3c62af&ui=en-US&rs=en-US&ad=US).

Regarding the 1st argument, *"1-11 includes manually-hidden rows, while 101-111 excludes them; filtered-out cells are always excluded"*. 
* If you **enable** the auto filter in a sheet, Keikai treats all hidden rows as **filtered-out cells**. 
* If you **don't enable the auto filter**, Keikai treats all hidden rows as **manually-hidden rows**. 



# Statistical (62)

| Function    | New Name since Excel 2010 | OSE | EE |
|-------------|--------------------------|-----|----|
| AVEDEV      | -                        | Y   | Y  |
| AVERAGE     | -                        | Y   | Y  |
| AVERAGEA    | -                        | Y   | -  |
| AVERAGEIF   | -                        | Y   | -  |
| BETADIST    | BETA.DIST                | Y   | -  |
| BETAINV     | BETA.INV                 | Y   | -  |
| BINOMDIST   | BINOM.DIST               | Y   | -  |
| CORREL      | -                        | Y   | -  |
| CRITBINOM   | BINOM.INV                | Y   | -  |
| CHIDIST     | CHISQ.DIST.RT            | Y   | -  |
| CHIINV      | CHISQ.INV.RT             | Y   | -  |
| -           | CHISQ.DIST               | Y   | -  |
| -           | CHISQ.INV                | Y   | -  |
| COUNT       | -                        | Y   | Y  |
| COUNTA      | -                        | Y   | Y  |
| COUNTBLANK  | -                        | Y   | Y  |
| COUNTIF     | -                        | Y   | Y  |
| COUNTIFS    | -                        | -   | Y  |
| DEVSQ       | -                        | Y   | Y  |
| EXPONDIST   | EXPON.DIST               | Y   | -  |
| FDIST       | F.DIST.RT                | Y   | -  |
| FINV        | F.INV.RT                 | Y   | -  |
| GAMMADIST   | GAMMA.DIST               | Y   | -  |
| GAMMAINV    | GAMMA.INV                | Y   | -  |
| GAMMALN     | -                        | Y   | -  |
| GEOMEAN     | -                        | Y   | -  |
| HARMEAN     | -                        | Y   | -  |
| HYPGEOMDIST | HYPGEOM.DIST             | Y   | -  |
| KURT        | -                        | Y   | -  |
| LARGE       | -                        | Y   | Y  |
| MAX         | -                        | Y   | Y  |
| MAXA        | -                        | Y   | Y  |
| MEDIAN      | -                        | Y   | Y  |
| MIN         | -                        | Y   | Y  |
| MINA        | -                        | Y   | Y  |
| MODE        | MODE.SNGL                | Y   | Y  |
| NEGBINOMDIST | NEGBINOM.DIST           | Y   | -  |
| NORMDIST    | NORM.DIST                | Y   | -  |
| NORMINV     | NORM.INV                 | Y   | -  |
| NORMSDIST   | NORM.S.DIST              | Y   | -  |
| NORMSINV    | NORM.S.INV               | Y   | -  |
| LOGNORMDIST | LOGNORM.DIST             | Y   | -  |
| LOGINV      | LOGNORM.INV              | Y   | Y  |
| POISSON     | POISSON.DIST             | Y   | Y  |
| RANK        | RANK.EQ                  | Y   | Y  |
| SKEW        | -                        | Y   | -  |
| SLOPE       | -                        | Y   | -  |
| SMALL       | -                        | Y   | Y  |
| STDEV       | STDE.V                   | Y   | Y  |
| -           | T.DIST.2T                | Y   | -  |
| TDIST       | T.DIST.RT                | Y   | -  |
| TINV        | T.INV.2T                 | Y   | -  |
| VAR         | VAR.S                    | Y   | Y  |
| VARP        | VAR.P                    | Y   | Y  |
| WEIBULL     | WEIBULL.DIST             | Y   | -  |

* Note: Keikai supports both function names [listed here](https://support.office.com/en-us/article/What-s-New-Changes-made-to-Excel-functions-355d08c8-8358-4ecb-b6eb-e2e443e98aac?ui=en-US&rs=en-US&ad=US&fromAR=1#bm2).
* `COUNTIFS` is available {% include version-badge.html version='5.12.0' %}

# Text (23)

| Function     | OSE | EE |
|--------------|-----|----|
| CHAR         |  Y  |  Y |
| CLEAN        |  Y  |  Y |
| CODE         |     |  Y |
| CONCATENATE  |  Y  |  Y |
| DOLLAR       |  Y  |  Y |
| EXACT        |  Y  |  Y |
| FIND         |  Y  |  Y |
| FIXED        |     |  Y |
| LEFT         |  Y  |  Y |
| LEN          |  Y  |  Y |
| LOWER        |  Y  |  Y |
| MID          |  Y  |  Y |
| PROPER       |     |  Y |
| REPLACE      |  Y  |  Y |
| REPT         |     |  Y |
| RIGHT        |  Y  |  Y |
| SEARCH       |  Y  |  Y |
| SUBSTITUTE   |  Y  |  Y |
| T            |  Y  |  Y |
| TEXT         |  Y  |  Y |
| TRIM         |  Y  |  Y |
| UPPER        |  Y  |  Y |
| VALUE        |  Y  |  Y |


# Unsupported Functions

Keikai doesn't support Cube, Database, Web functions and formulas that generate Arrays of results.

# Locale Support
* Keikai supports 2 separator: comma `,` and semi-color `;` depeneding on the locale.
* You can only use a function in English.


# Relative Position Evaluation

When evaluating a row area (e.g. `A1:B1`) or column area (e.g. `A1:A2`), keikai will select a single cell from an area depending on the coordinates of the calling cell.  Here is an example demonstrating both selection from a single row area and a single column area in the same formula.

<table border="1" cellpadding="1" cellspacing="1" >
    <tr><th>&nbsp;</th><th>&nbsp;A&nbsp;</th><th>&nbsp;B&nbsp;</th><th>&nbsp;C&nbsp;</th><th>&nbsp;D&nbsp;</th></tr>
    <tr><th>1</th><td>15</td><td>20</td><td>25</td><td>&nbsp;</td></tr>
    <tr><th>2</th><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>200</td></tr>
    <tr><th>3</th><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>300</td></tr>
    <tr><th>4</th><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>400</td></tr>
</table>

If the formula `=1000+A1:B1+D2:D3` is put into the 9 cells from A2 to C4, the spreadsheet
will look like this:

<table border="1" cellpadding="1" cellspacing="1" >
    <tr><th>&nbsp;</th><th>&nbsp;A&nbsp;</th><th>&nbsp;B&nbsp;</th><th>&nbsp;C&nbsp;</th><th>&nbsp;D&nbsp;</th></tr>
    <tr><th>1</th><td>15</td><td>20</td><td>25</td><td>&nbsp;</td></tr>
    <tr><th>2</th><td>1215</td><td>1220</td><td>#VALUE!</td><td>200</td></tr>
    <tr><th>3</th><td>1315</td><td>1320</td><td>#VALUE!</td><td>300</td></tr>
    <tr><th>4</th><td>#VALUE!</td><td>#VALUE!</td><td>#VALUE!</td><td>400</td></tr>
</table>

Note that the row area (A1:B1) does not include column C and the column area (D2:D3) does
not include row 4, so the values in C1(=25) and D4(=400) are not accessible to the formula
as written, but in the 4 cells A2:B3, the row and column selection works ok.

The same concept is extended to references across sheets, such that even multi-row, multi-column areas can be useful.