"use strict";
// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...}
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */
var Droppable = /** @class */ (function () {
    function Droppable(config) {
        this.dragOverClass = 'dragover';
        this.onFilesDroppedEventListeners = [];
        config = config || {};
        if (!config.element) {
            throw new Error('config.element: HTMLElement is required');
        }
        // This must be called before calling setAcceptsMultipleFiles
        this.virtualInputElement = Droppable.makeVirtualInputElement();
        var isClickable = typeof config.isClickable === 'boolean' ? config.isClickable : true;
        var acceptsMultipleFiles = typeof config.acceptsMultipleFiles === 'boolean' ? config.acceptsMultipleFiles : true;
        var appendStatusClasses = typeof config.appendStatusClasses === 'boolean' ? config.appendStatusClasses : true;
        this.setIsClickable(isClickable);
        this.setAcceptsMultipleFiles(acceptsMultipleFiles);
        this.setAppendStatusClasses(appendStatusClasses);
        this.element = config.element;
        this.elementEventsRemover = this.registerElementEvents();
        Droppable.addAccessibilityAttributesToDroppableElement(this.element);
        this.virtualInputElementEventsRemover = this.registerVirtualInputElementEvents();
    }
    Droppable.makeVirtualInputElement = function () {
        var input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.style.display = 'none';
        return input;
    };
    Droppable.addAccessibilityAttributesToDroppableElement = function (element) {
        element.tabIndex = 0;
        element.role = 'button';
    };
    Droppable.removeAccessibilityAttributesToDroppableElement = function (element) {
        delete element.role;
        element.removeAttribute('tabIndex');
    };
    Droppable.prototype.onFilesDropped = function (listener) {
        var _this = this;
        this.onFilesDroppedEventListeners.push(listener);
        return function () {
            var listenerIndex = _this.onFilesDroppedEventListeners.indexOf(listener);
            _this.onFilesDroppedEventListeners.splice(listenerIndex, 1);
        };
    };
    Droppable.prototype.destroy = function () {
        this.elementEventsRemover();
        this.virtualInputElementEventsRemover();
        this.onFilesDroppedEventListeners = [];
        Droppable.removeAccessibilityAttributesToDroppableElement(this.element);
    };
    Droppable.prototype.getLatestDroppedFiles = function () {
        if (this.latestDroppedFiles) {
            return this.latestDroppedFiles;
        }
        return [];
    };
    Droppable.prototype.promptForFiles = function () {
        this.virtualInputElement.click();
    };
    Droppable.prototype.setIsClickable = function (clickable) {
        this.isClickable = clickable;
    };
    Droppable.prototype.setAcceptsMultipleFiles = function (acceptsMultipleFiles) {
        this.virtualInputElement.setAttribute('multiple', acceptsMultipleFiles.toString());
    };
    Droppable.prototype.setAppendStatusClasses = function (appendStatusClasses) {
        this.appendStatusClasses = appendStatusClasses;
    };
    Droppable.prototype.registerElementEvents = function () {
        var eventNameToEventListenerDictionary = this.getElementEventsDictionary();
        return this.registerElementEventsWithDictionary(this.element, eventNameToEventListenerDictionary);
    };
    Droppable.prototype.registerVirtualInputElementEvents = function () {
        var eventNameToEventListenerDictionary = this.getVirtualInputElementEventsDictionary();
        return this.registerElementEventsWithDictionary(this.virtualInputElement, eventNameToEventListenerDictionary);
    };
    Droppable.prototype.getVirtualInputElementEventsDictionary = function () {
        return {
            change: this.onVirtualInputElementChange
        };
    };
    Droppable.prototype.getElementEventsDictionary = function () {
        return {
            dragover: this.onElementDragOver,
            dragleave: this.onElementDragLeave,
            drop: this.onElementDrop,
            click: this.onElementClick,
            focus: this.onElementFocus,
            focusout: this.onElementFocusOut
        };
    };
    Droppable.prototype.onElementDragOver = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.element.classList.add(this.dragOverClass);
    };
    Droppable.prototype.onElementDragLeave = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.element.classList.remove(this.dragOverClass);
    };
    Droppable.prototype.onElementDrop = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.element.classList.remove(this.dragOverClass);
        this.onDroppableElementChange(e);
    };
    Droppable.prototype.onElementClick = function () {
        if (this.isClickable)
            this.promptForFiles();
    };
    Droppable.prototype.onElementKeyDown = function (e) {
        if (e['keyCode'] === Droppable.ENTER_KEY_CODE) {
            this.promptForFiles();
            this.element.blur();
        }
    };
    Droppable.prototype.onElementFocus = function () {
        this.elementKeyDownEventRemover = this.registerElementEventsWithDictionary(this.element, {
            keydown: this.onElementKeyDown
        });
    };
    Droppable.prototype.onElementFocusOut = function () {
        if (this.elementKeyDownEventRemover)
            this.elementKeyDownEventRemover();
    };
    Droppable.prototype.onVirtualInputElementChange = function (e) {
        this.onDroppableElementChange(e);
        this.virtualInputElement.value = '';
    };
    // TODO: Use FileSystemDirectoryEntry instead of any for dirEntry type
    Droppable.prototype.loadDirectory = function (dirEntry) {
        return new Promise(function (resolve, reject) {
            var reader = dirEntry.createReader();
            reader.readEntries(function (entries) {
                resolve(entries);
            });
        });
    };
    // TODO: Use FileSystemFileEntry instead of any for fileEntry type
    Droppable.prototype.loadFile = function (fileEntry) {
        return new Promise(function (resolve, reject) {
            fileEntry.file(function (fileResult) {
                resolve(fileResult);
            });
        });
    };
    Droppable.prototype.traverseDataTransferItemsInner = function (items, fileNamePrefix) {
        if (fileNamePrefix === void 0) { fileNamePrefix = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var files, _i, items_1, item, fileResult, dirItems, dirFiles;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        files = [];
                        _i = 0, items_1 = items;
                        _a.label = 1;
                    case 1:
                        if (!(_i < items_1.length)) return [3 /*break*/, 7];
                        item = items_1[_i];
                        if (!item.isFile) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.loadFile(item)];
                    case 2:
                        fileResult = _a.sent();
                        fileResult.prefix = "" + fileNamePrefix;
                        files.push(fileResult);
                        return [3 /*break*/, 6];
                    case 3:
                        if (!item.isDirectory) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.loadDirectory(item)];
                    case 4:
                        dirItems = _a.sent();
                        return [4 /*yield*/, this.traverseDataTransferItemsInner(dirItems, "" + fileNamePrefix + item.name + "/")];
                    case 5:
                        dirFiles = _a.sent();
                        files = files.concat(dirFiles);
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/, files];
                }
            });
        });
    };
    Droppable.prototype.traverseDataTransferItems = function (items, callback) {
        this.traverseDataTransferItemsInner(items).then(function (files) {
            callback(files);
        });
    };
    Droppable.prototype.onDroppableElementChange = function (event) {
        var _this = this;
        var onFilesSet = function (files) {
            // Files is FileList, we convert to array
            var filesArray = Array.from(files);
            _this.setLatestDrop(filesArray);
        };
        if (event['dataTransfer']) {
            // Support for Chrome's traversal of directories
            if (event['dataTransfer'].items && event['dataTransfer'].items.length > 0 && event['dataTransfer'].items[0].webkitGetAsEntry) {
                var entries = Array.from(event['dataTransfer'].items).map(function (item) { return item.webkitGetAsEntry(); });
                this.traverseDataTransferItems(entries, onFilesSet);
            }
            else {
                onFilesSet(event['dataTransfer'].files);
            }
        }
        else if (event['target']) {
            onFilesSet(event['target'].files);
        }
        else {
            throw Error('Fired event contains no files');
        }
    };
    Droppable.prototype.setLatestDrop = function (files) {
        this.latestDroppedFiles = files;
        this.emitFilesWereDropped(files);
    };
    Droppable.prototype.emitFilesWereDropped = function (files) {
        this.onFilesDroppedEventListeners.forEach(function (listener) {
            listener(files);
        });
    };
    Droppable.prototype.registerElementEventsWithDictionary = function (element, eventNameToEventListenerDictionary) {
        var _this = this;
        var eventRemovers = [];
        Object.keys(eventNameToEventListenerDictionary).forEach(function (eventName) {
            var eventListener = eventNameToEventListenerDictionary[eventName];
            var boundEventListener = eventListener.bind(_this);
            element.addEventListener(eventName, boundEventListener);
            eventRemovers.push(function () { return element.removeEventListener(eventName, boundEventListener); });
        });
        return function () { return eventRemovers.forEach(function (eventRemover) { return eventRemover(); }); };
    };
    Droppable.ENTER_KEY_CODE = 13;
    return Droppable;
}());
exports.default = Droppable;
//# sourceMappingURL=droppable.js.map