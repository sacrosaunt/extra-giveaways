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

    // Create the button in the upper right corner
    function createButton() {
        let existingButton = document.getElementById('giveaway-auto-enter-btn');
        if (existingButton) {
            existingButton.removeEventListener('click', autoEnterGiveaways);
            existingButton.addEventListener('click', autoEnterGiveaways);
            return;
        }

        const navRightContainer = document.querySelector('.nav_top_inner-wrap-right') || 
                                  document.querySelector('.nav_top-content > div:last-child');
        
        if (!navRightContainer) {
            setTimeout(createButton, 1000);
            return;
        }

        const button = document.createElement('button');
        button.id = 'giveaway-auto-enter-btn';
        button.className = 'themeButton primaryLinkButton';
        button.title = 'Enter All Giveaways';
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
        
        button.innerHTML = '<i class="fal fa-gift" style="font-size: 2.8rem;"></i>';
        
        // Add hover effects
        button.addEventListener('mouseenter', () => {
            button.style.opacity = '0.8';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.opacity = '1';
        });
        
        // Add click handler
        button.addEventListener('click', autoEnterGiveaways);
        
        navRightContainer.insertBefore(button, navRightContainer.firstChild);
    }

    function autoEnterGiveaways() {
        // Create toast notification system
        function createToastSystem() {
            // Create container for toasts if it doesn't exist
            let toastContainer = document.getElementById('giveaway-extension-toasts');
            if (!toastContainer) {
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
            
            // Add styles for toasts
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
            
            return {
                show: function(message, type = 'info', duration = 3000) {
                    // Create toast element
                    const toast = document.createElement('div');
                    toast.className = `giveaway-toast ${type}`;
                    toast.textContent = message;
                    
                    // Add to container
                    toastContainer.appendChild(toast);
                    
                    // Trigger animation
                    setTimeout(() => toast.classList.add('show'), 10);
                    
                    // Remove after duration
                    setTimeout(() => {
                        toast.classList.remove('show');
                        setTimeout(() => toastContainer.removeChild(toast), 300);
                    }, duration);
                    
                }
            };
        }
        
        // Function to wait for an element to appear
        function waitForElement(selector, timeout = 10000) {
            return new Promise((resolve, reject) => {
                // Check if element already exists
                const element = document.querySelector(selector);
                if (element) {
                    return resolve(element);
                }
                
                // Set up mutation observer to watch for the element
                const observer = new MutationObserver((mutations, obs) => {
                    const element = document.querySelector(selector);
                    if (element) {
                        obs.disconnect();
                        resolve(element);
                    }
                });
                
                // Start observing
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });
                
                // Set timeout as a fallback
                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Timeout waiting for ${selector}`));
                }, timeout);
            });
        }
        
        // Function to wait for page transitions
        function waitForPageLoad() {
            return new Promise(resolve => {
                // If document is already complete, resolve immediately
                if (document.readyState === 'complete') {
                    return resolve();
                }
                
                // Otherwise wait for load event
                window.addEventListener('load', resolve, { once: true });
            });
        }
        
        // Function to wait for DOM to stabilize (no changes for a period)
        function waitForDomStable(timeoutMs = 100) {
            return new Promise(resolve => {
                let timeout;
                
                const observer = new MutationObserver(() => {
                    // Reset the timeout on each mutation
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        observer.disconnect();
                        resolve();
                    }, timeoutMs);
                });
                
                // Start observing
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });
                
                // Initial timeout in case there are no mutations
                timeout = setTimeout(() => {
                    observer.disconnect();
                    resolve();
                }, timeoutMs);
            });
        }
        
        // Process all eligible giveaways
        async function processGiveaways() {
            // Initialize toast system
            const toast = createToastSystem();

            toast.show('Starting...', 'info', 2000);
            
            let continueProcessing = true;
            
            while (continueProcessing) {
                // Wait for the page to be fully loaded
                await waitForPageLoad();
                await waitForDomStable();
                
                // Find all eligible giveaways (refresh the list each time)
                const eligibleGiveaways = document.querySelectorAll('button.giveaway-tile.eligible');
                
                if (eligibleGiveaways.length === 0) {
                    toast.show('All giveaways have been entered!', 'success', 5000);
                    continueProcessing = false;
                    break;
                }
                
                try {
                    // Always process the first eligible giveaway in the list
                    const giveaway = eligibleGiveaways[0];
                    
                    const nameElement = giveaway.querySelector('.giveaway-tile_name');
                    const giveawayName = nameElement?.textContent?.trim() || "giveaway";
                    
                    // Click the giveaway tile to open it
                    giveaway.click();
                    
                    // Wait for the overlay to load and the enter button to appear
                    const enterButton = await waitForElement('div.giveaway-enter-form button[type="button"]');
                    
                    await new Promise(r => setTimeout(r, 100));
                    
                    enterButton.click();
                    toast.show(`Successfully entered ${giveawayName}!`, 'success');
                    
                    
                    // Wait for any confirmation or changes
                    await waitForDomStable();
                    
                    // Go back to the giveaways page
                    const backButton = await waitForElement('div.giveaway-overlay_header button');
                    backButton.click();
                    
                    // Wait for the main page to reload
                    await waitForDomStable();
                    
                } catch (error) {
                    toast.show(`Error: ${error.message}`, 'error', 5000);
                    
                    try {
                        const backButton = document.querySelector('div.giveaway-overlay_header button');
                        if (backButton) backButton.click();
                        await waitForDomStable();
                    } catch (e) {
                        toast.show("Couldn't find back button, trying to continue...", 'info');
                    }
                    
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
        
        // Start the process
        processGiveaways();
    }

    // Wait for the page to load before creating the button
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createButton);
    } else {
        createButton();
    }

})();
