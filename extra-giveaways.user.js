// ==UserScript==
// @name         Giveaway Auto Enter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically enter giveaways on extrasforamazon.com
// @author       sacrosaunt
// @match        https://extrasforamazon.com/app/giveaways*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /**
     * Creates and injects the auto-enter button into the navigation bar
     * This function handles the UI setup for the giveaway automation tool
     */
    function createButton() {
        // Check if button already exists to avoid duplicates
        let existingButton = document.getElementById('giveaway-auto-enter-btn');
        if (existingButton) {
            // Re-attach event listener if button exists
            existingButton.removeEventListener('click', autoEnterGiveaways);
            existingButton.addEventListener('click', autoEnterGiveaways);
            return;
        }

        // Find the navigation container on the right side of the page
        // Try multiple selectors for compatibility across different page layouts
        const navRightContainer = document.querySelector('.nav_top_inner-wrap-right') || 
                                  document.querySelector('.nav_top-content > div:last-child');
        
        // If navigation container not found, retry after a delay
        // This handles cases where the page is still loading
        if (!navRightContainer) {
            setTimeout(createButton, 1000);
            return;
        }

        // Create the auto-enter button element
        const button = document.createElement('button');
        button.id = 'giveaway-auto-enter-btn';
        button.className = 'themeButton primaryLinkButton';
        button.title = 'Enter All Giveaways';
        
        // Apply custom styling to match the site's design
        button.style.cssText = `
            color: rgb(34, 51, 68);
            border: none;
            background: transparent;
            padding: 12px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 18px;
            margin-right: 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Add gift icon to the button
        button.innerHTML = '<i class="fal fa-gift" style="font-size: 2.8rem;"></i>';
        
        // Add hover effects for better user experience
        button.addEventListener('mouseenter', () => {
            button.style.opacity = '0.8';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.opacity = '1';
        });
        
        // Attach click handler to trigger the giveaway automation
        button.addEventListener('click', autoEnterGiveaways);
        
        // Insert button at the beginning of the navigation container
        navRightContainer.insertBefore(button, navRightContainer.firstChild);
    }

    /**
     * Main function that automates entering all eligible giveaways
     * This is the core functionality that processes giveaways one by one
     */
    function autoEnterGiveaways() {
        /**
         * Creates a toast notification system for user feedback
         * Shows success, info, and error messages during the automation process
         * @returns {Object} Toast system with show method
         */
        function createToastSystem() {
            // Check if toast container already exists
            let toastContainer = document.getElementById('giveaway-extension-toasts');
            if (!toastContainer) {
                // Create toast container for notifications
                toastContainer = document.createElement('div');
                toastContainer.id = 'giveaway-extension-toasts';
                toastContainer.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 10px;
                `;
                document.body.appendChild(toastContainer);
            }
            
            // Add CSS styles for toast notifications
            const style = document.createElement('style');
            style.textContent = `
                .giveaway-toast {
                    background-color: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 4px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    max-width: 300px;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.3s, transform 0.3s;
                }
                .giveaway-toast.show {
                    opacity: 1;
                    transform: translateY(0);
                }
                .giveaway-toast.success {
                    border-left: 4px solid #4CAF50;
                }
                .giveaway-toast.info {
                    border-left: 4px solid #2196F3;
                }
                .giveaway-toast.error {
                    border-left: 4px solid #F44336;
                }
            `;
            document.head.appendChild(style);
            
            // Return toast system with show method
            return {
                show: function(message, type = 'info', duration = 3000) {
                    const toast = document.createElement('div');
                    toast.className = `giveaway-toast ${type}`;
                    toast.textContent = message;
                    
                    toastContainer.appendChild(toast);
                    
                    // Animate toast in
                    setTimeout(() => toast.classList.add('show'), 10);
                    
                    // Auto-remove toast after duration
                    setTimeout(() => {
                        toast.classList.remove('show');
                        setTimeout(() => toastContainer.removeChild(toast), 300);
                    }, duration);
                    
                }
            };
        }
        
        /**
         * Waits for an element to appear in the DOM
         * Uses MutationObserver for efficient element detection
         * @param {string} selector - CSS selector for the target element
         * @param {number} timeout - Maximum time to wait in milliseconds
         * @returns {Promise<Element>} Promise that resolves with the found element
         */
        function waitForElement(selector, timeout = 10000) {
            return new Promise((resolve, reject) => {
                // Check if element already exists
                const element = document.querySelector(selector);
                if (element) {
                    return resolve(element);
                }
                
                // Set up observer to watch for DOM changes
                const observer = new MutationObserver((mutations, obs) => {
                    const element = document.querySelector(selector);
                    if (element) {
                        obs.disconnect();
                        resolve(element);
                    }
                });
                
                // Start observing DOM changes
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });
                
                // Set timeout to prevent infinite waiting
                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Timeout waiting for ${selector}`));
                }, timeout);
            });
        }
        
        /**
         * Waits for the page to fully load
         * @returns {Promise} Promise that resolves when page is loaded
         */
        function waitForPageLoad() {
            return new Promise(resolve => {
                if (document.readyState === 'complete') {
                    return resolve();
                }
                
                window.addEventListener('load', resolve, { once: true });
            });
        }
        
        /**
         * Waits for the DOM to become stable (no more rapid changes)
         * This prevents issues with elements being modified while we're trying to interact with them
         * @param {number} timeoutMs - Time to wait for stability in milliseconds
         * @returns {Promise} Promise that resolves when DOM is stable
         */
        function waitForDomStable(timeoutMs = 100) {
            return new Promise(resolve => {
                let timeout;
                
                // Watch for DOM mutations and reset timer
                const observer = new MutationObserver(() => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        observer.disconnect();
                        resolve();
                    }, timeoutMs);
                });
                
                // Start observing DOM changes
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });
                
                // Fallback timeout if no mutations occur
                timeout = setTimeout(() => {
                    observer.disconnect();
                    resolve();
                }, timeoutMs);
            });
        }
        
        /**
         * Main processing loop that enters giveaways one by one
         * Handles the entire workflow from finding eligible giveaways to completing entries
         */
        async function processGiveaways() {
            const toast = createToastSystem();

            // Show initial status message
            toast.show('Starting...', 'info', 2000);
            
            let continueProcessing = true;
            
            // Main processing loop
            while (continueProcessing) {
                // Wait for page to be ready before processing
                await waitForPageLoad();
                await waitForDomStable();
                
                // Find all eligible giveaways (those that can be entered)
                const eligibleGiveaways = document.querySelectorAll('button.giveaway-tile.eligible');
                
                // If no eligible giveaways found, we're done
                if (eligibleGiveaways.length === 0) {
                    toast.show('All giveaways have been entered!', 'success', 5000);
                    continueProcessing = false;
                    break;
                }
                
                try {
                    // Process the first eligible giveaway
                    const giveaway = eligibleGiveaways[0];
                    
                    // Extract giveaway name for user feedback
                    const nameElement = giveaway.querySelector('.giveaway-tile_name');
                    const giveawayName = nameElement?.textContent?.trim() || "giveaway";
                    
                    // Click on the giveaway to open it
                    giveaway.click();
                    
                    // Wait for and click the enter button
                    const enterButton = await waitForElement('div.giveaway-enter-form button[type="submit"]');
                    
                    // Small delay to ensure form is ready
                    await new Promise(r => setTimeout(r, 100));
                    
                    enterButton.click();
                    toast.show(`Successfully entered ${giveawayName}!`, 'success');
                    
                    // Wait for DOM to stabilize after entry
                    await waitForDomStable();
                    
                    // Find and click back button to return to giveaway list
                    const backButton = await waitForElement('div.giveaway-overlay_header button');
                    backButton.click();
                    
                    // Wait for page to stabilize before continuing
                    await waitForDomStable();
                    
                } catch (error) {
                    // Handle errors during giveaway processing
                    toast.show(`Error: ${error.message}`, 'error', 5000);
                    
                    // Try to recover by clicking back button if possible
                    try {
                        const backButton = document.querySelector('div.giveaway-overlay_header button');
                        if (backButton) backButton.click();
                        await waitForDomStable();
                    } catch (e) {
                        toast.show("Couldn't find back button, trying to continue...", 'info');
                    }
                    
                    // Implement retry logic (one retry)
                    if (continueProcessing === true) {
                        continueProcessing = "last_try";
                        toast.show("Encountered an error, will try once more", 'info');
                    } else {
                        continueProcessing = false;
                        toast.show("Too many errors, stopping process", 'error', 5000);
                    }
                }
            }
        }
        
        // Start the giveaway processing
        processGiveaways();
    }

    // Initialize the button when the page is ready
    // Handle both cases: page still loading vs already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createButton);
    } else {
        createButton();
    }

})();
