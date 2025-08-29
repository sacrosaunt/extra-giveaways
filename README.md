# Giveaway Auto Enter

A Tampermonkey userscript that automatically enters all giveaways on extrasforamazon.com.

## Features

- **One-Click Entry**: Adds a gift icon button to the navigation bar for easy access
- **Automatic Processing**: Sequentially enters all eligible giveaways on the current page
- **Real-time Feedback**: Toast notifications show progress and results
- **Non-intrusive**: Integrates seamlessly (and inconspicuously) with the existing site design

## Installation

### Option 1: Easy Installation via Greasy Fork (Recommended)
1. Click the [Install button on Greasy Fork](https://greasyfork.org/en/scripts/547667-giveaway-auto-enter)
2. Your userscript manager will automatically install the script
3. That's it! The script will work immediately on extrasforamazon.com

### Option 2: Manual Installation
**Prerequisites:**
You need a userscript manager browser extension:
- [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Safari, Edge)
- [Greasemonkey](https://www.greasespot.net/) (Firefox)
- [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)

**Install the Script:**
1. Install a userscript manager (Tampermonkey recommended)
2. Click on the userscript manager icon in your browser
3. Select "Create a new script" or "Add new script"
4. Copy and paste the contents of `extra-giveaways.user.js` into the editor
5. Save the script (Ctrl+S or Cmd+S)

## Usage

1. Navigate to [extrasforamazon.com/app/giveaways](https://extrasforamazon.com/app/giveaways)
2. Look for the gift icon (🎁) button to the right of the search bar
3. Click the gift icon to start automatically entering all eligible giveaways
4. Watch the toast notifications for progress updates
5. The script will stop when all giveaways have been entered

## Technical Details

- **Target Site**: `https://extrasforamazon.com/app/giveaways*`
- **Permissions**: No special permissions required (`@grant none`)
- **Execution**: Runs after page load (`@run-at document-end`)
- **DOM Manipulation**: Uses mutation observers for reliable element detection
- **Error Recovery**: Implements retry logic and graceful error handling
- **UI Integration**: Matches the site's existing button styling and layout

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The MIT License allows you to:
- Use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software
- Use the software for any purpose, including commercial use
- Modify the software and distribute modified versions
- The only requirement is that the original copyright notice and license must be included in all copies

For the full license text, see [LICENSE](LICENSE).

## Disclaimer

This script is for educational purposes. Use responsibly and in accordance with the website's terms of service. The author is not responsible for any consequences of using this script.