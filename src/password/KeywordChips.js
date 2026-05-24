/**
 * KeywordChips Component
 * 
 * Advanced keyword management with drag & drop reordering, inline editing,
 * and comprehensive mobile touch support. Features smooth animations,
 * visual feedback, and optimized event handling for responsive UI.
 * 
 * @author NuwaX
 */
import { toast } from '../utils/toast.js';
import { t } from '../utils/i18n.js';

const escapeHtml = (str) => str
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

/**
 * KeywordChips Class
 * 
 * Comprehensive keyword chip management system:
 * - Dynamic keyword addition with comma-separated support
 * - Inline editing with save/cancel functionality
 * - Drag & drop reordering with touch support
 * - Visual masking and feedback systems
 * - Mobile-optimized touch interactions
 * - Smooth animations and transitions
 */
export class KeywordChips {
  /**
   * Initialize KeywordChips with configuration options
   * 
   * @param {Object} options - Configuration options
   * @param {boolean} options.maskKeywords - Whether to mask keyword display
   * @param {Function} options.onKeywordChange - Callback for keyword changes
   */
  constructor(options = {}) {
    this.keywords = [];
    this.maskKeywords = options.maskKeywords || false;
    this.editingIndex = -1;
    this.onKeywordChange = options.onKeywordChange || (() => {});
    
    this.draggedIndex = -1;
    this.draggedElement = null;
    this.dragStartTime = 0;
    this.dragThreshold = 5;
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.dropZone = null;
    this.placeholder = null;
    this.autoScrollTimer = null;
    this.currentScrollSpeed = 0;
    this.ghostElement = null;
    
    this.touchStart = null;
    this.isTouchDragging = false;
    this.touchMoved = false;
    this.touchThreshold = 8;
    this.touchDraggedIndex = -1;
    this.touchDraggedElement = null;
    this.touchMoveTimeout = null;
    this.touchClickTimeout = null;
    this.touchPreventClick = false;
    
    this.debugLogThrottle = false;
    this.lastDebugState = null;
    
    this.currentDropZoneElement = null;
    this.currentHoverElement = null;
    
    this.dragOverThrottle = false;
    this.hoverTimeout = null;
    this.leaveTimeout = null;
    
    this.isDropping = false;
  }

  /**
   * Render keyword chips HTML with conditional editing state
   * 
   * @returns {string} HTML string for keyword chips
   */
  renderKeywordChips() {
    if (this.keywords.length === 0) {
      return `<div class="text-gray-400 dark:text-gray-400 text-sm italic py-2">${t('password.generator.keywordInput.noKeywords')}</div>`;
    }

    return this.keywords.map((keyword, index) => {
      const safeKeyword = escapeHtml(keyword);
      const displayText = this.maskKeywords ? '*'.repeat(keyword.length) : safeKeyword;
      const isEditing = this.editingIndex === index;

      if (isEditing) {
        return `
          <div class="keyword-chip keyword-chip-editing inline-flex items-center bg-primary-50 dark:bg-gray-700/40 border border-primary-300 dark:border-gray-500/50 rounded-lg px-3 py-2 shadow-sm">
            <div class="flex items-center flex-1">
              <svg class="w-4 h-4 text-gray-400 dark:text-gray-300 mr-2 cursor-grab" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
              </svg>
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2 min-w-[14px] text-center">${index + 1}.</span>
              <input type="text"
                     data-edit-index="${index}"
                     value="${safeKeyword}"
                     class="bg-transparent border-none outline-none text-sm font-medium text-primary-700 dark:text-white flex-1 min-w-0"
                     autocomplete="off">
            </div>
            <div class="flex items-center">
              <button type="button" 
                      data-save-index="${index}"
                      class="w-5 h-5 flex items-center justify-center rounded text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-500/10 transition-all duration-200 cursor-pointer"
                      title="Save">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              <button type="button" 
                      data-cancel-edit="${index}"
                      class="ml-1 w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-200 dark:hover:bg-gray-600/30 transition-all duration-200 cursor-pointer"
                      title="Cancel">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        `;
      }

      return `
        <div class="keyword-chip inline-flex items-center bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-500/40 rounded-lg px-3 py-2 group hover:bg-gray-100 dark:hover:bg-gray-600/40 hover:border-gray-300 dark:hover:border-gray-400/50 transition-all duration-200 shadow-sm drop-zone"
             draggable="true" 
             data-keyword-index="${index}">
          <div class="flex items-center flex-1">
            <svg class="drag-handle w-4 h-4 text-gray-400 dark:text-gray-300 mr-2 cursor-grab" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
            </svg>
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2 min-w-[14px] text-center">${index + 1}.</span>
            <span class="keyword-display text-sm font-medium text-gray-700 dark:text-gray-100 select-none">${displayText}</span>
          </div>
          <div class="flex items-center">
            <button type="button" 
                    data-edit-keyword="${index}"
                    class="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-primary-500/10 transition-all duration-200 cursor-pointer"
                    title="Edit keyword">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button type="button" 
                    data-remove-keyword="${index}"
                    class="ml-1 w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
                    title="Remove keyword">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Update keyword chips display with full re-render
   * 
   * @param {Element} container - Container element for keyword chips
   * @param {boolean} shouldTriggerChange - Whether to trigger change callback
   */
  updateKeywordChips(container, shouldTriggerChange = true) {
    container.innerHTML = this.renderKeywordChips();
    
    container.offsetHeight;
    
    this.attachKeywordListeners(container);
    this.setupEnhancedDragDrop(container);
    
    if (shouldTriggerChange) {
      this.onKeywordChange(this.keywords);
    }
  }

  /**
   * Attach event listeners to keyword chip elements
   * 
   * @param {Element} container - Container element for keyword chips
   */
  attachKeywordListeners(container) {
    const editButtons = container.querySelectorAll('[data-edit-keyword]');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('[data-edit-keyword]').dataset.editKeyword);
        this.startEditingKeyword(index, container);
      });
    });

    const removeButtons = container.querySelectorAll('[data-remove-keyword]');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('[data-remove-keyword]').dataset.removeKeyword);
        this.removeKeyword(index, container);
      });
    });

    const saveButtons = container.querySelectorAll('[data-save-index]');
    saveButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('[data-save-index]').dataset.saveIndex);
        this.saveEditingKeyword(index, container);
      });
    });

    const cancelButtons = container.querySelectorAll('[data-cancel-edit]');
    cancelButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('[data-cancel-edit]').dataset.cancelEdit);
        this.cancelEditingKeyword(index, container);
      });
    });

    const editInputs = container.querySelectorAll('[data-edit-index]');
    editInputs.forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const index = parseInt(e.target.dataset.editIndex);
          this.saveEditingKeyword(index, container);
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const index = parseInt(e.target.dataset.editIndex);
          this.cancelEditingKeyword(index, container);
        }
      });

      input.focus();
      input.select();
    });
  }

  /**
   * Attach event listeners to a single keyword chip element
   * 
   * @param {Element} item - Individual keyword chip element
   */
  attachIndividualKeywordListeners(item) {
    const container = item.closest('#keywords-container') || item.closest('.keywords-container');
    if (!container) return;

    const editButton = item.querySelector('[data-edit-keyword]');
    if (editButton) {
      editButton.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('[data-edit-keyword]').dataset.editKeyword);
        this.startEditingKeyword(index, container);
      });
    }

    const removeButton = item.querySelector('[data-remove-keyword]');
    if (removeButton) {
      removeButton.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('[data-remove-keyword]').dataset.removeKeyword);
        this.removeKeyword(index, container);
      });
    }

    const saveButton = item.querySelector('[data-save-index]');
    if (saveButton) {
      saveButton.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('[data-save-index]').dataset.saveIndex);
        this.saveEditingKeyword(index, container);
      });
    }

    const cancelButton = item.querySelector('[data-cancel-edit]');
    if (cancelButton) {
      cancelButton.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('[data-cancel-edit]').dataset.cancelEdit);
        this.cancelEditingKeyword(index, container);
      });
    }

    const editInput = item.querySelector('[data-edit-index]');
    if (editInput) {
      editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const index = parseInt(e.target.dataset.editIndex);
          this.saveEditingKeyword(index, container);
        }
      });

      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const index = parseInt(e.target.dataset.editIndex);
          this.cancelEditingKeyword(index, container);
        }
      });

      editInput.focus();
      editInput.select();
    }
  }

  /**
   * Add new keyword with comma-separated support
   * 
   * @param {string} keyword - Keyword or comma-separated keywords to add
   * @param {Element} container - Container element for keyword chips
   * @returns {boolean} True if any keywords were added
   */
  addKeyword(keyword, container) {
    const trimmedInput = keyword.trim();
    if (!trimmedInput) return false;
    
    if (trimmedInput.includes(',')) {
      return this.addMultipleKeywords(trimmedInput, container);
    } else {
      return this.addSingleKeyword(trimmedInput, container);
    }
  }

  /**
   * Add multiple keywords from comma-separated input
   * 
   * @param {string} input - Comma-separated keywords
   * @param {Element} container - Container element for keyword chips
   * @returns {boolean} True if any keywords were added
   */
  addMultipleKeywords(input, container) {
    const keywords = input.split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0);
    
    let addedCount = 0;
    let duplicateCount = 0;
    let shortCount = 0;
    
    keywords.forEach(keyword => {
      if (keyword.length < 1) {
        shortCount++;
      } else if (this.keywords.includes(keyword)) {
        duplicateCount++;
      } else {
        this.keywords.push(keyword);
        addedCount++;
      }
    });
    
    this.updateKeywordChips(container);
    
    if (addedCount > 0) {
      toast.success(t('password.generator.toasts.keywordAdded'));
    }
    
    if (duplicateCount > 0) {
      toast.warning(t('password.generator.toasts.keywordExists'));
    }
    
    if (shortCount > 0) {
      toast.warning(t('password.generator.toasts.keywordTooShort'));
    }

    return addedCount > 0;
  }

  /**
   * Add single keyword
   * 
   * @param {string} keyword - Keyword to add
   * @param {Element} container - Container element for keyword chips
   * @returns {boolean} True if keyword was added
   */
  addSingleKeyword(keyword, container) {
    if (keyword.length >= 1) {
      if (!this.keywords.includes(keyword)) {
        this.keywords.push(keyword);
        this.updateKeywordChips(container);
        toast.success(t('password.generator.toasts.keywordAdded'));
        return true;
      } else {
        toast.warning(t('password.generator.toasts.keywordExists'));
        return false;
      }
    } else {
      toast.warning(t('password.generator.toasts.keywordTooShort'));
      return false;
    }
  }

  /**
   * Start editing a keyword
   * 
   * @param {number} index - Index of keyword to edit
   * @param {Element} container - Container element for keyword chips
   */
  startEditingKeyword(index, container) {
    this.editingIndex = index;
    this.updateKeywordChips(container);
  }

  /**
   * Save edited keyword
   * 
   * @param {number} index - Index of keyword being edited
   * @param {Element} container - Container element for keyword chips
   */
  saveEditingKeyword(index, container) {
    const editInput = container.querySelector(`[data-edit-index="${index}"]`);
    if (editInput) {
      const newValue = editInput.value.trim();
      if (newValue && newValue.length >= 1) {
        const isDuplicate = this.keywords.some((keyword, i) => i !== index && keyword === newValue);
        if (!isDuplicate) {
          this.keywords[index] = newValue;
          this.editingIndex = -1;
          this.updateKeywordChips(container);
        } else {
          toast.warning(t('password.generator.toasts.keywordExists'));
        }
      } else {
        toast.warning(t('password.generator.toasts.keywordTooShort'));
      }
    }
  }

  /**
   * Cancel editing keyword
   * 
   * @param {number} index - Index of keyword being edited
   * @param {Element} container - Container element for keyword chips
   */
  cancelEditingKeyword(index, container) {
    this.editingIndex = -1;
    this.updateKeywordChips(container);
  }

  /**
   * Remove keyword
   * 
   * @param {number} index - Index of keyword to remove
   * @param {Element} container - Container element for keyword chips
   */
  removeKeyword(index, container) {
    this.keywords.splice(index, 1);
    this.editingIndex = -1;
    this.updateKeywordChips(container);
    toast.success(t('password.generator.toasts.keywordRemoved'));
  }

  /**
   * Reorder keywords via drag and drop
   * 
   * @param {number} fromIndex - Source index
   * @param {number} toIndex - Target index
   */
  reorderKeywords(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.keywords.length || 
        toIndex < 0 || toIndex >= this.keywords.length ||
        fromIndex === toIndex) {
      return;
    }
    
    const movedKeyword = this.keywords.splice(fromIndex, 1)[0];
    this.keywords.splice(toIndex, 0, movedKeyword);
  }

  /**
   * Set keywords from external source
   * 
   * @param {string[]} keywords - Array of keywords to set
   */
  setKeywords(keywords) {
    this.keywords = [...keywords];
  }

  /**
   * Get keywords array
   * 
   * @returns {string[]} Copy of keywords array
   */
  getKeywords() {
    return [...this.keywords];
  }

  /**
   * Set keyword masking option
   * 
   * @param {boolean} mask - Whether to mask keywords
   */
  setMaskKeywords(mask) {
    this.maskKeywords = mask;
  }

  /**
   * Validate keywords for password generation
   * 
   * @returns {Object} Validation results with hasValidKeyword and totalCharacters
   */
  validateKeywords() {
    let hasValidKeyword = false;
    let totalCharacters = 0;
    
    this.keywords.forEach((keyword) => {
      const trimmedKeyword = keyword.trim();
      
      if (trimmedKeyword.length >= 3) {
        hasValidKeyword = true;
      }
      
      totalCharacters += trimmedKeyword.length;
    });
    
    return { hasValidKeyword, totalCharacters };
  }

  /**
   * Setup enhanced drag and drop functionality with touch support
   * 
   * @param {Element} container - Container element for keyword chips
   */
  setupEnhancedDragDrop(container) {
    const draggableItems = container.querySelectorAll('[data-keyword-index]');
    
    this.cleanupDragDropEvents(container);
    
    draggableItems.forEach(item => {
      this.attachDragEvents(item);
    });
    
    this.containerDragOverHandler = (e) => this.handleContainerDragOver(e);
    this.containerDropHandler = (e) => this.handleContainerDrop(e);
    this.containerDragEnterHandler = (e) => this.handleContainerDragEnter(e);
    this.containerDragLeaveHandler = (e) => this.handleContainerDragLeave(e);
    
    container.addEventListener('dragover', this.containerDragOverHandler);
    container.addEventListener('drop', this.containerDropHandler);
    container.addEventListener('dragenter', this.containerDragEnterHandler);
    container.addEventListener('dragleave', this.containerDragLeaveHandler);
  }

  /**
   * Clean up drag and drop event listeners to prevent duplicates
   * 
   * @param {Element} container - Container element for keyword chips
   */
  cleanupDragDropEvents(container) {
    if (this.containerDragOverHandler) {
      container.removeEventListener('dragover', this.containerDragOverHandler);
      container.removeEventListener('drop', this.containerDropHandler);
      container.removeEventListener('dragenter', this.containerDragEnterHandler);
      container.removeEventListener('dragleave', this.containerDragLeaveHandler);
    }
    
    this.containerDragOverHandler = null;
    this.containerDropHandler = null;
    this.containerDragEnterHandler = null;
    this.containerDragLeaveHandler = null;
  }

  /**
   * Attach drag events to individual items with element cloning for cleanup
   * 
   * @param {Element} item - Individual keyword chip element
   */
  attachDragEvents(item) {
    const dragHandle = item.querySelector('.drag-handle');
    
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);
    const newDragHandle = newItem.querySelector('.drag-handle');
    
    newItem.addEventListener('dragstart', (e) => this.handleDragStart(e));
    newItem.addEventListener('dragend', (e) => this.handleDragEnd(e));
    newItem.addEventListener('dragover', (e) => this.handleDragOver(e));
    newItem.addEventListener('dragenter', (e) => this.handleDragEnter(e));
    newItem.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    newItem.addEventListener('drop', (e) => this.handleDrop(e));
    
    if (newDragHandle) {
      newDragHandle.addEventListener('mousedown', () => {
        newDragHandle.style.cursor = 'grabbing';
      });
      
      newDragHandle.addEventListener('mouseup', () => {
        newDragHandle.style.cursor = 'grab';
      });
      
      newDragHandle.addEventListener('mouseleave', () => {
        newDragHandle.style.cursor = 'grab';
      });
    }
    
    this.attachIndividualKeywordListeners(newItem);
    this.attachTouchEvents(newItem);
  }

  /**
   * Attach touch events for mobile drag support
   * 
   * @param {Element} item - Individual keyword chip element
   */
  attachTouchEvents(item) {
    item.addEventListener('touchstart', (e) => this.handleTouchStart(e), { 
      passive: false, 
      capture: false 
    });
    
    item.addEventListener('touchmove', (e) => this.handleTouchMove(e), { 
      passive: false, 
      capture: false 
    });
    
    item.addEventListener('touchend', (e) => this.handleTouchEnd(e), { 
      passive: false, 
      capture: false 
    });
    
    item.addEventListener('touchcancel', (e) => this.handleTouchCancel(e), { 
      passive: true 
    });
  }

  /**
   * Handle drag start event with visual feedback and ghost element creation
   * 
   * @param {Event} e - Drag start event
   */
  handleDragStart(e) {
    this.draggedIndex = parseInt(e.target.dataset.keywordIndex);
    this.draggedElement = e.target;
    this.dragStartTime = Date.now();
    this.isDragging = true;
    
    e.target.classList.add('dragging');
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    
    this.createGhostElement(e.target);
    if (this.ghostElement) {
      e.dataTransfer.setDragImage(this.ghostElement, this.dragOffsetX, this.dragOffsetY);
    }
    
    const container = e.target.closest('#keywords-container') || e.target.closest('.keywords-container');
    if (container) {
      container.classList.add('drag-active');
    }
    
    this.setupAutoScroll();
  }

  /**
   * Handle drag end event with complete cleanup
   * 
   * @param {Event} e - Drag end event
   */
  handleDragEnd(e) {
    e.target.classList.remove('dragging');
    this.isDragging = false;
    this.draggedIndex = -1;
    this.draggedElement = null;
    
    const container = e.target.closest('#keywords-container') || e.target.closest('.keywords-container');
    if (container) {
      container.classList.remove('drag-active');
    }
    
    this.clearAllDropZones(container);
    this.cleanupGhostElement();
    this.cleanupAutoScroll();
    
    document.body.style.cursor = '';
    this.isDropping = false;
  }

  /**
   * Handle drag over event with throttled drop zone updates
   * 
   * @param {Event} e - Drag over event
   */
  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    if (!this.isDragging || e.target === this.draggedElement) return;
    
    if (this.dragOverThrottle) return;
    this.dragOverThrottle = true;
    
    requestAnimationFrame(() => {
      this.dragOverThrottle = false;
      const dropIndex = this.getDropIndex(e);
      this.showDropZone(e.target, dropIndex, e);
    });
  }

  /**
   * Handle drag enter event with debounced hover effects
   * 
   * @param {Event} e - Drag enter event
   */
  handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.isDragging || e.target === this.draggedElement) return;
    
    const targetElement = e.target.closest('[data-keyword-index]');
    if (!targetElement) return;
    
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    
    this.hoverTimeout = setTimeout(() => {
      if (this.currentHoverElement !== targetElement) {
        if (this.currentHoverElement) {
          this.currentHoverElement.classList.remove('drag-over');
        }
        
        targetElement.classList.add('drag-over');
        this.currentHoverElement = targetElement;
      }
    }, 10);
  }

  /**
   * Handle drag leave event with debounced cleanup
   * 
   * @param {Event} e - Drag leave event
   */
  handleDragLeave(e) {
    if (!this.isDragging) return;
    
    e.stopPropagation();
    
    const targetElement = e.target.closest('[data-keyword-index]');
    if (!targetElement) return;
    
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
    }
    
    this.leaveTimeout = setTimeout(() => {
      const rect = targetElement.getBoundingClientRect();
      const isInside = e.clientX >= rect.left && e.clientX <= rect.right && 
                       e.clientY >= rect.top && e.clientY <= rect.bottom;
      
      if (!isInside) {
        if (this.currentHoverElement === targetElement) {
          targetElement.classList.remove('drag-over');
          this.currentHoverElement = null;
        }
        
        setTimeout(() => {
          if (this.isDragging && this.currentDropZoneElement === targetElement) {
            this.clearDropZone(targetElement);
          }
        }, 30);
      }
    }, 20);
  }

  /**
   * Handle drop event with duplicate prevention and index calculation
   * 
   * @param {Event} e - Drop event
   */
  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (this.isDropping) {
      return;
    }
    
    if (!this.isDragging) return;
    
    this.isDropping = true;
    
    const targetElement = e.target.closest('[data-keyword-index]');
    if (!targetElement) {
      this.isDropping = false;
      return;
    }
    
    const dropIndex = parseInt(targetElement.dataset.keywordIndex);
    
    let finalDropIndex;
    
    if (this.draggedIndex > dropIndex) {
      finalDropIndex = dropIndex;
    } else {
      finalDropIndex = dropIndex + 1;
    }
    
    if (this.draggedIndex < finalDropIndex) {
      finalDropIndex = finalDropIndex - 1;
    }
    
    finalDropIndex = Math.max(0, Math.min(finalDropIndex, this.keywords.length - 1));
    
    if (this.draggedIndex !== -1 && this.draggedIndex !== finalDropIndex) {
      const container = e.target.closest('#keywords-container') || e.target.closest('.keywords-container');
      this.reorderKeywordsWithAnimation(this.draggedIndex, finalDropIndex, container);
    }
    
    setTimeout(() => {
      this.isDropping = false;
    }, 100);
  }

  /**
   * Handle container drag over event
   * 
   * @param {Event} e - Drag over event
   */
  handleContainerDragOver(e) {
    e.preventDefault();
    if (!this.isDragging) return;
    
    if (this.draggedElement) {
      this.checkAutoScroll(e);
    }
  }

  /**
   * Handle container drop event
   * 
   * @param {Event} e - Drop event
   */
  handleContainerDrop(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Handle container drag enter event
   * 
   * @param {Event} e - Drag enter event
   */
  handleContainerDragEnter(e) {
    e.preventDefault();
  }

  /**
   * Handle container drag leave event
   * 
   * @param {Event} e - Drag leave event
   */
  handleContainerDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      const container = e.currentTarget;
      this.clearAllDropZones(container);
    }
  }

  /**
   * Handle touch start event with button detection and mobile optimization
   * 
   * @param {Event} e - Touch start event
   */
  handleTouchStart(e) {
    const touch = e.touches[0];
    const item = e.target.closest('[data-keyword-index]');
    
    if (!item || e.touches.length > 1) return;
    
    const isButton = e.target.closest('button') || 
                     e.target.matches('button') ||
                     e.target.closest('.edit-btn') ||
                     e.target.closest('.delete-btn') ||
                     e.target.closest('[data-edit-keyword]') ||
                     e.target.closest('[data-remove-keyword]') ||
                     e.target.closest('[data-save-index]') ||
                     e.target.closest('[data-cancel-edit]');
    
    if (isButton) {
      this.touchPreventClick = false;
      return;
    }
    
    this.touchStart = { 
      x: touch.clientX, 
      y: touch.clientY,
      time: Date.now(),
      element: item,
      target: e.target
    };
    this.isTouchDragging = false;
    this.touchMoved = false;
    this.touchPreventClick = false;
    
    this.touchDraggedIndex = parseInt(item.dataset.keywordIndex);
    this.touchDraggedElement = item;
    
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      e.preventDefault();
    }
    
    this.touchClickTimeout = setTimeout(() => {
      if (this.touchDraggedElement && !this.touchMoved) {
        this.touchDraggedElement.classList.add('touch-active');
      }
    }, 50);
    
    this.dragStartTime = Date.now();
  }

  /**
   * Handle touch move event with direction detection and drag threshold
   * 
   * @param {Event} e - Touch move event
   */
  handleTouchMove(e) {
    if (!e.touches[0] || !this.touchStart || e.touches.length > 1) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - this.touchStart.x);
    const deltaY = Math.abs(touch.clientY - this.touchStart.y);
    const totalDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const isMobile = window.innerWidth <= 768;
    
    this.touchMoved = true;
    
    if (this.touchClickTimeout) {
      clearTimeout(this.touchClickTimeout);
      this.touchClickTimeout = null;
    }
    
    if (isMobile && totalDelta > 3) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!this.isTouchDragging && totalDelta > this.touchThreshold) {
      let shouldStartDrag = false;
      
      if (isMobile) {
        const isVerticalDrag = deltaY > deltaX * 1.2;
        shouldStartDrag = isVerticalDrag || totalDelta > this.touchThreshold * 2;
      } else {
        const isHorizontalDrag = deltaX > deltaY * 1.5;
        shouldStartDrag = isHorizontalDrag || totalDelta > this.touchThreshold * 2;
      }
      
      if (shouldStartDrag) {
        this.isTouchDragging = true;
        this.touchPreventClick = true;
        this.startTouchDrag(e);
      }
    }
    
    if (this.isTouchDragging) {
      e.preventDefault();
      e.stopPropagation();
      this.updateTouchDrag(e);
    }
  }

  /**
   * Handle touch end event with cleanup and tap detection
   * 
   * @param {Event} e - Touch end event
   */
  handleTouchEnd(e) {
    if (this.touchClickTimeout) {
      clearTimeout(this.touchClickTimeout);
      this.touchClickTimeout = null;
    }
    
    if (this.touchMoveTimeout) {
      cancelAnimationFrame(this.touchMoveTimeout);
      this.touchMoveTimeout = null;
    }
    
    if (this.touchDraggedElement) {
      this.touchDraggedElement.classList.remove('touch-active');
    }
    
    if (this.isTouchDragging) {
      e.preventDefault();
      e.stopPropagation();
      this.endTouchDrag(e);
    } else if (this.touchStart && !this.touchMoved && !this.touchPreventClick) {
      // Allow normal button clicks for tap events
    } else if (this.touchPreventClick) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (this.touchDraggedElement) {
      const container = this.touchDraggedElement.closest('#keywords-container') || 
                        this.touchDraggedElement.closest('.keywords-container');
      if (container) {
        container.classList.remove('drag-active');
      }
    }
    
    this.isTouchDragging = false;
    this.touchMoved = false;
    this.touchStart = null;
    this.touchDraggedIndex = -1;
    this.touchDraggedElement = null;
    this.touchPreventClick = false;
  }

  /**
   * Handle touch cancel event with complete state cleanup
   * 
   * @param {Event} e - Touch cancel event
   */
  handleTouchCancel(e) {
    if (this.touchClickTimeout) {
      clearTimeout(this.touchClickTimeout);
      this.touchClickTimeout = null;
    }
    
    if (this.touchMoveTimeout) {
      cancelAnimationFrame(this.touchMoveTimeout);
      this.touchMoveTimeout = null;
    }
    
    if (this.touchDraggedElement) {
      this.touchDraggedElement.classList.remove('touch-active');
    }
    
    if (this.isTouchDragging) {
      this.endTouchDrag(e);
    }
    
    if (this.touchDraggedElement) {
      const container = this.touchDraggedElement.closest('#keywords-container') || 
                        this.touchDraggedElement.closest('.keywords-container');
      if (container) {
        container.classList.remove('drag-active');
      }
    }
    
    this.isTouchDragging = false;
    this.touchMoved = false;
    this.touchStart = null;
    this.touchDraggedIndex = -1;
    this.touchDraggedElement = null;
    this.touchPreventClick = false;
  }

  /**
   * Start touch drag operation with haptic feedback
   * 
   * @param {Event} e - Touch event
   */
  startTouchDrag(e) {
    if (!this.touchDraggedElement) return;
    
    this.draggedIndex = this.touchDraggedIndex;
    this.draggedElement = this.touchDraggedElement;
    this.isDragging = true;
    
    this.touchDraggedElement.classList.remove('touch-active');
    this.touchDraggedElement.classList.add('dragging');
    
    const container = this.touchDraggedElement.closest('#keywords-container') || 
                      this.touchDraggedElement.closest('.keywords-container');
    if (container) {
      container.classList.add('drag-active');
    }
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  /**
   * Update touch drag operation with drop zone detection
   * 
   * @param {Event} e - Touch event
   */
  updateTouchDrag(e) {
    if (!this.isDragging || !e.touches[0]) return;
    
    const touch = e.touches[0];
    
    if (this.touchMoveTimeout) {
      cancelAnimationFrame(this.touchMoveTimeout);
    }
    
    this.touchMoveTimeout = requestAnimationFrame(() => {
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropTarget = elementBelow?.closest('[data-keyword-index]');
      
      if (dropTarget && dropTarget !== this.draggedElement) {
        const dropIndex = parseInt(dropTarget.dataset.keywordIndex);
        this.showDropZoneForTouch(dropTarget, dropIndex, touch);
        this.updateTouchHover(dropTarget);
      } else {
        const container = this.draggedElement.closest('#keywords-container') || 
                          this.draggedElement.closest('.keywords-container');
        this.clearAllDropZones(container);
      }
    });
  }

  /**
   * End touch drag operation with drop logic and cleanup
   * 
   * @param {Event} e - Touch event
   */
  endTouchDrag(e) {
    if (!this.isDragging || !e.changedTouches[0]) return;
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropTarget = elementBelow?.closest('[data-keyword-index]');
    
    if (dropTarget && this.draggedElement !== dropTarget) {
      const dropIndex = parseInt(dropTarget.dataset.keywordIndex);
      
      let finalDropIndex;
      
      if (this.draggedIndex > dropIndex) {
        finalDropIndex = dropIndex;
      } else {
        finalDropIndex = dropIndex + 1;
      }
      
      if (this.draggedIndex < finalDropIndex) {
        finalDropIndex = finalDropIndex - 1;
      }
      
      finalDropIndex = Math.max(0, Math.min(finalDropIndex, this.keywords.length - 1));
      
      if (this.draggedIndex !== -1 && this.draggedIndex !== finalDropIndex) {
        const container = this.draggedElement.closest('#keywords-container') || 
                          this.draggedElement.closest('.keywords-container');
        this.reorderKeywordsWithAnimation(this.draggedIndex, finalDropIndex, container);
        
        if (navigator.vibrate) {
          navigator.vibrate([30, 10, 30]);
        }
      }
    }
    
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging', 'touch-active', 'drag-over');
    }
    
    if (this.touchDraggedElement && this.touchDraggedElement !== this.draggedElement) {
      this.touchDraggedElement.classList.remove('dragging', 'touch-active', 'drag-over');
    }
    
    const container = this.draggedElement?.closest('#keywords-container') || 
                      this.draggedElement?.closest('.keywords-container');
    if (container) {
      container.classList.remove('drag-active');
    }
    
    this.clearAllDropZones(container);
    this.isDragging = false;
    this.draggedIndex = -1;
    this.draggedElement = null;
  }

  /**
   * Show drop zone for touch interaction with mobile/desktop distinction
   * 
   * @param {Element} element - Target element
   * @param {number} dropIndex - Drop index
   * @param {Touch} touch - Touch object
   */
  showDropZoneForTouch(element, dropIndex, touch) {
    if (dropIndex === -1 || dropIndex === this.draggedIndex) return;
    
    const targetElement = element.closest('[data-keyword-index]');
    if (!targetElement) return;
    
    const container = targetElement.closest('#keywords-container') || 
                      targetElement.closest('.keywords-container');
    this.clearAllDropZones(container);
    
    const rect = targetElement.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    
    targetElement.classList.remove('drop-left', 'drop-right');
    
    if (isMobile) {
      const touchY = touch.clientY;
      const centerY = rect.top + rect.height / 2;
      
      if (touchY < centerY) {
        targetElement.classList.add('drop-left');
      } else {
        targetElement.classList.add('drop-right');
      }
    } else {
      const touchX = touch.clientX;
      const centerX = rect.left + rect.width / 2;
      
      if (touchX < centerX) {
        targetElement.classList.add('drop-left');
      } else {
        targetElement.classList.add('drop-right');
      }
    }
    
    this.currentDropZoneElement = targetElement;
  }

  /**
   * Update touch hover state
   * 
   * @param {Element} element - Element to apply hover state
   */
  updateTouchHover(element) {
    if (!element) return;
    
    if (this.currentHoverElement && this.currentHoverElement !== element) {
      this.currentHoverElement.classList.remove('drag-over');
    }
    
    element.classList.add('drag-over');
    this.currentHoverElement = element;
  }

  /**
   * Create ghost element for drag preview
   * 
   * @param {Element} element - Source element to clone
   */
  createGhostElement(element) {
    this.ghostElement = element.cloneNode(true);
    this.ghostElement.classList.add('drag-ghost');
    this.ghostElement.style.position = 'absolute';
    this.ghostElement.style.top = '-1000px';
    this.ghostElement.style.pointerEvents = 'none';
    
    document.body.appendChild(this.ghostElement);
    
    const rect = element.getBoundingClientRect();
    this.dragOffsetX = rect.width / 2;
    this.dragOffsetY = rect.height / 2;
  }

  /**
   * Clean up ghost element from DOM
   */
  cleanupGhostElement() {
    if (this.ghostElement) {
      document.body.removeChild(this.ghostElement);
      this.ghostElement = null;
    }
  }

  /**
   * Get drop index from event target
   * 
   * @param {Event} e - Event object
   * @returns {number} Drop index or -1 if not found
   */
  getDropIndex(e) {
    const target = e.target.closest('[data-keyword-index]');
    return target ? parseInt(target.dataset.keywordIndex) : -1;
  }

  /**
   * Show drop zone indicators with platform-specific positioning
   * 
   * @param {Element} element - Target element
   * @param {number} dropIndex - Drop index
   * @param {Event} e - Mouse/touch event
   */
  showDropZone(element, dropIndex, e) {
    if (dropIndex === -1 || dropIndex === this.draggedIndex) return;
    
    const targetElement = element.closest('[data-keyword-index]');
    if (!targetElement) return;
    
    const currentDropElement = this.currentDropZoneElement;
    
    if (currentDropElement === targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const isMobile = window.innerWidth <= 768;
      
      targetElement.classList.remove('drop-left', 'drop-right');
      
      if (isMobile) {
        const mouseY = e.clientY;
        const centerY = rect.top + rect.height / 2;
        
        if (mouseY < centerY) {
          targetElement.classList.add('drop-left');
        } else {
          targetElement.classList.add('drop-right');
        }
      } else {
        const mouseX = e.clientX;
        const centerX = rect.left + rect.width / 2;
        
        if (mouseX < centerX) {
          targetElement.classList.add('drop-left');
        } else {
          targetElement.classList.add('drop-right');
        }
      }
      return;
    }
    
    if (currentDropElement && currentDropElement !== targetElement) {
      this.clearDropZone(currentDropElement);
    }
    
    const container = targetElement.closest('#keywords-container') || 
                      targetElement.closest('.keywords-container');
    const allDropZones = container?.querySelectorAll('.drop-zone') || [];
    allDropZones.forEach(zone => {
      if (zone !== targetElement) {
        zone.classList.remove('drop-left', 'drop-right');
        if (this.currentHoverElement !== zone) {
          zone.classList.remove('drag-over');
        }
      }
    });
    
    const rect = targetElement.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    
    targetElement.classList.remove('drop-left', 'drop-right');
    
    if (isMobile) {
      const mouseY = e.clientY;
      const centerY = rect.top + rect.height / 2;
      
      if (mouseY < centerY) {
        targetElement.classList.add('drop-left');
      } else {
        targetElement.classList.add('drop-right');
      }
    } else {
      const mouseX = e.clientX;
      const centerX = rect.left + rect.width / 2;
      
      if (mouseX < centerX) {
        targetElement.classList.add('drop-left');
      } else {
        targetElement.classList.add('drop-right');
      }
    }
    
    this.currentDropZoneElement = targetElement;
  }

  /**
   * Clear drop zone indicator from element
   * 
   * @param {Element} element - Element to clear drop zone from
   */
  clearDropZone(element) {
    element.classList.remove('drop-left', 'drop-right');
  }

  /**
   * Clear all drop zones and drag states
   * 
   * @param {Element} container - Container element for keyword chips
   */
  clearAllDropZones(container) {
    if (!container) return;
    
    const dropZones = container.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
      zone.classList.remove('drop-left', 'drop-right', 'drag-over', 'touch-active', 'dragging');
    });
    
    const allChips = container.querySelectorAll('.keyword-chip');
    allChips.forEach(chip => {
      chip.classList.remove('touch-active', 'dragging', 'drag-over', 'drop-left', 'drop-right');
    });
    
    container.classList.remove('drag-active');
    
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
      this.leaveTimeout = null;
    }
    
    this.currentDropZoneElement = null;
    this.currentHoverElement = null;
    this.dragOverThrottle = false;
  }

  /**
   * Setup auto-scroll functionality for long lists
   */
  setupAutoScroll() {
    // Auto-scroll will be handled in checkAutoScroll method
  }

  /**
   * Check if auto-scroll is needed during drag
   * 
   * @param {Event} e - Drag event
   */
  checkAutoScroll(e) {
    // Disabled to prevent unwanted scrolling
    this.stopAutoScroll();
    return;
  }

  /**
   * Start auto-scroll with specified speed
   * 
   * @param {number} speed - Scroll speed in pixels per frame
   */
  startAutoScroll(speed) {
    if (this.autoScrollTimer && this.currentScrollSpeed === speed) {
      return;
    }
    
    this.stopAutoScroll();
    this.currentScrollSpeed = speed;
    
    this.autoScrollTimer = setInterval(() => {
      if (this.isDragging && this.draggedElement) {
        window.scrollBy(0, speed);
      } else {
        this.stopAutoScroll();
      }
    }, 32);
  }

  /**
   * Stop auto-scroll functionality
   */
  stopAutoScroll() {
    if (this.autoScrollTimer) {
      clearInterval(this.autoScrollTimer);
      this.autoScrollTimer = null;
      this.currentScrollSpeed = 0;
    }
  }

  /**
   * Clean up auto-scroll functionality
   */
  cleanupAutoScroll() {
    this.stopAutoScroll();
  }

  /**
   * Reorder keywords with smooth animation
   * 
   * @param {number} fromIndex - Source index
   * @param {number} toIndex - Target index
   * @param {Element} container - Container element for keyword chips
   */
  reorderKeywordsWithAnimation(fromIndex, toIndex, container) {
    const items = container?.querySelectorAll('[data-keyword-index]') || [];
    items.forEach(item => item.classList.add('moving'));
    
    this.reorderKeywords(fromIndex, toIndex);
    this.updateKeywordChips(container);
    
    if (container) {
      container.classList.remove('drag-active');
    }
    
    setTimeout(() => {
      const newItems = container?.querySelectorAll('[data-keyword-index]') || [];
      newItems.forEach(item => item.classList.remove('moving'));
      
      if (container) {
        container.classList.remove('drag-active');
      }
    }, 300);
  }
} 