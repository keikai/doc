# Keikai Document Website

> Website: https://keikai.io  
> Demo: https://keikai.io/demo  
> Blog: https://keikai.io/blog

# Document Folder Structure
* `tutorial`: Spreadsheet Tutorial
* `dev-ref`: Spreadsheet Developer Reference
* `doc`: Keikai Doc related pages

# Preview at Local
1. install necessary gem:

`bundle install`

2. start a local web server:

`preview.sh`


Ref: [Setting up your GitHub Pages site locally with Jekyll](https://help.github.com/en/articles/setting-up-your-github-pages-site-locally-with-jekyll)


# Base Theme: [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/)
from: https://jekyllthemes.io/

# Font source
[Google font](https://fonts.google.com)

# Apply Jekyll Remote Theme

Jekyll plugin for building Jekyll sites with any public GitHub-hosted theme


## Usage

1. Add the following to your Gemfile

  ```ruby
  gem "jekyll-remote-theme"
  ```

  and run `bundle install` to install the plugin

2. Add the following to your site's `_config.yml` to activate the plugin

  ```yml
  plugins:
    - jekyll-remote-theme
  ```
  Note: If you are using a Jekyll version less than 3.5.0, use the `gems` key instead of `plugins`.

3. Add the following to your site's `_config.yml` to choose your theme

  ```yml
  remote_theme: benbalter/retlab
  ```

## Declaring your theme

Remote themes are specified by the `remote_theme` key in the site's config.

Remote themes must be in the form of `OWNER/REPOSITORY`, and must represent a public GitHub-hosted Jekyll theme. See [the Jekyll documentation](https://jekyllrb.com/docs/themes/) for more information on authoring a theme. Note that you do not need to upload the gem to RubyGems or include a `.gemspec` file.

You may also optionally specify a branch, tag, or commit to use by appending an `@` and the Git ref (e.g., `benbalter/retlab@v1.0.0` or `benbalter/retlab@develop`). If you don't specify a Git ref, the `master` branch will be used.


* from: https://github.com/benbalter/jekyll-remote-theme

# search engine
https://programmablesearchengine.google.com/controlpanel/all

## Axyra Java / .NET documentation

Java pages live under `axyra/sheets/java/`; .NET pages live under `axyra/sheets/dotnet/`, with
separate masthead/sidebar navigation. Both use the sibling examples repository:
Java sources are under `axyra-sheets-examples/java/` and C# sources under
`axyra-sheets-examples/dotnet/`. Maintain page-to-source mappings in
`_data/axyra_code_links.yml`; language-specific URLs are configured in `_config.yml`.

The implementation repository's .NET API guides are in
`../axyra-sheets/docs/dotnet-api/`. Website pages should use the matching released
package behavior; the current evaluation package has known differences from newer SDK source.

Build the skill downloads from their canonical source directories:

```sh
python3 scripts/package-axyra-skill.py
python3 scripts/package-axyra-skill.py --skill axyra-sheets-dotnet
```

Add `--check` to verify that an archive matches its source. Standalone Java guide
downloads are built by `scripts/package-axyra-guide-examples.py`, which reads
`../axyra-sheets-examples/java/guide-projects/`.

The local `../axyra-dotnet-tests` workspace retains snippet verification tools;
its examples, website content and .NET skill paths link to these canonical repositories.


