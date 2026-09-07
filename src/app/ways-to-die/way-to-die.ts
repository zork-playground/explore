import { CodePath, CodePathItem } from './code-path';

export interface WayToDie {
    title?: string,     // VIEW PROP
    routine: any,       // the routine where JIGS-UP is called
    routineMeta: any,   //   its metadata
    codePaths: CodePath[],
    room?: any;         // room model if it requires being in a specific room, otherwise undefined
    roomMeta?: any,     //   its metadata
    syntax?: any,       // the syntax if it requires reaching a routine that's a PreAction or Action for a syntax
    syntaxDesc?: any    // VIEW PROP: syntax as string (syntax does not have metadata yet)
}
