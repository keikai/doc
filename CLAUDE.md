# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the documentation website for Keikai, a web-based spreadsheet component. The site is built using Jekyll with the "Minimal Mistakes" theme and hosted on GitHub Pages. It contains comprehensive documentation for developers using Keikai in various frameworks (JSP, ZK, JSF).

## Development Commands

### Local Development
- **Install dependencies**: `bundle install`
- **Start local development server**: `./preview.sh` (runs `bundle exec jekyll serve --config _config.yml`)
- **Build site**: Jekyll automatically builds to `_site/` directory

### PDF Generation
- **Generate single PDF**: `./topdf2.sh` (requires local Jekyll server running on port 4000)
- **Generate multiple PDFs**: `./topdf.sh` (uses `test_list.txt` for URL list)
- **Python PDF generator**: `python3 produce_pdf.py` (uses WeasyPrint, generates timestamped PDFs)

## Site Architecture

### Content Structure
- **`/tutorial/`** - Spreadsheet tutorial content (3 main pages)
- **`/dev-ref/`** - Developer reference documentation (70+ pages organized in categories)
  - `handling_events/` - Event handling documentation
  - `book_model/` - Spreadsheet model manipulation
  - `adv/` - Advanced features and customization
  - `jsp/`, `jsf/` - Framework-specific guides
- **`/doc/`** - Keikai-related pages and components

### Navigation and Configuration
- Navigation structure defined in `_data/navigation.yml`
- Site configuration in `_config.yml` uses remote theme `keikai/minimal-mistakes@keikai`
- Default page layout includes TOC, comments, and sharing enabled
- Sidebar navigation automatically applied based on path (`dev-ref` or `tutorial`)

### Theme and Styling
- Uses customized Minimal Mistakes theme hosted at `keikai/minimal-mistakes@keikai`
- Custom skin: "dirt"
- Google Analytics and search integration configured
- PDF-specific styling in `pdf.css`

### Build Process
- Jekyll builds static site to `_site/`
- Remote theme plugin pulls theme from GitHub
- Includes pagination and cache plugins for performance
- Generated HTML files are used by PDF generation scripts

## Key Files
- **`_config.yml`** - Main Jekyll configuration
- **`_data/navigation.yml`** - Site navigation structure
- **`preview.sh`** - Local development server script
- **`produce_pdf.py`** - WeasyPrint-based PDF generation
- **`pdf.css`** - PDF-specific styling

## PDF Workflow
The site supports generating PDFs of documentation pages using multiple approaches:
1. Python/WeasyPrint for high-quality PDFs with custom styling
2. wkhtmltopdf for batch processing of URL lists
3. Individual page PDFs that can be merged into combined documents