"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorControlHandler = void 0;
const editor_1 = require("../../../@types/editor");
class EditorControlHandler {
    /**
     * Reads log messages from the Cocos Creator Console
     * @param params Parameters containing filtering options
     * @returns Object containing console messages filtered by type
     */
    static async ReadConsole(params) {
        try {
            // Default values for show flags
            const showLogs = params.show_logs !== undefined ? params.show_logs : true;
            const showWarnings = params.show_warnings !== undefined ? params.show_warnings : true;
            const showErrors = params.show_errors !== undefined ? params.show_errors : true;
            const searchTerm = params.search_term || '';
            // Prepare log types to query
            const types = [];
            if (showLogs)
                types.push('log');
            if (showWarnings)
                types.push('warn');
            if (showErrors)
                types.push('error');
            // Query logs from Cocos Creator
            const response = await editor_1.Editor.Message.request('console', 'query', {
                type: types,
                pattern: searchTerm,
                limit: 1000 // Configurable limit
            });
            // Process and format the logs
            const entries = response.logs.map((log) => ({
                type: log.type === 'warn' ? 'Warning' :
                    log.type === 'error' ? 'Error' : 'Log',
                message: log.message,
                stackTrace: log.stack || '',
                timestamp: log.timestamp
            }));
            return {
                message: "Console logs retrieved successfully",
                entries: entries,
                total_entries: response.total,
                filtered_count: entries.length,
                show_logs: showLogs,
                show_warnings: showWarnings,
                show_errors: showErrors
            };
        }
        catch (error) {
            return {
                error: `Failed to read console logs: ${error.message}`,
                entries: []
            };
        }
    }
    /**
     * Sets up real-time log monitoring
     * @param callback Callback function to handle new log entries
     */
    static SetupLogMonitor(callback) {
        editor_1.Editor.Message.addListener('console:log', (log) => {
            callback({
                type: log.type === 'warn' ? 'Warning' :
                    log.type === 'error' ? 'Error' : 'Log',
                message: log.message,
                stackTrace: log.stack || '',
                timestamp: log.timestamp
            });
        });
    }
}
exports.EditorControlHandler = EditorControlHandler;
