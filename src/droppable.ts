// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...}

/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */

export default class Droppable {
    private static ENTER_KEY_CODE = 13;

    private dragOverClass = 'dragover';

    private appendStatusClasses: boolean;
    private isClickable: boolean;

    private element: HTMLElement;

    private elementEventsRemover: Function;

    private virtualInputElement: HTMLInputElement;
    private virtualInputElementEventsRemover: Function;

    private elementKeyDownEventRemover: Function;

    private latestDroppedFiles: File[];

    private onFilesDroppedEventListeners: FilesWereDroppedEventListener[] = [];

    constructor(config: DroppableSettings) {
        config = config || {};

        if (!config.element) {
            throw new Error('config.element: HTMLElement is required');
        }

        // This must be called before calling setAcceptsMultipleFiles
        this.virtualInputElement = Droppable.makeVirtualInputElement();

        const isClickable = typeof config.isClickable === 'boolean' ? config.isClickable : true;
        const acceptsMultipleFiles = typeof config.acceptsMultipleFiles === 'boolean' ? config.acceptsMultipleFiles : true;
        const appendStatusClasses = typeof config.appendStatusClasses === 'boolean' ? config.appendStatusClasses : true;

        this.setIsClickable(isClickable);
        this.setAcceptsMultipleFiles(acceptsMultipleFiles);
        this.setAppendStatusClasses(appendStatusClasses);

        this.element = config.element;
        this.elementEventsRemover = this.registerElementEvents();
        Droppable.addAccessibilityAttributesToDroppableElement(this.element);

        this.virtualInputElementEventsRemover = this.registerVirtualInputElementEvents();
    }

    private static makeVirtualInputElement() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.style.display = 'none';
        return input;
    }

    private static addAccessibilityAttributesToDroppableElement(element: any) {
        element.tabIndex = 0;
        element.role = 'button';
    }

    private static removeAccessibilityAttributesToDroppableElement(element: any) {
        delete element.role;
        element.removeAttribute('tabIndex');
    }

    onFilesDropped(listener: FilesWereDroppedEventListener): EventRemover {
        this.onFilesDroppedEventListeners.push(listener);
        return () => {
            const listenerIndex = this.onFilesDroppedEventListeners.indexOf(listener);
            this.onFilesDroppedEventListeners.splice(listenerIndex, 1);
        };
    }

    destroy() {
        this.elementEventsRemover();
        this.virtualInputElementEventsRemover();
        this.onFilesDroppedEventListeners = [];
        Droppable.removeAccessibilityAttributesToDroppableElement(this.element);
    }

    getLatestDroppedFiles(): File[] {
        if (this.latestDroppedFiles) {
            return this.latestDroppedFiles;
        }
        return [];
    }

    promptForFiles(): void {
        this.virtualInputElement.click();
    }

    setIsClickable(clickable: boolean) {
        this.isClickable = clickable;
    }

    setAcceptsMultipleFiles(acceptsMultipleFiles: boolean) {
        this.virtualInputElement.setAttribute('multiple', acceptsMultipleFiles.toString());
    }

    setAppendStatusClasses(appendStatusClasses: boolean) {
        this.appendStatusClasses = appendStatusClasses;
    }

    private registerElementEvents(): Function {
        const eventNameToEventListenerDictionary = this.getElementEventsDictionary();
        return this.registerElementEventsWithDictionary(this.element, eventNameToEventListenerDictionary);
    }

    private registerVirtualInputElementEvents(): Function {
        const eventNameToEventListenerDictionary = this.getVirtualInputElementEventsDictionary();
        return this.registerElementEventsWithDictionary(this.virtualInputElement, eventNameToEventListenerDictionary);
    }

    private getVirtualInputElementEventsDictionary() {
        return {
            change: this.onVirtualInputElementChange
        };
    }

    private getElementEventsDictionary() {
        return {
            dragover: this.onElementDragOver,
            dragleave: this.onElementDragLeave,
            drop: this.onElementDrop,
            click: this.onElementClick,
            focus: this.onElementFocus,
            focusout: this.onElementFocusOut
        };
    }

    private onElementDragOver(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this.element.classList.add(this.dragOverClass);
    }

    private onElementDragLeave(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this.element.classList.remove(this.dragOverClass);
    }

    private onElementDrop(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this.element.classList.remove(this.dragOverClass);
        this.onDroppableElementChange(e);
    }

    private onElementClick() {
        if (this.isClickable) this.promptForFiles();
    }

    private onElementKeyDown(e: { [key: string]: any }) {
        if (e['keyCode'] === Droppable.ENTER_KEY_CODE) {
            this.promptForFiles();
            this.element.blur();
        }
    }

    private onElementFocus() {
        this.elementKeyDownEventRemover = this.registerElementEventsWithDictionary(this.element, {
            keydown: this.onElementKeyDown
        });
    }

    private onElementFocusOut() {
        if (this.elementKeyDownEventRemover) this.elementKeyDownEventRemover();
    }

    private onVirtualInputElementChange(e: Event) {
        this.onDroppableElementChange(e);
        this.virtualInputElement.value = '';
    }

    // TODO: Use FileSystemDirectoryEntry instead of any for dirEntry type
    private loadDirectory(dirEntry: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const reader = dirEntry.createReader();
            reader.readEntries((entries: any) => {
                // TODO: Entries are either FileSystemDirectoryEntry or FileSystemFileEntry type
                resolve(entries);
            });
        });
    }

    // TODO: Use FileSystemFileEntry instead of any for fileEntry type
    private loadFile(fileEntry: any): Promise<any> {
        return new Promise((resolve, reject) => {
            fileEntry.file((fileResult: any) => {
                resolve(fileResult);
            });
        });
    }

    private async traverseDataTransferItemsInner(items: Array<any>, dirTree: Array<String> = []): Promise<any> {
        let files: Array<File> = [];
        for (let item of items) {
            if (item.isFile) {
                const fileResult = await this.loadFile(item);
                fileResult.dirTree = dirTree;
                files.push(fileResult);
            } else if (item.isDirectory) {
                const dirItems = await this.loadDirectory(item);
                dirTree.push(item.name);
                const dirFiles = await this.traverseDataTransferItemsInner(dirItems, dirTree);
                files = files.concat(dirFiles);
            }
        }
        return files;
    }

    private traverseDataTransferItems(items: Array<DataTransferItem>, callback: FilesWereDroppedEventListener) {
        this.traverseDataTransferItemsInner(items).then(files => {
            callback(files);
        });
    }

    private onDroppableElementChange(event: { [key: string]: any }) {
        const onFilesSet = (files: Array<File>) => {
            // Files is FileList, we convert to array
            const filesArray: File[] = Array.from(files);
            this.setLatestDrop(filesArray);
        };

        if (event['dataTransfer']) {
            // Support for Chrome's traversal of directories
            if (event['dataTransfer'].items && event['dataTransfer'].items.length > 0 && event['dataTransfer'].items[0].webkitGetAsEntry) {
                const entries = Array.from(event['dataTransfer'].items).map((item: any) => item.webkitGetAsEntry());
                this.traverseDataTransferItems(entries, onFilesSet);
            } else {
                onFilesSet(event['dataTransfer'].files);
            }
        } else if (event['target']) {
            onFilesSet(event['target'].files);
        } else {
            throw Error('Fired event contains no files');
        }
    }

    private setLatestDrop(files: Array<File>) {
        this.latestDroppedFiles = files;
        this.emitFilesWereDropped(files);
    }

    private emitFilesWereDropped(files: Array<File>) {
        this.onFilesDroppedEventListeners.forEach(listener => {
            listener(files);
        });
    }

    private registerElementEventsWithDictionary(element: HTMLElement, eventNameToEventListenerDictionary: { [key: string]: EventListener }): Function {
        const eventRemovers: Array<Function> = [];
        Object.keys(eventNameToEventListenerDictionary).forEach(eventName => {
            const eventListener = eventNameToEventListenerDictionary[eventName];
            const boundEventListener = eventListener.bind(this);
            element.addEventListener(eventName, boundEventListener);
            eventRemovers.push(() => element.removeEventListener(eventName, boundEventListener));
        });

        return () => eventRemovers.forEach(eventRemover => eventRemover());
    }
}

export interface DroppableSettings {
    element: HTMLElement;
    appendStatusClasses?: boolean;
    acceptsMultipleFiles?: boolean;
    isClickable?: boolean;
}

export type EventRemover = () => void;

export type FilesWereDroppedEventListener = (files: File[]) => any;
