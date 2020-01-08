---
title: 'Supported Data Format'
---
# Built-in Format

<table>
<tbody>
<tr class="odd">
<td><p><b>Category</b></p></td>
<td><p><b>Format Pattern</b></p></td>
<td><p><b>Input</b></p></td>
<td><p><b>Result</b></p></td>
</tr>
<tr class="even">
<td><p><b>Number</b></p></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="odd">
<td><p>-1234.10</p></td>
<td><p>0.00</p></td>
<td><p>12345</p></td>
<td><p>12345.00</p></td>
</tr>
<tr class="even">
<td><p>1234.10</p></td>
<td><p>0.00;[Red]0.00</p></td>
<td><p>-12345</p></td>
<td><div style="color:red">
<p>12345.00</p>
</div></td>
</tr>
<tr class="odd">
<td><p>(1234.10)</p></td>
<td><p>0.00_);(0.00)</p></td>
<td><p>12345</p></td>
<td><p>12345.00</p></td>
</tr>
<tr class="even">
<td></td>
<td></td>
<td><p>-12345</p></td>
<td><p>(12345.00)</p></td>
</tr>
<tr class="odd">
<td><p>(1234.10)</p></td>
<td><p>0.00_);[Red](0.00)</p></td>
<td><p>12345</p></td>
<td><p>12345.00</p></td>
</tr>
<tr class="even">
<td></td>
<td></td>
<td><p>-12345</p></td>
<td><div style="color:red">
<p>(12345.00)</p>
</div></td>
</tr>
<tr class="odd">
<td><p><b>Currency</b></p></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><p>-$1,234.10</p></td>
<td><p>$#,##0.00</p></td>
<td><p>12345</p></td>
<td><p>$12,345.00</p></td>
</tr>
<tr class="odd">
<td><p>$1,234.10</p></td>
<td><p>$#,##0.00;[Red]$#,##0.0</p></td>
<td><p>12345</p></td>
<td><p>$12,345.00</p></td>
</tr>
<tr class="even">
<td></td>
<td></td>
<td><p>-12345</p></td>
<td><div style="color:red">
<p>$12,345.0</p>
</div></td>
</tr>
<tr class="odd">
<td><p>($1,234.10)</p></td>
<td><p>$#,##0.00_);($#,##0.00)</p></td>
<td><p>12345</p></td>
<td><p>$12,345.00</p></td>
</tr>
<tr class="even">
<td></td>
<td></td>
<td></td>
<td><p>($12,345.00)</p></td>
</tr>
<tr class="odd">
<td><p>($1,234.10)</p></td>
<td><p>$#,##0.00_);[Red]($#,##0.00)</p></td>
<td><p>12345</p></td>
<td><p>$12,345.00</p></td>
</tr>
<tr class="even">
<td></td>
<td></td>
<td><p>-12345</p></td>
<td><div style="color:red">
<p>($12,345.00)</p>
</div></td>
</tr>
<tr class="odd">
<td><p><b>Accounting</b></p></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><p>$1,234</p></td>
<td><p>_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)</p></td>
<td><p>12345</p></td>
<td><p>$12,345.00</p></td>
</tr>
<tr class="odd">
<td></td>
<td></td>
<td><p>-12345</p></td>
<td><p>$ (12,345.00)</p></td>
</tr>
<tr class="even">
<td></td>
<td></td>
<td><p>0</p></td>
<td><p>$-</p></td>
</tr>
<tr class="odd">
<td></td>
<td></td>
<td><p>Text</p></td>
<td><p>Text</p></td>
</tr>
<tr class="even">
<td><p><b>Date</b></p></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="odd">
<td><p>*3/14/2001</p></td>
<td><p>yyyy/m/d</p></td>
<td><p>2013/11/8</p></td>
<td><p>2013/11/8</p></td>
</tr>
<tr class="even">
<td><p>3/14/01</p></td>
<td><p>m/d/yy;@</p></td>
<td></td>
<td><p>11/8/13</p></td>
</tr>
<tr class="odd">
<td><p>03/14/01</p></td>
<td><p>mm/dd/yy;@</p></td>
<td></td>
<td><p>11/08/13</p></td>
</tr>
<tr class="even">
<td><p>14-Mar-2001</p></td>
<td><p>d-mmm-yyyy;@</p></td>
<td></td>
<td><p>8-Oct-2013</p></td>
</tr>
<tr class="odd">
<td><p>4-Mar-01</p></td>
<td><p>d-mmm-yy;@</p></td>
<td></td>
<td><p>8-Oct-13</p></td>
</tr>
<tr class="even">
<td><p>04-Mar-01</p></td>
<td><p>dd-mmm-yy;@</p></td>
<td></td>
<td><p>08-Oct-13</p></td>
</tr>
<tr class="odd">
<td><p>3/14</p></td>
<td><p>m/d;@</p></td>
<td></td>
<td><p>11/8</p></td>
</tr>
<tr class="even">
<td><p>14-Mar</p></td>
<td><p>d-mmm;@</p></td>
<td></td>
<td><p>8-Oct</p></td>
</tr>
<tr class="odd">
<td><p>Mar-01</p></td>
<td><p>mmm-yy;@</p></td>
<td></td>
<td><p>Oct-13</p></td>
</tr>
<tr class="even">
<td><p>March-01</p></td>
<td><p>mmmm-yy;@</p></td>
<td></td>
<td><p>October-13</p></td>
</tr>
<tr class="odd">
<td><p>3/14/01 13:30</p></td>
<td><p>m/d/yy h:mm;@</p></td>
<td></td>
<td><p>11/8/13 10:55</p></td>
</tr>
<tr class="even">
<td><p>3/14/01 1:30 PM</p></td>
<td><p>m/d/yy h:mm AM/PM;@</p></td>
<td></td>
<td><p>11/8/13 10:55 AM</p></td>
</tr>
<tr class="odd">
<td><p><b>Time</b></p></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><p>*1:30:55 PM</p></td>
<td><p>AM/PM hh:mm:ss</p></td>
<td><p>10:55:30</p></td>
<td><p>AM 10:55:30</p></td>
</tr>
<tr class="odd">
<td><p>13:30</p></td>
<td><p>h:mm;@</p></td>
<td></td>
<td><p>10:55</p></td>
</tr>
<tr class="even">
<td><p>1:30 PM</p></td>
<td><p>h:mm AM/PM;@</p></td>
<td></td>
<td><p>10:55 AM</p></td>
</tr>
<tr class="odd">
<td><p>13:30:55</p></td>
<td><p>h:mm:ss;@</p></td>
<td></td>
<td><p>10:55:30</p></td>
</tr>
<tr class="even">
<td><p>1:30:55 PM</p></td>
<td><p>h:mm:ss AM/PM;@</p></td>
<td></td>
<td><p>10:55:30 AM</p></td>
</tr>
<tr class="odd">
<td><p>30:55.2</p></td>
<td><p>mm:ss.0;@</p></td>
<td></td>
<td><p>55:30.0</p></td>
</tr>
<tr class="even">
<td><p>37:30:55</p></td>
<td><p>[h]:mm:ss;@</p></td>
<td></td>
<td><p>998074:55:30</p></td>
</tr>
<tr class="odd">
<td><p>*3/14/01 1:30 PM</p></td>
<td><p>m/d/yy h:mm AM/PM;@</p></td>
<td></td>
<td><p>11/8/13 10:55 AM</p></td>
</tr>
<tr class="even">
<td><p>*3/14/01 13:30</p></td>
<td><p>m/d/yy h:mm;@</p></td>
<td></td>
<td><p>11/8/13 10:55</p></td>
</tr>
<tr class="odd">
<td><p><b>Percentage</b></p></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><p>percentage</p></td>
<td><p>0.00%</p></td>
<td><p>0.95</p></td>
<td><p>95.00%</p></td>
</tr>
<tr class="odd">
<td><p><b>Fraction</b></p></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><p>Up to one digit</p></td>
<td><p># ?/?</p></td>
<td><p>0.25</p></td>
<td><p>1/4</p></td>
</tr>
<tr class="odd">
<td><p>Up to two digits</p></td>
<td><p># ??/??</p></td>
<td><p>0.84</p></td>
<td><p>21/25</p></td>
</tr>
<tr class="even">
<td><p>Up to three digits</p></td>
<td><p># ???/???</p></td>
<td><p>0.33085896</p></td>
<td><p>312/943</p></td>
</tr>
<tr class="odd">
<td><p>As halves</p></td>
<td><p># ?/2</p></td>
<td><p>0.5</p></td>
<td><p>1/2</p></td>
</tr>
<tr class="even">
<td><p>As quarters</p></td>
<td><p># ?/4</p></td>
<td><p>0.5</p></td>
<td><p>2/4</p></td>
</tr>
<tr class="odd">
<td><p>As eighths</p></td>
<td><p># ?/8</p></td>
<td><p>0.5</p></td>
<td><p>4/8</p></td>
</tr>
<tr class="even">
<td><p>As sixteens</p></td>
<td><p># ??/16</p></td>
<td><p>0.3</p></td>
<td><p>8/16</p></td>
</tr>
<tr class="odd">
<td><p>As tenths</p></td>
<td><p># ?/10</p></td>
<td><p>0.3</p></td>
<td><p>3/10</p></td>
</tr>
<tr class="even">
<td><p>As hundredths</p></td>
<td><p># ??/100</p></td>
<td><p>0.25</p></td>
<td><p>30/100</p></td>
</tr>
<tr class="odd">
<td><p><b>Scientific</b></p></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><p>scientific</p></td>
<td><p>0.00E+00</p></td>
<td><p>12345</p></td>
<td><p>1.23E+04</p></td>
</tr>
<tr class="odd">
<td><p><b>Text</b></p></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><p>text</p></td>
<td><p>@</p></td>
<td><p>text</p></td>
<td><p>text</p></td>
</tr>
<tr class="odd">
<td><p><b>Special</b></p></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><p>Zip Code</p></td>
<td><p>00000</p></td>
<td><p>12345</p></td>
<td><p>12345</p></td>
</tr>
<tr class="odd">
<td><p>Zip Code + 4</p></td>
<td><p>00000-0000</p></td>
<td><p>123451234</p></td>
<td><p>12345-1234</p></td>
</tr>
<tr class="even">
<td><p>Phone Number</p></td>
<td><p>[&lt;=9999999]###-####;(###)###-####</p></td>
<td><p>0123456</p></td>
<td><p>012-3456</p></td>
</tr>
<tr class="odd">
<td><p>Social Security Number</p></td>
<td><p>000-00-0000</p></td>
<td><p>123456789</p></td>
<td><p>123-45-6789</p></td>
</tr>
</tbody>
</table>

# Syntax for Custom Number Format

To create a custom number format, you can start based on one of the built-in
number formats and customize on top of it.

A number format can have up to 2 sections, separated by semicolons.
These symbol sections define the format for positive numbers (including
zero) and negative numbers respectively.

`POSITIVE;NEGATIVE`

For example, you can create the following custom format:

`[Blue]#,##0.00_);[Red](#,##0.00)`

You do not have to include all symbol sections in your custom number
format. If you specify only one code section, it will be applied to all
numbers.

## Including Text in custom Number format

To display both text and numbers in a cell, enclose the text characters
in double quotes (" "). For example, input the format $0.00"
Surplus";$-0.00" Shortage" to display a positive amount as "$125.74
Surplus" and a negative amount as "$-125.74 Shortage." Note that there
is one space character before both "Surplus" and "Shortage" in each
symbol section.

## For using decimal places, spaces, colors, and conditions

### Include decimal places and significant digits

To format fractions or numbers that contain decimal points, include the
following digit placeholders, decimal points, and thousand separators in
a section.

|            |                                                                                                                                                                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 (zero)   | This digit placeholder displays insignificant zeros if a number has fewer digits than there are zeros in the format. For example, if you type 8.9, and you want it to be displayed as 8.90, use the format \#.00.                                                                                                                           |
| \#         | This digit placeholder follows the same rules as 0 (zero). However, Spreadsheet does not display extra zeros when the number that you type has fewer digits on either side of the decimal than there are \# symbols in the format. For example, if the custom format is \#.\#\#, and you type 8.9 in the cell, the number 8.9 is displayed. |
| ?          | This digit placeholder follows the same rules as 0 (zero). However, Spreadsheet adds a space for insignificant zeros on either side of the decimal point so that decimal points are aligned in the column. For example, the custom format 0.0? aligns the decimal points for the numbers 8.9 and 88.99 in a column.                         |
| . (period) | This digit placeholder displays the decimal point in a number.                                                                                                                                                                                                                                                                              |

### Display a thousands separator

To display a comma as a thousands separator or to scale a number by a
multiple of 1,000, include the following separator in the number format.

|           |                                                                                                                                                                                                                                                                                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| , (comma) | Displays the thousands separator in a number. Spreadsheet separates thousands by commas if the format contains a comma that is enclosed by number signs (\#) or by zeros. A comma that follows a digit placeholder scales the number by 1,000. For example, if the format is `#.0,`, and you type 12,200,000 in the cell, the number 12.200.0 is displayed. |

### Specify colors

To specify the color of a section of the format, type the name of one of
the following eight colors enclosed in square brackets in the section.
The color code must be the first item in the section.

|            |
| ---------- |
| \[Black\]  |
| \[Green\]  |
| \[White\]  |
| \[Blue\]   |
| \[Yellow\] |
| \[Red\]    |

### Specify Conditions

To define number formats that will be applied only if a number meets a
condition that you specify, enclose the condition in square brackets.
The condition consists of a comparison operator and a value. For
example, the following format displays numbers that are less than or
equal to 100 in a red font and numbers that are greater than 100 in a
blue font.

`[Red][<=100];[Blue][>100]`

## For percentages and scientific notation format

### Display percentages

To display numbers as a percentage of 100 — for example, to display .08
as 8% or 2.8 as 280% — include the percent sign (%) in the number
format.

### Display scientific notations

To display numbers in scientific (exponential) format, use the following
exponent codes in a section.

|   |                                                                                                                                                                                                                                                    |
| - | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E | Displays a number in scientific (exponential) format. For example, if the format is 0.00E+00, and you type 12,200,000 in the cell, the number 1.22E+07 is displayed. If you change the number format to \#0.0E+0, the number 12.2E+6 is displayed. |

## Syntax for Custom Date and Time Formats

### Display days, months, and years

To display numbers as date formats (such as days, months, and years),
use the following symbols in a section.

|      |                                                                 |
| ---- | --------------------------------------------------------------- |
| m    | Displays month as a number without a leading zero               |
| mm   | Displays month as a number with a leading zero when appropriate |
| mmm  | Displays month as an abbreviation (Jan to Dec).                 |
| mmmm | Displays the month as a full name (January to December).        |
| d    | Displays day as a number without a leading zero.                |
| dd   | Displays day as a number with a leading zero when appropriate.  |
| ddd  | Displays day as an abbreviation (Sun to Sat).                   |
| dddd | Displays day as a full name (Sunday to Saturday).               |
| yy   | Displays year as a two-digit number.                            |
| yyyy | Displays year as a four-digit number.                           |

### Display hours, minutes, and seconds

To display time formats (such as hours, minutes, and seconds), use the
following symbol in a section.

|                        |                                                                                                                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| h                      | Displays hour as a number without a leading zero.                                                                                                                                                                      |
| \[h\]                  | Displays elapsed time in hours. If you write a formula that returns a time in which the number of hours exceeds 24, use a number format like \[h\]:mm:ss.                                                              |
| hh                     | Displays hour as a number with a leading zero when appropriate. If the format contains AM or PM, the hour is based on the 12-hour clock. Otherwise, the hour is based on the 24-hour clock.                            |
| m                      | Displays minute as a number without a leading zero. The m or mm must appear immediately after the h or hh or immediately before the ss; otherwise, Spreadsheet displays it as month instead of minutes.                |
| \[m\]                  | Displays elapsed time in minutes. If you write a formula that returns a the number of minutes exceeds 60, use a format like \[mm\]:ss.                                                                                 |
| mm                     | Displays minute as a number with a leading zero when appropriate. The m or mm must appear immediately after the h or hh or immediately before the ss ; otherwise, Spreadsheet displays it as month instead of minutes. |
| s                      | Displays second as a number without a leading zero.                                                                                                                                                                    |
| \[s\]                  | Displays elapsed time in seconds. If you write a formula that returns the number of seconds which exceeds 60, use a number format that resembles \[ss\].                                                               |
| ss                     | Displays second as a number with a leading zero when appropriate. If you want to display fractions of a second, use a format like h:mm:ss.00.                                                                          |
| AM/PM, am/pm, A/P, a/p | Displays hour using a 12-hour clock. Spreadsheet displays AM, am, or A, for times from midnight until noon and PM, pm or P for times from noon until midnight.                                                         |
